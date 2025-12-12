---
inclusion: always
---

# Development Guidelines

## Project Overview

AI Product Framework is a React + TypeScript application for evaluating and prioritizing AI product hypotheses. Built with Vite, Tailwind CSS, and OpenRouter API integration.

## Architecture Principles

### Feature-Sliced Design
- **Features** (`src/features/`): Isolated business modules (framework, landing)
- **Shared** (`src/shared/`): Reusable code (api, config, lib, types, ui)
- **App** (`src/app/`): Root component and routing
- Features MUST NOT depend on each other - only on `shared/`
- Shared MUST NOT import from features

### Path Aliases
Use TypeScript path aliases for cleaner imports:
```typescript
// ✅ Good
import { ProblemEntry } from '@shared/types';
import { MyComponent } from '@shared/ui/components';

// ❌ Bad
import { ProblemEntry } from '../../../shared/types';
```

## Code Style

### TypeScript
- Use strict typing - avoid `any`
- Export all types from `@shared/types/index.ts`
- Prefer interfaces for props, types for unions/primitives
- Use optional chaining and nullish coalescing

### React Components
- Functional components with TypeScript
- Props destructuring in function signature
- Named exports for components: `export const MyComponent = () => {}`
- Use React 19 hooks (useState, useEffect, useRef)
- Keep components focused - extract complex logic to `@shared/lib/`

### Component Modularity Principle
- **Single Responsibility**: Each component should do ONE thing well
- **Extract Early**: If a component section exceeds ~50 lines or has distinct functionality, extract it
- **Clear Interface**: Components should have clean, minimal props interfaces
- **Reusability**: Design components to be reusable, even if used once initially
- **File Size Limit**: Keep view files under 300 lines - extract sections into separate components
- **Location**:
  - Feature-specific components → `src/features/[feature]/components/`
  - Reusable UI components → `@shared/ui/components.tsx`
- **Example**: Instead of a 400-line `ProblemView.tsx` with embedded GTM section, extract `GTMStrategy.tsx` as a separate component

### State Management
- Local state: `useState` for UI-only state
- Global state: Lifted to `FrameworkApp.tsx`
- Persistence: `localStorage` with automatic sync via `useEffect`
- Migrations: Handle in initial state loader for backward compatibility

### Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `ChatPanel.tsx`)
- **Functions**: `camelCase` (e.g., `calculateScore`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `STORAGE_KEY`)
- **Types/Interfaces**: `PascalCase` (e.g., `ProblemEntry`)

### Import Order
```typescript
// 1. React
import React, { useState } from 'react';

// 2. External libraries
import { someLib } from 'some-lib';

// 3. Internal - absolute paths
import { MyComponent } from '@shared/ui/components';
import { myUtil } from '@shared/lib/utils';

// 4. Relative imports (only within feature)
import { LocalComponent } from './LocalComponent';

// 5. Styles
import './styles.css';
```

## Styling

### Tailwind CSS
- Use Tailwind utility classes - avoid custom CSS unless necessary
- Follow mobile-first responsive design: `md:`, `lg:`, `xl:` breakpoints
- Use theme colors: `primary-*`, `slate-*` (defined in `tailwind.config.js`)
- Consistent spacing: `gap-*`, `p-*`, `m-*` with 4px increments

### Component Patterns
- Cards: `bg-white rounded-2xl shadow-sm border border-slate-200`
- Buttons: `px-4 py-2 rounded-lg transition-colors`
- Inputs: `rounded-xl focus:ring-2 focus:ring-primary-500`
- Hover states: Always include `transition-*` for smooth animations

## API Integration

### OpenRouter Client
- All AI calls go through `@shared/api/openrouter.ts`
- Use `makeAICall()` for standard chat completions
- Use `makeResearchCall()` for research with source extraction
- Handle errors gracefully with user-friendly messages
- API key stored in `localStorage` via `AISettings`

### Error Handling
```typescript
try {
  const result = await makeAICall(settings, system, user);
  // Handle success
} catch (e: any) {
  showAlert("Error Title", e.message);
}
```

## Data Flow

### State Updates
- Use immutable updates with spread operators
- Update via setter functions passed as props
- Persist to `localStorage` automatically via `useEffect`

### Prompts
- Centralized in `@shared/lib/prompts.ts`
- Use template functions for dynamic prompts
- Keep system prompts consistent across features

## Common Patterns

### Modal Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);
// Set true before async, false in finally block
```

### Conditional Rendering
Use ternary for simple cases, early returns for complex logic

## Testing & Quality

- Run `npm run build` before committing to catch TypeScript errors
- Run `npm run type-check` for type validation
- Test in browser at multiple breakpoints (mobile, tablet, desktop)
- Verify localStorage persistence across page refreshes

## Performance

- Avoid unnecessary re-renders - use React.memo sparingly
- Keep bundle size small - lazy load features if needed
- Optimize images and assets
- Use `useCallback` for event handlers passed to children

## Accessibility

- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Maintain color contrast ratios

## Git Workflow

### Commit Messages
Follow Conventional Commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code restructuring
- `style:` formatting
- `test:` adding tests

### Branch Naming
- `feature/description`
- `fix/bug-description`
- `docs/update-description`

## Common Tasks

### Adding a New Feature
1. Create folder in `src/features/my-feature/`
2. Add components, views, types
3. Import shared utilities from `@shared/`
4. Integrate in `App.tsx` or parent feature

### Adding a New UI Component
- Reusable → `@shared/ui/components.tsx`
- Feature-specific → `src/features/[feature]/components/`

### Adding a New Utility
- Business logic → `@shared/lib/utils.ts`
- Prompts → `@shared/lib/prompts.ts`
- API → `@shared/api/`

### Adding a New Type
Export from `@shared/types/index.ts` for global access

## Documentation

- **DO NOT** create standalone markdown files for every small change
- **DO** maintain structured feature documentation in `docs/` folder
- Each feature should have its own folder in `docs/` with comprehensive documentation
- Update existing documentation when making changes rather than creating new files
- Keep documentation focused on "what exists", "how it works", and "how to use it"

## Localization

- Primary language: Russian (UI text, prompts)
- Code comments: English preferred
- Variable names: English only

## Dependencies

- **React 19**: Latest features, no legacy patterns
- **TypeScript 5.8**: Strict mode enabled
- **Vite 6**: Fast dev server and build
- **Tailwind CSS 3**: Utility-first styling
- Keep dependencies minimal - evaluate before adding new ones 