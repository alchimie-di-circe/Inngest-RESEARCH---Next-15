# PRP: Task 3 - Implement Brand Configuration Management

## Goal
Implement a robust Brand Configuration Management system allowing users to create, read, update, and delete (CRUD) brand profiles. Each profile includes detailed settings for tone of voice, brand colors, logo, and platform history, acting as the "context engine" for downstream content generation.

## Why
- **Foundation for Agents**: The "Context Research" and "Content Writer" agents (Tasks 5 & 7) depend entirely on these configurations to generate on-brand content.
- **User Control**: Enables users to manage multiple brand personas (e.g., "Personal Brand" vs "Company Blog").
- **Schema Alignment**: Ensures the database schema fully supports the detailed requirements defined in `tasks.json` (fixing discrepancies from the initial Task 1 implementation).

## What
- **API Routes**: Next.js 15 App Router endpoints (`/api/brand`, `/api/brand/[id]`) for CRUD operations.
- **UI Components**:
    - `BrandForm`: A comprehensive React Hook Form with validation (Zod) for editing brand details.
    - `BrandList`: A card-based grid view of available brands.
    - `BrandSelector`: A reusable dropdown for selecting the active brand context.
- **Data Model**: Update `BrandConfig` in Prisma to include `brandColors`, `logoUrl`, and `platformHistory`.

### Success Criteria
- [ ] Prisma schema updated and synced (`brandColors`, `logoUrl` added).
- [ ] API Routes return 200/201/404/500 correctly with Zod validation.
- [ ] `BrandForm` successfully creates and updates brands including JSON fields (colors).
- [ ] `BrandList` displays all brands with correct styling (Dark Mode).
- [ ] `BrandSelector` allows selection and propagates state.
- [ ] Integration tests (TestSprite) pass for the full CRUD flow.

---

## All Needed Context

### Documentation & References
```yaml
# Tech Stack Documentation
- url: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
  why: "Official guide for Next.js 15 App Router API Routes (Route Handlers)."

- url: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#serverless-environments-faas
  why: "Prisma Client instantiation pattern for serverless (Neon) to prevent connection exhaustion."
  critical: "Must use the singleton pattern defined in src/lib/db.ts."

- url: https://zod.dev/?id=basic-usage
  why: "Schema validation for API requests and Form inputs."

- url: https://react-hook-form.com/get-started
  why: "Standard form state management for BrandForm."

# Project Context
- file: src/lib/db.ts
  why: "Existing Prisma Client singleton. Use `import { db } from '@/lib/db'`."

- file: src/components/sidebar.tsx
  why: "Reference for UI styling (Tailwind classes, Dark Mode palette)."

- file: prisma/schema.prisma
  why: "Current database definition. Needs update."
```

### Current Codebase Structure (Relevant)
```bash
src/
├── app/
│   ├── api/              # API Routes
│   └── (dashboard)/      # Dashboard Pages
├── components/           # UI Components (Sidebar exists here)
├── lib/
│   └── db.ts             # Prisma Client
└── types/                # TS Interfaces
```

### Desired Structure Additions
```bash
src/
├── app/
│   └── api/
│       └── brand/
│           ├── route.ts       # GET (list), POST (create)
│           └── [id]/
│               └── route.ts   # GET (one), PUT (update), DELETE
├── components/
│   └── brand/
│       ├── brand-form.tsx     # Client form component
│       ├── brand-list.tsx     # List/Grid view
│       └── brand-selector.tsx # Dropdown component
└── types/
    └── brand.ts               # Zod schemas & TS types
```

### Known Gotchas
- **Prisma Schema Discrepancy**: The current `schema.prisma` has `brandName`/`brandTone` but `tasks.json` requests `name`/`tovGuidelines` and adds `brandColors` (JSON). **ACTION**: We must update the schema first.
- **Next.js 15 Caching**: Route Handlers are cached by default for GET requests. **ACTION**: Use `export const dynamic = 'force-dynamic'` in route files if we want real-time DB data, or standard revalidation. Given this is a dashboard, `force-dynamic` is safer for now.
- **Dark Mode**: Tailwind v4 is used. Ensure all new components use `slate-900`/`slate-800` colors to match `Sidebar`.

