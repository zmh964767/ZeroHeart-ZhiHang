import { Resume } from '@/lib/resume/types';

export interface ResumeRepository {
  getAll(): Promise<Resume[]>;
  getById(id: string): Promise<Resume | null>;
  save(resume: Resume): Promise<void>;
  delete(id: string): Promise<void>;
  exportJSON(id: string): Promise<string>;
  importJSON(json: string): Promise<Resume>;
}
