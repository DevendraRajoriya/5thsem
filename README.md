# 5thsem

A modern React application scaffolded with Vite, TypeScript, Tailwind CSS, and essential development tools.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **State Management**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Drag & Drop**: @dnd-kit
- **Utilities**: classnames, clsx, tailwind-merge

## Project Structure

```
src/
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── utils/              # Utility functions
├── styles/             # Global CSS and Tailwind configuration
├── App.tsx             # Main App component (business-logic-free)
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without modifying files

## Development Guidelines

### Components

- Keep components in `src/components/`
- Use TypeScript for type safety
- Follow the existing naming conventions
- Components should be self-contained and reusable

### State Management

- Use Zustand for global state management (see `src/store/appStore.ts`)
- Keep local state in components when appropriate
- Use custom hooks for complex state logic

### Styling

- Use Tailwind CSS classes for styling
- Custom components are defined in `src/styles/globals.css`
- Follow the Notion-inspired theme (Inter font, light gray palette)
- Utilize smooth transitions and animations

### Code Quality

- All code must pass ESLint checks
- Use Prettier for consistent formatting
- Run `npm run lint` before committing changes
- Keep `App.tsx` business-logic-free - it should only render the shell layout

## Features

- ✅ TypeScript support with strict mode
- ✅ Tailwind CSS with custom Notion-inspired theme
- ✅ ESLint and Prettier pre-configured
- ✅ Hot module replacement in development
- ✅ Optimized production builds
- ✅ Component-based architecture
- ✅ Modern React patterns (hooks, functional components)
- ✅ Responsive design utilities
- ✅ Accessibility considerations

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)