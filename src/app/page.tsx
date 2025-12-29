import Link from "next/link";
import { getAgentConfig } from "@/lib/config";
import { WhatsAppPlayground } from "@/components/whatsapp-playground";

export default async function Home() {
  const config = getAgentConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <header className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200 ring-1 ring-white/20">
              WhatsApp Automation
            </p>
            <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
              {config.companyName} — Client Concierge Agent
            </h1>
            <p className="mt-4 text-lg text-slate-200">
              {config.companyDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-blue-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium">
                Tone: {config.tone}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium">
                Hours: {config.businessHours}
              </span>
              {config.escalationEmail ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium">
                  Escalations: {config.escalationEmail}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-16 max-w-6xl space-y-12 px-6 pb-20">
        <WhatsAppPlayground />

        <section className="grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold text-slate-900">
              Service catalog
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The agent prioritises matching incoming intents with the offerings
              below.
            </p>
            <div className="mt-6 space-y-6">
              {config.services.map((service) => (
                <div
                  key={service.name}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {service.description}
                  </p>
                  {service.responseHighlights.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm text-slate-500">
                      {service.responseHighlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <article className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--shadow-card)]">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                WhatsApp setup checklist
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Connect your WhatsApp Business number via Twilio in less than 15
                minutes.
              </p>
              <ol className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    1
                  </span>
                  <span>
                    Activate the{" "}
                    <Link
                      href="https://console.twilio.com/us1/develop/sms/whatsapp/learn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Twilio WhatsApp Sandbox or Business API
                    </Link>{" "}
                    for your phone number.
                  </span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    2
                  </span>
                  <span>
                    Set the incoming message webhook to{" "}
                    <span className="font-semibold text-slate-900">
                      https://agentic-83883b54.vercel.app/api/webhook
                    </span>
                    .
                  </span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    3
                  </span>
                  <span>
                    Add the following environment variables in Vercel to control
                    behaviour:{" "}
                    <code className="rounded-md bg-slate-200 px-1">
                      COMPANY_NAME
                    </code>
                    ,{" "}
                    <code className="rounded-md bg-slate-200 px-1">
                      COMPANY_DESCRIPTION
                    </code>
                    ,{" "}
                    <code className="rounded-md bg-slate-200 px-1">
                      COMPANY_SERVICES
                    </code>
                    ,{" "}
                    <code className="rounded-md bg-slate-200 px-1">
                      OPENAI_API_KEY
                    </code>
                    .
                  </span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    4
                  </span>
                  <span>
                    Test with the sandbox keyword, then graduate the number to
                    production through WhatsApp Business verification.
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-700">
              <h3 className="font-semibold">Need custom flows?</h3>
              <p className="mt-2">
                Extend the agent by editing the prompt logic in{" "}
                <code className="rounded bg-white px-1 py-0.5 text-xs text-blue-600">
                  src/lib/agent.ts
                </code>{" "}
                or integrating with CRMs in a dedicated API route.
              </p>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold text-slate-900">
            Environment variables
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Configure the agent without redeploying by adjusting these values.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="font-semibold text-slate-800">Required</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <code className="rounded bg-white px-1">OPENAI_API_KEY</code> —
                  used to generate agent replies.
                </li>
                <li>
                  <code className="rounded bg-white px-1">COMPANY_NAME</code> —
                  brand used in greetings and closing lines.
                </li>
                <li>
                  <code className="rounded bg-white px-1">
                    COMPANY_DESCRIPTION
                  </code>{" "}
                  — short summary for the system prompt.
                </li>
                <li>
                  <code className="rounded bg-white px-1">COMPANY_SERVICES</code>{" "}
                  — JSON array describing your offerings.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="font-semibold text-slate-800">Optional</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <code className="rounded bg-white px-1">AGENT_TONE</code> —
                  writing style (e.g. “friendly and concise”).
                </li>
                <li>
                  <code className="rounded bg-white px-1">
                    AGENT_BUSINESS_HOURS
                  </code>{" "}
                  — used for off-hours fallbacks.
                </li>
                <li>
                  <code className="rounded bg-white px-1">
                    AGENT_ESCALATION_EMAIL
                  </code>{" "}
                  — informs escalation messaging.
                </li>
                <li>
                  <code className="rounded bg-white px-1">
                    AGENT_TEMPERATURE
                  </code>{" "}
                  — controls creativity in responses.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
