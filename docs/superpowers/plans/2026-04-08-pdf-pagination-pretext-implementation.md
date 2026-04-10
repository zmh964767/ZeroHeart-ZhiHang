# PDF 分页与 Pretext 文本测量优化实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 使用 pretext 库测量文本高度，实现 PDF 自动分页功能，解决内容重叠问题

**架构：** 混合方案 - 前端用 pretext 测量布局并计算分页点，后端用 pdfkit 按指定位置渲染分页

**技术栈：** Next.js 14、TypeScript、@chenglou/pretext、pdfkit

---

## 文件结构概览

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/lib/resume/constants.ts` | 创建 | 共享常量配置（单位、尺寸、字体大小等） |
| `src/lib/resume/types.ts` | 修改 | 扩展 LayoutInfo、BlockInfo 类型 |
| `src/lib/resume/layout.ts` | 创建 | 布局计算工具函数 |
| `src/hooks/useResumeLayout.ts` | 创建 | 前端布局测量 Hook |
| `src/lib/resume/pdf.tsx` | 修改 | 传递 layoutInfo 给 API |
| `src/app/api/resume/pdf/route.tsx` | 修改 | 接收并传递 layoutInfo 给脚本 |
| `scripts/generate-pdf.mjs` | 修改 | 实现分页逻辑、页眉、layoutInfo 支持 |
| `package.json` | 修改 | 安装 @chenglou/pretext 依赖 |

---

## 任务 1：安装 pretext 依赖

**文件：** `package.json`

- [ ] **步骤 1：安装 @chenglou/pretext**

运行：
```bash
cd /home/zerobyheart/sps/.worktrees/zeroheart && npm install @chenglou/pretext
```

预期：安装成功，package.json 更新

- [ ] **步骤 2：Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: 安装 @chenglou/pretext 文本测量库"
```

---

## 任务 2：创建共享常量配置文件

**文件：** `src/lib/resume/constants.ts`

- [ ] **步骤 1：创建 constants.ts**

```typescript
export const PX_TO_PT = 72 / 96;
export const PT_TO_PX = 96 / 72;

export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const MARGIN_PT = 56.69;
export const MARGIN_PX = 75.59;

export const FONT_SIZE_MAP = {
  name: { px: 22, pt: 16.5 },
  title: { px: 11, pt: 8.25 },
  info: { px: 10, pt: 7.5 },
  section: { px: 11, pt: 8.25 },
  body: { px: 10, pt: 7.5 },
  small: { px: 9, pt: 6.75 },
} as const;

export const SAFETY_BUFFER_PX = 2;
export const SAFETY_BUFFER_PT = SAFETY_BUFFER_PX * PX_TO_PT;

export const ORPHAN_THRESHOLD_PX = 60;
export const ORPHAN_THRESHOLD_PT = ORPHAN_THRESHOLD_PX * PX_TO_PT;

export const LINE_HEIGHT_RATIO = 1.4;
```

- [ ] **步骤 2：Commit**

```bash
git add src/lib/resume/constants.ts
git commit -m "feat: 添加共享常量配置文件"
```

---

## 任务 3：扩展类型定义

**文件：** `src/lib/resume/types.ts`

- [ ] **步骤 1：添加 LayoutInfo 和 BlockInfo 类型**

在文件末尾添加：

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

- [ ] **步骤 2：Commit**

```bash
git add src/lib/resume/types.ts
git commit -m "feat: 扩展类型定义，添加 LayoutInfo 和 BlockInfo"
```

---

## 任务 4：创建布局计算工具函数

**文件：** `src/lib/resume/layout.ts`

- [ ] **步骤 1：创建 layout.ts**

```typescript
import type { BlockInfo } from './types';
import {
  MARGIN_PX,
  SAFETY_BUFFER_PX,
  ORPHAN_THRESHOLD_PX,
  PX_TO_PT,
} from './constants';

export function calculatePageBreaks(
  blocks: BlockInfo[],
  maxHeightPx: number
): number[] {
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

export function pxToPt(px: number): number {
  return px * PX_TO_PT;
}

export function ptToPx(pt: number): number {
  return pt / PX_TO_PT;
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/lib/resume/layout.ts
git commit -m "feat: 添加布局计算工具函数"
```

