# ZeroHeart职航 MVP 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个面向大学生的 AI 简历助手，支持多简历管理、模块化编辑、实时预览模板、AI 辅助生成、PDF 导出

**架构：** Next.js App Router 前端 + Zustand 状态管理 + LocalStorage 本地存储 + AI Provider 抽象层（支持多模型切换）+ 模板化 PDF 渲染

**技术栈：** Next.js 14+ / React / TypeScript / Tailwind CSS / shadcn/ui / TipTap / @react-pdf/renderer / Zustand

---

## 文件结构

```
zeroheart-zhihang/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 首页（简历列表）
│   │   ├── layout.tsx                  # 根布局
│   │   ├── globals.css                 # 全局样式
│   │   └── resume/
│   │       └── [id]/
│   │           ├── page.tsx            # 编辑器页
│   │           └── generate/
│   │               └── page.tsx         # AI 生成页
│   ├── components/
│   │   ├── ui/                         # shadcn/ui 组件
│   │   ├── resume/
│   │   │   ├── ResumeList.tsx          # 简历列表组件
│   │   │   ├── ResumeCard.tsx          # 简历卡片组件
│   │   │   ├── CreateResumeModal.tsx   # 新建简历弹窗
│   │   │   ├── ModuleSidebar.tsx       # 模块管理侧边栏
│   │   │   ├── TemplateSelector.tsx    # 模板选择器
│   │   │   ├── EditorCanvas.tsx        # 富文本编辑器
│   │   │   ├── PreviewPanel.tsx       # 实时预览面板
│   │   │   └── blocks/                 # 简历块组件
│   │   │       ├── ProfileBlock.tsx
│   │   │       ├── EducationBlock.tsx
│   │   │       ├── InternshipBlock.tsx
│   │   │       ├── ProjectBlock.tsx
│   │   │       ├── CampusBlock.tsx
│   │   │       └── AdvantageBlock.tsx
│   │   └── ai/
│   │       ├── AIModal.tsx             # AI 生成弹窗
│   │       └── ModuleSelector.tsx     # AI 模块选择
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── index.ts                # AI Provider 导出
│   │   │   ├── types.ts                 # AI 类型定义
│   │   │   └── providers/
│   │   │       ├── base.ts             # 基类
│   │   │       ├── wenxin.ts           # 文心一言
│   │   │       ├── tongyi.ts           # 通义千问
│   │   │       ├── kimi.ts             # Kimi
│   │   │       ├── deepseek.ts         # DeepSeek
│   │   │       └── zhipu.ts            # 智谱
│   │   ├── storage/
│   │   │   ├── repository.ts           # Repository 接口
│   │   │   └── local.ts                # LocalStorage 实现
│   │   ├── resume/
│   │   │   ├── types.ts                # 简历类型定义
│   │   │   ├── templates.ts            # 简历模板定义
│   │   │   └── pdf.ts                  # PDF 生成
│   │   └── utils.ts
│   └── stores/
│       └── resume.ts                   # Zustand store
├── public/
│   └── templates/                       # 模板资源
├── docs/
│   └── specs/                          # 设计文档
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 任务 1：项目初始化

**文件：**
- 创建：`package.json`
- 创建：`tailwind.config.ts`
- 创建：`tsconfig.json`
- 创建：`next.config.js`
- 创建：`src/app/layout.tsx`
- 创建：`src/app/globals.css`
- 创建：`src/app/page.tsx`

- [ ] **步骤 1：创建 package.json**

```json
{
  "name": "zeroheart-zhihang",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "14.1.0",
    "@tiptap/react": "^2.2.0",
    "@tiptap/starter-kit": "^2.2.0",
    "@tiptap/extension-placeholder": "^2.2.0",
    "@react-pdf/renderer": "^3.3.0",
    "zustand": "^4.5.0",
    "uuid": "^9.0.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "lucide-react": "^0.323.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/uuid": "^9.0.7",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  }
}
```

- [ ] **步骤 2：创建 tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **步骤 3：创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **步骤 4：创建 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
```

- [ ] **步骤 5：创建 src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **步骤 6：创建 src/app/layout.tsx**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZeroHeart职航 - AI简历助手",
  description: "面向大学生的AI简历助手，帮助快速生成专业简历",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **步骤 7：创建 src/app/page.tsx**

```typescript
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          ZeroHeart职航
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI简历助手 - 快速生成专业简历
        </p>
        <p className="text-center text-gray-500">
          简历列表页开发中...
        </p>
      </div>
    </main>
  );
}
```

- [ ] **步骤 8：创建 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **步骤 9：初始化项目并安装依赖**

```bash
cd /home/zerobyheart/sps/zeroheart-zhihang
npm install
```

- [ ] **步骤 10：Commit**

```bash
cd /home/zerobyheart/sps
mv zeroheart-zhihang/* . 2>/dev/null || true
mv zeroheart-zhihang/.* . 2>/dev/null || true
rmdir zeroheart-zhihang 2>/dev/null || true
git add -A
git commit -m "feat: 初始化 Next.js 项目"
```

