# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Hub is a Next.js 15 application designed as a searchable interface for Claude extensions, featuring a Google-style search UI with terminal/CLI aesthetics and modern dark theme design.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
npm run lint:fix       # Auto-fix linting issues

# Type checking
npm run type-check

# Testing
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode  
npm run test:coverage  # Run tests with coverage report

# Analyze bundle size
npm run analyze

# Clean install
npm run clean         # Remove .next and node_modules
```

## Architecture & Key Design Decisions

### Tech Stack
- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** 
- **TypeScript** with strict mode enabled (including noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess)
- **Tailwind CSS v4** (using @tailwindcss/postcss)
- **Testing**: Jest with React Testing Library, 80% coverage threshold
- **Code Quality**: ESLint with Next.js config, Husky for pre-commit hooks, lint-staged

### Component Architecture (Atomic Design)
```
src/components/
├── atoms/         # Basic building blocks (Button, Input, Badge, Logo, Skeleton)
├── molecules/     # Simple groups (SearchBar, ExtensionCard, Modal, SuggestionList)
├── organisms/     # Complex structures (Header, ExtensionGrid, ExtensionModal, SearchSection)
└── templates/     # Page templates (HomePage)
```

### State Management Architecture
- **Search State**: Manages query, suggestions, keyboard navigation, and loading states
- **UI State**: Handles sticky search positioning, selected extensions, and modal states
- **Filter Options**: Category filtering, sorting (name/stars/downloads/lastUpdated)
- No external state management library - uses React hooks and prop drilling

### Path Aliases
All imports should use these configured aliases:
- `@/*` → `./src/*`
- `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/types/*`, `@/utils/*`, `@/data/*`, etc.

### Data Architecture
- **Extensions Data**: Static data in `src/data/extensions.ts` with Extension interface
- **Extension Categories**: 11 predefined categories (Development, API, Browser, etc.)
- **Search Suggestions**: Default suggestions in `src/data/suggestions.ts`

### Design System
The project follows a dark-themed terminal aesthetic with these core elements:
- **Colors**: Charcoal gray backgrounds (#0A0A0B), dark gray cards (#111111), soft white text (#F5F5F5), coral accent (#FF6B6B)
- **Typography**: Fira Code monospace font for terminal feel
- **Animations**: 200ms transitions, search bar slides from center to top
- **Effects**: 3D card tilts (5°), coral glow effects, gradient backgrounds

### Key UI Behaviors
1. **Search Flow**: Center search → animate to top on search → show results with skeleton loaders
2. **Keyboard Navigation**: Arrow keys for suggestion navigation, Enter to select, ESC to close
3. **Modal System**: 80% screen size, backdrop blur, close on X or background click
4. **Responsive Design**: Mobile-first approach with responsive grid layouts

## TypeScript Configuration

The project uses strict TypeScript with:
- ES2017 target with DOM and ESNext libs
- Bundler module resolution
- Strict mode with additional checks (exactOptionalPropertyTypes, noUncheckedIndexedAccess)
- All unused variables/parameters must be prefixed with `_` to pass linting

## Testing Strategy

- Test files should be colocated with components (e.g., `Button.test.tsx`)
- Jest configured with Next.js and jsdom environment
- 80% coverage threshold for all metrics (branches, functions, lines, statements)
- Testing utilities from React Testing Library

## Build & Deploy Considerations

- React strict mode enabled
- Console logs removed in production builds
- CSS and package imports optimized
- Image optimization with AVIF/WebP formats
- Security headers configured (no powered-by header)
- Build errors from TypeScript and ESLint will fail the build