---

## Implementation Blueprint

### 1. Data Model & Types
**Step 1: Update Prisma Schema**
Modify `BrandConfig` in `prisma/schema.prisma` to match the robust requirements.
```prisma
model BrandConfig {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Updated fields
  name            String   // Was brandName
  tovGuidelines   String?  @db.Text // Tone of Voice
  brandKnowledge  Json?    // Key facts/context
  platformHistory Json?    // { twitter: [], linkedin: [] }
  brandColors     Json?    // { primary: '#...', secondary: '#...' }
  logoUrl         String?

  jobs            ResearchJob[]
  
  @@index ([name])
}
```

**Step 2: Zod Schemas (`src/types/brand.ts`)**
```typescript
import { z } from 'zod';

export const BrandColorsSchema = z.object({
  primary: z.string().min(1),
  secondary: z.string().min(1),
  accent: z.string().optional(),
});

export const CreateBrandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tovGuidelines: z.string().optional(),
  brandColors: BrandColorsSchema.optional(),
  logoUrl: z.string().url().optional().or(z.literal('')), 
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
```

### 2. Implementation Tasks

#### Task 3.1: Dependencies & Schema
- [ ] **Install Zod**: `npm install zod react-hook-form @hookform/resolvers`
- [ ] **Update Schema**: Edit `prisma/schema.prisma`.
- [ ] **Migrate**: Run `npx prisma db push` (In Container/Cloud).
- [ ] **Generate**: Run `npx prisma generate` (In Container/Cloud).

#### Task 3.2: API Routes
- [ ] **Create `src/app/api/brand/route.ts`**:
    - `GET`: Fetch all brands.
    - `POST`: Validate body with `CreateBrandSchema`, create via Prisma.
- [ ] **Create `src/app/api/brand/[id]/route.ts`**:
    - `GET`: Fetch single.
    - `PUT`: Update.
    - `DELETE`: Delete.

#### Task 3.3: Frontend Components
- [ ] **Create `src/components/brand/brand-form.tsx`**:
    - Use `useForm` with `zodResolver`.
    - Styled with Tailwind (Dark Mode).
- [ ] **Create `src/components/brand/brand-list.tsx`**:
    - Fetch data (client-side `useEffect` or SWR/TanStack Query if available, or simple fetch). *Simple fetch for now*.
- [ ] **Create `src/components/brand/brand-selector.tsx`**:
    - Simple `<select>` or custom dropdown styled to match sidebar.

#### Task 3.4: Integration
- [ ] **Update Dashboard Page**: Add these components to `src/app/(dashboard)/context/page.tsx` (or where appropriate) to verify they work.

---

## Validation Loop

### Level 1: Syntax & Schema
```bash
# Verify Schema
npx prisma validate

# Type Check
npx tsc --noEmit
```

### Level 2: Unit/Component Tests (Wallaby Compatible)
Create `src/components/brand/brand-form.test.tsx` (mocking fetch).
```typescript
// Basic smoke test
import { render, screen } from '@testing-library/react';
import { BrandForm } from './brand-form';

test('renders form fields', () => {
  render(<BrandForm />);
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
});
```

### Level 3: Integration (TestSprite/Container)
Inside the Dagger container or TestSprite sandbox:
```bash
# 1. Start Server
npm run dev

# 2. Test API
curl -X POST http://localhost:3000/api/brand \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Brand", "tovGuidelines": "Professional"}'
# Expect: 200 OK and JSON response
```

---

## Final Checklist
- [ ] Zod installed and configured.
- [ ] Prisma schema updated to support `brandColors`.
- [ ] API Routes functional and validated.
- [ ] UI components match Dark Theme (`bg-slate-900`).
- [ ] No type errors.

```