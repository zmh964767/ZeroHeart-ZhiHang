# PDF 分页与 Pretext 文本测量优化设计文档

**日期：** 2026-04-07
**版本：** 1.0
**作者：** zeroheart 开发团队

## 1. 问题背景

当前项目中存在以下问题：
- 简历预览面板显示正常（浏览器自动处理文本布局）
- PDF 导出时内容重叠（使用固定高度增量，未真正测量文本高度）
- 无分页逻辑，内容超过一页时无法正确处理
- 中文排版性能和精度有待提升

## 2. 解决方案概述

采用**混合方案**：
- **前端**：使用 pretext 库测量文本高度，计算分页点
- **后端**：接收布局信息，用 pdfkit 按指定位置分页渲染
- **核心思路**：让浏览器/前端处理复杂的文本测量，后端负责精准渲染

## 3. 关键常量配置

### 3.1 共享常量文件

创建 `src/lib/resume/constants.ts`，前后端共用同一份配置。

```typescript
// 单位转换
export const PX_TO_PT = 72 / 96; // 0.75
export const PT_TO_PX = 96 / 72; // 1.333...

// A4 纸张
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// 边距
export const MARGIN_PT = 56.69;
export const MARGIN_PX = 75.59;

// 字体大小映射
export const FONT_SIZE_MAP = {
  name: { px: 22, pt: 16.5 },
  title: { px: 11, pt: 8.25 },
  info: { px: 10, pt: 7.5 },
  section: { px: 11, pt: 8.25 },
  body: { px: 10, pt: 7.5 },
  small: { px: 9, pt: 6.75 },
} as const;

// 安全余量 - 应对 pretext 测量误差
export const SAFETY_BUFFER_PX = 2;
export const SAFETY_BUFFER_PT = SAFETY_BUFFER_PX * PX_TO_PT;

// 孤儿控制阈值 - 避免小块单独在页底
export const ORPHAN_THRESHOLD_PX = 60;
export const ORPHAN_THRESHOLD_PT = ORPHAN_THRESHOLD_PX * PX_TO_PT;

// 行高
export const LINE_HEIGHT_RATIO = 1.4;
```

## 4. 数据结构定义

### 4.1 扩展类型定义

在 `src/lib/resume/types.ts` 中添加：

```typescript
export interface BlockInfo {
  type: 'profile' | 'education' | 'internship' | 'project' | 'campus' | 'advantage';
  index?: number;
  heightPx: number;
  heightPt: number;
  canBreakBefore: boolean;
}

export interface LayoutInfo {
  blocks: BlockInfo[];
  pageBreaks: number[];
  totalHeightPx: number;
  totalHeightPt: number;
}
```

## 5. 前端测量模块

### 5.1 安装依赖

```bash
npm install @chenglou/pretext
```

### 5.2 布局测量 Hook

创建 `src/hooks/useResumeLayout.ts`：

```typescript
import { useMemo } from 'react';
import { prepare, layout } from '@chenglou/pretext';
import type { Resume } from '@/lib/resume/types';
import {
  MARGIN_PX,
  A4_HEIGHT_PX,
  PX_TO_PT,
  SAFETY_BUFFER_PX,
  ORPHAN_THRESHOLD_PX,
  FONT_SIZE_MAP,
  LINE_HEIGHT_RATIO,
} from '@/lib/resume/constants';

export function useResumeLayout(resume: Resume | null) {
  return useMemo(() => {
    if (!resume) return null;

    const blocks: BlockInfo[] = [];
    const { content, modules } = resume;

    // 测量 profile 块
    if (modules.profile && content.profile) {
      // 使用 pretext 测量各个文本区域
      // 累加得到总高度
      blocks.push({
        type: 'profile',
        heightPx: calculateProfileHeight(content.profile),
        heightPt: calculateProfileHeight(content.profile) * PX_TO_PT,
        canBreakBefore: false,
      });
    }

    // 测量 education 块
    if (modules.education && content.education?.length) {
      content.education.forEach((edu, index) => {
        blocks.push({
          type: 'education',
          index,
          heightPx: calculateEducationHeight(edu),
          heightPt: calculateEducationHeight(edu) * PX_TO_PT,
          canBreakBefore: true,
        });
      });
    }

    // ... 其他块类似

    // 计算分页点
    const pageBreaks = calculatePageBreaks(blocks, A4_HEIGHT_PX - MARGIN_PX * 2);

    return {
      blocks,
      pageBreaks,
      totalHeightPx: blocks.reduce((sum, b) => sum + b.heightPx, 0),
      totalHeightPt: blocks.reduce((sum, b) => sum + b.heightPt, 0),
    };
  }, [resume]);
}

// 辅助函数
function calculatePageBreaks(blocks: BlockInfo[], maxHeightPx: number): number[] {
  const pageBreaks: number[] = [];
  let currentHeight = MARGIN_PX;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockHeightWithBuffer = block.heightPx + SAFETY_BUFFER_PX;
    const nextBlock = blocks[i + 1];

    if (currentHeight + blockHeightWithBuffer > maxHeightPx) {
      pageBreaks.push(i);
      currentHeight = MARGIN_PX + blockHeightWithBuffer;
    } else {
      // 孤儿控制
      if (nextBlock &&
          nextBlock.heightPx < ORPHAN_THRESHOLD_PX &&
          currentHeight + blockHeightWithBuffer + nextBlock.heightPx <= maxHeightPx) {
        currentHeight += blockHeightWithBuffer;
      } else {
        currentHeight += blockHeightWithBuffer;
      }
    }
  }

  return pageBreaks;
}
```

