# Task ID: 6

**Title:** Implement Human-in-the-Loop Approval Workflow

**Status:** pending

**Dependencies:** 1, 4, 5

**Priority:** medium

**Description:** Create the approval workflow using Inngest's wait-for-event pattern (AgentKit Pattern 3) to pause workflows and wait for user approval before proceeding.

**Details:**

1. Create `src/inngest/functions/approval-workflow.ts`:
```typescript
export const approvalWorkflow = inngest.createFunction(
  { id: 'approval-workflow' },
  { event: 'approval.requested' },
  async ({ event, step }) => {
    const { itemId, itemType, userId, sessionId } = event.data;
    
    // Wait for approval (timeout: 7 days)
    const approval = await step.waitForEvent('approval-response', {
      event: 'approval.response',
      match: 'data.itemId',
      timeout: '7d'
    });
    
    if (approval) {
      if (approval.data.approved) {
        // Emit continuation event
        await step.sendEvent('continue-workflow', {
          name: `${itemType}.approved`,
          data: { itemId, approvedBy: approval.data.userId }
        });
      } else {
        // Emit rejection event
        await step.sendEvent('reject-workflow', {
          name: `${itemType}.rejected`,
          data: { itemId, reason: approval.data.reason }
        });
      }
    }
    
    return { approved: approval?.data.approved ?? false };
  }
);
```

2. Create API route `src/app/api/approval/route.ts`:
```typescript
export async function POST(request: Request) {
  const { itemId, approved, reason, userId } = await request.json();
  await inngest.send({
    name: 'approval.response',
    data: { itemId, approved, reason, userId }
  });
  return Response.json({ success: true });
}
```

3. Create approval UI component `src/components/approval-prompt.tsx`:
- Shows pending item details
- Approve/Reject buttons
- Optional rejection reason field

4. Add approval states to content_items and research_jobs tables

**Test Strategy:**

Integration tests simulating approval flow: request → wait → approve/reject → continuation. Test timeout behavior. Test rejection with reason flow.

## Subtasks

### 6.1. Create approval-workflow.ts Inngest function with waitForEvent pattern

**Status:** pending  
**Dependencies:** None  

Implement the core approval workflow Inngest function using step.waitForEvent() pattern to pause execution and wait for user approval decisions with a 7-day timeout.

**Details:**

Create `src/inngest/functions/approval-workflow.ts` with the approvalWorkflow function. The function should: 1) Listen for 'approval.requested' events; 2) Extract itemId, itemType, userId, sessionId from event data; 3) Use step.waitForEvent() to wait for 'approval.response' event with match on 'data.itemId' and 7-day timeout; 4) On approval, emit `${itemType}.approved` event with itemId and approvedBy; 5) On rejection, emit `${itemType}.rejected` event with itemId and reason; 6) Return approval status. Also add the new approval event types to src/inngest/client.ts EventSchemas: 'approval.requested', 'approval.response', 'content.approved', 'content.rejected', 'research.approved', 'research.rejected'. Register the new function in the Inngest serve() handler in src/app/api/inngest/route.ts.

### 6.2. Create /api/approval route for submitting approval decisions

**Status:** pending  
**Dependencies:** 6.1  

Implement the API route that accepts approval/rejection decisions from the UI and emits the approval.response event to Inngest to resume paused workflows.

**Details:**

Create `src/app/api/approval/route.ts` with POST handler. The handler should: 1) Parse request body for itemId, approved (boolean), reason (optional string), userId; 2) Validate required fields (itemId, approved, userId); 3) Use the Inngest client to send 'approval.response' event with data: { itemId, approved, reason, userId }; 4) Return JSON response { success: true } on success; 5) Handle errors with appropriate status codes (400 for validation, 500 for Inngest errors). Also create a corresponding server action in src/app/actions.ts: submitApprovalDecision(itemId, approved, reason, userId) that calls this API endpoint for use with React Server Components.

### 6.3. Create approval-prompt.tsx UI component with approve/reject buttons

**Status:** pending  
**Dependencies:** 6.2  

Build the React UI component that displays pending item details and provides approve/reject buttons with an optional rejection reason field.

**Details:**

Create `src/components/approval-prompt.tsx` component. Props: itemId, itemType, itemTitle, itemDescription, itemContent (the actual content to review), onApprovalComplete callback. Component should: 1) Display item details in a clear review format with title, description, and content preview; 2) Render Approve button (green) and Reject button (red); 3) On reject click, show a textarea for optional rejection reason; 4) Use the submitApprovalDecision server action to send decision; 5) Show loading state during submission; 6) Display success/error feedback; 7) Call onApprovalComplete callback after successful submission. Style with Tailwind CSS consistent with existing components (reference QueryForm.tsx and AgentCard.tsx patterns). Add optional realtime subscription to show if another user is also reviewing.

### 6.4. Add approval status fields and integrate with content/research job updates

**Status:** pending  
**Dependencies:** 6.1, 6.3  

Extend the database schema with approval status fields and update content/research job flows to trigger and respond to approval events.

**Details:**

1) Update Prisma schema (prisma/schema.prisma): Add to ResearchContext model: approvalStatus (enum: 'draft', 'pending_approval', 'approved', 'rejected'), approvalRequestedAt (DateTime?), approvalDecidedAt (DateTime?), approvedBy (String?), rejectionReason (String?). Create new ContentItem model with same approval fields if not exists. 2) Run prisma migrate dev to apply changes. 3) Create approval channel in src/inngest/channels.ts with topics: 'approval-requested', 'approval-decided'. 4) Update content generation workflows to: emit 'approval.requested' event when content is ready for review; listen for 'content.approved'/'content.rejected' events to update status. 5) Create src/app/api/approval/pending/route.ts GET endpoint to list items pending approval for a user. 6) Add ApprovalQueue component showing all pending items with links to individual approval prompts.