---

## 任务 2：简历类型定义和存储层

**文件：**
- 创建：`src/lib/resume/types.ts`
- 创建：`src/lib/storage/repository.ts`
- 创建：`src/lib/storage/local.ts`
- 创建：`src/stores/resume.ts`

- [ ] **步骤 1：创建 src/lib/resume/types.ts**

```typescript
export type ModuleType =
  | 'profile'
  | 'education'
  | 'internship'
  | 'project'
  | 'campus'
  | 'advantage';

export interface ProfileBlock {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
}

export interface EducationBlock {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[];
}

export interface InternshipBlock {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface ProjectBlock {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface CampusBlock {
  organization: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface AdvantageBlock {
  summary: string;
}

export interface ResumeContent {
  profile: ProfileBlock;
  education: EducationBlock[];
  internship: InternshipBlock[];
  project: ProjectBlock[];
  campus: CampusBlock[];
  advantage: AdvantageBlock;
}

export interface Resume {
  id: string;
  name: string;
  template: TemplateType;
  createdAt: number;
  updatedAt: number;
  content: ResumeContent;
  modules: Record<ModuleType, boolean>;
}

export type TemplateType =
  | 'simple'
  | 'modern'
  | 'classic'
  | 'creative';

export interface ResumeMetadata {
  version: number;
}

export const defaultProfile: ProfileBlock = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
};

export const defaultEducation: EducationBlock = {
  school: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: '',
  gpa: '',
  highlights: [],
};

export const defaultInternship: InternshipBlock = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultProject: ProjectBlock = {
  name: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultCampus: CampusBlock = {
  organization: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultAdvantage: AdvantageBlock = {
  summary: '',
};

export const defaultContent: ResumeContent = {
  profile: defaultProfile,
  education: [],
  internship: [],
  project: [],
  campus: [],
  advantage: defaultAdvantage,
};

export const defaultModules: Record<ModuleType, boolean> = {
  profile: true,
  education: false,
  internship: false,
  project: false,
  campus: false,
  advantage: false,
};
```

- [ ] **步骤 2：创建 src/lib/storage/repository.ts**

```typescript
import { Resume } from '@/lib/resume/types';

export interface ResumeRepository {
  getAll(): Promise<Resume[]>;
  getById(id: string): Promise<Resume | null>;
  save(resume: Resume): Promise<void>;
  delete(id: string): Promise<void>;
  exportJSON(id: string): Promise<string>;
  importJSON(json: string): Promise<Resume>;
}
```

- [ ] **步骤 3：创建 src/lib/storage/local.ts**

```typescript
import { Resume } from '@/lib/resume/types';
import { ResumeRepository } from './repository';

const STORAGE_KEY = 'zeroheart_resumes';

export class LocalStorageRepository implements ResumeRepository {
  private getStorage(): Resume[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private setStorage(resumes: Resume[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  }

  async getAll(): Promise<Resume[]> {
    return this.getStorage();
  }

  async getById(id: string): Promise<Resume | null> {
    const resumes = this.getStorage();
    return resumes.find(r => r.id === id) || null;
  }

  async save(resume: Resume): Promise<void> {
    const resumes = this.getStorage();
    const index = resumes.findIndex(r => r.id === resume.id);
    if (index >= 0) {
      resumes[index] = { ...resume, updatedAt: Date.now() };
    } else {
      resumes.push(resume);
    }
    this.setStorage(resumes);
  }

  async delete(id: string): Promise<void> {
    const resumes = this.getStorage().filter(r => r.id !== id);
    this.setStorage(resumes);
  }

  async exportJSON(id: string): Promise<string> {
    const resume = await this.getById(id);
    if (!resume) throw new Error('Resume not found');
    return JSON.stringify(resume, null, 2);
  }

  async importJSON(json: string): Promise<Resume> {
    const resume = JSON.parse(json) as Resume;
    resume.id = crypto.randomUUID();
    resume.createdAt = Date.now();
    resume.updatedAt = Date.now();
    await this.save(resume);
    return resume;
  }
}

export const resumeRepository = new LocalStorageRepository();
```

- [ ] **步骤 4：创建 src/stores/resume.ts**

