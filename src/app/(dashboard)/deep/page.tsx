'use client';

import { useState } from 'react';
import { QueryForm } from '@/components/QueryForm';
import { RealtimeResearchStatus } from '@/components/RealtimeResearchStatus';
import { submitResearchQuery } from '@/app/actions';

export default function DeepResearchPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const handleSubmit = async (query: string) => {
    setLoading(true);
    setError(null);
    setSubmitted(false);

    const newSessionId = crypto.randomUUID();
    const userId = 'demo-user';

    try {
      const result = await submitResearchQuery(query, newSessionId, userId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit query');
      }
      setCurrentQuery(query);
      setSessionId(newSessionId);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting query:', err);
      setError('Failed to submit query. Make sure the Inngest Dev Server is running.');
    } finally {
      setLoading(false);
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
