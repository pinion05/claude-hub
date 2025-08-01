# Claude Hub

A searchable interface for discovering Claude extensions, tools, and integrations. Built with modern web technologies and a terminal-inspired aesthetic.

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- 🔍 **Google-style Search Interface** - Intuitive search with terminal aesthetics
- ⚡ **Real-time Search** - Instant results with autocomplete suggestions
- 🎨 **Modern Dark Theme** - Sleek design with coral accent colors (#FF6B6B)
- 📱 **Fully Responsive** - Optimized for all devices and screen sizes
- ⌨️ **Keyboard Navigation** - Full keyboard support for power users
- 🎯 **Type-Safe** - Built with TypeScript and strict mode enabled
- 🧱 **Atomic Design** - Scalable component architecture
- ⚡ **Lightning Fast** - Powered by Turbopack and React 19 optimizations
- 🧪 **Well-Tested** - 80% test coverage requirement

## 🚀 Tech Stack

- **Framework**: [Next.js 15.4.5](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict mode
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **Architecture**: [Atomic Design Pattern](https://bradfrost.com/blog/post/atomic-web-design/)
- **State Management**: React Hooks (no external libraries)
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Husky, lint-staged
- **Performance**: Turbopack, React 19, optimized builds

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-hub.git
cd claude-hub

# Install dependencies (npm only)
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack (port 3000)
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report (80% threshold)

# Utilities
npm run analyze          # Analyze bundle size
npm run clean            # Remove .next and node_modules
```

## 📁 Project Structure

```
claude-hub/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   │
│   ├── components/       # React components (Atomic Design)
│   │   ├── atoms/        # Basic building blocks
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Logo.tsx
│   │   │   └── Skeleton.tsx
│   │   │
│   │   ├── molecules/    # Simple component groups
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ExtensionCard.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── SuggestionList.tsx
│   │   │
│   │   ├── organisms/    # Complex structures
│   │   │   ├── Header.tsx
│   │   │   ├── ExtensionGrid.tsx
│   │   │   ├── ExtensionModal.tsx
│   │   │   └── SearchSection.tsx
│   │   │
│   │   └── templates/    # Page templates
│   │       └── HomePage.tsx
│   │
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   ├── data/             # Static data
│   │   ├── extensions.ts # Extension database
│   │   └── suggestions.ts # Search suggestions
│   │
│   └── lib/              # Library code
│
├── public/               # Static assets
├── CLAUDE.md            # AI assistant guide
└── [config files]       # Various config files
```

## 🎨 Design System

### Color Palette
- **Background**: `#0A0A0B` (Charcoal)
- **Card**: `#111111` (Dark Gray)
- **Text**: `#F5F5F5` (Soft White)
- **Accent**: `#FF6B6B` (Coral)
- **Border**: `#222222` (Gray)

### Typography
- **Font**: Fira Code (monospace)
- **Weights**: 300, 400, 500, 600, 700

### Key Features
- Terminal-inspired aesthetics
- 3D card tilt effects (5°)
- Coral glow effects
- Smooth 200ms transitions
- Mobile-first responsive design

## 🧪 Testing

The project maintains an 80% test coverage threshold across all metrics:

```bash
# Run tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are colocated with components (e.g., `Button.test.tsx`).

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Path aliases configured (`@/*` for `src/*`)
- Unused variables must be prefixed with `_`
- ESLint auto-fix on commit via Husky

### Component Development
1. Follow Atomic Design principles
2. Use TypeScript interfaces for props
3. Include tests for new components
4. Use Tailwind CSS for styling
5. Ensure accessibility compliance

### Git Workflow
1. Create feature branch from `main`
2. Make changes following conventions
3. Ensure tests pass and coverage maintained
4. Commit with descriptive messages
5. Open PR with detailed description

## 🚀 Deployment

The app is optimized for production deployment:

- React strict mode enabled
- Console logs removed in production
- Optimized CSS and package imports
- Image optimization (AVIF/WebP)
- Security headers configured
- TypeScript and ESLint errors block builds

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our guidelines
4. Run tests and ensure coverage (`npm run test:coverage`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a detailed description

### Contribution Guidelines
- Maintain 80% test coverage
- Follow existing code style
- Update documentation as needed
- Add tests for new features
- Ensure TypeScript types are properly defined

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) by Vercel
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Font: [Fira Code](https://github.com/tonsky/FiraCode)

---

<p align="center">Made with ❤️ for the Claude community</p>
