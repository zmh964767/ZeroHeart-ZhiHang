import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useResumeStore } from '@/stores/resume';
import * as localStorageModule from '@/lib/storage/local';

vi.mock('@/lib/storage/local', () => ({
  resumeRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    exportJSON: vi.fn(),
    importJSON: vi.fn(),
  },
}));

const mockResume = {
  id: 'test-id-1',
  name: '测试简历',
  template: 'simple' as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  content: {
    profile: { name: '张三', title: '前端工程师', email: 'test@test.com', phone: '13800000000', location: '北京', photo: '' },
    education: [],
    internship: [],
    work: [],
    project: [],
    campus: [],
    evaluation: { content: '' },
  },
  modules: { profile: true, education: false, internship: false, work: false, project: false, campus: false, evaluation: false },
};

describe('resume store', () => {
  beforeEach(() => {
    useResumeStore.setState({ resumes: [], currentResume: null, isLoading: false });
    vi.clearAllMocks();
  });

  describe('loadResumes', () => {
    it('应加载简历列表', async () => {
      vi.mocked(localStorageModule.resumeRepository.getAll).mockResolvedValue([mockResume]);

      await useResumeStore.getState().loadResumes();

      expect(useResumeStore.getState().resumes).toHaveLength(1);
      expect(useResumeStore.getState().isLoading).toBe(false);
    });

    it('应设置 loading 状态', async () => {
      vi.mocked(localStorageModule.resumeRepository.getAll).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([mockResume]), 10))
      );

      const loadPromise = useResumeStore.getState().loadResumes();
      expect(useResumeStore.getState().isLoading).toBe(true);

      await loadPromise;
      expect(useResumeStore.getState().isLoading).toBe(false);
    });
  });

  describe('createResume', () => {
    it('应创建新简历', async () => {
      vi.mocked(localStorageModule.resumeRepository.save).mockResolvedValue(undefined);

      const resume = await useResumeStore.getState().createResume('新简历');

      expect(resume.name).toBe('新简历');
      expect(resume.template).toBe('simple');
      expect(resume.content.profile).toBeDefined();
      expect(resume.modules.profile).toBe(true);
      expect(useResumeStore.getState().resumes).toHaveLength(1);
    });
  });

  describe('updateResume', () => {
    it('应更新简历', async () => {
      vi.mocked(localStorageModule.resumeRepository.save).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getAll).mockResolvedValue([mockResume]);

      await useResumeStore.getState().loadResumes();

      const updatedResume = { ...mockResume, name: '更新后的简历' };
      await useResumeStore.getState().updateResume(updatedResume);

      expect(useResumeStore.getState().resumes[0].name).toBe('更新后的简历');
    });
  });

  describe('deleteResume', () => {
    it('应删除简历', async () => {
      vi.mocked(localStorageModule.resumeRepository.delete).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getAll).mockResolvedValue([mockResume]);

      await useResumeStore.getState().loadResumes();
      expect(useResumeStore.getState().resumes).toHaveLength(1);

      await useResumeStore.getState().deleteResume('test-id-1');

      expect(useResumeStore.getState().resumes).toHaveLength(0);
    });

    it('删除当前选中简历时应清除 currentResume', async () => {
      vi.mocked(localStorageModule.resumeRepository.delete).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getById).mockResolvedValue(mockResume);
      vi.mocked(localStorageModule.resumeRepository.getAll).mockResolvedValue([mockResume]);

      await useResumeStore.getState().loadResumes();
      await useResumeStore.getState().selectResume('test-id-1');
      expect(useResumeStore.getState().currentResume).toBeDefined();

      await useResumeStore.getState().deleteResume('test-id-1');

      expect(useResumeStore.getState().currentResume).toBeNull();
    });
  });

  describe('selectResume', () => {
    it('应选中简历', async () => {
      vi.mocked(localStorageModule.resumeRepository.getById).mockResolvedValue(mockResume);

      await useResumeStore.getState().selectResume('test-id-1');

      expect(useResumeStore.getState().currentResume).toEqual(mockResume);
    });

    it('选中不存在的简历时应设置 null', async () => {
      vi.mocked(localStorageModule.resumeRepository.getById).mockResolvedValue(null);

      await useResumeStore.getState().selectResume('non-existent');

      expect(useResumeStore.getState().currentResume).toBeNull();
    });
  });

  describe('duplicateResume', () => {
    it('应复制简历', async () => {
      vi.mocked(localStorageModule.resumeRepository.save).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getAll).mockResolvedValue([mockResume]);

      await useResumeStore.getState().loadResumes();

      const duplicated = await useResumeStore.getState().duplicateResume('test-id-1');

      expect(duplicated.name).toBe('测试简历 (副本)');
      expect(duplicated.id).not.toBe('test-id-1');
      expect(useResumeStore.getState().resumes).toHaveLength(2);
    });
  });

  describe('updateTemplate', () => {
    it('应更新模板', async () => {
      vi.mocked(localStorageModule.resumeRepository.save).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getById).mockResolvedValue(mockResume);

      await useResumeStore.getState().selectResume('test-id-1');
      await useResumeStore.getState().updateTemplate('modern');

      expect(useResumeStore.getState().currentResume?.template).toBe('modern');
    });
  });

  describe('toggleModule', () => {
    it('应切换模块状态', async () => {
      vi.mocked(localStorageModule.resumeRepository.save).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getById).mockResolvedValue(mockResume);

      await useResumeStore.getState().selectResume('test-id-1');
      expect(useResumeStore.getState().currentResume?.modules.education).toBe(false);

      await useResumeStore.getState().toggleModule('education');

      expect(useResumeStore.getState().currentResume?.modules.education).toBe(true);
    });
  });

  describe('updateContent', () => {
    it('应更新内容', async () => {
      vi.mocked(localStorageModule.resumeRepository.save).mockResolvedValue(undefined);
      vi.mocked(localStorageModule.resumeRepository.getById).mockResolvedValue(mockResume);

      await useResumeStore.getState().selectResume('test-id-1');
      await useResumeStore.getState().updateContent({ profile: { name: '李四', title: '后端工程师', email: 'li@test.com', phone: '13900000000', location: '上海', photo: '' } });

      expect(useResumeStore.getState().currentResume?.content.profile.name).toBe('李四');
      expect(useResumeStore.getState().currentResume?.content.profile.title).toBe('后端工程师');
    });

    it('无选中简历时应不执行', async () => {
      const spy = vi.spyOn(localStorageModule.resumeRepository, 'save');

      await useResumeStore.getState().updateContent({ profile: { name: 'test' } as any });

      expect(spy).not.toHaveBeenCalled();
    });
  });
});