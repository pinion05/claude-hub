/**
 * Custom error classes for consistent error handling
 */

/**
 * Base application error class
 * 
 * Provides a consistent error structure with error codes and optional details.
 * All application-specific errors should extend this class.
 * 
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, 'NETWORK_ERROR', statusCode, details);
    this.name = 'NetworkError';
  }
}

export class GitHubAPIError extends AppError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, 'GITHUB_API_ERROR', statusCode, details);
    this.name = 'GitHubAPIError';
  }

  static fromResponse(response: Response, body?: unknown): GitHubAPIError {
    const message = body && typeof body === 'object' && 'message' in body
      ? String(body.message)
      : `GitHub API error: ${response.status} ${response.statusText}`;
    
    return new GitHubAPIError(message, response.status, body);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string,
    public resetTime?: Date,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }

  static fromGitHubHeaders(headers: Headers): RateLimitError {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    
    const resetTime = reset ? new Date(parseInt(reset) * 1000) : undefined;
    const message = remaining === '0'
      ? `GitHub API rate limit exceeded. Resets at ${resetTime?.toLocaleTimeString()}`
      : 'GitHub API rate limit error';
    
    return new RateLimitError(message, resetTime, {
      remaining,
      reset,
      limit: headers.get('x-ratelimit-limit')
    });
  }
}

/**
 * Error handler utility class
 * 
 * Provides centralized error handling, logging, and retry logic.
 * Converts unknown errors to AppError instances for consistent handling.
 * 
 * @class ErrorHandler
 */
export class ErrorHandler {
  /**
   * Converts any error to AppError instance
   * @param {unknown} error - The error to handle
   * @returns {AppError} Normalized error instance
   */
  static handle(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN_ERROR', undefined, error);
    }
    
    return new AppError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }

  /**
   * Logs error with appropriate detail level based on environment
   * @param {unknown} error - The error to log
   */
  static log(error: unknown): void {
    const appError = this.handle(error);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${appError.code}] ${appError.message}`, {
        statusCode: appError.statusCode,
        details: appError.details
      });
    } else {
      // In production, send to error tracking service
      // e.g., Sentry, LogRocket, etc.
      console.error(`[${appError.code}] ${appError.message}`);
    }
  }

  /**
   * Determines if an error is retryable
   * @param {unknown} error - The error to check
   * @returns {boolean} True if the operation can be retried
   */
  static isRetryable(error: unknown): boolean {
    const appError = this.handle(error);
    
    // Network errors and 5xx errors are retryable
    if (appError instanceof NetworkError) {
      return true;
    }
    
    if (appError.statusCode && appError.statusCode >= 500) {
      return true;
    }
    
    // Rate limit errors might be retryable after delay
    if (appError instanceof RateLimitError) {
      return appError.resetTime ? appError.resetTime > new Date() : false;
    }
    
    return false;
  }
}