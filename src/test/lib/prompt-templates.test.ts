import { describe, it, expect } from 'vitest';
import { buildPrompt, PromptContext } from '@/lib/ai/prompt-templates';

describe('prompt-templates.ts - Prompt 构建测试', () => {
  const mockContext: PromptContext = {
    profile: {
      name: '张三',
      title: '前端开发工程师',
      email: 'zhangsan@example.com',
      phone: '13800000000',
      location: '北京',
    },
    education: [
      {
        school: '清华大学',
        degree: '本科',
        major: '计算机科学与技术',
        startDate: '2020',
        endDate: '2024',
        gpa: '3.8/4.0',
        highlights: ['一等奖学金'],
        courses: '',
        awards: '',
      },
    ],
    internship: [
      {
        company: '字节跳动',
        position: '前端开发实习生',
        startDate: '2023.06',
        endDate: '2023.12',
        description: '参与电商平台前端开发',
        highlights: [],
      },
    ],
    work: [
      {
        company: '腾讯科技',
        position: '前端开发工程师',
        startDate: '2024.01',
        endDate: '2025.01',
        description: '负责核心业务开发',
        highlights: [],
      },
    ],
    project: [
      {
        name: '校园博客系统',
        role: '独立开发',
        startDate: '2022.03',
        endDate: '2022.08',
        description: '基于 React 的博客系统',
        highlights: [],
      },
    ],
    campus: [
      {
        organization: '学生会',
        position: '技术部长',
        startDate: '2021',
        endDate: '2023',
        description: '负责技术支持',
        highlights: [],
      },
    ],
    evaluation: {
      content: '熟悉 React 和 TypeScript',
    },
  };

  describe('buildPrompt', () => {
    it('应为 internship 模块生成包含 STAR 法则的 prompt', () => {
      const prompt = buildPrompt('internship', mockContext);
      expect(prompt).toContain('字节跳动');
      expect(prompt).toContain('STAR法则');
      expect(prompt).toContain('量化');
      expect(prompt).toContain('S (情境)');
      expect(prompt).toContain('T (任务)');
      expect(prompt).toContain('A (行动)');
      expect(prompt).toContain('R (结果)');
    });

    it('应为 work 模块生成包含 STAR 法则的 prompt', () => {
      const prompt = buildPrompt('work', mockContext);
      expect(prompt).toContain('腾讯科技');
      expect(prompt).toContain('STAR法则');
      expect(prompt).toContain('量化');
    });

    it('应为 project 模块生成包含 STAR 法则的 prompt', () => {
      const prompt = buildPrompt('project', mockContext);
      expect(prompt).toContain('校园博客系统');
      expect(prompt).toContain('STAR法则');
      expect(prompt).toContain('技术栈');
    });

    it('应为 campus 模块生成包含 STAR 法则的 prompt', () => {
      const prompt = buildPrompt('campus', mockContext);
      expect(prompt).toContain('学生会');
      expect(prompt).toContain('STAR法则');
      expect(prompt).toContain('活动');
    });

    it('应为 evaluation 模块生成 prompt 并引用用户输入', () => {
      const prompt = buildPrompt('evaluation', mockContext);
      expect(prompt).toContain('熟悉 React 和 TypeScript');
    });

    it('应为空字符串 profile 模块返回空字符串', () => {
      const prompt = buildPrompt('profile', mockContext);
      expect(prompt).toBe('');
    });

    it('应为空字符串 education 模块返回空字符串', () => {
      const prompt = buildPrompt('education', mockContext);
      expect(prompt).toBe('');
    });

    it('应处理空的 internship 信息', () => {
      const emptyContext: PromptContext = {
        ...mockContext,
        internship: [],
      };
      const prompt = buildPrompt('internship', emptyContext);
      expect(prompt).toContain('未知');
    });

    it('应处理空的 evaluation 信息', () => {
      const emptyEvalContext: PromptContext = {
        ...mockContext,
        evaluation: { content: '' },
      };
      const prompt = buildPrompt('evaluation', emptyEvalContext);
      expect(prompt).toContain('用户未填写');
    });

    it('应包含输出格式要求', () => {
      const prompt = buildPrompt('internship', mockContext);
      expect(prompt).toContain('输出格式');
      expect(prompt).toContain('直接输出');
    });
  });
});