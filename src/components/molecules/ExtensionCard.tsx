import React, { memo, useState, useId } from 'react';
import { Extension } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { CategoryIcon } from '@/components/atoms/CategoryIcon';
import { cn } from '@/utils/classNames';
import { ScreenReaderOnly } from '@/components/atoms/VisuallyHidden';

export interface ExtensionCardProps {
  extension: Extension;
  onClick: (extension: Extension) => void;
  index?: number;
  variant?: 'default' | 'glass' | 'elevated' | 'minimal' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  interactive?: boolean;
}

export const ExtensionCard = memo<ExtensionCardProps>(({
  extension,
  onClick,
  index = 0,
  variant = 'default',
  size = 'md',
  showStats = true,
  interactive = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const cardId = useId();
  const descriptionId = useId();

  const sizeClasses = {
    sm: 'p-4 gap-2',
    md: 'p-6 gap-3', 
    lg: 'p-8 gap-4'
  };

  const variantClasses = {
    default: [
      'bg-card border border-border',
      interactive && 'hover:border-accent/60 hover:shadow-lg',
      interactive && 'hover:-translate-y-1 active:translate-y-0',
      'transition-all duration-300 ease-out'
    ].join(' '),
    glass: [
      'glass backdrop-blur-xl',
      interactive && 'hover:bg-glass-medium hover:shadow-glass-medium',
      interactive && 'hover:-translate-y-1 active:translate-y-0',
      'transition-all duration-300 ease-out'
    ].join(' '),
    elevated: [
      'bg-card border border-border shadow-lg',
      interactive && 'hover:shadow-xl hover:border-accent/60',
      interactive && 'hover:-translate-y-2 active:-translate-y-1',
      'transition-all duration-300 ease-out'
    ].join(' '),
    minimal: [
      'bg-transparent border border-transparent',
      interactive && 'hover:bg-surface-1 hover:border-border',
      'transition-all duration-200 ease-out'
    ].join(' '),
    compact: [
      'bg-card border border-border',
      interactive && 'hover:border-accent/40 hover:bg-surface-1',
      'transition-all duration-200 ease-out'
    ].join(' ')
  };

  const handleClick = () => {
    if (interactive) {
      onClick(extension);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPressed(true);
      onClick(extension);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false);
    }
  };

  const staggerDelay = Math.min(index * 50, 500);

  // Generate accessible description
  const statsDescription = [];
  if (extension.stars) {
    statsDescription.push(`${extension.stars.toLocaleString()} stars`);
  }
  if (extension.downloads) {
    const downloadText = extension.downloads > 1000 
      ? `${Math.round(extension.downloads / 1000)}k downloads` 
      : `${extension.downloads.toLocaleString()} downloads`;
    statsDescription.push(downloadText);
  }
  const fullDescription = `${extension.name}, ${extension.category} extension. ${extension.description}${statsDescription.length ? '. ' + statsDescription.join(', ') : ''}`;

  return (
    <article
      className={cn(
        'group relative rounded-xl cursor-pointer',
        'transform-gpu will-change-transform',
        'opacity-0 animate-fadeIn',
        // 3D effect based on variant
        variant === 'default' && interactive && 'card-3d-subtle',
        variant === 'elevated' && interactive && 'card-3d',
        variant === 'glass' && interactive && 'card-3d-reverse',
        // Size classes
        sizeClasses[size],
        // Variant classes
        variantClasses[variant],
        // Interactive states
        interactive && 'focus-accent',
        interactive && isPressed && 'scale-95',
        // Loading animation
        'animate-stagger'
      )}
      style={{ 
        animationDelay: `${staggerDelay}ms`,
        '--stagger-delay': index.toString()
      } as React.CSSProperties}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      role={interactive ? "button" : "article"}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-label={interactive ? `View details for ${extension.name}` : undefined}
      aria-describedby={descriptionId}
      data-testid={`extension-card-${extension.id}`}
    >
      {/* Screen reader description */}
      <ScreenReaderOnly id={descriptionId}>
        {fullDescription}
      </ScreenReaderOnly>

      {/* Background glow effect */}
      {isHovered && variant !== 'minimal' && (
        <div className="absolute inset-0 -z-10 bg-accent/5 rounded-xl blur-xl transition-opacity duration-300" />
      )}

      {/* Content container */}
      <div className="flex flex-col h-full relative z-10">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3 mb-auto">
          <div className={cn(
            'flex-shrink-0 transition-transform duration-200',
            isHovered && interactive && 'scale-110'
          )}>
            <CategoryIcon 
              category={extension.category} 
              className={cn(
                'text-2xl transition-colors duration-200',
                size === 'sm' && 'text-xl',
                size === 'lg' && 'text-3xl',
                isHovered ? 'text-accent' : 'text-foreground/80'
              )}
              aria-hidden="true"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold line-clamp-1 transition-colors duration-200',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-lg',
              size === 'lg' && 'text-xl',
              isHovered && interactive ? 'text-accent' : 'text-foreground',
              interactive && 'group-hover:text-gradient-accent'
            )}>
              {extension.name}
            </h3>
            
            {/* Animated underline */}
            {interactive && (
              <div className={cn(
                'h-0.5 bg-accent mt-1 transition-all duration-300',
                'transform origin-left',
                isHovered ? 'scale-x-100' : 'scale-x-0'
              )} />
            )}
          </div>
        </div>

        {/* Description */}
        <p className={cn(
          'text-foreground/70 mb-4 transition-colors duration-200',
          size === 'sm' ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2',
          size === 'lg' && 'text-base line-clamp-3',
          variant === 'compact' && 'line-clamp-1',
          isHovered && 'text-foreground/90'
        )}>
          {extension.description}
        </p>

        {/* Footer with badge and stats */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Badge 
            variant="accent" 
            size={size === 'sm' ? 'xs' : 'sm'}
            className={cn(
              'transition-all duration-200',
              isHovered && 'glow-accent scale-105'
            )}
          >
            {extension.category}
          </Badge>
          
          {showStats && extension.stars && (
            <div className={cn(
              'flex items-center gap-1 text-foreground/50 transition-all duration-200',
              size === 'sm' ? 'text-xs' : 'text-xs',
              isHovered && 'text-accent scale-105'
            )}>
              <span 
                className="transition-transform duration-200 hover:scale-125"
                aria-hidden="true"
              >
                ⭐
              </span>
              <span className="font-feature-tabular" aria-label={`${extension.stars.toLocaleString()} stars`}>
                {extension.stars.toLocaleString()}
              </span>
            </div>
          )}

          {/* Downloads count if available */}
          {showStats && extension.downloads && (
            <div className={cn(
              'flex items-center gap-1 text-foreground/50 transition-all duration-200',
              size === 'sm' ? 'text-xs' : 'text-xs',
              isHovered && 'text-success scale-105'
            )}>
              <span aria-hidden="true">↓</span>
              <span 
                className="font-feature-tabular" 
                aria-label={`${extension.downloads > 1000 
                  ? `${Math.round(extension.downloads / 1000)}k` 
                  : extension.downloads.toLocaleString()
                } downloads`}
              >
                {extension.downloads > 1000 
                  ? `${Math.round(extension.downloads / 1000)}k` 
                  : extension.downloads.toLocaleString()
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Shine effect overlay */}
      {interactive && (
        <div className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-500',
          'bg-gradient-to-br from-transparent via-white/10 to-transparent',
          'rounded-xl pointer-events-none',
          isHovered && 'opacity-100'
        )}>
          <div className={cn(
            'absolute inset-0 animate-shimmer-accent rounded-xl',
            'opacity-0 transition-opacity duration-300',
            isHovered && 'opacity-30'
          )} />
        </div>
      )}

      {/* Ripple effect for interactions */}
      {interactive && isPressed && (
        <div className="absolute inset-0 bg-accent/10 rounded-xl animate-ping pointer-events-none" />
      )}
    </article>
  );
});

ExtensionCard.displayName = 'ExtensionCard';