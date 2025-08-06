import { cn } from '@/utils/classNames';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  focusable?: boolean;
}

/**
 * Visually Hidden component
 * Hides content visually while keeping it accessible to screen readers
 * Based on the sr-only pattern but with more flexibility
 */
export function VisuallyHidden({
  children,
  className,
  asChild = false,
  focusable = false
}: VisuallyHiddenProps) {
  const hiddenStyles = cn(
    'absolute w-px h-px p-0 -m-px overflow-hidden',
    'whitespace-nowrap border-0',
    // If focusable, show when focused
    focusable ? 'focus:not-sr-only focus:static focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:border focus:bg-white focus:text-black focus:z-50' : '',
    className
  );

  if (asChild) {
    // Return children with the hidden styles applied
    return <span className={hiddenStyles}>{children}</span>;
  }

  return (
    <span className={hiddenStyles}>
      {children}
    </span>
  );
}

/**
 * Screen Reader Only component
 * Alias for VisuallyHidden with common use case
 */
export function ScreenReaderOnly({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <VisuallyHidden className={className}>
      {children}
    </VisuallyHidden>
  );
}

/**
 * Skip to Content component
 * Specialized visually hidden component that becomes visible on focus
 */
export function SkipToContent({ 
  targetId, 
  children = "Skip to main content",
  className 
}: { 
  targetId: string; 
  children?: React.ReactNode; 
  className?: string; 
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      target.focus();
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'bg-accent text-white px-4 py-2 rounded-md font-medium',
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent',
        'transform -translate-y-1 focus:translate-y-0 transition-transform duration-200',
        className
      )}
    >
      {children}
    </a>
  );
}