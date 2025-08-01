# Claude Hub

A searchable interface for discovering Claude extensions, tools, and integrations.

## Features

- 🔍 Google-style search interface with terminal aesthetics
- ⚡ Real-time search with autocomplete suggestions
- 🎨 Modern dark theme with coral accent colors
- 📱 Fully responsive design
- 🚀 Built with Next.js 15 and React 19
- 🎯 TypeScript for type safety
- 🧱 Atomic design architecture

## Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Architecture**: Atomic Design Pattern
- **State Management**: React Hooks
- **Performance**: Turbopack, React 19 optimizations

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-hub.git
cd claude-hub

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components (atomic design)
│   ├── atoms/        # Basic building blocks
│   ├── molecules/    # Simple component groups
│   ├── organisms/    # Complex component structures
│   └── templates/    # Page templates
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── data/             # Static data and constants
├── lib/              # Library code
└── styles/           # Global styles

```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
