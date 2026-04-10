import { Resume, defaultContent, defaultModules, defaultProfile } from '@/lib/resume/types';
import { ResumeRepository } from './repository';

const STORAGE_KEY = 'zeroheart_resumes';
const DATA_VERSION = 1;

function validateResume(data: unknown): data is Resume {
  if (!data || typeof data !== 'object') return false;
  const resume = data as Record<string, unknown>;
  
  if (typeof resume.id !== 'string') return false;
  if (typeof resume.name !== 'string') return false;
  if (typeof resume.createdAt !== 'number') return false;
  if (typeof resume.updatedAt !== 'number') return false;
  if (typeof resume.template !== 'string') return false;
  if (!resume.content || typeof resume.content !== 'object') return false;
  if (!resume.modules || typeof resume.modules !== 'object') return false;
  
  return true;
}

function migrateResume(data: unknown): Resume {
  if (!validateResume(data)) {
    const fallback: Resume = {
      id: crypto.randomUUID(),
      name: '未命名简历',
      template: 'simple',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: { ...defaultContent, profile: { ...defaultProfile } },
      modules: { ...defaultModules },
    };
    console.warn('Invalid resume data, using fallback:', data);
    return fallback;
  }
  return data;
}

export class LocalStorageRepository implements ResumeRepository {
  private getStorage(): Resume[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        console.warn('LocalStorage data is not an array, resetting');
        return [];
      }
      
      return parsed.map(migrateResume);
    } catch (error) {
      console.error('Failed to parse resumes from localStorage:', error);
      return [];
    }
  }

  private setStorage(resumes: Resume[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please delete some resumes manually.');
        throw new Error('存储空间已满，请手动删除一些简历后重试');
      }
      throw error;
    }
  }

  async getAll(): Promise<Resume[]> {
    return this.getStorage();
  }

  async getById(id: string): Promise<Resume | null> {
    return this.getStorage().find(r => r.id === id) || null;
  }

  async save(resume: Resume): Promise<void> {
    const validated = migrateResume(resume);
    const resumes = this.getStorage();
    const index = resumes.findIndex(r => r.id === validated.id);
    if (index >= 0) {
      resumes[index] = { ...validated, updatedAt: Date.now() };
    } else {
      resumes.push(validated);
    }
    this.setStorage(resumes);
  }

  async delete(id: string): Promise<void> {
    this.setStorage(this.getStorage().filter(r => r.id !== id));
  }

  async exportJSON(id: string): Promise<string> {
    const resume = await this.getById(id);
    if (!resume) throw new Error('Resume not found');
    return JSON.stringify(resume, null, 2);
  }

  async importJSON(json: string): Promise<Resume> {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Invalid JSON format');
    }
    
    const resume = migrateResume(parsed);
    resume.id = crypto.randomUUID();
    resume.createdAt = Date.now();
    resume.updatedAt = Date.now();
    
    await this.save(resume);
    return resume;
  }
}

export const resumeRepository = new LocalStorageRepository();