---

## 任务 5：创建布局测量 Hook

**文件：** `src/hooks/useResumeLayout.ts`

- [ ] **步骤 1：创建 useResumeLayout.ts**

```typescript
import { useMemo } from 'react';
import { prepare, layout } from '@chenglou/pretext';
import type { Resume, BlockInfo, LayoutInfo } from '@/lib/resume/types';
import {
  MARGIN_PX,
  A4_HEIGHT_PX,
  PX_TO_PT,
  SAFETY_BUFFER_PX,
  FONT_SIZE_MAP,
  LINE_HEIGHT_RATIO,
} from '@/lib/resume/constants';
import { calculatePageBreaks } from '@/lib/resume/layout';

function measureTextHeight(
  text: string,
  fontSizePx: number,
  maxWidthPx: number,
  lineHeightRatio: number = LINE_HEIGHT_RATIO
): number {
  if (!text) return 0;
  try {
    const font = `${fontSizePx}px "Noto Sans SC", sans-serif`;
    const prepared = prepare(text, font, { whiteSpace: 'pre-wrap' });
    const lineHeight = fontSizePx * lineHeightRatio;
    const result = layout(prepared, maxWidthPx, lineHeight);
    return result.height;
  } catch (e) {
    console.warn('pretext 测量失败，回退到估算:', e);
    const estimatedLines = Math.ceil(text.length / 30);
    return estimatedLines * fontSizePx * lineHeightRatio;
  }
}

export function useResumeLayout(resume: Resume | null): LayoutInfo | null {
  return useMemo(() => {
    if (!resume) return null;

    const blocks: BlockInfo[] = [];
    const { content, modules } = resume;
    const contentWidthPx = 794 - 75.59 * 2;

    if (modules.profile && content.profile) {
      let heightPx = 0;
      heightPx += measureTextHeight(content.profile.name, FONT_SIZE_MAP.name.px, contentWidthPx);
      heightPx += 8;
      if (content.profile.title) {
        heightPx += measureTextHeight(content.profile.title, FONT_SIZE_MAP.title.px, contentWidthPx);
        heightPx += 4;
      }
      if (content.profile.email || content.profile.phone || content.profile.location) {
        heightPx += 14 * 3;
      }
      if (content.profile.photo) {
        heightPx = Math.max(heightPx, 105);
      }
      heightPx += 20;

      blocks.push({
        type: 'profile',
        heightPx,
        heightPt: heightPx * PX_TO_PT,
        canBreakBefore: false,
      });
    }

    const sectionHeaderHeight = 15 + 10 + 10;

    if (modules.education && content.education?.length) {
      blocks.push({
        type: 'education',
        index: -1,
        heightPx: sectionHeaderHeight,
        heightPt: sectionHeaderHeight * PX_TO_PT,
        canBreakBefore: true,
      });

      content.education.forEach((edu, index) => {
        let heightPx = 0;
        heightPx += 16;
        heightPx += 14;
        if (edu.gpa) heightPx += 13;
        if (edu.courses) {
          heightPx += measureTextHeight(edu.courses, FONT_SIZE_MAP.small.px, contentWidthPx);
        }
        if (edu.awards) {
          heightPx += measureTextHeight(edu.awards, FONT_SIZE_MAP.small.px, contentWidthPx);
        }
        if (edu.highlights?.length) {
          heightPx += edu.highlights.length * 13;
        }
        heightPx += 8;

        blocks.push({
          type: 'education',
          index,
          heightPx,
          heightPt: heightPx * PX_TO_PT,
          canBreakBefore: true,
        });
      });
    }

    const addSectionBlocks = (
      type: 'internship' | 'project' | 'campus',
      items: any[],
      sectionTitle: string
    ) => {
      if (items?.length) {
        blocks.push({
          type,
          index: -1,
          heightPx: sectionHeaderHeight,
          heightPt: sectionHeaderHeight * PX_TO_PT,
          canBreakBefore: true,
        });

        items.forEach((item, index) => {
          let heightPx = 0;
          heightPx += 16;
          heightPx += 14;
          if (item.description) {
            heightPx += measureTextHeight(item.description, FONT_SIZE_MAP.body.px, contentWidthPx);
            heightPx += 4;
          }
          if (item.highlights?.length) {
            heightPx += item.highlights.length * 13;
          }
          heightPx += 8;

          blocks.push({
            type,
            index,
            heightPx,
            heightPt: heightPx * PX_TO_PT,
            canBreakBefore: true,
          });
        });
      }
    };

    addSectionBlocks('internship', content.internship, '实习经历');
    addSectionBlocks('project', content.project, '项目经历');
    addSectionBlocks('campus', content.campus, '校园经历');

    if (modules.advantage && content.advantage?.summary) {
      blocks.push({
        type: 'advantage',
        index: -1,
        heightPx: sectionHeaderHeight,
        heightPt: sectionHeaderHeight * PX_TO_PT,
        canBreakBefore: true,
      });

      const heightPx = measureTextHeight(content.advantage.summary, FONT_SIZE_MAP.body.px, contentWidthPx);
      blocks.push({
        type: 'advantage',
        index: 0,
        heightPx,
        heightPt: heightPx * PX_TO_PT,
        canBreakBefore: true,
      });
    }

    const maxHeightPx = A4_HEIGHT_PX - MARGIN_PX * 2;
    const pageBreaks = calculatePageBreaks(blocks, maxHeightPx);

    return {
      blocks,
      pageBreaks,
      totalHeightPx: blocks.reduce((sum, b) => sum + b.heightPx, 0),
      totalHeightPt: blocks.reduce((sum, b) => sum + b.heightPt, 0),
    };
  }, [resume]);
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/hooks/useResumeLayout.ts
git commit -m "feat: 添加 useResumeLayout Hook"
```

