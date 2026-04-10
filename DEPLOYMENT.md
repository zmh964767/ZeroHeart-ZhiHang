# 部署与运维指南

本指南将帮助你部署项目并建立运维迭代流程。

## 目录

- [部署平台选择](#部署平台选择)
- [部署前准备](#部署前准备)
- [部署步骤](#部署步骤)
- [运维监控](#运维监控)
- [错误追踪](#错误追踪)
- [性能分析](#性能分析)
- [用户反馈收集](#用户反馈收集)
- [CI/CD 流程](#cicd-流程)
- [版本发布流程](#版本发布流程)

---

## 部署平台选择

### 推荐平台

#### 1. Vercel（推荐）
**优点：**
- Next.js 官方推荐，一键部署
- 自动 HTTPS 和 CDN
- 实时预览和分支部署
- 免费额度充足
- 内置 Analytics

**缺点：**
- 服务器函数有执行时间限制（Vercel Pro 是 60 秒）

#### 2. Netlify
**优点：**
- 类似 Vercel 的体验
- 表单处理、边缘函数
- 免费额度不错

#### 3. 阿里云/腾讯云
**优点：**
- 完全控制
- 国内访问速度快
- 适合有一定运维经验的用户

**缺点：**
- 需要自己配置环境
- 成本较高

---

## 部署前准备

### 1. 环境变量配置

确保 `.env.example` 包含所有必需的环境变量：

```env
# AI API Keys
# 至少配置一个 API Key 才能使用 AI 功能

# 智谱 AI (https://open.bigmodel.cn/)
ZHIPU_API_KEY=

# 文心一言 (https://cloud.baidu.com/product/wenxinworkshop)
WENXIN_API_KEY=
WENXIN_ACCESS_TOKEN=

# 通义千问 (https://dashscope.aliyun.com/)
TONGYI_API_KEY=

# Kimi (https://platform.moonshot.cn/)
KIMI_API_KEY=

# DeepSeek (https://platform.deepseek.com/)
DEEPSEEK_API_KEY=
```

### 2. 安全检查清单

- [ ] 所有 API Key 都没有 `NEXT_PUBLIC_` 前缀
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] `.env.local` 不会被提交到仓库
- [ ] 敏感信息已从代码中移除
- [ ] 输入验证已到位

### 3. 构建测试

在部署前确保构建通过：

```bash
npm run build
npm start  # 测试生产服务器
```

---

## 部署步骤

### Vercel 部署（推荐）

#### 方式一：Git 集成（推荐）

1. **推送代码到 GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **访问 Vercel.com**
   - 用 GitHub/GitLab 账号登录
   - 点击 "New Project"
   - 选择你的仓库

3. **配置项目**
   - Project Name: `zeroheart-zhihang`（或你喜欢的名字）
   - Framework Preset: `Next.js`（自动检测）
   - Root Directory: `./`

4. **配置环境变量**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加所有需要的环境变量（从 `.env.example` 复制）
   - **重要**：确保没有勾选 "Automatically expose System Environment Variables"

5. **部署**
   - 点击 "Deploy"
   - 等待 1-2 分钟
   - 部署成功后会获得一个 URL（如 `https://zeroheart-zhihang.vercel.app`）

#### 方式二：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署（预览环境）
vercel

# 部署到生产环境
vercel --prod
```

### Netlify 部署

1. 推送代码到 GitHub
2. 访问 netlify.com
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的仓库
5. 配置构建命令：`npm run build`
6. 配置发布目录：`.next`
7. 在 Site settings → Environment variables 添加环境变量
8. 点击 "Deploy site"

---

## 运维监控

### 1. Vercel Analytics（推荐）

**启用方式：**
1. Vercel Dashboard → Analytics
2. 点击 "Enable"
3. 选择 "Web Analytics"

**可以查看：**
- 实时访问人数
- 页面访问量
- 流量来源
- 设备和浏览器分布
- 地理位置

### 2. 自定义日志记录

在 API 路由中添加结构化日志：

```typescript
// src/lib/logger.ts
export function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message,
    ...data
  }));
}

export function logError(message: string, error?: Error, data?: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message,
    error: error?.message,
    stack: error?.stack,
    ...data
  }));
}
```

在 API 路由中使用：

```typescript
import { logInfo, logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logInfo('PDF generation started', { resumeId: resume.id });
    // ... 业务逻辑
    logInfo('PDF generation completed', { resumeId: resume.id });
  } catch (error) {
    logError('PDF generation failed', error as Error, { resumeId: resume.id });
    throw error;
  }
}
```

### 3. 健康检查端点

创建一个健康检查端点：

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
  });
}
```

使用 UptimeRobot 或类似服务监控：
- 每 5 分钟访问 `/api/health`
- 配置告警通知（邮件、短信、Slack 等）

---

## 错误追踪

### 1. Sentry（推荐）

**集成步骤：**

1. **注册 Sentry 账号**
   - 访问 sentry.io
   - 创建新项目，选择 Next.js

2. **安装依赖**
   ```bash
   npm install @sentry/nextjs
   ```

3. **配置 Sentry**
   ```typescript
   // next.config.js
   const { withSentryConfig } = require('@sentry/nextjs');

   const nextConfig = {
     // 你的现有配置
   };

   module.exports = withSentryConfig(nextConfig, {
     org: "your-org",
     project: "your-project",
     silent: true,
   });
   ```

