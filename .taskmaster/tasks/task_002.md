# Task ID: 2

**Title:** Create Dashboard Layout with 4-Tab Navigation

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Implement the dashboard shell with sidebar navigation and 4 phase tabs (Deep Research, Context Research, Content Generation, Publishing) using Next.js 15 app router.

**Details:**

Create the dashboard structure:

1. Create `src/app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
```

2. Create `src/components/sidebar.tsx` with navigation links for 4 tabs:
- Deep Research (`/deep`)
- Context Research (`/context`)
- Content Generation (`/content`)
- Publishing (`/publishing`)

3. Create page stubs:
- `src/app/(dashboard)/deep/page.tsx`
- `src/app/(dashboard)/context/page.tsx`
- `src/app/(dashboard)/content/page.tsx`
- `src/app/(dashboard)/publishing/page.tsx`

4. Update `src/app/page.tsx` to redirect to `/deep` or show project selection

Use Tailwind classes consistent with existing dark theme (slate-950, slate-800, etc.)

**Test Strategy:**

Create component tests for Sidebar using React Testing Library. Verify navigation links render correctly. E2E test with Playwright to verify tab switching works and maintains URL state.

## Subtasks

### 2.1. Create Dashboard Route Group with Layout

**Status:** pending  
**Dependencies:** None  

Create the (dashboard) route group directory structure and implement the layout.tsx file with flex container for sidebar and main content area.

**Details:**

Create `src/app/(dashboard)/layout.tsx` with the following structure:

1. Create directory: `src/app/(dashboard)/`
2. Implement layout.tsx as a server component:
```tsx
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
```

Key implementation details:
- Use `h-screen` for full viewport height
- Use `flex` layout with sidebar on left, main content on right
- Apply `bg-slate-950` to match existing dark theme pattern from current page.tsx
- Main area uses `flex-1` to take remaining space, `overflow-auto` for scrolling, `p-6` for consistent padding
- Import Sidebar from @/components/sidebar (to be created in subtask 2)

### 2.2. Create Sidebar Navigation Component

**Status:** pending  
**Dependencies:** 2.1  

Implement the Sidebar component with navigation links for the 4 phase tabs using existing dark theme patterns (slate-950, slate-800, indigo accents).

**Details:**

Create `src/components/sidebar.tsx` as a client component:

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/deep', label: 'Deep Research', icon: '🔬' },
  { href: '/context', label: 'Context Research', icon: '📋' },
  { href: '/content', label: 'Content Generation', icon: '✍️' },
  { href: '/publishing', label: 'Publishing', icon: '📤' },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Research Suite</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

Theme patterns from codebase:
- `bg-slate-900` for sidebar background (nested bg level)
- `border-r border-slate-700` for right border
- `text-white` for headings, `text-slate-400` for inactive links
- `bg-indigo-600 text-white` for active state (matches button pattern)
- `hover:bg-slate-800 hover:text-white` for hover states
- `transition-colors` for smooth transitions

### 2.3. Create Page Stubs and Root Redirect

**Status:** pending  
**Dependencies:** 2.1, 2.2  

Create the 4 page stub files for /deep, /context, /content, /publishing routes and update root page.tsx to redirect to /deep as the default tab.

**Details:**

1. Create 4 page stubs in the (dashboard) route group:

`src/app/(dashboard)/deep/page.tsx`:
```tsx
export default function DeepResearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Deep Research</h1>
      <p className="text-slate-400">Multi-agent staging → reasoning → reporting pipeline</p>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <p className="text-slate-300">Deep Research interface coming soon...</p>
      </div>
    </div>
  );
}
```

`src/app/(dashboard)/context/page.tsx`:
```tsx
export default function ContextResearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Context Research</h1>
      <p className="text-slate-400">Multi-source gathering + brand contextualization</p>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <p className="text-slate-300">Context Research interface coming soon...</p>
      </div>
    </div>
  );
}
```

`src/app/(dashboard)/content/page.tsx`:
```tsx
export default function ContentGenerationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Content Generation</h1>
      <p className="text-slate-400">Unified text + design creation</p>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <p className="text-slate-300">Content Generation interface coming soon...</p>
      </div>
    </div>
  );
}
```

`src/app/(dashboard)/publishing/page.tsx`:
```tsx
export default function PublishingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Publishing</h1>
      <p className="text-slate-400">Automated distribution to platforms</p>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <p className="text-slate-300">Publishing interface coming soon...</p>
      </div>
    </div>
  );
}
```

2. Update `src/app/page.tsx` to redirect to /deep:
```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/deep');
}
```

Alternatively, keep existing content but add a link to dashboard, or use `next.config.ts` redirects.
