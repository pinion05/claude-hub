import {
  escapeHtml,
  sanitizeInput,
  validateSearchQuery,
  validateGitHubUrl,
  sanitizeUserContent,
} from '../sanitize';

describe('Security - Input Sanitization', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
      );
      expect(escapeHtml("' OR '1'='1")).toBe('&#039; OR &#039;1&#039;=&#039;1');
      expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe(
        '&lt;img src=x onerror=alert(1)&gt;'
      );
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      expect(sanitizeInput(input)).toBe('Hello  World');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      expect(sanitizeInput(input)).toBe('<div >Click me</div>');
    });

    it('should handle nested script tags', () => {
      const input = '<script><script>alert(1)</script></script>';
      const result = sanitizeInput(input);
      // After removing the outer script tag, inner </script> may remain
      // The important thing is that no executable script tags remain
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert(1)');
    });
  });

  describe('validateSearchQuery', () => {
    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(201);
      expect(() => validateSearchQuery(longQuery)).toThrow('Search query too long');
    });

    it('should remove dangerous characters', () => {
      expect(validateSearchQuery('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
      expect(validateSearchQuery('javascript:alert(1)')).toBe('alert(1)');
      expect(validateSearchQuery('data:text/html,<script>alert(1)</script>')).toBe(
        'text/html,scriptalert(1)/script'
      );
    });

    it('should allow safe queries', () => {
      expect(validateSearchQuery('Claude AI extensions')).toBe('Claude AI extensions');
      expect(validateSearchQuery('react-component')).toBe('react-component');
    });
  });

  describe('validateGitHubUrl', () => {
    it('should validate correct GitHub URLs', () => {
      expect(validateGitHubUrl('https://github.com/vercel/next.js')).toBe(true);
      expect(validateGitHubUrl('https://github.com/facebook/react')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateGitHubUrl('http://github.com/user/repo')).toBe(false);
      expect(validateGitHubUrl('https://evil.com/user/repo')).toBe(false);
      expect(validateGitHubUrl('javascript:alert(1)')).toBe(false);
      expect(validateGitHubUrl('https://github.com/../../etc/passwd')).toBe(false);
    });
  });

  describe('sanitizeUserContent', () => {
    it('should remove inline scripts', () => {
      const content = 'Hello <script>alert(1)</script> World';
      expect(sanitizeUserContent(content)).toBe('Hello  World');
    });

    it('should remove inline event handlers', () => {
      const content = '<button onclick="alert(1)">Click</button>';
      expect(sanitizeUserContent(content)).toBe('<button >Click</button>');
    });

    it('should remove dangerous protocols', () => {
      expect(sanitizeUserContent('Click <a href="javascript:alert(1)">here</a>')).toBe(
        'Click <a href="alert(1)">here</a>'
      );
      expect(sanitizeUserContent('<a href="vbscript:msgbox(1)">link</a>')).toBe(
        '<a href="msgbox(1)">link</a>'
      );
    });

    it('should handle complex XSS attempts', () => {
      const xssAttempts = [
        '<img src=x onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '<iframe src="javascript:alert(1)">',
        '<object data="data:text/html,<script>alert(1)</script>">',
      ];

      xssAttempts.forEach(attempt => {
        const sanitized = sanitizeUserContent(attempt);
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('vbscript:');
        expect(sanitized).not.toContain('data:text/html');
        expect(sanitized).not.toContain('onload=');
        expect(sanitized).not.toContain('onerror=');
      });
    });
  });
});