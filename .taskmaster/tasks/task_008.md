# Task ID: 8

**Title:** Implement Canva MCP Integration for Design Generation

**Status:** pending

**Dependencies:** 3, 7

**Priority:** medium

**Description:** Integrate Canva MCP server for automated design creation aligned with brand guidelines per PRD Feature 3.2, using AgentKit Pattern 6.

**Details:**

1. Create MCP client for Canva at `src/lib/mcp/canva-client.ts`:
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export class CanvaMCPClient {
  private client: Client;
  
  async createDesign(params: {
    copy: string;
    brandColors: { primary: string; secondary: string };
    logoUrl?: string;
    designType: 'social_post' | 'carousel' | 'banner';
  }) {
    const result = await this.client.callTool({
      name: 'create_design',
      arguments: params
    });
    return result;
  }
  
  async applyBrandKit(designId: string, brandId: string) {
    // Apply brand colors, fonts, logo
  }
}
```

2. Create `src/inngest/functions/canva-agent.ts`:
```typescript
export const canvaDesignAgent = inngest.createFunction(
  { id: 'canva-design-agent' },
  { event: 'content.design.requested' },
  async ({ event, step }) => {
    const { contentItemId, brandId } = event.data;
    
    const [content, brand] = await Promise.all([
      step.run('fetch-content', () => prisma.contentItem.findUnique({...})),
      step.run('fetch-brand', () => prisma.brandConfig.findUnique({...}))
    ]);
    
    const design = await step.run('create-design', async () => {
      const canva = new CanvaMCPClient();
      return await canva.createDesign({
        copy: content.copy,
        brandColors: brand.brandColors,
        logoUrl: brand.logoUrl,
        designType: mapContentTypeToDesign(content.contentType)
      });
    });
    
    // Update content item with design assets
    await step.run('save-design', async () => {
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: { designAssets: design }
      });
    });
    
    return design;
  }
);
```

3. Add Canva environment variables to `.env.example`:
- CANVA_API_KEY
- CANVA_API_SECRET

4. Update Content tab UI to show design previews alongside copy

**Test Strategy:**

Mock Canva MCP responses for unit tests. Integration test with actual Canva API in sandbox environment. Verify design assets are correctly stored and retrievable.