```typescript
import { create } from 'zustand';
import { Resume, ResumeContent, TemplateType, ModuleType, defaultContent, defaultModules, defaultProfile } from '@/lib/resume/types';
import { resumeRepository } from '@/lib/storage/local';

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  isLoading: boolean;

  loadResumes: () => Promise<void>;
  createResume: (name: string) => Promise<Resume>;
  updateResume: (resume: Resume) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  selectResume: (id: string) => Promise<void>;
  updateContent: (content: Partial<ResumeContent>) => Promise<void>;
  updateTemplate: (template: TemplateType) => Promise<void>;
  toggleModule: (module: ModuleType) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,

  loadResumes: async () => {
    set({ isLoading: true });
    const resumes = await resumeRepository.getAll();
    set({ resumes, isLoading: false });
  },

  createResume: async (name: string) => {
    const resume: Resume = {
      id: crypto.randomUUID(),
      name,
      template: 'simple',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: { ...defaultContent, profile: { ...defaultProfile } },
      modules: { ...defaultModules },
    };
    await resumeRepository.save(resume);
    set(state => ({ resumes: [...state.resumes, resume] }));
    return resume;
  },

  updateResume: async (resume: Resume) => {
    const updated = { ...resume, updatedAt: Date.now() };
    await resumeRepository.save(updated);
    set(state => ({
      resumes: state.resumes.map(r => r.id === updated.id ? updated : r),
      currentResume: state.currentResume?.id === updated.id ? updated : state.currentResume,
    }));
  },

  deleteResume: async (id: string) => {
    await resumeRepository.delete(id);
    set(state => ({
      resumes: state.resumes.filter(r => r.id !== id),
      currentResume: state.currentResume?.id === id ? null : state.currentResume,
    }));
  },

  selectResume: async (id: string) => {
    const resume = await resumeRepository.getById(id);
    set({ currentResume: resume });
  },

  updateContent: async (content: Partial<ResumeContent>) => {
    const { currentResume } = get();
    if (!currentResume) return;
    const updated: Resume = {
      ...currentResume,
      content: { ...currentResume.content, ...content },
    };
    await get().updateResume(updated);
  },

  updateTemplate: async (template: TemplateType) => {
    const { currentResume } = get();
    if (!currentResume) return;
    const updated: Resume = { ...currentResume, template };
    await get().updateResume(updated);
  },

  toggleModule: async (module: ModuleType) => {
    const { currentResume } = get();
    if (!currentResume) return;
    const updated: Resume = {
      ...currentResume,
      modules: {
        ...currentResume.modules,
        [module]: !currentResume.modules[module],
      },
    };
    await get().updateResume(updated);
  },
}));
```

- [ ] **步骤 5：Commit**

```bash
git add -A
git commit -m "feat: 添加简历类型定义、存储层和Zustand store"
```

---

## 任务 3：UI 基础组件（shadcn/ui）

**文件：**
- 创建：`src/components/ui/button.tsx`
- 创建：`src/components/ui/card.tsx`
- 创建：`src/components/ui/input.tsx`
- 创建：`src/components/ui/modal.tsx`
- 创建：`src/components/ui/toast.tsx`
- 创建：`src/lib/utils.ts`

- [ ] **步骤 1：创建 src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **步骤 2：创建 src/components/ui/button.tsx**

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **步骤 3：创建 src/components/ui/card.tsx**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

- [ ] **步骤 4：创建 src/components/ui/input.tsx**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **步骤 5：创建 src/components/ui/modal.tsx**

```typescript
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
```

- [ ] **步骤 6：Commit**

```bash
git add -A
git commit -m "feat: 添加 UI 基础组件（Button, Card, Input, Dialog）"
```

---

## 任务 4：简历列表页

**文件：**
- 修改：`src/app/page.tsx`
- 创建：`src/components/resume/ResumeList.tsx`
- 创建：`src/components/resume/ResumeCard.tsx`
- 创建：`src/components/resume/CreateResumeModal.tsx`

- [ ] **步骤 1：创建 src/components/resume/ResumeList.tsx**

```typescript
"use client";

import { useResumeStore } from "@/stores/resume";
import { ResumeCard } from "./ResumeCard";
import { CreateResumeModal } from "./CreateResumeModal";
import { FileText } from "lucide-react";

export function ResumeList() {
  const { resumes, isLoading } = useResumeStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无简历</h3>
        <p className="text-gray-500 mb-6">创建你的第一份简历，开启求职之旅</p>
        <CreateResumeModal>
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            创建简历
          </button>
        </CreateResumeModal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          我的简历 ({resumes.length})
        </h2>
        <CreateResumeModal>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
            新建简历
          </button>
        </CreateResumeModal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map(resume => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **步骤 2：创建 src/components/resume/ResumeCard.tsx**

```typescript
"use client";

