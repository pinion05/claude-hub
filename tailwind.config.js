/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Performance optimizations
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
  },
  
  theme: {
    extend: {
      // Container queries support
      container: {
        center: true,
        padding: '1rem',
        screens: {
          'xs': '475px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
      },
      
      // Enhanced color system with OKLCH support
      colors: {
        // CSS variables for theme system
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        
        // OKLCH color palette for modern displays
        primary: {
          DEFAULT: 'oklch(65% 0.15 15)',
          50: 'oklch(98% 0.02 15)',
          100: 'oklch(95% 0.05 15)',
          200: 'oklch(88% 0.08 15)',
          300: 'oklch(80% 0.10 15)',
          400: 'oklch(72% 0.12 15)',
          500: 'oklch(65% 0.15 15)',
          600: 'oklch(58% 0.13 15)',
          700: 'oklch(50% 0.11 15)',
          800: 'oklch(42% 0.09 15)',
          900: 'oklch(35% 0.07 15)',
        },
        
        // Semantic colors
        success: 'oklch(70% 0.15 140)',
        warning: 'oklch(75% 0.15 85)',
        error: 'oklch(65% 0.18 25)',
        info: 'oklch(70% 0.13 250)',
        
        // Glass morphism colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.25)',
        },
      },
      
      // Enhanced typography system
      fontFamily: {
        mono: ['var(--font-mono)', '0xProto', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      // Enhanced animation system
      animation: {
        // Micro-interactions
        'fadeIn': 'fadeIn 0.3s ease-out forwards',
        'fadeOut': 'fadeOut 0.2s ease-in forwards',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'slideLeft': 'slideLeft 0.3s ease-out',
        'slideRight': 'slideRight 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'scaleOut': 'scaleOut 0.15s ease-in',
        
        // Pulse animations
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-medium': 'pulse 2s ease-in-out infinite',
        'pulse-fast': 'pulse 1s ease-in-out infinite',
        
        // Glow effects
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        
        // Loading animations
        'shimmer': 'shimmer 2s infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite alternate',
        
        // Interactive animations
        'bounce-in': 'bounceIn 0.3s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
        
        // Scroll animations
        'scroll-fade': 'scrollFade 0.6s ease-out',
        'parallax': 'parallax 10s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px var(--color-accent, oklch(65% 0.15 15))' },
          '100%': { boxShadow: '0 0 20px var(--color-accent, oklch(65% 0.15 15)), 0 0 30px var(--color-accent, oklch(65% 0.15 15))' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px var(--color-accent, oklch(65% 0.15 15))' },
          '50%': { boxShadow: '0 0 15px var(--color-accent, oklch(65% 0.15 15)), 0 0 25px var(--color-accent, oklch(65% 0.15 15))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        skeleton: {
          '0%': { opacity: '0.6' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        scrollFade: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        parallax: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' },
        },
      },
      
      // Enhanced spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Grid templates with container queries
      gridTemplateColumns: {
        'auto-fit-xs': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(350px, 1fr))',
        'auto-fill-xs': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-sm': 'repeat(auto-fill, minmax(300px, 1fr))',
        'auto-fill-md': 'repeat(auto-fill, minmax(350px, 1fr))',
      },
      
      // Enhanced shadows for depth
      boxShadow: {
        'glass-light': '0 2px 8px rgba(255, 255, 255, 0.1)',
        'glass-medium': '0 4px 16px rgba(255, 255, 255, 0.15)',
        'glass-heavy': '0 8px 32px rgba(255, 255, 255, 0.2)',
        'glow-sm': '0 0 10px var(--color-accent, oklch(65% 0.15 15))',
        'glow-md': '0 0 20px var(--color-accent, oklch(65% 0.15 15))',
        'glow-lg': '0 0 30px var(--color-accent, oklch(65% 0.15 15))',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      },
      
      // Enhanced backdrop blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // Enhanced breakpoints with container queries
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        // Container query breakpoints
        '@xs': { 'container-query': '(min-width: 20rem)' },
        '@sm': { 'container-query': '(min-width: 24rem)' },
        '@md': { 'container-query': '(min-width: 28rem)' },
        '@lg': { 'container-query': '(min-width: 32rem)' },
        '@xl': { 'container-query': '(min-width: 36rem)' },
      },
    },
  },
  
  plugins: [
    // Enhanced utilities for modern UI
    function({ addUtilities, theme, addComponents }) {
      // Add component classes
      addComponents({
        // Glass morphism components
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        
        // Enhanced card components
        '.card-elevated': {
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--color-border)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
        
        // Interactive button styles
        '.btn-primary': {
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'color-mix(in oklch, var(--color-accent) 90%, black)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      });
      
      // Add utility classes
      addUtilities({
        // GPU acceleration
        '.gpu': {
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        
        // 3D transforms
        '.card-3d': {
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'rotateY(5deg) rotateX(-5deg) translateZ(20px)',
          },
        },
        
        '.card-3d-reverse': {
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'rotateY(-5deg) rotateX(5deg) translateZ(20px)',
          },
        },
        
        // Glow effects
        '.glow-accent': {
          boxShadow: '0 0 20px var(--color-accent, oklch(65% 0.15 15))',
        },
        '.glow-accent-strong': {
          boxShadow: '0 0 30px var(--color-accent, oklch(65% 0.15 15)), 0 0 60px var(--color-accent, oklch(65% 0.15 15))',
        },
        
        // Text effects
        '.text-gradient': {
          background: 'linear-gradient(135deg, var(--color-accent), color-mix(in oklch, var(--color-accent) 80%, blue))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          backgroundClip: 'text',
        },
        
        // Scrollbar styling
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border) transparent',
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--color-border)',
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: 'var(--color-accent)',
            },
          },
        },
        
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        
        // Focus styles
        '.focus-accent': {
          '&:focus': {
            outline: '2px solid var(--color-accent)',
            outlineOffset: '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
        
        // Layout utilities
        '.center': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        
        '.center-x': {
          display: 'flex',
          justifyContent: 'center',
        },
        
        '.center-y': {
          display: 'flex',
          alignItems: 'center',
        },
      });
    },
  ],
};
EOL < /dev/null