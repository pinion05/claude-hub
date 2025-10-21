# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Hub is a Next.js 15 directory service for discovering Claude AI extensions. It features a Google-style search UI with terminal/CLI aesthetics, real-time GitHub statistics integration, and modern dark theme design.

**Live Demo**: https://www.claude-hub.org

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
- **Repository Data Source**: Primary data stored in `storage/claude-hub-repositories/all-repositories.json`
- **Static Data**: `src/data/extensions.ts` (Extension interface), `src/data/categories.ts`, `src/data/suggestions.ts`
- **Dynamic GitHub Data**: Real-time stats fetched via GitHub API (stars, forks, releases, contributors)
- **Extension Categories**: 11 predefined categories in `storage/claude-hub-repositories/categories.json`
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

## Environment Variables

Required environment variables:
- **GITHUB_TOKEN**: GitHub Personal Access Token for API access (server-side only, not prefixed with NEXT_PUBLIC_)
  - Increases GitHub API rate limit from 60 to 5000 requests/hour
  - Should be kept secret and never committed to version control

## GitHub API Integration

### API Proxy Route
- **Path**: `/api/github/[...path]` - Server-side proxy for GitHub API calls
- **Purpose**: Keeps GITHUB_TOKEN secret, handles rate limiting, returns user-friendly errors
- **Rate Limits**: GitHub enforces 60 req/hour (unauthenticated) or 5000 req/hour (with token)
- **Endpoints Used**: Repository details, releases, contributors, README content

### GitHub Client (`src/lib/github-client.ts`)
- Fetches repository data, activity, releases, contributors
- Includes retry logic with exponential backoff
- Handles GitHub API errors and rate limiting

## Cache System

### Client-side Cache (`src/lib/cache.ts`)
- **Storage**: localStorage with simple encryption (`src/utils/crypto.ts`)
- **TTL**: Default 5 minutes for GitHub API responses
- **Features**: Automatic cleanup of expired entries, cache statistics
- **Purpose**: Reduces GitHub API calls, improves performance

## Context Providers

### GitHubDataContext (`src/contexts/GitHubDataContext.tsx`)
- Provides centralized GitHub data fetching across components
- Used by `useGitHubRepo` hook for efficient data management

## Custom Hooks

The project includes several custom hooks in `src/hooks/`:
- **useSearch**: Manages search state, suggestions, and keyboard navigation
- **useScrollSticky**: Handles sticky header behavior based on scroll position
- **useModal**: Controls modal open/close state and animations
- **useGitHubRepo**: Fetches full repository details including releases and contributors
- **useGitHubRepoBasic**: Lightweight version for basic repository info only

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

## Middleware & Security

### Security Headers (`src/middleware.ts`)
Implements OWASP-recommended security headers:
- **CSP**: Content Security Policy with strict rules
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin

### Rate Limiting
- **General Routes**: 60 requests per minute per IP
- **API Routes**: 30 requests per minute per IP
- **Implementation**: In-memory Map (use Redis in production)
- **Headers**: Includes X-RateLimit-* headers for client information

### CORS Configuration
- Allowed origins: localhost:3000, production domain
- Methods: GET, POST, OPTIONS
- Handles preflight requests

### Path Traversal Protection
- Validates API paths to prevent `..` and `//` attacks

## Error Handling

- Global ErrorBoundary component wraps the entire app
- AppError interface in types for consistent error handling
- Error messages should be user-friendly and actionable
- GitHub API errors handled with specific status codes (429 for rate limit, 403 for auth issues)

## Contributing New Extensions

To add a new Claude-related project to the directory:

1. Edit `storage/claude-hub-repositories/all-repositories.json`
2. Add project in this format:
```json
{
  "name": "owner/repo-name",
  "github_url": "https://github.com/owner/repo-name",
  "category": "category-name",
  "tags": ["tag1", "tag2"]
}
```
3. Ensure project meets criteria:
   - Direct relevance to Claude AI
   - Active maintenance (updated within 6 months)
   - Clear documentation
   - Open source license
   - Minimum 10 stars
