# Task ID: 3

**Title:** Implement Brand Configuration Management

**Status:** pending

**Dependencies:** 1

**Priority:** high

**Description:** Create API routes and UI for managing brand configurations including tone of voice guidelines, brand colors, and platform history storage.

**Details:**

1. Create API routes at `src/app/api/brand/route.ts`:
```typescript
// GET - List all brand configs
// POST - Create new brand config
export async function GET(request: Request) {
  const brands = await prisma.brandConfig.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return Response.json(brands);
}

export async function POST(request: Request) {
  const body = await request.json();
  const brand = await prisma.brandConfig.create({ data: body });
  return Response.json(brand);
}
```

2. Create `src/app/api/brand/[id]/route.ts` for GET/PUT/DELETE by ID

3. Create types in `src/types/brand.ts`:
```typescript
export interface BrandConfig {
  id: string;
  name: string;
  tovGuidelines?: string;
  brandKnowledge?: Record<string, unknown>;
  platformHistory?: {
    twitter?: string[];
    linkedin?: string[];
    shopify?: string[];
  };
  brandColors?: { primary: string; secondary: string; accent: string };
  logoUrl?: string;
}
```

4. Create UI components:
- `src/components/brand/brand-form.tsx` - Form for creating/editing brands
- `src/components/brand/brand-list.tsx` - List view of all brands
- `src/components/brand/brand-selector.tsx` - Dropdown for selecting active brand

**Test Strategy:**

Unit tests for API routes using mocked Prisma client. Integration tests verifying CRUD operations against test database. Component tests for form validation and submission.

## Subtasks

### 3.1. Create Brand API Routes with CRUD Operations

**Status:** pending  
**Dependencies:** None  

Implement the API routes at /api/brand and /api/brand/[id] for full CRUD operations on brand configurations, following the existing server action patterns in the codebase.

**Details:**

Create two API route files following existing patterns:

1. `src/app/api/brand/route.ts`:
   - GET: List all brand configs using `prisma.brandConfig.findMany({ orderBy: { createdAt: 'desc' } })`
   - POST: Create new brand config with validation using `prisma.brandConfig.create({ data: body })`

2. `src/app/api/brand/[id]/route.ts`:
   - GET: Fetch single brand by ID using `prisma.brandConfig.findUnique({ where: { id } })`
   - PUT: Update brand config using `prisma.brandConfig.update({ where: { id }, data: body })`
   - DELETE: Remove brand config using `prisma.brandConfig.delete({ where: { id } })`

Follow the existing error handling patterns seen in the codebase. Return appropriate HTTP status codes (200, 201, 404, 500). Use Response.json() for all responses. Ensure routes handle edge cases like missing brand IDs and validation errors.

### 3.2. Define BrandConfig TypeScript Interface and Types

**Status:** pending  
**Dependencies:** None  

Create comprehensive TypeScript type definitions for BrandConfig interface in src/types/brand.ts, including all brand-related types for API contracts and component props.

**Details:**

Create `src/types/brand.ts` with the following type definitions:

```typescript
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface PlatformHistory {
  twitter?: string[];
  linkedin?: string[];
  shopify?: string[];
}

export interface BrandConfig {
  id: string;
  name: string;
  tovGuidelines?: string;
  brandKnowledge?: Record<string, unknown>;
  platformHistory?: PlatformHistory;
  brandColors?: BrandColors;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrandConfigInput {
  name: string;
  tovGuidelines?: string;
  brandKnowledge?: Record<string, unknown>;
  platformHistory?: PlatformHistory;
  brandColors?: BrandColors;
  logoUrl?: string;
}

export interface UpdateBrandConfigInput extends Partial<CreateBrandConfigInput> {}
```

Follow the existing interface-based pattern seen in `src/inngest/types.ts`. Export all types for use across API routes, components, and Inngest functions.

### 3.3. Build BrandForm Component with Full Field Support

**Status:** pending  
**Dependencies:** 3.2  

Create brand-form.tsx component in src/components/brand/ with form fields for name, TOV guidelines, brand colors (primary/secondary/accent), logo URL, and platform history.

**Details:**

Create `src/components/brand/brand-form.tsx` following existing component patterns (QueryForm.tsx style):

1. Use 'use client' directive for client-side interactivity
2. Props interface: `{ initialData?: BrandConfig; onSubmit: (data: CreateBrandConfigInput) => Promise<void>; isLoading?: boolean }`
3. Form fields using controlled components with useState:
   - Name input (required, text)
   - TOV Guidelines textarea (optional, multiline)
   - Logo URL input (optional, URL validation)
   - Brand Colors section with 3 color pickers (primary, secondary, accent)
   - Platform History JSON editor or structured inputs for twitter/linkedin/shopify arrays
4. Apply existing dark theme styling:
   - Container: `bg-slate-800 rounded-lg p-6 border border-slate-700`
   - Inputs: `w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-indigo-500`
   - Submit button: `px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50`
5. Include form validation for required fields and URL format
6. Handle both create and edit modes based on initialData prop

### 3.4. Create BrandList and BrandSelector Dropdown Components

**Status:** pending  
**Dependencies:** 3.2  

Build brand-list.tsx for displaying all brands in a list/card view and brand-selector.tsx dropdown component for selecting the active brand in the research workflow.

**Details:**

Create two components in `src/components/brand/`:

**1. brand-list.tsx:**
- Props: `{ brands: BrandConfig[]; onEdit?: (id: string) => void; onDelete?: (id: string) => void; selectedId?: string }`
- Display brands in card layout following AgentCard.tsx pattern
- Each card shows: name, TOV preview (truncated), color swatches, logo thumbnail
- Include edit and delete action buttons with confirmation for delete
- Apply dark theme: `bg-slate-800 rounded-lg border border-slate-700`
- Show empty state when no brands exist

**2. brand-selector.tsx:**
- Props: `{ brands: BrandConfig[]; selectedBrandId?: string; onSelect: (brandId: string) => void; disabled?: boolean }`
- Dropdown/select component for choosing active brand
- Show brand name and color preview in options
- Style: `w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700`
- Include 'None' option for no brand selection
- Used in Context Research tab for applying brand context

Both components should be keyboard accessible and follow existing styling conventions.
