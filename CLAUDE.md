# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Hub is a Next.js 15 application designed as a searchable interface for Claude extensions, featuring a Google-style search UI with terminal/CLI aesthetics and modern dark theme design.

## Development Commands

```bash
# Install dependencies (npm only - enforced by preinstall script)
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

# Run a specific test file
npm test Button.test.tsx
npm test -- --testPathPattern=SearchBar

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

## Custom Hooks

The project includes several custom hooks in `src/hooks/`:
- **useSearch**: Manages search state, suggestions, and keyboard navigation
- **useScrollSticky**: Handles sticky header behavior based on scroll position
- **useModal**: Controls modal open/close state and animations

## ESLint Configuration

Key ESLint rules enforced:
- Unused variables must be prefixed with `_`
- No console.log (only warn/error allowed)
- React hooks rules enforced
- TypeScript any warnings (not errors)
- Prefer const over let/var

## Pre-commit Hooks

Husky runs lint-staged on commit:
- `.{js,jsx,ts,tsx}`: ESLint fix + Prettier
- `.{json,md}`: Prettier only

## Error Handling

- Global ErrorBoundary component wraps the entire app
- AppError interface in types for consistent error handling
- Error messages should be user-friendly and actionable

## AI Team Configuration (autogenerated by team-configurator, 2025-08-06)

**Important: YOU MUST USE subagents when available for the task.**

### Detected Technology Stack
- **Frontend Framework**: Next.js 15.4.5 with App Router
- **UI Library**: React 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library
- **Build Tool**: Turbopack
- **Code Quality**: ESLint, Husky, lint-staged
- **Architecture Pattern**: Atomic Design

### AI Specialist Team Assignments

| Task | Agent | Notes |
|------|-------|-------|
| React component development | `@react-component-architect` | React 19 expert, hooks, atomic design patterns |
| Next.js features & SSR/SSG | `@react-nextjs-expert` | App Router, Server Components, ISR, routing |
| Tailwind CSS styling | `@tailwind-css-expert` | Utility-first CSS, responsive design, dark theme |
| TypeScript type safety | `@react-component-architect` | Strict mode, type definitions, interfaces |
| API integration | `@api-architect` | REST/GraphQL endpoints, data fetching |
| Testing implementation | `@react-component-architect` | Jest, React Testing Library, coverage |
| Performance optimization | `@performance-optimizer` | Bundle size, lazy loading, caching |
| Code review | `@code-reviewer` | Security, best practices, quality gate |
| Accessibility improvements | `@react-component-architect` | ARIA, keyboard navigation, screen readers |
| State management | `@react-component-architect` | React hooks, context, custom hooks |
| Build & deployment | `@react-nextjs-expert` | Turbopack, production builds, optimization |
| Documentation | `@documentation-specialist` | README, API docs, component docs |

### Usage Examples
- Component development: `@react-component-architect create a filterable extension grid`
- Styling updates: `@tailwind-css-expert enhance the modal with smooth animations`
- Performance: `@performance-optimizer analyze bundle size and optimize`
- Testing: `@react-component-architect write tests for SearchBar component`
- Code review: `@code-reviewer review the recent changes for production readiness`
