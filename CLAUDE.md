# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview the production build

## Test Commands
- `npm test -- src/hooks/useKeyboardThrottler.test.ts` - Run a specific test file
- Tests use Jest with React Testing Library

## Code Style Guidelines
- **TypeScript**: Use strong typing, avoid `any` when possible
- **Components**: React functional components with hooks
- **Imports**: Sort imports by type (React, 3rd party, project)
- **AG Grid**: Custom hooks for grid functionality, profile management
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch for async operations
- **State Management**: React hooks (useState, useRef, useMemo)
- **Formatting**: 2-space indentation, semi-colons, single quotes
- **File Structure**: Group related components, hooks in dedicated folders
- **Tailwind CSS**: Use for styling with utility classes