import React, { memo } from 'react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils/classNames';

interface RetryErrorProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

const RetryErrorComponent: React.FC<RetryErrorProps> = ({
  message = '데이터를 불러올 수 없습니다',
  onRetry,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12',
      className
    )}>
      <div className="text-4xl mb-4">😕</div>
      <p className="text-gray-400 mb-6">{message}</p>
      <Button
        onClick={onRetry}
        variant="secondary"
        size="md"
      >
        다시 시도
      </Button>
    </div>
  );
};

export const RetryError = memo(RetryErrorComponent);