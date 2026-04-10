# AI 辅助填充功能实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 实现侧边抽屉式的 AI 辅助填充功能，支持流式 Markdown 输出和实时编辑

**架构：** 侧边抽屉 + 流式 Markdown + 智能上下文感知 + 结构化数据解析

**技术栈：** Next.js 14 / React / TypeScript / Tailwind CSS / Zustand

---

## 文件结构

```
src/
├── components/
│   └── ai/
│       ├── AISidebar.tsx              # 侧边抽屉主组件
│       ├── ModuleSelector.tsx         # 模块多选器
│       ├── ContextPreview.tsx         # 已读取信息预览
│       ├── MarkdownStreamViewer.tsx   # 流式 Markdown 渲染
│       └── GenerationActions.tsx      # 操作按钮
├── hooks/
│   ├── useAISidebar.ts               # 管理抽屉开关
│   ├── useAIStreamGenerate.ts         # 流式生成 Hook
│   └── useMarkdownParser.ts           # Markdown 解析
└── lib/ai/
    ├── prompt-templates.ts           # Prompt 模板
    ├── parsers/
    │   └── markdown-to-json.ts       # Markdown 转结构化数据
    └── providers/
        └── wenxin.ts                 # 修改为支持流式
```

---

## 任务 1：创建 Prompt 模板系统

**文件：**
- 创建：`src/lib/ai/prompt-templates.ts`

- [ ] **步骤 1：创建 prompt-templates.ts**

```typescript
import { ModuleType, EducationBlock, InternshipBlock, ProjectBlock, CampusBlock, ProfileBlock } from '@/lib/resume/types';

export interface PromptContext {
  profile: ProfileBlock;
  education: EducationBlock[];
  internship: InternshipBlock[];
  project: ProjectBlock[];
  campus: CampusBlock[];
  advantage: { summary: string };
}

const MODULE_NAMES: Record<ModuleType, string> = {
  profile: '个人信息',
  education: '教育经历',
  internship: '实习经历',
  project: '项目经历',
  campus: '校园经历',
  advantage: '个人优势',
};

function formatHighlights(block: { highlights?: string[] }): string {
  if (!block.highlights || block.highlights.length === 0) return '';
  return block.highlights.map(h => `  · ${h}`).join('\n');
}

function buildEducationContext(blocks: EducationBlock[]): string {
  if (blocks.length === 0) return '';
  return blocks.map(b => [
    `- 学校：${b.school}`,
    `  专业：${b.major}`,
    `  学历：${b.degree}`,
    `  时间：${b.startDate} - ${b.endDate}`,
    b.gpa ? `  GPA：${b.gpa}` : '',
    b.courses ? `  核心课程：${b.courses}` : '',
    b.awards ? `  获奖情况：${b.awards}` : '',
    b.highlights.length > 0 ? `  亮点：\n${formatHighlights(b)}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
}

