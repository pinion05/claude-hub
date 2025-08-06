'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/classNames';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * High-performance image component with lazy loading, error handling, and optimization
 */
export const OptimizedImage = React.memo<OptimizedImageProps>(({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  fallbackSrc = '/images/placeholder.svg',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  placeholder = 'empty',
  blurDataURL
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  }, [imageSrc, fallbackSrc]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setImageSrc(src);
  }, [src]);

  // Simple blur placeholder
  const defaultBlurDataURL = blurDataURL || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%231f2937\'/%3E%3C/svg%3E';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 text-gray-600">
            <svg
              className="animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && imageSrc === fallbackSrc && (
        <div
          className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-gray-400"
          style={{ width, height }}
        >
          <div className="text-3xl mb-2">📷</div>
          <p className="text-sm mb-2">Failed to load image</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Optimized image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        {...(placeholder === 'blur' && { blurDataURL: defaultBlurDataURL })}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
