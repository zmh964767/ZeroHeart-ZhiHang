# AI 辅助填充功能设计文档

> **日期：** 2026-04-07
> **状态：** 已确认

## 1. 概述

AI 辅助填充是一个侧边抽屉式的交互功能，帮助用户快速生成简历各模块的专业内容。

### 核心设计原则

- **信息一致性**：AI 必须基于用户已填写的信息生成，不凭空编造
- **所见即所得**：流式输出 Markdown，用户可以实时编辑
- **用户主导**：生成结果仅作参考，用户拥有最终决策权

***

## 2. 交互流程

```
用户点击"AI 辅助填充"按钮
        ↓
    弹出侧边抽屉（右侧）
        ↓
   自动读取简历已有信息
        ↓
   选择要生成的模块（多选）
        ↓
   点击"开始生成"
        ↓
   流式输出 Markdown 预览
        ↓
   用户操作：
   • 直接编辑 Markdown
   • 点击"重新生成"（该模块）
   • 点击"采纳填充"
        ↓
   内容填充到简历，关闭抽屉
```

***

## 3. 信息读取规则

### 3.1 必读信息

| 模块         | 必读字段                                                                | 说明               |
| ---------- | ------------------------------------------------------------------- | ---------------- |
| profile    | name, title                                                         | 姓名 + 求职意向（核心上下文） |
| education  | school, degree, major, startDate, endDate, gpa                      | 已有的教育经历          |
| internship | company, position, startDate, endDate, description, highlights      | 已有的实习经历          |
| project    | name, role, startDate, endDate, description, highlights             | 已有的项目经历          |
| campus     | organization, position, startDate, endDate, description, highlights | 已有的校园经历          |
| advantage  | summary                                                              | 已有优势概要（用于扩写）      |

### 3.2 信息不足时的处理

| 情况           | 处理方式                                      |
| ------------ | ----------------------------------------- |
| 模块信息为空       | 允许生成，但提示"该模块暂无信息，AI 将基于你的求职意向生成"          |
| profile 未填写  | 禁止使用 AI 生成，提示"请先填写姓名和求职意向"                |
| 信息过少（如只有学校名） | AI 生成时会"合理推断"，但会在输出末尾标注"⚠️ 基于较少信息生成，建议补充" |

### 3.3 Prompt 上下文构建

```typescript
interface AIContext {
  // 核心上下文（必有）
  profile: {
    name: string;
    title: string;
  };
  // 各模块已有信息（可能有）
  education?: EducationBlock[];
  internship?: InternshipBlock[];
  project?: ProjectBlock[];
  campus?: CampusBlock[];
  advantage?: { summary: string };
  // 用户选择的待生成模块
  targetModules: ModuleType[];
}
```

***

## 4. AI Prompt 模板

### 4.1 Prompt 通用结构

```
你是专业的简历撰写助手。用户正在申请 [求职意向] 岗位。

## 已有信息
[根据目标模块填充对应的已有信息]

## 要求
1. 使用 Markdown 格式输出
2. 突出与 [求职意向] 相关的内容
3. 亮点用 **加粗** + 具体数字量化
4. 只输出 Markdown，不要其他内容

## 输出格式
[具体格式要求]
```

### 4.2 各模块 Prompt 模板

#### 教育经历 (education)

```
你是专业的简历撰写助手。用户正在申请 [前端开发工程师] 岗位。

## 已有信息
- 姓名：[张三]
- 学校：[XX大学]
- 专业：[计算机科学与技术]
- 学历：[本科]
- 在校时间：[2020.09 - 2024.06]
- GPA：[3.8/4.0]

## 要求
1. 使用 Markdown 格式输出
2. 突出与 [前端开发工程师] 相关的内容（如编程课程、项目经历）
3. 亮点用 **加粗** + 具体数字量化
4. 亮点分类清晰，使用 emoji 分类标签
5. 不要编造具体数字，如不知道可写"多次获得奖学金"而非"获得 3 次奖学金"

## 输出格式
## [学校] [专业]
📅 [时间]  |  📊 GPA: [GPA]

### 学术成就

- 🏆 **亮点描述**
  · 详细说明

### 实践经历

- 💻 **亮点描述**
  · 详细说明
```

