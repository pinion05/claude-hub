import { cn } from '@/utils/classNames';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip link component for accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Initially hidden, visible only on focus
        'sr-only focus:not-sr-only',
        // Positioning
        'fixed top-4 left-4 z-[9999]',
        // Styling
        'bg-accent text-white px-4 py-2 rounded-lg',
        'font-medium text-sm',
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent',
        // Transitions
        'transition-all duration-200 ease-in-out',
        // Transform for smooth animation
        'transform -translate-y-1 focus:translate-y-0',
        className
      )}
      onClick={(e) => {
        // Smooth scroll to target
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus the target element if it's focusable
          if (target instanceof HTMLElement) {
            target.focus();
          }
        }
      }}
    >
      {children}
    </a>
  );
}