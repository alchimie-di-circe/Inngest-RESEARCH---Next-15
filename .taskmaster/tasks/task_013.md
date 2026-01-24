# Task ID: 13

**Title:** Implement Real-Time Streaming for All Phases

**Status:** pending

**Dependencies:** 2, 4, 5, 7, 9

**Priority:** medium

**Description:** Extend the existing Inngest realtime channels to support streaming updates across all 4 phases (Deep, Context, Content, Publishing) with unified progress tracking.

**Details:**

1. Extend `src/inngest/channels.ts` with phase-specific topics:
```typescript
// Add to existing researchChannel
.addTopic(topic('deep-progress').type<{
  stage: 'staging' | 'reasoning' | 'reporting';
  progress: number; // 0-100
  message: string;
  timestamp: string;
}>())
.addTopic(topic('context-progress').type<{
  stage: 'analysis' | 'brand-matching' | 'synthesis';
  progress: number;
  message: string;
  timestamp: string;
}>())
.addTopic(topic('content-progress').type<{
  stage: 'writing' | 'designing' | 'approval';
  contentType: ContentType;
  progress: number;
  message: string;
  timestamp: string;
}>())
.addTopic(topic('publishing-progress').type<{
  platform: Platform;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  message: string;
  timestamp: string;
}>())
```

2. Create unified progress component `src/components/phase-progress.tsx`:
```tsx
export function PhaseProgress({ sessionId, phase }: { sessionId: string; phase: Phase }) {
  const { freshData } = useInngestSubscription({
    refreshToken: () => getProgressToken(sessionId, phase)
  });
  
  return (
    <div className="progress-container">
      {/* Render phase-specific progress UI */}
    </div>
  );
}
```

3. Create `src/components/stream-status.tsx` showing combined status across all phases

4. Update each phase page to include PhaseProgress component

5. Ensure all agent functions publish progress updates at key steps

**Test Strategy:**

Component tests for progress rendering with various states. Integration tests verifying realtime updates are received correctly. E2E test watching full workflow progress from start to finish.