#### 实习经历 (internship)

```
你是专业的简历撰写助手。用户正在申请 [前端开发工程师] 岗位。

## 已有信息
- 姓名：[张三]
- 求职意向：[前端开发工程师]
- 公司：[XX公司]
- 职位：[前端开发实习生]
- 在职时间：[2023.06 - 2023.09]
- 工作描述：[参与前端开发工作]

## 要求
1. 基于已有信息扩写，不要改变核心事实
2. 使用 Markdown 格式输出
3. 突出技术栈和项目成果
4. 成果用 **加粗** + 数字量化
5. 动作词使用：参与、负责、开发、优化、实现等

## 输出格式
## [公司] | [职位]
📅 [时间]

[扩写后的工作描述段落]

### 工作成果

- 🚀 **成果描述** + 数字
  · 详细说明
```

#### 项目经历 (project)

```
你是专业的简历撰写助手。用户正在申请 [前端开发工程师] 岗位。

## 已有信息
- 项目名称：[React 组件库开发]
- 角色：[核心开发者]
- 时间：[2023.03 - 2023.08]
- 项目描述：[独立开发了一个 React 组件库]

## 要求
1. 基于已有信息扩写
2. 使用 Markdown 格式输出
3. 突出技术栈、项目规模、个人贡献
4. 成果用 **加粗** + 数字量化

## 输出格式
## [项目名称] | [角色]
📅 [时间]

[项目描述段落]

### 技术栈
[技术栈列表]

### 个人贡献

- 💻 **贡献描述** + 数字
  · 详细说明
```

#### 校园经历 (campus)

```
你是专业的简历撰写助手。用户正在申请 [前端开发工程师] 岗位。

## 已有信息
- 组织：[学生会]
- 职务：[主席]
- 时间：[2022.09 - 2023.06]
- 描述：[组织了多场大型活动]

## 要求
1. 基于已有信息扩写
2. 使用 Markdown 格式输出
3. 突出领导力、组织能力、团队协作
4. 成果用 **加粗** + 数字量化
5. 可迁移技能（沟通、项目管理）可用"培养了优秀的 XXX 能力"表述

## 输出格式
## [组织] | [职务]
📅 [时间]

[活动描述段落]

### 主要成果

- 🎯 **成果描述** + 数字
  · 详细说明
```

#### 个人优势 (advantage)

```
你是专业的简历撰写助手。用户正在申请 [前端开发工程师] 岗位。

## 已有信息
- 姓名：[张三]
- 求职意向：[前端开发工程师]
- 个人优势概要：[熟悉 React，了解前端工程化]

## 已有的其他模块信息（用于提炼共性亮点）
[教育经历亮点]
[实习经历亮点]
[项目经历亮点]
[校园经历亮点]

## 要求
1. 基于用户已有经历，提炼出与 [前端开发工程师] 最相关的技能和优势
2. 使用 Markdown 格式输出
3. 控制在 3-5 个核心优势点
4. 每个优势点用具体经历/成果支撑，而非空洞描述
5. 语言精炼，每点不超过 2 行

## 输出格式
## 个人优势

- 💡 **技术能力**：**描述**，具体体现在...
- 🚀 **项目经验**：**描述**，参与过...
- 🤝 **协作能力**：**描述**，在...中体现
- 📚 **学习能力**：**描述**，例如...
```

***

## 5. UI 组件设计

### 5.1 组件结构

```
AISidebar (侧边抽屉容器)
├── Header (标题 + 关闭按钮)
├── ModuleSelector (模块多选器)
├── ContextPreview (已读取信息预览)
├── GenerationArea (生成区域)
│   ├── ModuleTab (各模块 Tab)
│   ├── MarkdownStreamViewer (流式 Markdown 渲染)
│   └── ActionButtons (重新生成 + 采纳)
└── Footer (如有需要)
```