4. **创建配置文件**
   ```typescript
   // sentry.client.config.ts
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN',
     tracesSampleRate: 1.0,
   });
   ```

   ```typescript
   // sentry.server.config.ts
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN',
     tracesSampleRate: 1.0,
   });
   ```

5. **添加环境变量**
   - 在部署平台添加 `SENTRY_DSN`

**能获得什么：**
- 实时错误告警
- 错误堆栈追踪
- 错误发生频率统计
- 用户影响范围
- 性能监控

### 2. 错误告警配置

**重要告警：**
- [ ] 5xx 错误率 > 5%
- [ ] API 响应时间 > 3秒
- [ ] PDF 生成失败率 > 10%
- [ ] AI API 错误率 > 20%

---

## 性能分析

### 1. Lighthouse 审计

定期运行 Lighthouse 审计：

```bash
# 使用 Chrome DevTools
# 或使用 CLI
npm install -g @lhci/cli
lhci autorun --url=https://your-domain.com
```

**关注指标：**
- LCP（ Largest Contentful Paint）< 2.5s
- FID（First Input Delay）< 100ms
- CLS（Cumulative Layout Shift）< 0.1
- TTI（Time to Interactive）< 3.8s

### 2. Next.js Bundle Analyzer

分析打包大小：

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

### 3. 性能监控清单

- [ ] 字体预加载
- [ ] 图片懒加载
- [ ] 代码分割（Next.js 自动处理）
- [ ] 第三方库按需加载
- [ ] API 响应时间监控

---

## 用户反馈收集

### 1. 内置反馈表单

在应用中添加反馈入口：

```typescript
// src/components/FeedbackButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submitFeedback = async () => {
    // 发送到你的反馈收集服务
    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback, timestamp: new Date().toISOString() }),
    });
    setOpen(false);
    setFeedback('');
    // 提示用户感谢
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4">
          反馈建议
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>告诉我们你的想法</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="遇到了什么问题？有什么改进建议？"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={5}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submitFeedback}>提交</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. 使用第三方服务

- **Google Forms** - 免费、简单
- **Typeform** - 美观的表单
- **Tidio** - 在线聊天和反馈
- **Hotjar** - 用户行为录制和热图

### 3. 反馈分类

建立反馈分类系统：
- 🐛 Bug 报告
- ✨ 功能建议
- 🎨 UI/UX 改进
- 📖 文档问题
- ❓ 使用问题

---

## CI/CD 流程

### 使用 GitHub Actions

创建 `.github/workflows/main.yml`：

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:run
      
      - name: Build
        run: npm run build
        env:
          # 提供必需的环境变量（可以是占位符）
          ZHIPU_API_KEY: dummy_key_for_build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 必需的 GitHub Secrets

在仓库 Settings → Secrets and variables → Actions 中添加：

- `VERCEL_TOKEN` - 从 vercel.com/account/tokens 获取
- `ORG_ID` - 从 Vercel 项目设置获取
- `PROJECT_ID` - 从 Vercel 项目设置获取

---

## 版本发布流程

### 1. 语义化版本

遵循 Semantic Versioning：
- `MAJOR` - 不兼容的 API 变更
- `MINOR` - 向下兼容的功能新增
- `PATCH` - 向下兼容的问题修复

### 2. 发布检查清单

发布新版本前：

- [ ] 所有测试通过 `npm run test:run`
- [ ] 构建成功 `npm run build`
- [ ] 代码已 lint `npm run lint`
- [ ] 更新 CHANGELOG.md
- [ ] 更新 package.json 版本号
- [ ] 创建 Git tag
- [ ] 部署到预览环境验证
- [ ] 部署到生产环境

### 3. CHANGELOG 模板

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### ✨ 新功能
- 添加了多语言支持
- 新增简历模板

### 🐛 Bug 修复
- 修复了 PDF 导出中文乱码问题
- 修复了移动端布局问题

### 🚀 性能优化
- 优化了首页加载速度
- 减少了打包体积

## [1.0.0] - 2024-01-01

### 🎉 初始发布
- 简历编辑功能
- PDF 导出
- AI 辅助填充
```

---

## 运维快速参考

### 常用命令

```bash
# 本地开发
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行测试
npm run test:run

# 代码检查
npm run lint

# 查看日志（Vercel）
# Vercel Dashboard → Functions → Logs
```

### 紧急回滚

如果发布出现问题：

1. **Vercel 回滚**
   - Vercel Dashboard → Deployments
   - 找到之前成功的部署
   - 点击 "..." → "Promote to Production"

2. **Git 回滚**
   ```bash
   git revert <bad-commit-hash>
   git push
   # CI/CD 会自动部署
   ```

### 联系支持

- Vercel 支持: vercel.com/support
- Sentry 支持: sentry.io/support
- 项目 Issue: 你的 GitHub 仓库 Issues

---

## 总结

建立完整的运维流程需要：

1. **选择合适的部署平台**（Vercel 推荐）
2. **配置监控和告警**（Sentry + UptimeRobot）
3. **收集用户反馈**（内置表单 + 第三方服务）
4. **建立 CI/CD 流程**（GitHub Actions）
5. **定义版本发布流程**（语义化版本 + CHANGELOG）

这样你就可以：
- ✅ 快速发现和修复问题
- ✅ 持续改进产品
- ✅ 确保服务稳定性
- ✅ 高效迭代新版本
