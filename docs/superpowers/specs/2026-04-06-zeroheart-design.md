# ZeroHeart职航 - 产品设计规格说明

## 1. 产品概述

### 1.1 产品名称
ZeroHeart职航

### 1.2 产品定位
面向大学生和求职者的 AI 简历助手，帮助用户快速生成专业简历。

### 1.3 目标用户
- 大学生（在校生、应届毕业生）
- 求职者（转行、跳槽）
- 需要优化简历的职场人士

### 1.4 核心价值
- 无需登录，开箱即用
- 手动填写 + AI 辅助，随心选择
- 多简历管理，灵活应对不同岗位
- 实时预览，导出所见即所得

---

## 2. MVP 功能范围

### 2.1 必须功能（MVP）

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 简历列表 | 展示用户所有简历，支持新建/删除/复制 | P0 |
| 简历编辑 | 所见即所得编辑器，实时预览 | P0 |
| AI 生成 | 输入经历概要，AI 生成完整简历内容 | P0 |
| PDF 导出 | 选择模板，导出 PDF 文件 | P0 |
| 模块化简历 | 个人信息、教育经历、实习经历、项目经历、校园经历、个人优势 | P0 |

### 2.2 核心设计原则

- **零配置**：用户无需配置任何 API Key，开箱即用
- **模块可选**：简历各模块均为可选，用户只需填写自己有内容的相关模块
- **隐私优先**：所有数据存储在浏览器本地，不上传服务器

### 2.3 暂不做（后续迭代）

- 用户账号系统
- JD 简历定制功能
- 多格式导出（Word/图片）
- 简历分享/内链

---

## 3. 技术选型

### 3.1 前端技术栈

| 技术 | 选择 | 说明 |
|------|------|------|
| 框架 | Next.js 14+ (App Router) | React 生态成熟，SSR/SSG 支持好 |
| UI 库 | Tailwind CSS + shadcn/ui | 快速开发，设计一致性好 |
| 编辑器 | TipTap / Slate | 所见即所得富文本编辑器 |
| 状态管理 | Zustand | 轻量，简单易用 |
| PDF 生成 | @react-pdf/renderer | React 原生 PDF 生成 |
| 样式 | CSS Modules + Tailwind | 灵活组合 |

### 3.2 AI 接入

| Provider | API | 说明 |
|----------|-----|------|
| 文心一言 | ERNIE-4.0 | 百度，国内合规 |
| 通义千问 | Qwen-Max | 阿里，中文能力强 |
| Kimi | moonshot-v1 | 月之暗面，长上下文 |
| DeepSeek | deepseek-chat | 性价比高 |
| 智谱清言 | GLM-4 | 清华智谱，中文优化 |

**AI 配置策略**：平台预置多模型 API Key，用户无需配置，按需切换。

### 3.3 数据存储

| 存储 | 方式 | 说明 |
|------|------|------|
| 本地存储 | LocalStorage | MVP 阶段，数据存储在浏览器本地 |
| 导出 | JSON | 支持简历数据备份/迁移 |

### 3.4 部署

- **平台**: Netlify
- **方式**: GitHub 仓库联动自动部署

---

## 4. 架构设计

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (Next.js)                     │
├──────────────┬──────────────┬──────────────┬────────────┤
│  首页/简历列表 │   简历编辑器   │  AI 生成面板  │   导出模块   │
├──────────────┴──────────────┴──────────────┴────────────┤
│                    状态管理层 (Zustand)                  │
├─────────────────────────────────────────────────────────┤
│                    数据抽象层 (Repository Pattern)       │
├────────────────────────┬────────────────────────────────┤
│    本地存储适配器        │      云端存储适配器 (预留)       │
│   (LocalStorage)        │    (Firebase/Supabase)         │
└────────────────────────┴────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  AI Provider 抽象层                      │
├──────────────┬──────────────┬──────────────┬────────────┤
│  文心一言     │   通义千问    │    Kimi      │   智谱/DeepSeek │
└──────────────┴──────────────┴──────────────┴────────────┘
```

### 4.2 模块化设计原则

- **数据模型块化**: 简历内容拆分为独立 Block，方便扩展新模块
- **AI Provider 可插拔**: 统一接口，支持多 Provider 切换
- **存储层抽象**: Repository Pattern，本地优先，云端预留

---

## 5. 数据模型

### 5.1 简历结构

```typescript
interface Resume {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  content: ResumeContent;
  metadata: ResumeMetadata;
}

