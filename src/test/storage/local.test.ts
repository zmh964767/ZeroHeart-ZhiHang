import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.data[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.data[key]; }),
  clear: vi.fn(() => { mockLocalStorage.data = {}; }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

import { LocalStorageRepository } from '@/lib/storage/local';
import { Resume } from '@/lib/resume/types';

const createMockResume = (id: string, name: string): Resume => ({
  id,
  name,
  template: 'simple',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  content: {
    profile: { name: '张三', title: '工程师', email: 'test@test.com', phone: '13800000000', location: '北京', photo: '' },
    education: [],
    internship: [],
    work: [],
    project: [],
    campus: [],
    evaluation: { content: '' },
  },
  modules: { profile: true, education: false, internship: false, work: false, project: false, campus: false, evaluation: false },
});

describe('LocalStorageRepository', () => {
  const repo = new LocalStorageRepository();
  const STORAGE_KEY = 'zeroheart_resumes';

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('应返回空数组当存储为空', async () => {
      const result = await repo.getAll();
      expect(result).toEqual([]);
    });

    it('应解析存储的简历数据', async () => {
      const mockResume = createMockResume('id-1', '简历1');
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([mockResume]));

      const result = await repo.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('id-1');
      expect(result[0].name).toBe('简历1');
    });

    it('应处理损坏的 JSON', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, 'invalid-json');

      const result = await repo.getAll();

      expect(result).toEqual([]);
    });

    it('应处理非数组数据', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, '{"not": "an array"}');

      const result = await repo.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('应返回匹配的简历', async () => {
      const mockResume = createMockResume('id-1', '简历1');
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([mockResume]));

      const result = await repo.getById('id-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('id-1');
    });

    it('应返回 null 当简历不存在', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([]));

      const result = await repo.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('应添加新简历', async () => {
      const newResume = createMockResume('new-id', '新简历');

      await repo.save(newResume);

      const stored = mockLocalStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || '[]');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('new-id');
    });

    it('应在 localStorage quota 耗尽时抛出错误', async () => {
      const originalSetItem = mockLocalStorage.setItem;
      const newResume = createMockResume('new-id', '新简历');
      
      try {
        mockLocalStorage.setItem = vi.fn(() => {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        });

        await expect(repo.save(newResume)).rejects.toThrow('存储空间已满');
      } finally {
        mockLocalStorage.setItem = originalSetItem;
      }
    });

    it('应更新已存在的简历并修改 updatedAt', async () => {
      const existingResume = createMockResume('existing-id', '原名称');
      const originalUpdatedAt = existingResume.updatedAt;
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([existingResume]));

      vi.useFakeTimers();
      vi.setSystemTime(originalUpdatedAt + 1000);

      const updatedResume = { ...existingResume, name: '更新后的名称' };
      await repo.save(updatedResume);

      const stored = mockLocalStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || '[]');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('更新后的名称');
      expect(parsed[0].updatedAt).toBe(originalUpdatedAt + 1000);

      vi.useRealTimers();
    });

    it('应保留其他简历不变', async () => {
      const resume1 = createMockResume('id-1', '简历1');
      const resume2 = createMockResume('id-2', '简历2');
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([resume1, resume2]));

      const updatedResume = { ...resume1, name: '更新后' };
      await repo.save(updatedResume);

      const stored = mockLocalStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || '[]');
      expect(parsed).toHaveLength(2);
      expect(parsed.find((r: Resume) => r.id === 'id-1')?.name).toBe('更新后');
      expect(parsed.find((r: Resume) => r.id === 'id-2')?.name).toBe('简历2');
    });
  });

  describe('delete', () => {
    it('应删除指定的简历', async () => {
      const resume1 = createMockResume('id-1', '简历1');
      const resume2 = createMockResume('id-2', '简历2');
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([resume1, resume2]));

      await repo.delete('id-1');

      const stored = mockLocalStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || '[]');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('id-2');
    });

    it('删除不存在的简历时应无副作用', async () => {
      const resume = createMockResume('id-1', '简历1');
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([resume]));

      await repo.delete('non-existent');

      const stored = mockLocalStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || '[]');
      expect(parsed).toHaveLength(1);
    });
  });

  describe('exportJSON', () => {
    it('应导出简历的 JSON 格式', async () => {
      const resume = createMockResume('id-1', '简历1');
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([resume]));

      const result = await repo.exportJSON('id-1');
      const parsed = JSON.parse(result);

      expect(parsed.id).toBe('id-1');
      expect(parsed.name).toBe('简历1');
    });

    it('导出不存在的简历时应抛出错误', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify([]));

      await expect(repo.exportJSON('non-existent')).rejects.toThrow('Resume not found');
    });
  });

  describe('importJSON', () => {
    it('应导入并分配新 ID', async () => {
      const originalResume = createMockResume('original-id', '原始简历');
      const json = JSON.stringify(originalResume);

      const imported = await repo.importJSON(json);

      expect(imported.id).not.toBe('original-id');
      expect(imported.name).toBe('原始简历');
      expect(typeof imported.id).toBe('string');
    });

    it('应在无效 JSON 时抛出错误', async () => {
      const invalidJson = 'not valid json';

      await expect(repo.importJSON(invalidJson)).rejects.toThrow('Invalid JSON format');
    });

    it('应设置新的创建和更新时间', async () => {
      const oldResume = createMockResume('id', '简历');
      const originalCreatedAt = oldResume.createdAt;
      oldResume.createdAt = Date.now() - 100000;
      const json = JSON.stringify(oldResume);

      vi.useFakeTimers();
      const expectedTime = Date.now() + 10000;
      vi.setSystemTime(expectedTime);

      const imported = await repo.importJSON(json);

      expect(imported.createdAt).toBe(expectedTime);
      expect(imported.updatedAt).toBe(expectedTime);
      expect(imported.createdAt).not.toBe(originalCreatedAt);

      vi.useRealTimers();
    });
  });
});