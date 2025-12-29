"use client";

import { useCallback, useState } from "react";

interface AgentReply {
  reply: string;
  classification: string;
  confidence: number;
  escalated: boolean;
}

const EXAMPLE_MESSAGES = [
  "Hi! I'm looking for help with automation for our onboarding process.",
  "Can you share pricing for the full service engagement?",
  "I need support with an issue from our last project.",
  "Are you available this Saturday?",
];

export function WhatsAppPlayground() {
  const [input, setInput] = useState(EXAMPLE_MESSAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      const controller = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Request failed");
        }

        const payload = (await response.json()) as AgentReply;
        setReply(payload);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
        setReply(null);
      } finally {
        setIsLoading(false);
      }
    },
    [setReply],
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-blue-500/10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Agent Response Simulator
          </h2>
          <p className="text-sm text-slate-500">
            Send a sample client message to see the automated WhatsApp reply.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const nextIndex = Math.floor(
              Math.random() * EXAMPLE_MESSAGES.length,
            );
            setInput(EXAMPLE_MESSAGES[nextIndex]);
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
        >
          I&apos;m feeling lucky
        </button>
      </header>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Client message
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          placeholder="Type the incoming WhatsApp message from a client…"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          disabled={isLoading || input.trim().length === 0}
          onClick={() => sendMessage(input)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
              Generating reply…
            </>
          ) : (
            "Send to agent"
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      {reply ? (
        <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              Classification: {reply.classification}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700">
              Confidence: {(reply.confidence * 100).toFixed(0)}%
            </span>
            {reply.escalated ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                Escalated to humans
              </span>
            ) : null}
          </div>
          <article className="rounded-2xl border border-white bg-white px-4 py-3 text-sm text-slate-800 shadow-inner">
            <p className="whitespace-pre-line leading-6">{reply.reply}</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