import Link from "next/link";
import { Resume } from "@/lib/resume/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Copy } from "lucide-react";
import { useResumeStore } from "@/stores/resume";

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const { deleteResume, createResume } = useResumeStore();

  const handleDelete = async () => {
    if (confirm(`确定删除简历 "${resume.name}" 吗？`)) {
      await deleteResume(resume.id);
    }
  };

  const handleDuplicate = async () => {
    await createResume(`${resume.name} (副本)`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN");
  };

  return (
    <Link href={`/resume/${resume.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{resume.name}</h3>
                <p className="text-sm text-gray-500">
                  更新于 {formatDate(resume.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {resume.content.profile.name && (
              <p className="text-sm text-gray-700">{resume.content.profile.name}</p>
            )}
            {resume.content.profile.title && (
              <p className="text-sm text-gray-500">{resume.content.profile.title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleDuplicate();
              }}
            >
              <Copy className="h-4 w-4 mr-1" />
              复制
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **步骤 3：创建 src/components/resume/CreateResumeModal.tsx**

```typescript
"use client";

import { useState } from "react";
import { useResumeStore } from "@/stores/resume";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateResumeModalProps {
  children: React.ReactNode;
}

export function CreateResumeModal({ children }: CreateResumeModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { createResume, selectResume } = useResumeStore();

  const handleCreate = async () => {
    if (!name.trim()) return;
    const resume = await createResume(name.trim());
    setName("");
    setOpen(false);
    selectResume(resume.id);
    window.location.href = `/resume/${resume.id}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新简历</DialogTitle>
          <DialogDescription>
            为你的新简历起个名字，例如"技术岗简历"或"产品经理简历"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="简历名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              创建
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **步骤 4：更新 src/app/page.tsx**

```typescript
"use client";

import { ResumeList } from "@/components/resume/ResumeList";
import { useResumeStore } from "@/stores/resume";
import { useEffect } from "react";

export default function HomePage() {
  const { loadResumes } = useResumeStore();

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZeroHeart职航</h1>
              <p className="text-sm text-gray-500">AI简历助手</p>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <ResumeList />
      </div>
    </main>
  );
}
```

- [ ] **步骤 5：Commit**

```bash
git add -A
git commit -m "feat: 添加简历列表页"
```

---

## 任务 5：简历编辑器页（核心）

**文件：**
- 创建：`src/app/resume/[id]/page.tsx`
- 创建：`src/components/resume/EditorCanvas.tsx`
- 创建：`src/components/resume/PreviewPanel.tsx`
- 创建：`src/components/resume/ModuleSidebar.tsx`
- 创建：`src/components/resume/TemplateSelector.tsx`
- 创建：`src/components/resume/blocks/*.tsx`

- [ ] **步骤 1：创建 src/components/resume/TemplateSelector.tsx**

```typescript
"use client";

import { TemplateType } from "@/lib/resume/types";
import { useResumeStore } from "@/stores/resume";
import { cn } from "@/lib/utils";

const templates: { type: TemplateType; name: string; description: string }[] = [
  { type: "simple", name: "简约专业", description: "白底黑字，简洁大方" },
  { type: "modern", name: "现代简洁", description: "淡色背景，分区清晰" },
  { type: "classic", name: "经典稳重", description: "传统排版，层次分明" },
  { type: "creative", name: "创意时尚", description: "色彩点缀，布局灵活" },
];

export function TemplateSelector() {
  const { currentResume, updateTemplate } = useResumeStore();
  const currentTemplate = currentResume?.template || "simple";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">选择模板</label>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <button
            key={template.type}
            onClick={() => updateTemplate(template.type)}
            className={cn(
              "p-3 border rounded-lg text-left transition-all",
              currentTemplate === template.type
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2",
                  currentTemplate === template.type
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                )}
              />
              <span className="text-sm font-medium">{template.name}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **步骤 2：创建 src/components/resume/ModuleSidebar.tsx**

```typescript
"use client";

import { ModuleType } from "@/lib/resume/types";
import { useResumeStore } from "@/stores/resume";
import { cn } from "@/lib/utils";

const modules: { type: ModuleType; name: string; description: string }[] = [
  { type: "profile", name: "个人信息", description: "必填" },
  { type: "education", name: "教育经历", description: "选填" },
  { type: "internship", name: "实习经历", description: "选填" },
  { type: "project", name: "项目经历", description: "选填" },
  { type: "campus", name: "校园经历", description: "选填" },
  { type: "advantage", name: "个人优势", description: "选填" },
];

export function ModuleSidebar() {
  const { currentResume, toggleModule } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h3 className="font-medium text-gray-900 mb-4">简历模块</h3>
      <div className="space-y-2">
        {modules.map((module) => {
          const isEnabled = currentResume.modules[module.type];
          return (
            <button
              key={module.type}
              onClick={() => toggleModule(module.type)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all flex items-center gap-3",
                isEnabled
                  ? "bg-white border border-primary/30 shadow-sm"
                  : "bg-gray-100 border border-transparent hover:bg-gray-200"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  isEnabled ? "border-primary bg-primary" : "border-gray-300"
                )}
              >
                {isEnabled && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{module.name}</p>
                <p className="text-xs text-gray-500">{module.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **步骤 3：创建简历块组件（ProfileBlock.tsx）**

```typescript
"use client";

import { ProfileBlock as ProfileBlockType } from "@/lib/resume/types";
import { Input } from "@/components/ui/input";
import { useResumeStore } from "@/stores/resume";

interface ProfileBlockProps {
  data: ProfileBlockType;
}

export function ProfileBlockEditor({ data }: ProfileBlockProps) {
  const { updateContent } = useResumeStore();

  const handleChange = (field: keyof ProfileBlockType, value: string) => {
    updateContent({
      profile: { ...data, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">个人信息</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">姓名</label>
          <Input
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="张三"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">求职意向</label>
          <Input
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="前端开发工程师"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">邮箱</label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="zhangsan@example.com"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">电话</label>
          <Input
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="138-0000-0000"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-600 mb-1 block">所在城市</label>
          <Input
            value={data.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="北京"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步骤 4：创建 EducationBlock.tsx**

```typescript
"use client";

import { EducationBlock as EducationBlockType } from "@/lib/resume/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "@/stores/resume";
import { defaultEducation } from "@/lib/resume/types";

interface EducationBlockProps {
  data: EducationBlockType[];
}

export function EducationBlockEditor({ data }: EducationBlockProps) {
  const { updateContent } = useResumeStore();

  const handleChange = (index: number, field: keyof EducationBlockType, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    updateContent({ education: newData });
  };

  const handleAdd = () => {
    updateContent({ education: [...data, { ...defaultEducation }] });
  };

  const handleRemove = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    updateContent({ education: newData });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">教育经历</h3>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">暂无教育经历</p>
      )}
      {data.map((item, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">学校</label>
              <Input
                value={item.school}
                onChange={(e) => handleChange(index, "school", e.target.value)}
                placeholder="XX大学"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">专业</label>
              <Input
                value={item.major}
                onChange={(e) => handleChange(index, "major", e.target.value)}
                placeholder="计算机科学与技术"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">学历</label>
              <Input
                value={item.degree}
                onChange={(e) => handleChange(index, "degree", e.target.value)}
                placeholder="本科"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">GPA</label>
              <Input
                value={item.gpa || ""}
                onChange={(e) => handleChange(index, "gpa", e.target.value)}
                placeholder="3.8/4.0"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">开始时间</label>
              <Input
                value={item.startDate}
                onChange={(e) => handleChange(index, "startDate", e.target.value)}
                placeholder="2020.09"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">结束时间</label>
              <Input
                value={item.endDate}
                onChange={(e) => handleChange(index, "endDate", e.target.value)}
                placeholder="2024.06"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **步骤 5：创建 EditorCanvas.tsx**

```typescript
"use client";

import { useResumeStore } from "@/stores/resume";
import { ProfileBlockEditor } from "./blocks/ProfileBlock";
import { EducationBlockEditor } from "./blocks/EducationBlock";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function EditorCanvas() {
  const { currentResume } = useResumeStore();

  if (!currentResume) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">未选择简历</p>
      </div>
    );
  }

  const { content, modules } = currentResume;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        {modules.profile && <ProfileBlockEditor data={content.profile} />}

        {modules.education && <EducationBlockEditor data={content.education} />}

        {modules.internship && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">实习经历</h3>
            <p className="text-sm text-gray-500">AI 辅助生成中...</p>
          </div>
        )}

        {modules.project && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">项目经历</h3>
            <p className="text-sm text-gray-500">AI 辅助生成中...</p>
          </div>
        )}

        {modules.campus && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">校园经历</h3>
            <p className="text-sm text-gray-500">AI 辅助生成中...</p>
          </div>
        )}

        {modules.advantage && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">个人优势</h3>
            <Textarea
              value={content.advantage.summary}
              onChange={(e) =>
                useResumeStore.getState().updateContent({
                  advantage: { summary: e.target.value },
                })
              }
              placeholder="描述你的个人优势和特长..."
              rows={4}
            />
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Link href={`/resume/${currentResume.id}/generate`}>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              AI 辅助填充
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步骤 6：创建 Textarea 组件（src/components/ui/textarea.tsx）**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
```

- [ ] **步骤 7：创建 PreviewPanel.tsx（模板预览）**

```typescript
"use client";

import { useResumeStore } from "@/stores/resume";
import { cn } from "@/lib/utils";

export function PreviewPanel() {
  const { currentResume } = useResumeStore();

  if (!currentResume) {
    return (
      <div className="w-1/2 border-l bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">预览区</p>
      </div>
    );
  }

  const { content, modules, template } = currentResume;

  return (
    <div className="w-1/2 border-l bg-gray-100 overflow-y-auto">
      <div className="p-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className={cn(
            "p-8",
            template === "simple" && "bg-white",
            template === "modern" && "bg-slate-50",
            template === "classic" && "bg-white border-2 border-gray-200",
            template === "creative" && "bg-gradient-to-br from-blue-50 to-purple-50",
          )}>
            {modules.profile && (
              <div className="text-center mb-6">
                <h1 className={cn(
                  "font-bold mb-2",
                  template === "simple" && "text-xl text-black",
                  template === "modern" && "text-2xl text-gray-900",
                  template === "classic" && "text-xl text-gray-800",
                  template === "creative" && "text-2xl text-purple-900",
                )}>
                  {content.profile.name || "姓名"}
                </h1>
                <p className={cn(
                  "mb-2",
                  template === "simple" && "text-sm text-gray-600",
                  template === "modern" && "text-base text-blue-600",
                  template === "classic" && "text-sm text-gray-600",
                  template === "creative" && "text-base text-purple-600",
                )}>
                  {content.profile.title || "求职意向"}
                </p>
                <div className={cn(
                  "text-xs",
                  template === "simple" && "text-gray-500",
                  template === "modern" && "text-gray-500",
                  template === "classic" && "text-gray-600",
                  template === "creative" && "text-purple-700",
                )}>
                  {content.profile.email} | {content.profile.phone} | {content.profile.location}
                </div>
              </div>
            )}

            {modules.education && content.education.length > 0 && (
              <div className="mb-6">
                <h2 className={cn(
                  "font-bold border-b pb-1 mb-3",
                  template === "simple" && "text-sm text-black border-black",
                  template === "modern" && "text-base text-blue-900 border-blue-200",
                  template === "classic" && "text-sm text-gray-800 border-gray-400",
                  template === "creative" && "text-base text-purple-900 border-purple-300",
                )}>
                  教育经历
                </h2>
                {content.education.map((edu, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{edu.school}</span>
                      <span className="text-gray-500">{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <div className="text-gray-600">{edu.degree} | {edu.major}</div>
                    {edu.gpa && <div className="text-gray-500 text-xs">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            )}

            {modules.advantage && content.advantage.summary && (
              <div className="mb-6">
                <h2 className={cn(
                  "font-bold border-b pb-1 mb-3",
                  template === "simple" && "text-sm text-black border-black",
                  template === "modern" && "text-base text-blue-900 border-blue-200",
                  template === "classic" && "text-sm text-gray-800 border-gray-400",
                  template === "creative" && "text-base text-purple-900 border-purple-300",
                )}>
                  个人优势
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.advantage.summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步骤 8：创建 src/app/resume/[id]/page.tsx**

```typescript
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/stores/resume";
import { ModuleSidebar } from "@/components/resume/ModuleSidebar";
import { EditorCanvas } from "@/components/resume/EditorCanvas";
import { PreviewPanel } from "@/components/resume/PreviewPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { currentResume, selectResume, isLoading } = useResumeStore();

  useEffect(() => {
    const id = params.id as string;
    if (id && id !== currentResume?.id) {
      selectResume(id);
    }
  }, [params.id, selectResume, currentResume?.id]);

  const handleBack = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">简历不存在</p>
          <Button onClick={handleBack}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="font-medium">{currentResume.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出 PDF
          </Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <ModuleSidebar />
        <EditorCanvas />
        <PreviewPanel />
      </div>
    </div>
  );
}
```

- [ ] **步骤 9：Commit**

```bash
git add -A
git commit -m "feat: 添加简历编辑器页（模块管理+编辑+实时预览）"
```

---

## 任务 6：AI 生成页

**文件：**
- 创建：`src/app/resume/[id]/generate/page.tsx`
- 创建：`src/components/ai/AIModal.tsx`
- 创建：`src/lib/ai/types.ts`
- 创建：`src/lib/ai/providers/base.ts`
- 创建：`src/lib/ai/providers/wenxin.ts`

- [ ] **步骤 1：创建 src/lib/ai/types.ts**

```typescript
import { ModuleType } from "@/lib/resume/types";

export interface GenerateInput {
  moduleType: Exclude<ModuleType, "profile">;
  profile: { name: string; title: string };
  outline: string;
}

export interface GenerateResult {
  moduleType: ModuleType;
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface AIProvider {
  name: string;
  generate(input: GenerateInput): Promise<GenerateResult>;
}
```

- [ ] **步骤 2：创建 src/lib/ai/providers/base.ts**

```typescript
import { AIProvider, GenerateInput, GenerateResult } from "../types";

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract apiKey: string;
  abstract endpoint: string;

  async generate(input: GenerateInput): Promise<GenerateResult> {
    try {
      const result = await this.callAPI(input);
      return {
        moduleType: input.moduleType,
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        moduleType: input.moduleType,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  protected abstract callAPI(input: GenerateInput): Promise<Record<string, any>>;
}
```

- [ ] **步骤 3：创建 src/lib/ai/providers/wenxin.ts**

```typescript
import { BaseAIProvider } from "./base";
import { GenerateInput } from "../types";

export class WenxinProvider extends BaseAIProvider {
  name = "文心一言";
  apiKey = process.env.NEXT_PUBLIC_WENXIN_API_KEY || "";
  endpoint = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions";

  protected async callAPI(input: GenerateInput): Promise<Record<string, any>> {
    const prompt = this.buildPrompt(input);
    const response = await fetch(`${this.endpoint}?access_token=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  private buildPrompt(input: GenerateInput): string {
    const templates: Record<string, string> = {
      education: `请根据以下概要信息，生成一段专业的教育经历描述：

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- school: 学校名称
- degree: 学历
- major: 专业
- highlights: 成就描述（数组）

只返回JSON，不要其他内容。`,
      internship: `请根据以下概要信息，生成一段专业的实习经历描述：

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- company: 公司名称
- position: 职位
- description: 工作描述
- highlights: 成就/成果（数组）

只返回JSON，不要其他内容。`,
      project: `请根据以下概要信息，生成一段专业的项目经历描述：

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- name: 项目名称
- role: 角色
- description: 项目描述
- highlights: 个人贡献/成果（数组）

只返回JSON，不要其他内容。`,
      campus: `请根据以下概要信息，生成一段专业的校园经历描述：

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- organization: 组织名称
- position: 职务
- description: 活动描述
- highlights: 成就/成果（数组）

只返回JSON，不要其他内容。`,
      advantage: `请根据以下信息，生成一段精炼的个人优势总结：

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- summary: 个人优势总结（100字以内）

只返回JSON，不要其他内容。`,
    };

    return templates[input.moduleType] || "";
  }

  private parseResponse(data: any): Record<string, any> {
    const content = data.choices?.[0]?.message?.content || "{}";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      return { description: content };
    }
  }
}
```

- [ ] **步骤 4：创建 src/lib/ai/index.ts**

```typescript
import { AIProvider } from "./types";
import { WenxinProvider } from "./providers/wenxin";

let provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = new WenxinProvider();
  }
  return provider;
}

export { type AIProvider, GenerateInput, GenerateResult } from "./types";
```

- [ ] **步骤 5：创建 AI 生成页 src/app/resume/[id]/generate/page.tsx**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/stores/resume";
import { ModuleType } from "@/lib/resume/types";
import { getAIProvider } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const moduleConfigs: { type: ModuleType; name: string; placeholder: string }[] = [
  { type: "education", name: "教育经历", placeholder: "例如：2020-2024年就读于XX大学计算机专业，GPA 3.8/4.0，曾获得校级一等奖学金..." },
  { type: "internship", name: "实习经历", placeholder: "例如：在XX公司实习3个月，负责前端开发，参与了XX项目..." },
  { type: "project", name: "项目经历", placeholder: "例如：独立开发了一个React组件库，包含20+组件..." },
  { type: "campus", name: "校园经历", placeholder: "例如：担任学生会主席，组织过1000+人参加的活动..." },
  { type: "advantage", name: "个人优势", placeholder: "例如：熟悉React生态，掌握TypeScript，参与过开源项目..." },
];

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const { currentResume, selectResume, updateContent } = useResumeStore();
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [outlines, setOutlines] = useState<Record<ModuleType, string>>({
    education: "",
    internship: "",
    project: "",
    campus: "",
    advantage: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id && id !== currentResume?.id) {
      selectResume(id);
    }
  }, [params.id, selectResume, currentResume?.id]);

  const handleBack = () => {
    router.push(`/resume/${params.id}`);
  };

  const toggleModule = (type: ModuleType) => {
    setSelectedModules((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!currentResume || selectedModules.length === 0) return;

    setIsGenerating(true);
    const provider = getAIProvider();
    const profile = currentResume.content.profile;

    for (const moduleType of selectedModules) {
      const outline = outlines[moduleType];
      if (!outline.trim()) continue;

      try {
        const result = await provider.generate({
          moduleType,
          profile: { name: profile.name, title: profile.title },
          outline,
        });

        if (result.success && result.data) {
          if (moduleType === "advantage") {
            updateContent({ advantage: { summary: result.data.summary || "" } });
          } else {
            const existing = currentResume.content[moduleType] || [];
            if (Array.isArray(existing)) {
              updateContent({ [moduleType]: [...existing, result.data] });
            }
          }
        }
      } catch (error) {
        console.error(`生成 ${moduleType} 失败:`, error);
      }
    }

    setIsGenerating(false);
    handleBack();
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </Button>
        <h1 className="font-medium ml-4">AI 辅助填充</h1>
      </header>

      <main className="max-w-2xl mx-auto p-8 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">选择要生成的模块</h2>
          <div className="flex flex-wrap gap-2">
            {moduleConfigs.map((config) => {
              const isEnabled = currentResume.modules[config.type];
              const isSelected = selectedModules.includes(config.type);
              return (
                <button
                  key={config.type}
                  onClick={() => isEnabled && toggleModule(config.type)}
                  disabled={!isEnabled}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm transition-all",
                    !isEnabled && "opacity-50 cursor-not-allowed",
                    isEnabled && !isSelected && "bg-gray-100 hover:bg-gray-200",
                    isSelected && "bg-primary text-white"
                  )}
                >
                  {config.name}
                </button>
              );
            })}
          </div>
        </div>

        {selectedModules.length > 0 && (
          <div className="space-y-6">
            {selectedModules.map((type) => {
              const config = moduleConfigs.find((c) => c.type === type);
              return (
                <div key={type} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-medium mb-3">{config?.name}</h3>
                  <Textarea
                    value={outlines[type]}
                    onChange={(e) =>
                      setOutlines((prev) => ({ ...prev, [type]: e.target.value }))
                    }
                    placeholder={config?.placeholder}
                    rows={4}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={selectedModules.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                开始生成
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **步骤 6：Commit**

```bash
git add -A
git commit -m "feat: 添加 AI 生成页和 Provider 抽象层"
```

---

## 任务 7：PDF 导出功能

**文件：**
- 创建：`src/lib/resume/pdf.ts`
- 修改：`src/components/resume/PreviewPanel.tsx`（添加导出按钮逻辑）

- [ ] **步骤 1：创建 src/lib/resume/pdf.ts**

```typescript
import { Resume, TemplateType } from "./types";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const getStyles = (template: TemplateType) => {
  const base = {
    page: {
      padding: 40,
      fontFamily: "Helvetica",
    },
    name: {
      fontSize: 24,
      fontWeight: "bold" as const,
      marginBottom: 8,
      textAlign: "center" as const,
    },
    title: {
      fontSize: 12,
      marginBottom: 4,
      textAlign: "center" as const,
    },
    contact: {
      fontSize: 10,
      textAlign: "center" as const,
      marginBottom: 20,
      color: "#666",
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold" as const,
      borderBottom: "1 solid #333",
      paddingBottom: 4,
      marginBottom: 8,
    },
    sectionContent: {
      fontSize: 11,
      lineHeight: 1.5,
    },
  };

  switch (template) {
    case "modern":
      return {
        ...base,
        name: { ...base.name, color: "#1e40af" },
        title: { ...base.title, color: "#3b82f6" },
        sectionTitle: { ...base.sectionTitle, color: "#1e3a8a", borderColor: "#93c5fd" },
      };
    case "classic":
      return {
        ...base,
        page: { ...base.page, borderWidth: 2, borderColor: "#e5e5e5" },
      };
    case "creative":
      return {
        ...base,
        name: { ...base.name, color: "#7c3aed" },
        title: { ...base.title, color: "#8b5cf6" },
        sectionTitle: { ...base.sectionTitle, color: "#5b21b6", borderColor: "#c4b5fd" },
      };
    default:
      return base;
  }
};

export async function generatePDF(resume: Resume): Promise<Buffer> {
  const { content, modules, template } = resume;
  const styles = getStyles(template);

  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {modules.profile && (
          <>
            <Text style={styles.name}>{content.profile.name || "姓名"}</Text>
            <Text style={styles.title}>{content.profile.title || "求职意向"}</Text>
            <Text style={styles.contact}>
              {content.profile.email} | {content.profile.phone} | {content.profile.location}
            </Text>
          </>
        )}

        {modules.education && content.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>教育经历</Text>
            {content.education.map((edu, i) => (
              <View key={i} style={styles.sectionContent}>
                <Text>
                  {edu.school} | {edu.degree} | {edu.major}
                </Text>
                <Text>
                  {edu.startDate} - {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {modules.advantage && content.advantage.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>个人优势</Text>
            <Text style={styles.sectionContent}>{content.advantage.summary}</Text>
          </View>
        )}
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(<MyDocument />);
  return buffer;
}

export function downloadPDF(buffer: Buffer, filename: string) {
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

- [ ] **步骤 2：Commit**

```bash
git add -A
git commit -m "feat: 添加 PDF 导出功能"
```

---

## 任务 8：完善其他 AI Provider

**文件：**
- 创建：`src/lib/ai/providers/tongyi.ts`
- 创建：`src/lib/ai/providers/kimi.ts`
- 创建：`src/lib/ai/providers/deepseek.ts`
- 创建：`src/lib/ai/providers/zhipu.ts`

- [ ] **步骤 1：创建通义千问 Provider**

```typescript
import { BaseAIProvider } from "./base";
import { GenerateInput } from "../types";

export class TongyiProvider extends BaseAIProvider {
  name = "通义千问";
  apiKey = process.env.NEXT_PUBLIC_TONGYI_API_KEY || "";
  endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

  protected async callAPI(input: GenerateInput): Promise<Record<string, any>> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [{ role: "user", content: this.buildPrompt(input) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  private buildPrompt(input: GenerateInput): string {
    return `请根据以下信息生成简历内容：
${input.outline}
只返回JSON格式。`;
  }

  private parseResponse(data: any): Record<string, any> {
    const content = data.choices?.[0]?.message?.content || "{}";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
    } catch {
      return { description: content };
    }
  }
}
```

- [ ] **步骤 2：Commit**

```bash
git add -A
git commit -m "feat: 添加通义千问 AI Provider"
```

---

## 验收检查清单

完成所有任务后，验证以下功能正常工作：

- [ ] 简历列表页显示所有简历
- [ ] 可以新建、删除、复制简历
- [ ] 简历编辑器可以编辑各模块内容
- [ ] 模块管理可以启用/禁用各模块
- [ ] 模板选择器可以切换不同模板风格
- [ ] 预览区实时显示选中模板的渲染效果
- [ ] AI 生成页可以选择模块并输入概要
- [ ] AI 可以生成内容并填充到简历
- [ ] PDF 导出可以生成并下载 PDF
- [ ] 所有数据正确保存到 LocalStorage