function buildInternshipContext(blocks: InternshipBlock[]): string {
  if (blocks.length === 0) return '';
  return blocks.map(b => [
    `- 公司：${b.company}`,
    `  职位：${b.position}`,
    `  时间：${b.startDate} - ${b.endDate}`,
    b.description ? `  描述：${b.description}` : '',
    b.highlights.length > 0 ? `  亮点：\n${formatHighlights(b)}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
}

function buildProjectContext(blocks: ProjectBlock[]): string {
  if (blocks.length === 0) return '';
  return blocks.map(b => [
    `- 项目：${b.name}`,
    `  角色：${b.role}`,
    `  时间：${b.startDate} - ${b.endDate}`,
    b.description ? `  描述：${b.description}` : '',
    b.highlights.length > 0 ? `  亮点：\n${formatHighlights(b)}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
}

function buildCampusContext(blocks: CampusBlock[]): string {
  if (blocks.length === 0) return '';
  return blocks.map(b => [
    `- 组织：${b.organization}`,
    `  职务：${b.position}`,
    `  时间：${b.startDate} - ${b.endDate}`,
    b.description ? `  描述：${b.description}` : '',
    b.highlights.length > 0 ? `  亮点：\n${formatHighlights(b)}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
}

export function buildPrompt(moduleType: ModuleType, context: PromptContext): string {
  const { profile, education, internship, project, campus, advantage } = context;
  const jobTitle = profile.title || '待定';
  const name = profile.name || '用户';

  const templates: Record<ModuleType, string> = {
    profile: '', // profile 不需要 AI 生成

    education: `你是专业的简历撰写助手。用户正在申请 [${jobTitle}] 岗位。

## 已有信息
- 姓名：${name}
- 学校：${education.map(e => e.school).join('、') || '待定'}
- 专业：${education.map(e => e.major).join('、') || '待定'}
- 学历：${education.map(e => e.degree).join('、') || '待定'}
- 时间：${education.map(e => `${e.startDate} - ${e.endDate}`).join('、') || '待定'}
${education.some(e => e.gpa) ? `- GPA：${education.map(e => e.gpa).filter(Boolean).join('、')}` : ''}
${education.some(e => e.awards) ? `- 获奖：${education.map(e => e.awards).filter(Boolean).join('、')}` : ''}

## 要求
1. 使用 Markdown 格式输出
2. 突出与 [${jobTitle}] 相关的内容（如编程课程、项目经历）
3. 亮点用 **加粗** + 具体数字量化
4. 亮点分类清晰，使用 emoji 分类标签
5. 不要编造具体数字，如不确定可写"多次获得奖学金"

## 输出格式
## [学校] [专业]
📅 [时间]  |  📊 GPA: [GPA]

### 学术成就

- 🏆 **亮点描述**
  · 详细说明

### 实践经历

- 💻 **亮点描述**
  · 详细说明`,

    internship: `你是专业的简历撰写助手。用户正在申请 [${jobTitle}] 岗位。

## 已有信息
- 姓名：${name}
${buildInternshipContext(internship) || '- 实习经历：待补充'}

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
  · 详细说明`,

    project: `你是专业的简历撰写助手。用户正在申请 [${jobTitle}] 岗位。

## 已有信息
- 姓名：${name}
${buildProjectContext(project) || '- 项目经历：待补充'}

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
  · 详细说明`,

    campus: `你是专业的简历撰写助手。用户正在申请 [${jobTitle}] 岗位。

## 已有信息
- 姓名：${name}
${buildCampusContext(campus) || '- 校园经历：待补充'}

## 要求
1. 基于已有信息扩写
2. 使用 Markdown 格式输出
3. 突出领导力、组织能力、团队协作
4. 成果用 **加粗** + 数字量化
5. 可迁移技能可用"培养了优秀的 XXX 能力"表述

## 输出格式
## [组织] | [职务]
📅 [时间]

[活动描述段落]

### 主要成果

- 🎯 **成果描述** + 数字
  · 详细说明`,

    advantage: `你是专业的简历撰写助手。用户正在申请 [${jobTitle}] 岗位。

## 已有信息
- 姓名：${name}
- 个人优势概要：${advantage.summary || '待补充'}

## 已有的其他模块信息
### 教育经历
${buildEducationContext(education) || '暂无'}
### 实习经历
${buildInternshipContext(internship) || '暂无'}
### 项目经历
${buildProjectContext(project) || '暂无'}
### 校园经历
${buildCampusContext(campus) || '暂无'}

## 要求
1. 基于用户已有经历，提炼出与 [${jobTitle}] 最相关的技能和优势
2. 使用 Markdown 格式输出
3. 控制在 3-5 个核心优势点
4. 每个优势点用具体经历/成果支撑，而非空洞描述
5. 语言精炼，每点不超过 2 行

## 输出格式
## 个人优势

- 💡 **技术能力**：**描述**，具体体现在...
- 🚀 **项目经验**：**描述**，参与过...
- 🤝 **协作能力**：**描述**，在...中体现
- 📚 **学习能力**：**描述**，例如...`,
  };

  return templates[moduleType] || '';
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/lib/ai/prompt-templates.ts
git commit -m "feat: 添加 AI Prompt 模板系统"
```

---

## 任务 2：创建 Markdown 解析器

**文件：**
- 创建：`src/lib/ai/parsers/markdown-to-json.ts`

- [ ] **步骤 1：创建 markdown-to-json.ts**

```typescript
import { EducationBlock, InternshipBlock, ProjectBlock, CampusBlock, AdvantageBlock } from '@/lib/resume/types';

export function parseEducationMarkdown(md: string): Partial<EducationBlock> {
  const schoolMatch = md.match(/##\s*\[?([^\]|]+)/);
  const dateMatch = md.match(/📅\s*([\d.\-~\s]+)/);
  const gpaMatch = md.match(/GPA[:：]\s*([\d./]+)/);

  const highlights: string[] = [];
  const boldMatches = md.matchAll(/\*\*([^*]+)\*\*/g);
  for (const match of boldMatches) {
    const nextChar = md[md.indexOf(match[0]) + match[0].length];
    if (nextChar === '\n' || nextChar === ' ') {
      const afterBold = md.slice(md.indexOf(match[0]) + match[0].length).trim();
      const endOfLine = afterBold.indexOf('\n');
      const detail = endOfLine > 0 ? afterBold.slice(0, endOfLine) : afterBold;
      if (detail && !detail.startsWith('-')) {
        highlights.push(match[1] + detail);
      } else {
        highlights.push(match[1]);
      }
    }
  }

  const lines = md.split('\n');
  let currentDetail = '';
  const processedHighlights: string[] = [];
  for (const line of lines) {
    const boldMatch = line.match(/\*\*([^*]+)\*\*/);
    if (boldMatch) {
      if (currentDetail) {
        processedHighlights.push(currentDetail);
        currentDetail = '';
      }
      processedHighlights.push(boldMatch[1]);
    } else if (line.includes('·')) {
      currentDetail += ' ' + line.replace(/^[·\-*]\s*/, '').trim();
    }
  }
  if (currentDetail) {
    processedHighlights.push(currentDetail.trim());
  }

  return {
    school: schoolMatch?.[1]?.trim() || '',
    startDate: dateMatch?.[1]?.split('-')[0]?.trim() || '',
    endDate: dateMatch?.[1]?.split('-').slice(1).join('-')?.trim() || '',
    gpa: gpaMatch?.[1],
    highlights: processedHighlights.length > 0 ? processedHighlights : highlights,
  };
}

export function parseInternshipMarkdown(md: string): Partial<InternshipBlock> {
  const companyMatch = md.match(/##\s*\[?([^\]|]+)/);
  const dateMatch = md.match(/📅\s*([\d.\-~\s]+)/);

  const highlights: string[] = [];
  const boldMatches = md.matchAll(/\*\*([^*]+)\*\*/g);
  for (const match of boldMatches) {
    highlights.push(match[1]);
  }

  const descMatch = md.match(/#{2,3}.+\n+([^\n#]+)/);
  const description = descMatch?.[1]?.trim() || '';

  return {
    company: companyMatch?.[1]?.trim() || '',
    startDate: dateMatch?.[1]?.split('-')[0]?.trim() || '',
    endDate: dateMatch?.[1]?.split('-').slice(1).join('-')?.trim() || '',
    description,
    highlights,
  };
}

export function parseProjectMarkdown(md: string): Partial<ProjectBlock> {
  const nameMatch = md.match(/##\s*\[?([^\]|]+)/);
  const dateMatch = md.match(/📅\s*([\d.\-~\s]+)/);

  const highlights: string[] = [];
  const boldMatches = md.matchAll(/\*\*([^*]+)\*\*/g);
  for (const match of boldMatches) {
    highlights.push(match[1]);
  }

  const techMatch = md.match(/### 技术栈\n+([^\n#]+)/);
  const techStack = techMatch?.[1]?.trim() || '';

  const descMatch = md.match(/#{2,3}.+\n+([^\n#]+(?:\n(?!\n|#|$))[^\n]*)*/);
  const description = descMatch?.[0]?.replace(/^#+.*\n/, '').trim() || '';

  return {
    name: nameMatch?.[1]?.trim() || '',
    startDate: dateMatch?.[1]?.split('-')[0]?.trim() || '',
    endDate: dateMatch?.[1]?.split('-').slice(1).join('-')?.trim() || '',
    description: description.split('\n')[0] || '',
    highlights,
  };
}

export function parseCampusMarkdown(md: string): Partial<CampusBlock> {
  const orgMatch = md.match(/##\s*\[?([^\]|]+)/);
  const dateMatch = md.match(/📅\s*([\d.\-~\s]+)/);

  const highlights: string[] = [];
  const boldMatches = md.matchAll(/\*\*([^*]+)\*\*/g);
  for (const match of boldMatches) {
    highlights.push(match[1]);
  }

  return {
    organization: orgMatch?.[1]?.trim() || '',
    startDate: dateMatch?.[1]?.split('-')[0]?.trim() || '',
    endDate: dateMatch?.[1]?.split('-').slice(1).join('-')?.trim() || '',
    highlights,
  };
}

export function parseAdvantageMarkdown(md: string): Partial<AdvantageBlock> {
  const lines = md.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const summary = lines.map(l => l.replace(/^[•\-*]\s*/, '').replace(/\*\*([^*]+)\*\*/g, '$1')).join('\n');

  return {
    summary,
  };
}

export function parseMarkdown(moduleType: string, md: string): Record<string, any> {
  switch (moduleType) {
    case 'education':
      return parseEducationMarkdown(md);
    case 'internship':
      return parseInternshipMarkdown(md);
    case 'project':
      return parseProjectMarkdown(md);
    case 'campus':
      return parseCampusMarkdown(md);
    case 'advantage':
      return parseAdvantageMarkdown(md);
    default:
      return { description: md };
  }
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/lib/ai/parsers/markdown-to-json.ts
git commit -m "feat: 添加 Markdown 解析器"
```

---

## 任务 3：创建流式生成 Hook

**文件：**
- 创建：`src/hooks/useAIStreamGenerate.ts`

- [ ] **步骤 1：创建 useAIStreamGenerate.ts**

```typescript
import { useState, useCallback } from 'react';
import { getAIProvider } from '@/lib/ai';

type GenerationStatus = 'idle' | 'generating' | 'generated' | 'error';

interface UseAIStreamGenerateOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

export function useAIStreamGenerate(options: UseAIStreamGenerateOptions = {}) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string) => {
    setStatus('generating');
    setGeneratedText('');
    setError(null);

    try {
      const provider = getAIProvider();
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: provider.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setGeneratedText(fullText);
        options.onChunk?.(chunk);
      }

      setStatus('generated');
      options.onComplete?.(fullText);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setStatus('error');
      setError(errorMessage);
      options.onError?.(errorMessage);
    }
  }, [options]);

  const reset = useCallback(() => {
    setStatus('idle');
    setGeneratedText('');
    setError(null);
  }, []);

  return {
    status,
    generatedText,
    error,
    generate,
    reset,
    isGenerating: status === 'generating',
  };
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/hooks/useAIStreamGenerate.ts
git commit -m "feat: 添加流式生成 Hook"
```

---

## 任务 4：创建 AI 侧边抽屉组件

**文件：**
- 创建：`src/components/ai/AISidebar.tsx`
- 创建：`src/components/ai/ModuleSelector.tsx`
- 创建：`src/components/ai/ContextPreview.tsx`
- 创建：`src/components/ai/MarkdownStreamViewer.tsx`
- 创建：`src/components/ai/GenerationActions.tsx`

- [ ] **步骤 1：创建 AISidebar.tsx**

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useResumeStore } from '@/stores/resume';
import { ModuleType } from '@/lib/resume/types';
import { ModuleSelector } from './ModuleSelector';
import { ContextPreview } from './ContextPreview';
import { MarkdownStreamViewer } from './MarkdownStreamViewer';
import { GenerationActions } from './GenerationActions';
import { useAIStreamGenerate } from '@/hooks/useAIStreamGenerate';
import { buildPrompt } from '@/lib/ai/prompt-templates';
import { parseMarkdown } from '@/lib/ai/parsers/markdown-to-json';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AISidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AISidebar({ open, onClose }: AISidebarProps) {
  const { currentResume, updateContent } = useResumeStore();
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);

  const { status, generatedText, error, generate, reset, isGenerating } = useAIStreamGenerate({
    onChunk: () => {},
  });

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedModules([]);
      setActiveModule(null);
    }
  }, [open, reset]);

  const handleStartGenerate = async () => {
    if (!currentResume || selectedModules.length === 0) return;

    setActiveModule(selectedModules[0]);
    reset();

    const context = {
      profile: currentResume.content.profile,
      education: currentResume.content.education,
      internship: currentResume.content.internship,
      project: currentResume.content.project,
      campus: currentResume.content.campus,
      advantage: currentResume.content.advantage,
    };

    const prompt = buildPrompt(selectedModules[0], context);
    await generate(prompt);
  };

  const handleAccept = async () => {
    if (!currentResume || !activeModule || !generatedText) return;

    const parsed = parseMarkdown(activeModule, generatedText);

    if (activeModule === 'advantage') {
      await updateContent({ advantage: parsed as { summary: string } });
    } else {
      const existing = currentResume.content[activeModule] as any[];
      await updateContent({ [activeModule]: [...existing, parsed] });
    }

    const remaining = selectedModules.filter(m => m !== activeModule);
    if (remaining.length > 0) {
      setSelectedModules(remaining);
      setActiveModule(remaining[0]);
      reset();

      const context = {
        profile: currentResume.content.profile,
        education: currentResume.content.education,
        internship: currentResume.content.internship,
        project: currentResume.content.project,
        campus: currentResume.content.campus,
        advantage: currentResume.content.advantage,
      };

      const prompt = buildPrompt(remaining[0], context);
      await generate(prompt);
    } else {
      onClose();
    }
  };

  const handleRegenerate = async () => {
    if (!currentResume || !activeModule) return;
    reset();

    const context = {
      profile: currentResume.content.profile,
      education: currentResume.content.education,
      internship: currentResume.content.internship,
      project: currentResume.content.project,
      campus: currentResume.content.campus,
      advantage: currentResume.content.advantage,
    };

    const prompt = buildPrompt(activeModule, context);
    await generate(prompt);
  };

  const canGenerate = currentResume?.content.profile.name && currentResume?.content.profile.title;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-xl z-50 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-medium">AI 辅助填充</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!canGenerate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              请先填写姓名和求职意向，才能使用 AI 辅助填充
            </div>
          )}

          {canGenerate && !activeModule && (
            <>
              <ModuleSelector
                selectedModules={selectedModules}
                onToggle={(module) => {
                  setSelectedModules(prev =>
                    prev.includes(module)
                      ? prev.filter(m => m !== module)
                      : [...prev, module]
                  );
                }}
                disabledModules={!canGenerate}
              />
              <ContextPreview />
            </>
          )}

          {activeModule && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {activeModule === 'education' && '教育经历'}
                  {activeModule === 'internship' && '实习经历'}
                  {activeModule === 'project' && '项目经历'}
                  {activeModule === 'campus' && '校园经历'}
                  {activeModule === 'advantage' && '个人优势'}
                </span>
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <MarkdownStreamViewer
                content={generatedText}
                isGenerating={isGenerating}
              />
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          {!activeModule ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleStartGenerate}
              disabled={selectedModules.length === 0 || isGenerating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              开始生成 {selectedModules.length > 0 && `(${selectedModules.length} 个模块)`}
            </Button>
          ) : (
            <GenerationActions
              onRegenerate={handleRegenerate}
              onAccept={handleAccept}
              onCancel={onClose}
              disabled={isGenerating || !generatedText}
            />
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **步骤 2：创建 ModuleSelector.tsx**

```typescript
"use client";

import { ModuleType } from '@/lib/resume/types';
import { useResumeStore } from '@/stores/resume';
import { cn } from '@/lib/utils';

const MODULE_CONFIG: { type: ModuleType; name: string; icon: string }[] = [
  { type: 'education', name: '教育经历', icon: '🎓' },
  { type: 'internship', name: '实习经历', icon: '💼' },
  { type: 'project', name: '项目经历', icon: '🚀' },
  { type: 'campus', name: '校园经历', icon: '🎯' },
  { type: 'advantage', name: '个人优势', icon: '💡' },
];

interface ModuleSelectorProps {
  selectedModules: ModuleType[];
  onToggle: (module: ModuleType) => void;
  disabledModules?: boolean;
}

export function ModuleSelector({ selectedModules, onToggle, disabledModules }: ModuleSelectorProps) {
  const { currentResume } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">选择要生成的模块</h3>
      <div className="flex flex-wrap gap-2">
        {MODULE_CONFIG.map(({ type, name, icon }) => {
          const isEnabled = currentResume.modules[type];
          const isSelected = selectedModules.includes(type);

          return (
            <button
              key={type}
              onClick={() => isEnabled && onToggle(type)}
              disabled={!isEnabled || disabledModules}
              className={cn(
                "px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                !isEnabled && "opacity-40 cursor-not-allowed",
                isEnabled && !isSelected && "bg-gray-100 hover:bg-gray-200",
                isSelected && "bg-primary text-white"
              )}
            >
              <span>{icon}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
      {selectedModules.length === 0 && (
        <p className="text-xs text-gray-500">请选择至少一个模块</p>
      )}
    </div>
  );
}
```

- [ ] **步骤 3：创建 ContextPreview.tsx**

```typescript
"use client";

import { useResumeStore } from '@/stores/resume';
import { cn } from '@/lib/utils';

export function ContextPreview() {
  const { currentResume } = useResumeStore();

  if (!currentResume) return null;

  const { profile, education, internship, project, campus } = currentResume.content;

  const hasAnyInfo = profile.name || profile.title ||
    education.length > 0 || internship.length > 0 ||
    project.length > 0 || campus.length > 0;

  if (!hasAnyInfo) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-700">已读取的信息</h3>

      <div className="space-y-2 text-sm">
        {profile.name && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[60px]">姓名：</span>
            <span className="font-medium">{profile.name}</span>
          </div>
        )}
        {profile.title && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[60px]">求职意向：</span>
            <span>{profile.title}</span>
          </div>
        )}

        {education.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">教育经历</div>
            {education.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-blue-200">
                {e.school} | {e.major} | {e.startDate}-{e.endDate}
              </div>
            ))}
          </div>
        )}

        {internship.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">实习经历</div>
            {internship.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-green-200">
                {e.company} | {e.position}
              </div>
            ))}
          </div>
        )}

        {project.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">项目经历</div>
            {project.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-purple-200">
                {e.name} | {e.role}
              </div>
            ))}
          </div>
        )}

        {campus.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">校园经历</div>
            {campus.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-orange-200">
                {e.organization} | {e.position}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **步骤 4：创建 MarkdownStreamViewer.tsx**

```typescript
"use client";

import { cn } from '@/lib/utils';

interface MarkdownStreamViewerProps {
  content: string;
  isGenerating: boolean;
}

export function MarkdownStreamViewer({ content, isGenerating }: MarkdownStreamViewerProps) {
  if (!content && !isGenerating) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
        AI 正在生成中...
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 min-h-[200px]">
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {content}
          {isGenerating && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **步骤 5：创建 GenerationActions.tsx**

```typescript
"use client";

import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X } from 'lucide-react';

interface GenerationActionsProps {
  onRegenerate: () => void;
  onAccept: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function GenerationActions({ onRegenerate, onAccept, onCancel, disabled }: GenerationActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={onRegenerate}
        disabled={disabled}
        className="flex-1"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        重新生成
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        className="flex-1"
      >
        <X className="h-4 w-4 mr-2" />
        取消
      </Button>
      <Button
        onClick={onAccept}
        disabled={disabled}
        className="flex-1"
      >
        <Check className="h-4 w-4 mr-2" />
        采纳
      </Button>
    </div>
  );
}
```

- [ ] **步骤 6：Commit**

```bash
git add src/components/ai/
git commit -m "feat: 添加 AI 侧边抽屉组件"
```

---

## 任务 5：创建 AI 流式 API 路由

**文件：**
- 创建：`src/app/api/ai/stream/route.ts`

- [ ] **步骤 1：创建 API 路由**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider: providerName } = await request.json();

    const encoder = new TextEncoder();
    const provider = getAIProvider();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${provider.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: prompt }],
              stream: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No reader available');
          }

          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/app/api/ai/stream/route.ts
git commit -m "feat: 添加 AI 流式 API 路由"
```

---

## 任务 6：集成 AI 侧边抽屉到编辑器

**文件：**
- 修改：`src/components/resume/EditorCanvas.tsx`

- [ ] **步骤 1：修改 EditorCanvas.tsx**

```typescript
"use client";

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume';
import { ProfileBlockEditor } from './blocks/ProfileBlock';
import { EducationBlockEditor } from './blocks/EducationBlock';
import { InternshipBlockEditor } from './blocks/InternshipBlock';
import { ProjectBlockEditor } from './blocks/ProjectBlock';
import { CampusBlockEditor } from './blocks/CampusBlock';
import { AdvantageBlockEditor } from './blocks/AdvantageBlock';
import { AISidebar } from '@/components/ai/AISidebar';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function EditorCanvas() {
  const { currentResume } = useResumeStore();
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  if (!currentResume) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">未选择简历</p>
      </div>
    );
  }

  const { content, modules } = currentResume;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8 space-y-8">
          {modules.profile && <ProfileBlockEditor data={content.profile} />}

          {modules.education && <EducationBlockEditor data={content.education} />}

          {modules.internship && <InternshipBlockEditor data={content.internship} />}

          {modules.project && <ProjectBlockEditor data={content.project} />}

          {modules.campus && <CampusBlockEditor data={content.campus} />}

          {modules.advantage && <AdvantageBlockEditor data={content.advantage} />}

          <div className="flex justify-center pt-4">
            <Button onClick={() => setAiSidebarOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI 辅助填充
            </Button>
          </div>
        </div>
      </div>

      <AISidebar
        open={aiSidebarOpen}
        onClose={() => setAiSidebarOpen(false)}
      />
    </>
  );
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/components/resume/EditorCanvas.tsx
git commit -m "feat: 集成 AI 侧边抽屉到编辑器"
```

---

## 验收检查清单

- [ ] 用户未填写 profile 时，AI 生成按钮禁用
- [ ] 已填写的模块信息被正确读取并显示在 ContextPreview
- [ ] 流式输出时用户可以看到 AI 逐字生成的过程
- [ ] 生成的 Markdown 可以直接预览
- [ ] "重新生成"按钮只重新生成当前模块
- [ ] "采纳"后内容正确追加到简历对应模块
- [ ] 网络错误时显示错误信息