interface ResumeContent {
  profile: ProfileBlock;           // 个人信息（必填）
  education: EducationBlock[];      // 教育经历（可选）
  internship: InternshipBlock[];   // 实习经历（可选）
  project: ProjectBlock[];          // 项目经历（可选）
  campus: CampusBlock[];            // 校园经历（可选）
  advantage: AdvantageBlock;       // 个人优势（可选）
}

interface Block {
  type: string;
  order: number;
  visible: boolean;
  enabled: boolean;                 // 是否启用该模块
  data: Record<string, any>;
}
```

### 5.2 Block 详细定义

| Block 类型 | 字段 | 说明 | 必填 |
|------------|------|------|------|
| ProfileBlock | name, title, email, phone, location | 个人信息 | 是 |
| EducationBlock | school, degree, major, startDate, endDate, gpa, highlights | 教育经历 | 否 |
| InternshipBlock | company, position, startDate, endDate, description, highlights | 实习经历 | 否 |
| ProjectBlock | name, role, startDate, endDate, description, highlights | 项目经历 | 否 |
| CampusBlock | organization, position, startDate, endDate, description, highlights | 校园经历 | 否 |
| AdvantageBlock | summary: string | 个人优势 | 否 |

### 5.3 模块可选设计

用户新建简历时，只需填写个人信息模块，其他模块按需启用：

```
┌────────────────────────────────────────┐
│  简历模块管理（侧边栏）                  │
├────────────────────────────────────────┤
│  ✅ 个人信息（已启用）                  │
│  ☐ 教育经历                            │
│  ☐ 实习经历                            │
│  ☐ 项目经历                            │
│  ☐ 校园经历                            │
│  ☐ 个人优势                            │
└────────────────────────────────────────┘
```

启用某模块后，该模块才会在简历预览和 PDF 导出中显示。

---

## 6. 页面结构

### 6.1 路由设计

| 页面 | 路由 | 功能 |
|------|------|------|
| 简历列表页 | `/` | 展示所有简历，新建/删除/复制 |
| 编辑器页 | `/resume/[id]` | 所见即所得编辑，实时预览 |
| AI 生成页 | `/resume/[id]/generate` | 填写经历概要，AI 生成简历 |

### 6.2 页面流程

```
首页 (简历列表)
    │
    ├── 新建简历 → 编辑器页
    │
    ├── 选择简历 → 编辑器页
    │                  │
    │                  ├── 选择模板（预览区实时显示效果）
    │                  │
    │                  ├── 编辑内容（手动填写 or AI 辅助）
    │                  │                │
    │                  │                ├── 模块管理（启用/禁用模块）
    │                  │                │
    │                  │                └── AI 生成（可选，非必须）
    │                  │
    │                  ├── 预览区实时查看最终效果
    │                  │
    │                  └── 导出 PDF（所见即所得）
```

---

## 7. 组件设计

### 7.1 组件层级

```
App
├── Layout
│   ├── Header (Logo + 导航)
│   └── MainContent
├── Pages
│   ├── HomePage
│   │   ├── ResumeCard
│   │   ├── CreateResumeModal
│   │   └── EmptyState
│   ├── EditorPage
│   │   ├── EditorToolbar
│   │   ├── ModuleSidebar (模块管理)
│   │   ├── TemplateSelector (模板选择)
│   │   ├── EditorCanvas (TipTap 编辑区)
│   │   └── PreviewPanel (实时预览)
│   └── GeneratePage (AI 辅助页)
│       ├── ModuleSelector (选择要生成的模块)
│       ├── InputForm (经历概要输入)
│       └── GenerationResult
└── Shared
    ├── Button
    ├── Modal
    ├── Toast
    ├── Input
    └── Select
