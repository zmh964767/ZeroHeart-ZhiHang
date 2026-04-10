# ZeroHeart 简历生成器

一个现代化的简历生成器，支持中文排版、实时预览、PDF 导出和 AI 辅助填充。

## 特性

- 🎨 **简约模板** - 专业美观的简历样式
- 👁️ **实时预览** - 所见即所得的编辑体验
- 📄 **PDF 导出** - 支持 A4 纸张、多页分页
- 🤖 **AI 辅助** - 集成智谱 AI，智能生成简历内容
- 💾 **本地存储** - 数据存储在浏览器本地，安全私密
- 📱 **移动端适配** - 响应式设计，支持手机和平板

## 技术栈

- **框架** - Next.js 14.1.0 (App Router)
- **语言** - TypeScript 5.3.3
- **UI 组件** - shadcn/ui + Radix UI
- **样式** - Tailwind CSS 3.4.1
- **状态管理** - Zustand 4.5.0
- **PDF 生成** - pdfkit
- **测试** - Vitest 1.6.0

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制示例配置文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的智谱 API Key：

```env
# AI API Keys
ZHIPU_API_KEY=your_zhipu_api_key_here
```

获取 API Key：[智谱 AI 开放平台](https://open.bigmodel.cn/)

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 开始使用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页
│   │   ├── resume/[id]/page.tsx  # 简历编辑页
│   │   └── api/               # API 路由
│   │       ├── ai/stream/     # AI 生成接口
│   │       └── resume/pdf/    # PDF 导出接口
│   ├── components/            # React 组件
│   │   ├── resume/            # 简历相关组件
│   │   ├── ai/                # AI 侧边栏
│   │   └── ui/                # shadcn/ui 组件
│   ├── hooks/                 # React Hooks
│   │   ├── useAIGenerate.ts   # AI 生成 Hook
│   │   └── useThrottle.ts     # 节流 Hook
│   ├── lib/                   # 工具库
│   │   ├── resume/            # 简历相关工具
│   │   │   ├── types.ts       # 类型定义
│   │   │   └── pdf.tsx        # PDF 导出
│   │   ├── ai/                # AI 相关工具
│   │   ├── storage/local.ts   # 本地存储
│   │   ├── security.ts        # 安全工具
│   │   └── utils.ts           # 通用工具
│   ├── stores/                # Zustand 状态管理
│   │   └── resume.ts          # 简历状态
│   └── test/                  # 测试文件
├── scripts/
│   └── generate-pdf.mjs       # PDF 生成脚本
├── public/
│   └── fonts/                 # 中文字体
├── docs/                      # 文档
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run test` | 运行 Vitest 测试（监听模式）|
| `npm run test:run` | 运行所有测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |

## PDF 导出功能

### 特性

- 支持 A4 纸张格式
- 自动多页分页
- 在内容块之间分页，避免切断单个经历
- 后续页面显示「姓名 | 第 X 页」页眉
- 完善的边缘情况处理

### 边缘情况处理

- 简历名称限制最大 50 字符
- Section 标题限制最大 100 字符
- Entry 标题限制最大 200 字符
- Entry 详情最多 50 条，每条 1000 字符
- 图片无效时静默忽略

## AI 辅助填充

### 支持的模块

- 实习经历
- 项目经历
- 校园经历
- 个人优势

### 速率限制

- 最小请求间隔：3 秒
- 每分钟最大请求数：10 次

### 错误处理

- 网络错误提示
- API Key 无效提示
- 速率限制提示
- 超时处理（30 秒）

## 安全说明

### API Key 保护

- API Key 存储在后端环境变量中
- 前端通过后端 API 代理调用 AI 服务
- 避免 NEXT_PUBLIC_ 前缀暴露 Key

### 输入验证

- PDF 导出接口验证输入格式
- 文件名清理，防止路径遍历
- 请求体大小限制（最大 5 MB）

### 本地存储

- 数据存储在浏览器 LocalStorage 中
- 不涉及云存储，隐私安全

## 开发指南

### 本地开发

1. Fork 并克隆仓库
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

### 提交规范

遵循中文 Git 提交规范：

```
<类型>(<范围>): <简要描述>

<详细说明（可选）>
```

类型：
- `feat` - 新功能
- `fix` - 修复 Bug
- `docs` - 文档变更
- `style` - 代码格式
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 测试
- `chore` - 构建/工具

### 测试

```bash
# 运行所有测试
npm run test:run

# 生成覆盖率报告
npm run test:coverage
```

## 更新日志

详见 [CHANGELOG.md](./docs/superpowers/ai/CHANGELOG.md)。

## 许可证

MIT

## 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - 样式框架
- [shadcn/ui](https://ui.shadcn.com) - UI 组件
- [pdfkit](https://pdfkit.org) - PDF 生成
- [智谱 AI](https://open.bigmodel.cn) - AI 服务
