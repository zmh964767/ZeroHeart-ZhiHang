import { create } from 'zustand';
import { Resume, ResumeContent, TemplateType, ModuleType, defaultContent, defaultModules, defaultProfile } from '@/lib/resume/types';
import { resumeRepository } from '@/lib/storage/local';
import { toast } from 'sonner';

const MAX_RESUME_NAME_LENGTH = 100; // 简历名称最大长度，平衡可读性和存储

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  isLoading: boolean;

  loadResumes: () => Promise<void>;
  createResume: (name: string) => Promise<Resume>;
  duplicateResume: (id: string) => Promise<Resume>;
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
    try {
      const resumes = await resumeRepository.getAll();
      set({ resumes, isLoading: false });
    } catch (error) {
      toast.error('加载简历列表失败');
      set({ isLoading: false });
      throw error;
    }
  },

  createResume: async (name: string) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast.error('简历名称不能为空');
      throw new Error('Resume name cannot be empty');
    }
    
    if (trimmedName.length > MAX_RESUME_NAME_LENGTH) {
      toast.error(`简历名称不能超过 ${MAX_RESUME_NAME_LENGTH} 个字符`);
      throw new Error(`Resume name too long (max ${MAX_RESUME_NAME_LENGTH} chars)`);
    }

    const existingNames = get().resumes.map(r => r.name.toLowerCase());
    let finalName = trimmedName;
    let counter = 1;
    
    while (existingNames.includes(finalName.toLowerCase())) {
      finalName = `${trimmedName} (${counter})`;
      counter++;
    }

    const resume: Resume = {
      id: crypto.randomUUID(),
      name: finalName,
      template: 'simple',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: { ...defaultContent, profile: { ...defaultProfile } },
      modules: { ...defaultModules },
    };
    
    try {
      await resumeRepository.save(resume);
      set(state => ({ resumes: [...state.resumes, resume] }));
      return resume;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建简历失败，请重试';
      toast.error(errorMessage);
      throw error;
    }
  },

  duplicateResume: async (id: string) => {
    const original = get().resumes.find(r => r.id === id);
    if (!original) {
      toast.error('找不到要复制的简历');
      throw new Error("Resume not found");
    }
    
    const deepCopy = JSON.parse(JSON.stringify(original));
    const resume: Resume = {
      ...deepCopy,
      id: crypto.randomUUID(),
      name: `${original.name} (副本)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    try {
      await resumeRepository.save(resume);
      set(state => ({ resumes: [...state.resumes, resume] }));
      return resume;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '复制简历失败，请重试';
      toast.error(errorMessage);
      throw error;
    }
  },

  updateResume: async (resume: Resume) => {
    const updated = { ...resume, updatedAt: Date.now() };
    try {
      await resumeRepository.save(updated);
      set(state => ({
        resumes: state.resumes.map(r => r.id === updated.id ? updated : r),
        currentResume: state.currentResume?.id === updated.id ? updated : state.currentResume,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存简历失败，请重试';
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteResume: async (id: string) => {
    await resumeRepository.delete(id);
    set(state => ({
      resumes: state.resumes.filter(r => r.id !== id),
      currentResume: state.currentResume?.id === id ? null : state.currentResume,
    }));
  },

  selectResume: async (id: string) => {
    try {
      const resume = await resumeRepository.getById(id);
      if (!resume) {
        toast.error('找不到简历');
        set({ currentResume: null });
        return;
      }
      set({ currentResume: resume });
    } catch (error) {
      toast.error('加载简历失败');
      throw error;
    }
  },

  updateContent: async (content: Partial<ResumeContent>) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) {
      toast.error('请先选择或创建一份简历');
      return;
    }
    const updated: Resume = {
      ...currentResume,
      content: { ...currentResume.content, ...content },
    };
    await updateResume(updated);
  },

  updateTemplate: async (template: TemplateType) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) {
      toast.error('请先选择或创建一份简历');
      return;
    }
    const updated: Resume = { ...currentResume, template };
    await updateResume(updated);
  },

  toggleModule: async (module: ModuleType) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) {
      toast.error('请先选择或创建一份简历');
      return;
    }
    const updated: Resume = {
      ...currentResume,
      modules: {
        ...currentResume.modules,
        [module]: !currentResume.modules[module],
      },
    };
    await updateResume(updated);
  },
}));