## 6. 后端 PDF 生成改造

### 6.1 修改 API 路由

`src/app/api/resume/pdf/route.tsx` 扩展请求体：

```typescript
interface PDFRequest {
  resume: Resume;
  layoutInfo?: LayoutInfo;
}
```

### 6.2 修改 PDF 生成脚本

`scripts/generate-pdf.mjs` 改造：

1. 引入共享常量配置
2. 接收 layoutInfo 参数
3. 实现分页逻辑
4. 添加页眉（姓名 + 页码）

关键代码：

```javascript
function buildPdf(resume, layoutInfo) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  let y = M;
  let pageNum = 1;
  let currentBlockIndex = 0;

  // 渲染 profile
  if (resume.modules.profile && profile) {
    if (shouldBreakBefore(currentBlockIndex, y, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, profile.name);
    }
    // 渲染 profile 内容...
    currentBlockIndex++;
  }

  // 渲染 education
  if (resume.modules.education && education?.length) {
    section("教育经历");
    for (const e of education) {
      if (shouldBreakBefore(currentBlockIndex, y, layoutInfo)) {
        y = addNewPage(doc, ++pageNum, profile.name);
      }
      // 渲染单个 education...
      currentBlockIndex++;
    }
  }

  // ... 其他部分类似

  return doc;
}

function shouldBreakBefore(blockIndex, currentY, layoutInfo) {
  return layoutInfo?.pageBreaks?.includes(blockIndex);
}

function addNewPage(doc, pageNum, resumeName) {
  doc.addPage();
  doc.font(FONT_BOLD).fontSize(10);
  doc.text(`${resumeName} | 第 ${pageNum} 页`, M, 20, { align: 'center' });
  return M + 40;
}
```

## 7. 文件结构改动

```
src/
├── lib/
│   └── resume/
│       ├── constants.ts       # 🆕 新增：共享常量配置
│       ├── types.ts           # 扩展：添加 LayoutInfo 类型
│       ├── layout.ts          # 🆕 新增：布局计算工具函数
│       └── pdf.tsx            # 修改：传递 layoutInfo
├── hooks/
│   └── useResumeLayout.ts    # 🆕 新增：布局测量 hook
scripts/
└── generate-pdf.mjs          # 修改：引入常量、接收 layoutInfo、实现分页
src/app/api/resume/pdf/
└── route.tsx                 # 修改：传递 layoutInfo 给脚本
```

## 8. 关键问题解决方案

| 问题 | 解决方案 |
|------|----------|
| 字体边距不一致 | 共享常量配置文件 `constants.ts` |
| px vs pt 单位 | `PX_TO_PT = 72/96 = 0.75` 转换系数 |
| 非文本块处理 | DOM 测量图片高度，固定高度处理其他元素 |
| pretext 测量误差 | `SAFETY_BUFFER_PX = 2` 安全余量 |
| 孤儿行问题 | `ORPHAN_THRESHOLD_PX = 60` 孤儿控制 |
| 分页策略 | 在内容块之间分页 + 孤儿控制 |
| 多页页眉 | 后续页面显示「姓名 | 第 X 页」 |

## 9. 验收标准

1. ✅ 预览和 PDF 渲染完全一致
2. ✅ 内容超过一页时自动分页
3. ✅ 分页在内容块之间，不切断单个经历
4. ✅ 避免小块单独出现在页底
5. ✅ 后续页面有正确的页眉（姓名 + 页码）
6. ✅ 中文文本无重叠，排版正确

## 10. 风险与注意事项

1. **字体加载**：确保 Noto Sans SC 字体在前端和后端都正确加载
2. **性能**：pretext 的 prepare() 只需调用一次，避免重复计算
3. **测试**：需要测试各种内容长度场景（1 页、2 页、多页）
4. **回退**：如果 layoutInfo 缺失，回退到旧的固定高度逻辑
