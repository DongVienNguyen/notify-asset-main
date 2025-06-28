# AI Development Rules

This document outlines the core technologies and best practices for developing this application.

## Tech Stack Overview

*   **React:** The primary JavaScript library for building the user interface.
*   **TypeScript:** All code is written in TypeScript for type safety and improved developer experience.
*   **React Router:** Used for client-side routing. All main routes are defined in `src/App.tsx`.
*   **Tailwind CSS:** The sole framework for styling. All UI elements should be styled using Tailwind utility classes.
*   **shadcn/ui & Radix UI:** Pre-built UI components from `shadcn/ui` are utilized for a consistent and accessible design. These components are built on Radix UI primitives.
*   **Lucide React:** The designated library for all icons used throughout the application.
*   **Supabase:** Serves as the backend, providing database, authentication, and serverless function capabilities.
*   **Tanstack Query (React Query):** Manages server state, data fetching, caching, and synchronization.
*   **React Hook Form & Zod:** Used for robust form management and validation.
*   **Date-fns & React Day Picker:** For handling date manipulations and providing date input components.
*   **Sonner / Radix UI Toast:** For displaying user notifications and feedback.
*   **JSZip:** Used for client-side file compression and decompression, particularly for data export/import features.

## Library Usage Rules

To maintain consistency and efficiency, adhere to the following rules when using libraries:

*   **React:** Always use functional components and React Hooks.
*   **TypeScript:** Ensure all new files and modifications are strongly typed. Avoid `any` where possible.
*   **React Router:**
    *   Define all top-level routes in `src/App.tsx`.
    *   Use `Link` for navigation within the app and `useNavigate` for programmatic navigation.
*   **Tailwind CSS:**
    *   Prioritize utility-first styling. Avoid custom CSS files unless absolutely necessary for complex animations or third-party overrides.
    *   Ensure designs are responsive by utilizing Tailwind's responsive prefixes (e.g., `md:`, `lg:`).
*   **shadcn/ui & Radix UI:**
    *   Always import components from `@/components/ui`.
    *   Do NOT modify the source files of `shadcn/ui` components directly. If a component needs customization beyond its props, create a new component in `src/components/` that wraps or extends the `shadcn/ui` component.
*   **Lucide React:** Import icons directly from `lucide-react`.
*   **Supabase:**
    *   Interact with Supabase via the client instance imported from `src/integrations/supabase/client.ts`.
    *   For sensitive operations or complex logic, leverage Supabase Edge Functions.
*   **Tanstack Query:**
    *   Use `useQuery` for fetching data and `useMutation` for data modifications (create, update, delete).
    *   Manage query keys effectively for proper caching and invalidation.
*   **React Hook Form & Zod:**
    *   All forms should be managed using `react-hook-form` with `zod` for schema validation.
    *   Use `@hookform/resolvers` to integrate Zod with React Hook Form.
*   **Date-fns & React Day Picker:** Use `date-fns` for all date formatting, parsing, and manipulation. `react-day-picker` should be used for date input UI.
*   **Sonner / Radix UI Toast:** Use `sonner` for general toasts and `useToast` from `@/components/ui/use-toast` for more traditional toast notifications.
*   **JSZip:** Only use for client-side file compression/decompression. Do not use for server-side operations.
*   **Bcryptjs:** This library is used for password hashing. Its usage is restricted to server-side (Supabase Edge Functions) for security reasons. Do not implement password hashing directly in the client-side code.

## File Structure Guidelines

*   **`src/pages/`**: Contains top-level page components (e.g., `Index.tsx`, `Login.tsx`).
*   **`src/components/`**: Contains reusable UI components. Each component should ideally be in its own file.
*   **`src/hooks/`**: Contains custom React hooks for encapsulating reusable logic.
*   **`src/services/`**: Contains logic for interacting with external APIs (e.g., Supabase, email service, Gemini API) and complex business logic.
*   **`src/utils/`**: Contains general utility functions that are not React-specific (e.g., date formatting, validation helpers).
*   **`src/integrations/`**: Contains client configurations for third-party services (e.g., `supabase/client.ts`).