# 国内部署与运维指南

本指南专门针对国内用户，推荐可访问的工具和平台。

## 目录

- [部署平台选择](#部署平台选择)
- [监控和错误追踪](#监控和错误追踪)
- [用户反馈收集](#用户反馈收集)
- [CI/CD 流程](#cicd-流程)
- [性能分析](#性能分析)

---

## 部署平台选择

### 推荐方案对比

| 平台 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Vercel（配合国内 CDN）** | Next.js 官方支持，体验好 | 国内直连较慢，但可以用 CDN 加速 | ⭐⭐⭐⭐ |
| **Netlify（配合国内 CDN）** | 类似 Vercel | 国内直连较慢 | ⭐⭐⭐ |
| **阿里云函数计算 FC** | 国内访问快，完全可控 | 需要自己配置，上手复杂 | ⭐⭐⭐⭐ |
| **腾讯云 Serverless** | 国内访问快 | 需要自己配置 | ⭐⭐⭐ |
| **Zeabur** | 国内友好，部署简单 | 新兴平台，生态不如 Vercel | ⭐⭐⭐⭐⭐ |

---

## 🚀 推荐方案一：Zeabur（国内最推荐）

### 为什么选 Zeabur？

1. ✅ **国内访问快** - 服务器在国内
2. ✅ **部署简单** - 类似 Vercel，一键部署
3. ✅ **支持 Next.js** - 完美支持
4. ✅ **免费额度** - 个人项目足够用
5. ✅ **中文界面** - 对国内用户友好

### Zeabur 部署步骤

1. **注册账号**
   - 访问 https://zeabur.com
   - 用手机号注册

2. **推送代码到 GitHub/Gitee**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **导入项目**
   - 登录 Zeabur 控制台
   - 点击 "新建项目"
   - 选择 "导入 Git 仓库"
   - 授权 GitHub/Gitee
   - 选择你的仓库

4. **配置项目**
   - 框架：选择 Next.js
   - 构建命令：`npm run build`
   - 启动命令：`npm start`

5. **配置环境变量**
   - 项目设置 → 环境变量
   - 添加：`ZHIPU_API_KEY`、`WENXIN_API_KEY` 等

6. **部署**
   - 点击 "部署"
   - 等待 2-3 分钟
   - 获得访问域名（如 `https://your-project.zeabur.app`）

7. **绑定自定义域名（可选）**
   - 项目设置 → 域名
   - 添加你的域名
   - 按提示配置 DNS

---

## 🚀 推荐方案二：Vercel + 七牛云 CDN

如果你还是想用 Vercel，可以用国内 CDN 加速：

### 步骤

1. **Vercel 部署**（按之前的 DEPLOYMENT.md）

2. **注册七牛云**
   - 访问 https://www.qiniu.com
   - 注册账号（个人免费额度够用）

3. **创建 CDN 加速域名**
   - 七牛云控制台 → CDN → 域名管理
   - 添加域名：`resume.yourdomain.com`
   - 源站配置：选择 "七牛云存储" 或 "自定义源站"
   - 源站地址：你的 Vercel 域名（如 `your-project.vercel.app`）

4. **配置 DNS**
   - 在你的域名 DNS 服务商处
   - 将 `resume.yourdomain.com` CNAME 到七牛云提供的加速域名

5. **启用 HTTPS**
   - 七牛云 CDN → 域名管理 → HTTPS 设置
   - 上传 SSL 证书（可以用 Let's Encrypt 免费证书）

---

## 监控和错误追踪（国内可用）

### 1. 前端监控：Fundebug（推荐）

**优点：**
- ✅ 国内服务，访问快
- ✅ 支持 Next.js
- ✅ 错误追踪 + 性能监控
- ✅ 免费额度够用

**集成步骤：**

1. **注册 Fundebug**
   - 访问 https://www.fundebug.com
   - 注册账号
   - 创建项目，选择 "Web 前端"

2. **安装依赖**
   ```bash
   npm install fundebug-javascript
   ```

3. **配置**
   ```typescript
   // src/app/providers.tsx 或 layout.tsx
   'use client';
   
   import * as fundebug from 'fundebug-javascript';
   import { useEffect } from 'react';
   
   export function FundebugProvider({ children }: { children: React.ReactNode }) {
     useEffect(() => {
       fundebug.init({
         apikey: 'YOUR_FUNDEBUG_APIKEY',
         releasestage: process.env.NODE_ENV,
       });
     }, []);
     
     return <>{children}</>;
   }
   ```

4. **在 root layout 中使用**
   ```typescript
   import { FundebugProvider } from './providers';
   
   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="zh-CN">
         <body>
           <FundebugProvider>
             {children}
           </FundebugProvider>
         </body>
       </html>
     );
   }
   ```

### 2. 服务端日志：直接用平台日志

- **Zeabur**：控制台 → 项目 → 日志
- **Vercel**：Dashboard → Functions → Logs
- **阿里云 FC**：控制台 → 日志服务

### 3. 可用性监控：UptimeRobot（国内版）或自己写

**方案 A：UptimeRobot（用国内节点）**
- 访问 https://uptimerobot.com
- 注册账号
- 添加监控：每 5 分钟检查你的网站

**方案 B：自己写个简单的监控脚本**
```typescript
// scripts/monitor.ts
import fetch from 'node-fetch';
import { createTransport } from 'nodemailer';

const WEBSITE_URL = 'https://your-domain.com';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 分钟

async function checkWebsite() {
  try {
    const start = Date.now();
    const response = await fetch(WEBSITE_URL);
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      console.log(`[${new Date().toISOString()}] OK - ${responseTime}ms`);
    } else {
      console.error(`[${new Date().toISOString()}] ERROR - Status ${response.status}`);
      await sendAlert(`网站异常: HTTP ${response.status}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR - ${(error as Error).message}`);
    await sendAlert(`网站无法访问: ${(error as Error).message}`);
  }
}

async function sendAlert(message: string) {
  // 配置邮件发送
  const transporter = createTransport({
    host: 'smtp.qq.com',
    port: 587,
    auth: {
      user: 'your-email@qq.com',
      pass: 'your-smtp-password',
    },
  });
  
  await transporter.sendMail({
    from: 'your-email@qq.com',
    to: 'your-email@qq.com',
    subject: '【告警】网站监控',
    text: message,
  });
}

// 启动监控
checkWebsite();
setInterval(checkWebsite, CHECK_INTERVAL);
```

---

## 用户反馈收集（国内可用）

### 1. 最简单：问卷星

**优点：**
- ✅ 国内最流行的问卷工具
- ✅ 完全免费
- ✅ 手机就能看结果

**步骤：**
1. 访问 https://www.wjx.cn
2. 注册账号
3. 创建问卷："产品反馈收集"
4. 添加问题：
   - 你遇到了什么问题？（单选/填空）
   - 你有什么建议？（填空）
   - 总体满意度（1-5 分）
5. 获得问卷链接
6. 在网站上添加按钮链接到问卷

### 2. 稍微高级：金数据

类似问卷星，但界面更美观。

### 3. 自建反馈表单（推荐）

配合企业微信机器人或飞书机器人：

```typescript
// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { feedback, contact } = await request.json();
    
    // 发送到企业微信群机器人
    const webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY';
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'text',
        text: {
          content: `📝 新反馈:\n${feedback}\n\n联系方式: ${contact || '匿名'}\n时间: ${new Date().toLocaleString('zh-CN')}`,
        },
      }),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
  }
}
```

**前端组件：**
```typescript
// src/components/FeedbackButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('请填写反馈内容');
      return;
    }

    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, contact }),
      });
      
      toast.success('感谢你的反馈！');
      setOpen(false);
      setFeedback('');
      setContact('');
    } catch {
      toast.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
          反馈建议
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>告诉我们你的想法</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="遇到了什么问题？有什么改进建议？"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
          />
          <Input
            placeholder="联系方式（可选，方便我们回复你）"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submitFeedback} disabled={submitting}>
              {submitting ? '提交中...' : '提交'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## CI/CD 流程（国内可用）

### 推荐：Gitee + Gitee Go

**优点：**
- ✅ 国内访问快
- ✅ 完全免费
- ✅ 中文界面

**步骤：**

1. **推代码到 Gitee**
   ```bash
   git remote add gitee https://gitee.com/your-username/your-repo.git
   git push gitee main
   ```

2. **创建 Gitee Go 配置**
   在仓库根目录创建 `.gitee/workflows/build.yml`：
   ```yaml
   name: Build and Deploy
   
   on:
     push:
       branches: [main]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
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
             ZHIPU_API_KEY: ${{ secrets.ZHIPU_API_KEY }}
   ```

3. **配置部署到 Zeabur**
   Zeabur 可以自动监听 Gitee 仓库的推送，自动部署。

---

## 性能分析（国内可用）

### 1. Lighthouse（Chrome 自带）

- Chrome DevTools → Lighthouse
- 选择 "Mobile" 或 "Desktop"
- 点击 "Generate report"

### 2. 腾讯云测速

- 访问 https://ce.cloud.qq.com
- 输入你的域名
- 查看全国各地的访问速度

### 3. 阿里云测速

- 访问 https://www.aliyun.com/product/dcdn
- 可以测试 CDN 加速效果

---

## 快速开始（最小可行方案）

如果你不想搞那么复杂，可以先从这个最小方案开始：

### 第 1 步：部署到 Zeabur（10分钟）
- 注册 Zeabur
- 导入 GitHub 仓库
- 配置环境变量
- 部署上线

### 第 2 步：加个反馈按钮（10分钟）
- 复制上面的 FeedbackButton 代码
- 添加到首页
- 链接到问卷星

### 第 3 步：用平台自带的监控
- Zeabur 控制台看日志
- 偶尔手动访问一下网站看看是否正常

### 后续再逐步添加：
- Fundebug 错误追踪
- 自建反馈表单（企业微信机器人）
- CI/CD 流程

---

## 常用国内服务清单

| 类别 | 推荐服务 | 网址 |
|------|---------|------|
| **部署平台** | Zeabur | https://zeabur.com |
| **代码托管** | Gitee | https://gitee.com |
| **前端监控** | Fundebug | https://www.fundebug.com |
| **用户反馈** | 问卷星 | https://www.wjx.cn |
| **CDN 加速** | 七牛云 | https://www.qiniu.com |
| **邮件服务** | 腾讯企业邮 | https://exmail.qq.com |
| **测速工具** | 腾讯云测速 | https://ce.cloud.qq.com |
| **SSL 证书** | 阿里云免费证书 | https://www.aliyun.com/product/cas |

---

## 总结

国内运维方案核心：
1. **部署** - Zeabur（最简单）
2. **监控** - Fundebug + 平台日志
3. **反馈** - 问卷星（最简单）或 企业微信机器人
4. **CI/CD** - Gitee Go
5. **CDN** - 七牛云（如果需要）

这样你就可以在国内顺畅地运维项目了！