```

### 7.2 核心组件说明

| 组件 | 职责 |
|------|------|
| ModuleSidebar | 模块管理侧边栏，启用/禁用简历模块 |
| TemplateSelector | 模板选择器，预览区实时切换显示不同模板效果 |
| EditorCanvas | 富文本编辑器，承载简历内容编辑 |
| PreviewPanel | 实时预览渲染，根据所选模板展示简历最终效果 |
| ResumeCard | 简历卡片，显示基本信息，支持快捷操作 |
| ModuleSelector | AI 生成页的模块选择器，选择要生成哪些模块 |

---

## 8. AI 生成流程

### 8.1 分模块生成流程

用户无需填写完整信息，只需选择要生成的模块，填写相关内容概要：

```
1. 用户进入 AI 生成页
2. 用户选择要生成的模块（可多选）：
   - ☐ 教育经历
   - ☐ 实习经历
   - ☐ 项目经历
   - ☐ 校园经历
   - ☐ 个人优势
3. 用户填写所选模块的概要内容
4. 用户点击"生成"
5. 系统调用 AI Provider
6. AI 返回该模块的结构化内容
7. 系统解析并填充到简历对应模块
8. 跳转到编辑器页展示生成结果
```

### 8.2 各模块生成概要

| 模块 | 用户输入概要 | AI 输出 |
|------|-------------|---------|
| 教育经历 | 学校、专业、入学毕业时间、成绩/荣誉 | 结构化教育经历描述 |
| 实习经历 | 公司、岗位、实习时间、主要工作、成就 | 结构化实习经历描述 |
| 项目经历 | 项目名、角色、时间、技术栈、项目描述、个人贡献 | 结构化项目经历描述 |
| 校园经历 | 组织、职务、时间、活动描述、成就 | 结构化校园经历描述 |
| 个人优势 | 现有信息、个人特点 | 精炼的个人优势总结 |

### 8.3 AI Provider 接口

```typescript
interface AIProvider {
  name: string;
  generateModule(input: ModuleGenerateInput): Promise<ModuleContent>;
  selectProvider(): AIProvider;  // 根据负载/可用性选择 Provider
}

type ModuleType = 'education' | 'internship' | 'project' | 'campus' | 'advantage';

interface ModuleGenerateInput {
  moduleType: ModuleType;
  profile: { name: string; title: string };
  outline: string;              // 用户填写的概要
}

interface ModuleContent {
  moduleType: ModuleType;
  data: Record<string, any>;     // 解析后的结构化内容
}
```

---

## 9. PDF 导出

### 9.1 模板选择与预览

用户在编辑简历时，就能看到最终效果。模板选择是编辑体验的一部分：

```
┌─────────────────────────────────────────────────────────────────┐
│  编辑器页面                                                       │
├───────────────────────────────────────┬─────────────────────────┤
│                                       │                         │
│  编辑器内容区                          │   实时预览面板            │
│  （左侧，可填写/修改内容）              │   （右侧，实时渲染）      │
│                                       │                         │
│  [模块选择器 - 选择模板样式]            │   ┌─────────────────┐   │
│                                       │   │  模板A效果预览   │   │
│                                       │   │  模板B效果预览   │   │
│                                       │   │  模板C效果预览   │   │
│                                       │   └─────────────────┘   │
│                                       │                         │
└───────────────────────────────────────┴─────────────────────────┘
```

### 9.2 导出流程

```
1. 用户在编辑页面选择模板样式（实时预览效果）
2. 用户填写/完善简历内容
3. 预览区实时显示最终效果
4. 用户点击"导出 PDF"
5. 系统生成 PDF 文件
6. 触发浏览器下载
```

### 9.3 模板风格

| 模板 | 风格描述 | 预览效果 |
|------|----------|----------|
| 简约专业 | 白底黑字，线条简洁，适合金融/咨询 | [预览图] |
| 现代简洁 | 淡色背景，分区清晰，适合互联网 | [预览图] |
| 经典稳重 | 传统排版，层次分明，适合国企/传统行业 | [预览图] |
| 创意时尚 | 色彩点缀，布局灵活，适合设计/创意类 | [预览图] |

**关键：用户在编辑时就能看到选用不同模板的最终效果，选择模板=选择预览效果，导出=所见即所得**

---

## 10. 错误处理

| 场景 | 处理方式 |
|------|----------|
| AI 服务不可用 | 自动切换到其他 AI Provider，显示切换提示 |
| AI 生成失败 | Toast 提示错误，显示重试按钮 |
| LocalStorage 满了 | 提示用户导出/清理数据 |
| 简历数据损坏 | 尝试恢复旧版本，提供备份机制 |
| 网络断开 | 离线模式友好提示，已生成内容缓存 |

---

## 11. 项目结构

```
zeroheart-zhihang/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 首页（简历列表）
│   │   ├── layout.tsx          # 根布局
│   │   └── resume/
│   │       └── [id]/
│   │           ├── page.tsx    # 编辑器页
│   │           └── generate/
│   │               └── page.tsx # AI 生成页
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── editor/             # 编辑器相关组件
│   │   ├── resume/             # 简历相关组件
│   │   └── ai/                 # AI 相关组件
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── providers/      # AI Provider 实现
│   │   │   └── index.ts        # Provider 导出
│   │   ├── storage/
│   │   │   ├── repository.ts   # Repository 接口
│   │   │   └── local.ts        # LocalStorage 实现
│   │   ├── resume/
│   │   │   ├── types.ts        # 简历数据类型
│   │   │   └── template.ts     # 简历模板
│   │   └── utils.ts
│   └── stores/
│       └── resume.ts           # Zustand store
├── public/
│   └── templates/              # PDF 模板资源
├── docs/
│   └── specs/                  # 设计文档
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## 12. 开发里程碑

