import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Node.js 20+ 中 global.crypto 是只读的，需要特殊处理
try {
  if (!global.crypto) {
    global.crypto = {
      randomUUID: () => Math.random().toString(36).substring(2, 15),
    } as any;
  }
} catch (e) {
  // 如果无法设置 crypto，忽略错误
  console.log('crypto polyfill skipped:', e);
}

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});
