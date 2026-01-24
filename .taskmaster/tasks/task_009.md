# Task ID: 9

**Title:** Implement Multi-Channel Publishing Agents

**Status:** pending

**Dependencies:** 1, 6, 7

**Priority:** medium

**Description:** Create individual publisher agents for Shopify, Twitter, LinkedIn, and Instagram with platform-specific API integrations per PRD Feature 4.1.

**Details:**

1. Create platform-specific publisher agents:

`src/inngest/functions/publishers/shopify-publisher.ts`:
```typescript
export const shopifyPublisher = inngest.createFunction(
  { id: 'shopify-publisher' },
  { event: 'publishing.shopify.requested' },
  async ({ event, step }) => {
    const { contentItemId } = event.data;
    
    const content = await step.run('fetch-content', () => 
      prisma.contentItem.findUnique({ where: { id: contentItemId } })
    );
    
    const result = await step.run('publish-to-shopify', async () => {
      const shopify = new ShopifyClient({
        storeUrl: process.env.SHOPIFY_STORE_URL,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN
      });
      
      if (content.contentType === 'blog_post') {
        return await shopify.blog.createArticle({...});
      } else {
        return await shopify.products.update({...});
      }
    });
    
    return result;
  }
);
```

2. Create `src/inngest/functions/publishers/social-publisher.ts` for Twitter/LinkedIn/Instagram

3. Create API client wrappers in `src/lib/api-clients/`:
- `shopify.ts` - Shopify Admin API
- `twitter.ts` - Twitter API v2
- `linkedin.ts` - LinkedIn Marketing API
- `instagram.ts` - Instagram Graph API (via Meta)

4. Add all required API keys to `.env.example`

5. Create Publishing page showing:
- All approved content ready for publishing
- Platform selection checkboxes
- Schedule date picker
- Publish button

**Test Strategy:**

Mock all external APIs for unit tests. Integration tests using sandbox/test accounts for each platform. Verify error handling for API rate limits and failures.
