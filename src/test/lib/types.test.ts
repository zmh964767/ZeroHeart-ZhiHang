import { describe, it, expect } from 'vitest';
import {
  defaultProfile,
  defaultEducation,
  defaultInternship,
  defaultWork,
  defaultProject,
  defaultCampus,
  defaultEvaluation,
  defaultContent,
  defaultModules,
} from '@/lib/resume/types';

describe('types.ts - 默认值测试', () => {
  describe('defaultProfile', () => {
    it('应返回正确的默认值', () => {
      expect(defaultProfile).toEqual({
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        photo: '',
      });
    });
  });

  describe('defaultEducation', () => {
    it('应返回正确的默认值', () => {
      expect(defaultEducation).toEqual({
        school: '',
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
        gpa: '',
        highlights: [],
        courses: '',
        awards: '',
      });
    });
  });

  describe('defaultInternship', () => {
    it('应返回正确的默认值', () => {
      expect(defaultInternship).toEqual({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [],
      });
    });
  });

  describe('defaultWork', () => {
    it('应返回正确的默认值', () => {
      expect(defaultWork).toEqual({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [],
      });
    });
  });

  describe('defaultProject', () => {
    it('应返回正确的默认值', () => {
      expect(defaultProject).toEqual({
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [],
      });
    });
  });

  describe('defaultCampus', () => {
    it('应返回正确的默认值', () => {
      expect(defaultCampus).toEqual({
        organization: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [],
      });
    });
  });

  describe('defaultEvaluation', () => {
    it('应返回正确的默认值', () => {
      expect(defaultEvaluation).toEqual({
        content: '',
      });
    });
  });

  describe('defaultContent', () => {
    it('应返回正确的默认值', () => {
      expect(defaultContent).toEqual({
        profile: defaultProfile,
        education: [],
        internship: [],
        work: [],
        project: [],
        campus: [],
        evaluation: defaultEvaluation,
      });
    });
  });

  describe('defaultModules', () => {
    it('应返回正确的默认值', () => {
      expect(defaultModules).toEqual({
        profile: true,
        education: false,
        internship: false,
        work: false,
        project: false,
        campus: false,
        evaluation: false,
      });
    });

    it('profile 模块应默认启用', () => {
      expect(defaultModules.profile).toBe(true);
    });

    it('其他模块应默认禁用', () => {
      expect(defaultModules.education).toBe(false);
      expect(defaultModules.internship).toBe(false);
      expect(defaultModules.work).toBe(false);
      expect(defaultModules.project).toBe(false);
      expect(defaultModules.campus).toBe(false);
      expect(defaultModules.evaluation).toBe(false);
    });
  });
});