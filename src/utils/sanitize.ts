/**
 * Security utility functions for input sanitization and validation
 * OWASP XSS Prevention Cheat Sheet compliant
 */

// HTML entity encoding to prevent XSS
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

// Remove dangerous HTML tags and attributes
export function sanitizeInput(input: string): string {
  // Remove script tags (including nested ones)
  let result = input;
  let previousResult = '';
  
  // Keep removing script tags until no more are found (handles nested scripts)
  while (result !== previousResult) {
    previousResult = result;
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  // Remove event handlers
  const eventHandlers = /on\w+\s*=\s*"[^"]*"/gi;
  result = result.replace(eventHandlers, '');
  
  return result.trim();
}

// Validate search query input
export function validateSearchQuery(query: string): string {
  // Max length check (prevent DoS)
  if (query.length > 200) {
    throw new Error('Search query too long');
  }
  
  // Remove potentially dangerous characters
  const sanitized = query
    .replace(/[<>'"]/g, '') // Remove HTML-related characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
  
  return sanitized;
}

// Validate GitHub URL
export function validateGitHubUrl(url: string): boolean {
  const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
  return pattern.test(url);
}

// Validate and sanitize user-generated content
export function sanitizeUserContent(content: string): string {
  // Remove any inline scripts
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove inline event handlers
  content = content.replace(/on\w+="[^"]*"/gi, '');
  content = content.replace(/on\w+='[^']*'/gi, '');
  
  // Remove dangerous protocols
  content = content.replace(/javascript:/gi, '');
  content = content.replace(/vbscript:/gi, '');
  content = content.replace(/data:text\/html/gi, '');
  
  return content;
}