import React, { useState } from 'react';
import { Extension } from '@/types';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils/classNames';

interface SocialShareProps {
  extension?: Extension;
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  label: string;
}

/**
 * Social sharing component with multiple platform support
 */
export function SocialShare({
  extension,
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = extension?.name || 'Claude Hub - AI Extensions',
  description: _description,
  className,
  variant = 'horizontal',
  size = 'md'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const shareText = extension 
    ? `Check out ${extension.name} - ${extension.description}`
    : title;

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(shareText);

  const platforms: SharePlatform[] = [
    {
      name: 'twitter',
      label: 'Share on Twitter',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
      color: '#1DA1F2'
    },
    {
      name: 'linkedin',
      label: 'Share on LinkedIn',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: '#0A66C2'
    },
    {
      name: 'facebook',
      label: 'Share on Facebook',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: '#1877F2'
    },
    {
      name: 'reddit',
      label: 'Share on Reddit',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      url: `https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,
      color: '#FF4500'
    },
    {
      name: 'hackernews',
      label: 'Share on Hacker News',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896h-1.88z"/>
        </svg>
      ),
      url: `https://news.ycombinator.com/submitlink?u=${shareUrl}&t=${shareTitle}`,
      color: '#FF6600'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform: SharePlatform) => {
    window.open(platform.url, '_blank', 'noopener,noreferrer');
    
    // Analytics tracking
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'share', {
        method: platform.name,
        content_type: extension ? 'extension' : 'page',
        content_id: extension?.id || url
      });
    }
  };

  const shareButton = (
    <Button
      variant="secondary"
      size={size}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="relative"
      aria-label="Share options"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      Share
    </Button>
  );

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative inline-block', className)}>
        {shareButton}
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border z-50">
            <div className="py-1" role="menu">
              {platforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-surface-1 transition-colors"
                  role="menuitem"
                  aria-label={platform.label}
                >
                  <span 
                    className="mr-3 flex-shrink-0"
                    style={{ color: platform.color }}
                  >
                    {platform.icon}
                  </span>
                  {platform.label}
                </button>
              ))}
              
              <hr className="my-1 border-border" />
              
              <button
                onClick={copyToClipboard}
                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-surface-1 transition-colors"
                role="menuitem"
                aria-label="Copy link"
              >
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-2',
      variant === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
      className
    )}>
      {platforms.map((platform) => (
        <Button
          key={platform.name}
          variant="secondary"
          size={size}
          onClick={() => handleShare(platform)}
          className={cn(
            'transition-colors',
            size === 'sm' && 'px-2 py-1',
            variant === 'vertical' && 'justify-start'
          )}
          style={{
            '--hover-color': platform.color,
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = platform.color;
            e.currentTarget.style.color = platform.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.color = '';
          }}
          aria-label={platform.label}
        >
          <span className="flex-shrink-0">
            {platform.icon}
          </span>
          {(variant === 'vertical' || size === 'lg') && (
            <span className="ml-2 hidden sm:inline">
              {platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
            </span>
          )}
        </Button>
      ))}

      <Button
        variant="secondary"
        size={size}
        onClick={copyToClipboard}
        className={cn(
          'transition-colors',
          copied && 'border-success text-success',
          size === 'sm' && 'px-2 py-1',
          variant === 'vertical' && 'justify-start'
        )}
        aria-label="Copy link to clipboard"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {(variant === 'vertical' || size === 'lg') && (
          <span className="ml-2 hidden sm:inline">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        )}
      </Button>
    </div>
  );
}