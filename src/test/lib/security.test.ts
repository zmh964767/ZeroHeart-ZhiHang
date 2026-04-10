import { describe, it, expect, vi } from 'vitest';
import { sanitizeHtml, escapeHtml, isValidUrl } from '@/lib/security';

describe('security utils', () => {
  describe('sanitizeHtml', () => {
    it('应转义 HTML 标签', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('应转义尖括号', () => {
      expect(sanitizeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('应保持普通文本不变', () => {
      expect(sanitizeHtml('hello world')).toBe('hello world');
    });

    it('应转义引号', () => {
      expect(sanitizeHtml('"hello"')).toBe('&quot;hello&quot;');
    });

    it('应转义单引号', () => {
      expect(sanitizeHtml("'hello'")).toBe('&#039;hello&#039;');
    });

    it('应转义 & 符号', () => {
      expect(sanitizeHtml('a & b')).toBe('a &amp; b');
    });
  });

  describe('escapeHtml', () => {
    it('应转义 HTML 特殊字符', () => {
      expect(escapeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#039;');
    });

    it('应保持普通文本不变', () => {
      expect(escapeHtml('test')).toBe('test');
    });

    it('应处理空字符串', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('应验证有效的 HTTP URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('应验证有效的 HTTPS URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('应验证带路径的 URL', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('应验证带查询参数的 URL', () => {
      expect(isValidUrl('https://example.com/?q=test')).toBe(true);
    });

    it('应拒绝无效的 URL', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('应拒绝空字符串', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('应拒绝只有协议的 URL', () => {
      expect(isValidUrl('http://')).toBe(false);
    });
  });
});