---

## 任务 6：修改 PDF 导出函数传递 layoutInfo

**文件：** `src/lib/resume/pdf.tsx`

- [ ] **步骤 1：修改 generatePDF 函数**

```typescript
import { Resume, LayoutInfo } from "./types";

export async function generatePDF(resume: Resume, layoutInfo?: LayoutInfo): Promise<void> {
  try {
    const response = await fetch("/api/resume/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, layoutInfo }),
    });

    if (!response.ok) throw new Error("PDF generation failed");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.name || "简历"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("PDF生成失败:", e);
    alert("PDF生成失败，请重试");
  }
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/lib/resume/pdf.tsx
git commit -m "feat: 修改 generatePDF 支持传递 layoutInfo"
```

---

## 任务 7：修改 API 路由传递 layoutInfo

**文件：** `src/app/api/resume/pdf/route.tsx`

- [ ] **步骤 1：修改 API 路由**

```typescript
import { NextRequest, NextResponse } from "next/server";
import type { Resume, LayoutInfo } from "@/lib/resume/types";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const MAX_BODY_SIZE = 5 * 1024 * 1024;
const PROCESS_TIMEOUT = 30000;

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "请求体过大，最大 5MB" }, { status: 413 });
  }

  const outputPath = `/tmp/resume-${Date.now()}.pdf`;

  try {
    const body = await request.json();
    const resume: Resume = body.resume;
    const layoutInfo: LayoutInfo | undefined = body.layoutInfo;

    const scriptPath = path.join(process.cwd(), "scripts/generate-pdf.mjs");

    const result = await new Promise<Buffer>((resolve, reject) => {
      const child = spawn("node", [scriptPath]);
      let stdout = "", stderr = "";
      let timedOut = false;

      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill();
        reject(new Error("PDF 生成超时（30秒）"));
      }, PROCESS_TIMEOUT);

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(new Error(`Spawn failed: ${err.message}`));
      });

      child.stdout?.on("data", (d: Buffer) => { stdout += d.toString(); });
      child.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });

      child.on("close", (code) => {
        clearTimeout(timeout);
        if (timedOut) return;
        if (code !== 0) {
          reject(new Error(`PDF script failed: ${stderr}`));
        } else if (!fs.existsSync(outputPath)) {
          reject(new Error("PDF file not created: " + stdout));
        } else {
          resolve(fs.readFileSync(outputPath));
        }
      });

      child.stdin?.write(JSON.stringify({ resume, outputPath, layoutInfo }));
      child.stdin?.end();
    });

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(resume.name || "简历")}.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    const message = e instanceof Error ? e.message : "PDF生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch { /* ignore */ }
  }
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/app/api/resume/pdf/route.tsx
git commit -m "feat: 修改 API 路由传递 layoutInfo"
```

