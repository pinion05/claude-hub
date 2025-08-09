'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { ErrorHandler } from '@/lib/errors';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorHandler.log(error);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      const appError = ErrorHandler.handle(this.state.error);
      const isRetryable = ErrorHandler.isRetryable(this.state.error);

      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-xl font-bold text-accent">오류가 발생했습니다</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              {appError.message}
            </p>

            {appError.code && (
              <div className="bg-background rounded p-3 mb-6">
                <code className="text-xs text-gray-500">
                  Error Code: {appError.code}
                  {appError.statusCode && ` (${appError.statusCode})`}
                </code>
              </div>
            )}

            <div className="flex gap-3">
              {isRetryable && (
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  className="flex-1"
                >
                  다시 시도
                </Button>
              )}
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                className="flex-1"
              >
                페이지 새로고침
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}