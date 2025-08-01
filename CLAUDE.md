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
```

## Architecture & Key Design Decisions

### Tech Stack
- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** 
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** (using @tailwindcss/postcss)
- **Font System**: Geist Sans + Geist Mono fonts

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- Path alias configured: `@/*` maps to `./src/*`
- Using ES2017 target with modern module resolution

### Design System
The project follows a dark-themed terminal aesthetic with these core elements:
- **Colors**: Charcoal gray backgrounds (#0A0A0B), dark gray cards (#111111), soft white text (#F5F5F5), coral accent (#FF6B6B)
- **Typography**: Fira Code monospace font for terminal feel
- **Animations**: 200ms transitions, search bar slides from center to top
- **Effects**: 3D card tilts (5°), coral glow effects, gradient backgrounds

### Key UI Components to Implement
1. **Search Interface**: Google-style central search with terminal prompt (>)
2. **Terminal Intelligence**: Real-time autocomplete with keyboard navigation
3. **Extension Cards**: 3D tilt effect with hover states
4. **Modal System**: 80% screen size with blur background
5. **Loading States**: Skeleton loaders during search

## TypeScript Configuration

The project uses strict TypeScript with:
- Bundler module resolution
- JSON module imports enabled
- Path aliases configured (@/* for src/*)
- Next.js plugin for enhanced type checking