### Phase 1: 基础搭建
- [ ] Next.js 项目初始化
- [ ] Tailwind + shadcn/ui 配置
- [ ] 基础组件库搭建
- [ ] 路由配置

### Phase 2: 核心功能
- [ ] 简历列表页
- [ ] 简历编辑器（富文本）
- [ ] 简历数据模型 + LocalStorage 存储
- [ ] PDF 预览 + 导出

### Phase 3: AI 集成
- [ ] AI Provider 抽象层
- [ ] 文心一言 Provider 实现
- [ ] AI 生成页
- [ ] 通义千问 Provider 实现

### Phase 4: 完善优化
- [ ] 多模板支持
- [ ] 错误处理优化
- [ ] 响应式适配
- [ ] 部署上线

---

## 13. 验收标准

### 13.1 功能验收

| 功能 | 验收条件 |
|------|----------|
| 简历列表 | 能新建/删除/复制简历，数据正确保存到 LocalStorage |
| 简历编辑 | 所见即所得编辑，修改实时反映到预览 |
| 模块管理 | 能启用/禁用各模块，禁用模块不在预览和 PDF 中显示 |
| 模板预览 | 能在编辑时切换不同模板，预览区实时显示最终效果 |
| AI 生成 | 选择模块后输入概要，能生成对应模块的结构化内容（可选功能） |
| PDF 导出 | 能导出当前预览效果的 PDF，导出=所见即所得 |

### 13.2 体验验收

- [ ] 无需注册，开箱即用
- [ ] 无需配置 API Key，AI 功能开箱即用
- [ ] 用户只需填写有内容的模块，没内容的模块可跳过
- [ ] 无需 AI 也能完成简历，直接手动填写后导出
- [ ] 编辑时实时预览，切换模板立即看到效果
- [ ] 操作流程流畅，无多余步骤
- [ ] 错误提示友好
- [ ] 移动端基本可用（响应式）

---

## 14. 附录

### 14.1 参考资料
- shadcn/ui 组件库: https://ui.shadcn.com
- TipTap 编辑器: https://tiptap.dev
- @react-pdf/renderer: https://react-pdf.org

### 14.2 术语表

| 术语 | 说明 |
|------|------|
| Block | 简历内容块，模块化设计的基础单元 |
| Provider | AI 服务提供者（如文心一言、通义千问） |
| Repository | 数据仓库接口，抽象数据存储操作 |
| LocalStorage | 浏览器本地存储 |