### 5.2 布局规格

| 属性   | 值                                   |
| ---- | ----------------------------------- |
| 抽屉宽度 | 480px                               |
| 抽屉位置 | 右侧                                  |
| 背景遮罩 | 半透明黑色 50%                           |
| 动画   | slide-in from right, 300ms ease-out |

### 5.3 状态定义

| 状态         | UI 表现                 |
| ---------- | --------------------- |
| idle       | 显示模块选择器               |
| generating | 流式输出中，显示加载动画          |
| generated  | 显示 Markdown 预览 + 操作按钮 |
| error      | 显示错误信息 + 重试按钮         |

***

## 6. Markdown 到结构化数据的转换

### 6.1 解析规则

```typescript
// 教育经历解析
const parseEducationMarkdown = (md: string): Partial<EducationBlock> => {
  // 提取学校、专业、时间、GPA
  // 提取 ### 分隔的各个亮点分类
  // 提取每个 - **bold** 下的内容作为 highlights
};

// 输出结构
interface ParsedEducation {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[]; // 扁平化的字符串数组
}
```

### 6.2 采纳填充逻辑

```typescript
const handleAccept = (moduleType: ModuleType, markdown: string) => {
  // 1. 解析 Markdown 为结构化数据
  const parsed = parseMarkdown(moduleType, markdown);

  // 2. 与现有数据合并（追加而非覆盖）
  const existing = currentResume.content[moduleType];
  const merged = Array.isArray(existing)
    ? [...existing, parsed]
    : [parsed];

  // 3. 更新 Store
  updateContent({ [moduleType]: merged });

  // 4. 关闭抽屉或切换到下一个模块
};
```

***

## 7. 技术实现要点

### 7.1 Hooks

| Hook                  | 职责                 |
| --------------------- | ------------------ |
| `useAISidebar`        | 管理抽屉开关状态           |
| `useAIStreamGenerate` | 处理流式生成，接收 SSE 事件   |
| `useResumeContext`    | 读取当前简历信息           |
| `useMarkdownParser`   | 解析 Markdown 为结构化数据 |

### 7.2 流式输出实现

```typescript
// 使用 SSE 或 ReadableStream
const streamGenerate = async (prompt: string) => {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // 触发 onChunk 回调，更新 UI
    onChunk?.(chunk);
  }
};
```

### 7.3 错误处理

| 错误类型     | 处理方式                              |
| -------- | --------------------------------- |
| 网络错误     | 显示"网络连接失败，请重试"，保留用户输入             |
| API 配额超限 | 显示"AI 服务繁忙，请稍后再试"                 |
| 内容安全拦截   | 显示"内容因安全策略被拦截，请调整输入"              |
| 解析失败     | 显示原始 Markdown，提示"格式解析失败，内容仍可手动采纳" |

***

## 8. 文件结构

```
src/
├── components/
│   └── ai/
│       ├── AISidebar.tsx          # 侧边抽屉主组件
│       ├── ModuleSelector.tsx     # 模块多选器
│       ├── ContextPreview.tsx     # 已读取信息预览
│       ├── MarkdownStreamViewer.tsx # 流式 Markdown 渲染
│       └── GenerationActions.tsx  # 操作按钮
├── hooks/
│   ├── useAISidebar.ts
│   ├── useAIStreamGenerate.ts
│   └── useMarkdownParser.ts
└── lib/
    └── ai/
        ├── prompt-templates.ts   # Prompt 模板
        └── parsers/
            └── markdown-to-json.ts
```

***

## 9. 验收标准

- [ ] 用户未填写 profile 时，AI 生成按钮禁用
- [ ] 已填写的模块信息被正确读取并显示在 ContextPreview
- [ ] 流式输出时用户可以看到 AI 逐字生成的过程
- [ ] 生成的 Markdown 可以直接编辑
- [ ] "重新生成"按钮只重新生成当前模块
- [ ] "采纳填充"后内容正确追加到简历对应模块
- [ ] 网络错误时用户输入不被丢失

