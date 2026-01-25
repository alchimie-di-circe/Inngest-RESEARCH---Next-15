'use server';

import { inngest } from '@/inngest/client';
import { researchChannel } from '@/inngest/channels';
import { getSubscriptionToken } from '@inngest/realtime';
import { db } from '@/lib/db';

export async function submitResearchQuery(query: string, sessionId: string, userId: string) {
  try {
    // Create a ResearchJob entry in the database
    const job = await db.researchJob.create({
      data: {
        jobTitle: query,
        jobBrief: `Research query: ${query}`,
        status: 'PENDING',
      },
    });

    // Send event directly to Inngest from server action
    await inngest.send({
      name: 'research/query.submitted',
      data: {
        query,
        sessionId,
        userId,
        jobId: job.id,
      },
    });

    return { success: true, sessionId, jobId: job.id };
  } catch (error) {
    console.error('Error submitting query:', error);
    return { success: false, error: 'Failed to submit query' };
  }
}

export async function getResearchSubscriptionToken(sessionId: string) {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: researchChannel(sessionId),
      topics: [
        'progress',
        'source-result',
        'contexts',
        'ai-chunk',
        'result',
        'metadata',
        'error',
        'agent-update',
        'agent-chunk',
        'agent-result',
      ],
    });
    return token;
  } catch (error) {
    console.error('Error getting subscription token:', error);
    throw new Error('Failed to get subscription token');
  }
}

export async function getRecentResearchJobs(limit: number = 10) {
  try {
    const jobs = await db.researchJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        jobTitle: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return jobs;
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    return [];
  }
}
