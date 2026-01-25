# PRP-TASK-002: Create Dashboard Layout with 4-Tab Navigation

## Goal
Implement the core dashboard shell for the Research & Publishing Suite. This includes a persistent sidebar navigation, a 4-tab structure (Deep Research, Context Research, Content Generation, Publishing), and the foundational layout using Next.js 15 App Router.

## Why
- **User Experience**: A unified, persistent navigation is essential for a complex multi-phase workflow.
- **Foundation**: This task lays the groundwork (routing structure, layout containers) for all subsequent feature development.
- **Visual Consistency**: Establishes the dark theme application shell (`bg-slate-950`) used throughout the app.

## What
1.  **Route Structure**: Create a `(dashboard)` route group to isolate the application shell from potential marketing/auth pages.
2.  **Layout**: Implement a Server Component layout with a flexbox shell.
3.  **Sidebar**: Create a Client Component sidebar with active state handling using `usePathname`.
4.  **Pages**: Scaffold the 4 main application views as empty stubs.
5.  **Redirect**: Configure the root route (`/`) to redirect to the first tab (`/deep`).

### Success Criteria
- [ ] Application loads at `http://localhost:3000` and immediately redirects to `/deep`.
- [ ] Sidebar is visible on the left, full height, with 4 navigation items.
- [ ] Clicking tabs changes the URL and the main content area without a full page reload.
- [ ] The active tab is visually distinct (highlighted) in the sidebar.
- [ ] Layout is responsive (basic flex behavior) and uses the correct dark theme colors.
- [ ] `npm run lint` passes without errors.

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- doc: Next.js App Router Layouts
  url: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
  why: Best practices for Server Component layouts and nesting.

- doc: Next.js usePathname Hook
  url: https://nextjs.org/docs/app/api-reference/functions/use-pathname
  why: Essential for active link styling in the Client Component Sidebar.

- file: src/app/globals.css
  why: Check for existing base styles or CSS variables.

- file: tailwind.config.ts
  why: Verify available colors (slate, indigo) and extend if necessary.
```

### Current Codebase tree
```bash
/Users/alexandthemusic/APP-VIBE/ZED_Inngest-APP/Inngest-RESEARCH---Next-15/
├── src/
│   ├── app/
│   │   ├── page.tsx          # To be modified
│   │   └── layout.tsx        # Root layout (exists)
│   └── components/           # To be populated
```

### Desired Codebase tree
```bash
/Users/alexandthemusic/APP-VIBE/ZED_Inngest-APP/Inngest-RESEARCH---Next-15/
├── src/
│   ├── app/
│   │   ├── (dashboard)/      # New Route Group
│   │   │   ├── layout.tsx    # Dashboard Layout (Flex container)
│   │   │   ├── deep/         # Tab 1
│   │   │   │   └── page.tsx
│   │   │   ├── context/      # Tab 2
│   │   │   │   └── page.tsx
│   │   │   ├── content/      # Tab 3
│   │   │   │   └── page.tsx
│   │   │   └── publishing/   # Tab 4
│   │   │       └── page.tsx
│   │   └── page.tsx          # Modified (Redirect)
│   └── components/
│       └── sidebar.tsx       # New Client Component
```

### Known Gotchas & Library Quirks
```python
# CRITICAL: Client vs Server Components
# The Sidebar needs to use `usePathname` to show which tab is active.
# `usePathname` ONLY works in Client Components.
# Therefore, `src/components/sidebar.tsx` MUST start with `'use client';`.
# The Layout (`src/app/(dashboard)/layout.tsx`) should remain a Server Component
# and import the Client Component Sidebar.

# CRITICAL: Route Groups
# We use `(dashboard)` (with parenthesis) so that it doesn't add `/dashboard`
# to the URL path. This keeps URLs clean: `/deep` instead of `/dashboard/deep`.

# STYLE: Height Management
# Use `h-screen` for the outer container to ensure the sidebar stretches
# the full viewport height. Use `overflow-auto` on the main content area
# to allow independent scrolling of the page content while sidebar stays fixed.
```

## Implementation Blueprint

### List of tasks to be completed

```yaml
Task 1:
CREATE src/components/sidebar.tsx:
  - COMPONENT: Client Component ('use client')
  - LOGIC: Import `usePathname`, define `navItems` array
  - RENDER: `<aside>` with mapped `<Link>` elements
  - STYLE: Tailwind `w-64`, `bg-slate-900`, active states

Task 2:
CREATE src/app/(dashboard)/layout.tsx:
  - COMPONENT: Server Component (default)
  - RENDER: Flex container holding `<Sidebar />` and `<main>{children}</main>`
  - STYLE: `flex h-screen bg-slate-950`

Task 3:
CREATE src/app/(dashboard)/[tab]/page.tsx:
  - ACTION: Create 4 folders: deep, context, content, publishing
  - CREATE: `page.tsx` in each with basic placeholder content (Heading + Description)

Task 4:
MODIFY src/app/page.tsx:
  - LOGIC: Import `redirect` from `next/navigation`
  - ACTION: Execute `redirect('/deep')` immediately
```

### Per task pseudocode

#### Task 1: Sidebar Component
```tsx
// src/components/sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define nav items outside component to avoid recreation
const navItems = [
  { href: '/deep', label: 'Deep Research', icon: '🔬' },
  // ... other items
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 p-4">
      {/* Header */}
      <nav>
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              className={isActive ? 'bg-indigo-600...' : 'hover:bg-slate-800...'}
              // ...
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  );
}
```

#### Task 2: Dashboard Layout
```tsx
// src/app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

#### Task 4: Root Redirect
```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/deep');
}
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run linting to check for standard React/Next.js issues
npm run lint

# Check for TypeScript errors
npm run type-check
```

### Level 2: Component Verification
```bash
# Manual verification of sidebar active states
# 1. Start dev server: npm run dev
# 2. Visit http://localhost:3000 -> Should redirect to /deep
# 3. Sidebar "Deep Research" should be highlighted
# 4. Click "Context Research" -> URL changes to /context, Highlight changes
```

### Level 3: E2E Test (Playwright)
```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('has sidebar navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*\/deep/);
  
  await page.click('text=Context Research');
  await expect(page).toHaveURL(/.*\/context/);
  
  // Verify active state class (indigo-600)
  const contextLink = page.getByRole('link', { name: 'Context Research' });
  await expect(contextLink).toHaveClass(/bg-indigo-600/);
});
```

## Final Validation Checklist
- [ ] Root URL redirects to `/deep`.
- [ ] Sidebar is present on all 4 tabs.
- [ ] Content area scrolls independently of sidebar.
- [ ] Active tab is visually distinct.
- [ ] No hydration errors in console.
- [ ] Mobile responsiveness (at least doesn't break, though mobile menu is out of scope for this task).
