'use client';

import { useState, useEffect } from 'react';
import { QueryForm } from '@/components/QueryForm';
import { RealtimeResearchStatus } from '@/components/RealtimeResearchStatus';
import { submitResearchQuery, getRecentResearchJobs } from '@/app/actions';

interface RecentJob {
  id: string;
  jobTitle: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DeepResearchPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const loadRecentJobs = async () => {
    setLoadingJobs(true);
    const jobs = await getRecentResearchJobs(5);
    setRecentJobs(jobs as RecentJob[]);
    setLoadingJobs(false);
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setSubmitted(false);

    const newSessionId = crypto.randomUUID();

    try {
      const result = await submitResearchQuery(query, newSessionId);
      if (controller.signal.aborted) return;

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit query');
      }
      setCurrentQuery(query);
      setSessionId(newSessionId);
      setSubmitted(true);
      await loadRecentJobs();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Query submission was aborted.');
        return;
      }
      if (controller.signal.aborted) return;
      console.error('Error submitting query:', err);
      setError('Failed to submit query. Make sure the Inngest Dev Server is running.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Deep Research</h2>
        <p className="mt-2 text-slate-300">
          Start deep research workflows and track multi-step analysis here.
        </p>
      </div>

      <QueryForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {submitted && sessionId && currentQuery && (
        <RealtimeResearchStatus sessionId={sessionId} query={currentQuery} />
      )}

      {!loadingJobs && recentJobs.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Recent Jobs</h3>
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-600"
              >
                <div className="flex-1">
                  <p className="text-white font-medium truncate">{job.jobTitle}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      job.status === 'COMPLETED'
                        ? 'bg-green-900/30 text-green-300'
                        : job.status === 'RUNNING'
                          ? 'bg-blue-900/30 text-blue-300'
                          : job.status === 'FAILED'
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-yellow-900/30 text-yellow-300'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !submitted && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Getting Started</h3>
          <div className="space-y-4 text-slate-300">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Set up environment variables</h4>
              <p className="text-sm text-slate-400">
                Copy <code className="text-indigo-400">.env.example</code> to{' '}
                <code className="text-indigo-400">.env.local</code> and add your API keys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Start the Inngest Dev Server</h4>
              <p className="text-sm text-slate-400 mb-1">Run in a separate terminal:</p>
              <code className="block bg-slate-900 p-2 rounded text-sm text-indigo-400">
                npx inngest-cli@latest dev
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Try a sample query</h4>
              <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                <li>What are the latest advances in transformer architectures?</li>
                <li>Explain retrieval-augmented generation</li>
                <li>How does rate limiting work in distributed systems?</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