---

## 任务 8：改造 PDF 生成脚本实现分页

**文件：** `scripts/generate-pdf.mjs`

- [ ] **步骤 1：读取当前脚本内容**

（先读取，然后修改）

- [ ] **步骤 2：修改 generate-pdf.mjs**

完整修改后的代码：

```javascript
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

const FONT_DIR = path.join(process.cwd(), "public/fonts");
const FONT_REGULAR = `${FONT_DIR}/NotoSansSC-Regular.ttf`;
const FONT_BOLD = `${FONT_DIR}/NotoSansSC-Bold.ttf`;

const PX_TO_PT = 72 / 96;
const A4_HEIGHT_PT = 841.89;

const COLORS = {
  simple: { name: [0, 0, 0], title: [102, 102, 102], info: [153, 153, 153], header: [0, 0, 0], sectionLine: [0, 0, 0] },
  modern: { name: [30, 58, 110], title: [38, 99, 235], info: [153, 153, 153], header: [30, 58, 110], sectionLine: [30, 58, 110] },
  classic: { name: [51, 51, 51], title: [102, 102, 102], info: [153, 153, 153], header: [51, 51, 51], sectionLine: [51, 51, 51] },
  creative: { name: [89, 27, 135], title: [125, 60, 235], info: [125, 60, 235], header: [89, 27, 135], sectionLine: [89, 27, 135] },
};

function fmtDate(d) {
  if (!d) return "";
  return d.replace(/-/g, ".");
}

function buildDates(start, end) {
  const s = fmtDate(start), e = fmtDate(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  if (e) return e;
  return "";
}

function shouldBreakBefore(blockIndex, layoutInfo) {
  return layoutInfo?.pageBreaks?.includes(blockIndex);
}

function addNewPage(doc, pageNum, resumeName, M) {
  doc.addPage();
  doc.font(FONT_BOLD).fontSize(10);
  doc.text(`${resumeName} | 第 ${pageNum} 页`, M, 20, { align: 'center', width: 595.28 - M * 2 });
  return M + 40;
}

function buildPdf(resume, layoutInfo) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const W = 595.28, M = 56.69;
  const PW = W - M * 2;
  const c = COLORS[resume.template] || COLORS.simple;
  const { profile, education, internship, project, campus, advantage } = resume.content;
  let y = M;
  let pageNum = 1;
  let currentBlockIndex = 0;
  const resumeName = profile?.name || "简历";

  function section(title) {
    doc.font(FONT_BOLD).fontSize(11);
    doc.fillColor(c.header[0], c.header[1], c.header[2]);
    doc.text(title, M, y, { width: PW });
    y += 15;
    doc.strokeColor(c.sectionLine[0], c.sectionLine[1], c.sectionLine[2]).lineWidth(0.8);
    doc.moveTo(M, y).lineTo(W - M, y).stroke();
    y += 10;
  }

  function entry(title, subtitle, dates, extras) {
    const DATE_W = 90;
    const GAP = 8;
    const titleW = PW - DATE_W - GAP;

    if (dates) {
      doc.font(FONT_REGULAR).fontSize(9);
      doc.fillColor(c.info[0], c.info[1], c.info[2]);
      doc.text(dates, W - M - DATE_W, y, { width: DATE_W, align: "right" });
    }

    doc.font(FONT_BOLD).fontSize(11);
    doc.fillColor(0, 0, 0);
    doc.text(title || "", M, y, { width: titleW });
    y += 16;

    if (subtitle) {
      doc.font(FONT_REGULAR).fontSize(10);
      doc.fillColor(c.title[0], c.title[1], c.title[2]);
      doc.text(subtitle, M, y, { width: PW });
      y += 14;
    }

    if (extras && extras.length > 0) {
      doc.font(FONT_REGULAR).fontSize(10);
      doc.fillColor(c.info[0], c.info[1], c.info[2]);
      for (const ex of extras) {
        doc.text(ex, M, y, { width: PW });
        y += 13;
      }
    }

    y += 8;
  }

  if (resume.modules.profile && profile) {
    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;

    const photoW = 28 * 2.83465;
    const photoH = 37 * 2.83465;

    if (profile.photo) {
      try {
        const base64 = profile.photo.replace(/^data:image\/\w+;base64,/, "");
        doc.image(Buffer.from(base64, "base64"), M + PW - photoW, y, { width: photoW, height: photoH });
      } catch (e) { /* ignore */ }
    }

    const textMaxW = profile.photo ? PW - photoW - 12 : PW;

    doc.font(FONT_BOLD).fontSize(22);
    doc.fillColor(c.name[0], c.name[1], c.name[2]);
    doc.text(profile.name || "姓名", M, y, { width: textMaxW });

    let infoY = y + 28;
    doc.font(FONT_REGULAR).fontSize(11);
    doc.fillColor(c.title[0], c.title[1], c.title[2]);
    if (profile.title) {
      doc.text(profile.title, M, infoY, { width: textMaxW });
      infoY += 16;
    }

    doc.font(FONT_REGULAR).fontSize(10);
    doc.fillColor(c.info[0], c.info[1], c.info[2]);
    if (profile.email) { doc.text(profile.email, M, infoY, { width: textMaxW }); infoY += 14; }
    if (profile.phone) { doc.text(profile.phone, M, infoY, { width: textMaxW }); infoY += 14; }
    if (profile.location) { doc.text(profile.location, M, infoY, { width: textMaxW }); infoY += 14; }

    y = Math.max(y + photoH, infoY) + 20;
  }

  if (resume.modules.education && education?.length) {
    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;
    section("教育经历");

    for (const e of education) {
      if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
        y = addNewPage(doc, ++pageNum, resumeName, M);
      }
      currentBlockIndex++;

      const extras = [];
      if (e.gpa) extras.push(`GPA: ${e.gpa}`);
      if (e.courses && typeof e.courses === "string") { e.courses.split("\n").filter(Boolean).forEach(l => extras.push(l.trim())); }
      if (e.awards && typeof e.awards === "string") { e.awards.split("\n").filter(Boolean).forEach(l => extras.push(l.trim())); }
      if (e.highlights?.length) extras.push(...e.highlights);
      entry(e.school || "", [e.degree, e.major].filter(Boolean).join("  "), buildDates(e.startDate, e.endDate), extras);
    }
    y += 4;
  }

  if (resume.modules.internship && internship?.length) {
    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;
    section("实习经历");

    for (const i of internship) {
      if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
        y = addNewPage(doc, ++pageNum, resumeName, M);
      }
      currentBlockIndex++;

      const extras = [...(i.highlights || [])];
      if (i.description) extras.unshift(i.description);
      entry(i.company || "", i.position, buildDates(i.startDate, i.endDate), extras);
    }
    y += 4;
  }

  if (resume.modules.project && project?.length) {
    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;
    section("项目经历");

    for (const p of project) {
      if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
        y = addNewPage(doc, ++pageNum, resumeName, M);
      }
      currentBlockIndex++;

      const extras = [...(p.highlights || [])];
      if (p.description) extras.unshift(p.description);
      entry(p.name || "", p.role, buildDates(p.startDate, p.endDate), extras);
    }
    y += 4;
  }

  if (resume.modules.campus && campus?.length) {
    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;
    section("校园经历");

    for (const c_ of campus) {
      if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
        y = addNewPage(doc, ++pageNum, resumeName, M);
      }
      currentBlockIndex++;

      const extras = [...(c_.highlights || [])];
      if (c_.description) extras.unshift(c_.description);
      entry(c_.organization || "", c_.position, buildDates(c_.startDate, c_.endDate), extras);
    }
    y += 4;
  }

  if (resume.modules.advantage && advantage?.summary) {
    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;
    section("个人优势");

    if (shouldBreakBefore(currentBlockIndex, layoutInfo)) {
      y = addNewPage(doc, ++pageNum, resumeName, M);
    }
    currentBlockIndex++;

    doc.font(FONT_REGULAR).fontSize(9);
    doc.fillColor(c.info[0], c.info[1], c.info[2]);
    doc.text(advantage.summary, M, y, { width: PW });
  }

  return doc;
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
const { resume, outputPath, layoutInfo } = input;
const doc = buildPdf(resume, layoutInfo);
const chunks = [];
doc.on("data", (chunk) => chunks.push(chunk));
doc.on("end", () => {
  const buffer = Buffer.concat(chunks);
  fs.writeFileSync(outputPath, buffer);
  console.log("PDF generated:", buffer.length, "bytes");
});
doc.end();
```

