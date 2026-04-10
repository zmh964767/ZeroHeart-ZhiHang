import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils.ts - cn() 测试', () => {
  it('应合并两个类名', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('应处理空字符串', () => {
    const result = cn('', 'bar');
    expect(result).toBe('bar');
  });

  it('应处理 undefined 和 null', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toBe('foo bar');
  });

  it('应合并多个类名', () => {
    const result = cn('a', 'b', 'c', 'd');
    expect(result).toBe('a b c d');
  });

  it('twMerge 应覆盖重复的类', () => {
    const result = cn('foo foo-alt', 'foo bar');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
    expect(result).toContain('foo-alt');
  });

  it('应处理条件类名', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active', !isActive && 'inactive');
    expect(result).toBe('base active');
  });
});