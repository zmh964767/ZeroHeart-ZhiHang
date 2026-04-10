import { describe, it, expect } from 'vitest';
import {
  parseEducationMarkdown,
  parseWorkMarkdown,
  parseInternshipMarkdown,
  parseProjectMarkdown,
  parseCampusMarkdown,
  parseEvaluationMarkdown,
  parseMarkdown,
} from '@/lib/ai/parsers/markdown-to-json';

describe('markdown-to-json.ts - 解析器测试', () => {
  describe('parseEducationMarkdown', () => {
    it('应解析基本教育信息', () => {
      const md = `清华大学 | 本科 | 计算机科学与技术 | 2020-2024
GPA: 3.8/4.0
一等奖学金
校级优秀学生`;
      const result = parseEducationMarkdown(md);
      expect(result.school).toBe('清华大学');
      expect(result.degree).toBe('本科');
      expect(result.major).toBe('计算机科学与技术');
      expect(result.startDate).toBe('2020');
      expect(result.endDate).toBe('2024');
      expect(result.gpa).toBe('3.8/4.0');
      expect(result.highlights).toContain('一等奖学金');
      expect(result.highlights).toContain('校级优秀学生');
    });

    it('应处理空输入', () => {
      const result = parseEducationMarkdown('');
      expect(result.school).toBe('');
      expect(result.degree).toBe('');
      expect(result.highlights).toEqual([]);
    });

    it('应移除 Markdown 符号', () => {
      const md = `• 北京大学 | 硕士 | 软件工程 | 2022-2024
- GPA: 3.9/4.0
* 优秀毕业生`;
      const result = parseEducationMarkdown(md);
      expect(result.highlights).not.toContain('•');
      expect(result.highlights).not.toContain('-');
      expect(result.highlights).not.toContain('*');
    });
  });

  describe('parseWorkMarkdown', () => {
    it('应解析工作信息', () => {
      const md = `腾讯科技 | 前端开发 | 2024-2025
负责核心业务开发
提升系统稳定性 20%`;
      const result = parseWorkMarkdown(md);
      expect(result.company).toBe('腾讯科技');
      expect(result.position).toBe('前端开发');
      expect(result.startDate).toBe('2024');
      expect(result.endDate).toBe('2025');
      expect(result.highlights).toContain('负责核心业务开发');
      expect(result.highlights).toContain('提升系统稳定性 20%');
    });

    it('应处理空输入', () => {
      const result = parseWorkMarkdown('');
      expect(result.company).toBe('');
      expect(result.position).toBe('');
    });
  });

  describe('parseInternshipMarkdown', () => {
    it('应解析实习信息', () => {
      const md = `字节跳动 | 前端开发 | 2023-2024
参与电商项目开发
提升页面加载速度 30%`;
      const result = parseInternshipMarkdown(md);
      expect(result.company).toBe('字节跳动');
      expect(result.position).toBe('前端开发');
      expect(result.startDate).toBe('2023');
      expect(result.endDate).toBe('2024');
      expect(result.highlights).toContain('参与电商项目开发');
      expect(result.highlights).toContain('提升页面加载速度 30%');
    });

    it('应处理空输入', () => {
      const result = parseInternshipMarkdown('');
      expect(result.company).toBe('');
      expect(result.position).toBe('');
    });
  });

  describe('parseProjectMarkdown', () => {
    it('应解析项目信息', () => {
      const md = `电商平台 | 前端负责人 | 2023-2023
技术栈: React, TypeScript, Node.js
独立完成用户模块开发
优化首屏加载速度 50%`;
      const result = parseProjectMarkdown(md);
      expect(result.name).toBe('电商平台');
      expect(result.role).toBe('前端负责人');
      expect(result.startDate).toBe('2023');
      expect(result.endDate).toBe('2023');
      expect(result.description).toBe('React, TypeScript, Node.js');
    });

    it('应提取技术栈描述', () => {
      const md = `项目名称 | 技术负责人 | 2023-2024
技术栈：Vue3 + Spring Boot
完成核心功能开发`;
      const result = parseProjectMarkdown(md);
      expect(result.description).toBe('Vue3 + Spring Boot');
    });
  });

  describe('parseCampusMarkdown', () => {
    it('应解析校园经历', () => {
      const md = `学生会 | 主席 | 2021-2023
组织校园招聘会
参与人数 1000+`;
      const result = parseCampusMarkdown(md);
      expect(result.organization).toBe('学生会');
      expect(result.position).toBe('主席');
      expect(result.startDate).toBe('2021');
      expect(result.endDate).toBe('2023');
      expect(result.highlights).toContain('组织校园招聘会');
    });
  });

  describe('parseEvaluationMarkdown', () => {
    it('应解析自我评价', () => {
      const md = `# 自我评价
熟悉 React 生态
掌握 TypeScript
有开源项目经验`;
      const result = parseEvaluationMarkdown(md);
      expect(result.content).toContain('熟悉 React 生态');
      expect(result.content).toContain('掌握 TypeScript');
      expect(result.content).not.toContain('# 自我评价');
    });

    it('应处理仅标题的输入', () => {
      const md = `# 自我评价`;
      const result = parseEvaluationMarkdown(md);
      expect(result.content).toBe('');
    });
  });

  describe('parseMarkdown', () => {
    it('应根据模块类型调用对应解析器', () => {
      const md = `测试学校 | 本科 | CS | 2020-2024`;
      const result = parseMarkdown('education', md);
      expect(result.school).toBe('测试学校');
    });

    it('应处理未知模块类型', () => {
      const md = 'some text';
      const result = parseMarkdown('unknown', md);
      expect(result.description).toBe('some text');
    });

    it('应处理 evaluation 模块', () => {
      const md = '自我评价内容';
      const result = parseMarkdown('evaluation', md);
      expect(result.content).toBe('自我评价内容');
    });
  });
});