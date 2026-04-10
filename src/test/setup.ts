import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.crypto = {
  randomUUID: () => Math.random().toString(36).substring(2, 15),
} as any;

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});