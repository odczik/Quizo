# Frontend Folder Structure

This document outlines the purpose of each directory within the `app/` folder of the frontend project. This structure follows modern React and React Router paradigms to separate concerns and maintain a scalable codebase.

## Directory Overview

* **`app/components/`**
  This directory contains reusable UI components (e.g., `Button.tsx`, `Header.tsx`, `Modal.tsx`). These are primarily "presentational" or "dumb" components. They should receive data via props and emit events via callbacks, without worrying about how data is fetched or where it comes from.

* **`app/hooks/`**
  Store all custom React hooks here (e.g., `useAuth.ts`, `useWindowSize.ts`, `useDebounce.ts`). Extracting complex state logic or side-effects into custom hooks keeps your components clean and makes the logic reusable across different parts of the application.

* **`app/utils/`** (sometimes called `lib/`)
  For generic helper functions, API clients, formatters, and constants (e.g., `formatDate.ts`, `apiClient.ts`, `constants.ts`). These are standard JavaScript/TypeScript functions that do not rely on React APIs (they don't use hooks or JSX).

* **`app/types/`**
  Contains shared TypeScript interfaces and type aliases (e.g., `user.types.ts`, `api.types.ts`). While component-specific types can live alongside the component, types shared across multiple files, hooks, or utilities should be placed here.

* **`app/assets/`**
  Store internal assets like global CSS utilities, fonts, or SVGs that need to be processed by Vite during the build step. 
  *(Note: Static files that don't need processing, like `favicon.ico` or static images, should go in the root `public/` folder).*

* **`app/routes/`**
  This is the routing and page directory. Files here map directly to URLs in your application via React Router. These are "smart" components—they often include `loader` functions (to fetch data before rendering) and `action` functions (to handle form submissions). They assemble the smaller pieces from `app/components/` to build complete pages.