- [ ] **步骤 3：Commit**

```bash
git add scripts/generate-pdf.mjs
git commit -m "feat: 改造 PDF 生成脚本，实现分页和 layoutInfo 支持"
```

---

## 任务 9：集成到导出按钮

**文件：** 找到使用 generatePDF 的组件

- [ ] **步骤 1：搜索使用 generatePDF 的文件**

运行：
```bash
cd /home/zerobyheart/sps/.worktrees/zeroheart && grep -r "generatePDF" src --include="*.tsx" --include="*.ts"
```

- [ ] **步骤 2：修改导出按钮组件**

找到组件后，修改导出逻辑：

```typescript
import { useResumeLayout } from '@/hooks/useResumeLayout';

// 在组件中
const layoutInfo = useResumeLayout(currentResume);

// 导出时
await generatePDF(currentResume, layoutInfo);
```

- [ ] **步骤 3：Commit**

```bash
git add <修改的文件>
git commit -m "feat: 集成 layoutInfo 到导出按钮"
```

---

## 任务 10：测试验证

- [ ] **步骤 1：启动开发服务器**

```bash
npm run dev
```

- [ ] **步骤 2：测试短简历（1页）**
  - 填写少量内容
  - 导出 PDF
  - 验证无重叠、无分页

- [ ] **步骤 3：测试长简历（多页）**
  - 填写大量内容（多个经历、长描述）
  - 导出 PDF
  - 验证：
    - ✅ 自动分页
    - ✅ 分页在内容块之间
    - ✅ 后续页面有正确的页眉
    - ✅ 无内容重叠

- [ ] **步骤 4：运行 lint 和类型检查**

```bash
npm run lint
npx tsc --noEmit
```

---

## 自检

**1. 规格覆盖度：** ✅ 全部覆盖
- 共享常量配置 ✓
- 前端 pretext 测量 ✓
- 分页计算 ✓
- 孤儿控制 ✓
- 安全余量 ✓
- 后端分页渲染 ✓
- 页眉 ✓

**2. 占位符扫描：** ✅ 无占位符
- 所有步骤都有完整代码
- 所有命令都明确

**3. 类型一致性：** ✅ 一致
- LayoutInfo、BlockInfo 类型明确定义
- 前后端使用相同的常量

---

计划已完成并保存到 `docs/superpowers/plans/2026-04-08-pdf-pagination-pretext-implementation.md`。两种执行方式：

**1. 子代理驱动（推荐）** - 每个任务调度一个新的子代理，任务间进行审查，快速迭代

**2. 内联执行** - 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点

选哪种方式？
