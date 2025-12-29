import OpenAI from "openai";
import { getAgentConfig, type AgentConfig } from "./config";

type MessageClassification =
  | "lead"
  | "support"
  | "pricing"
  | "off-hours"
  | "not-understood";

export interface AgentReplyInput {
  body: string;
  from: string;
  timestamp?: string;
}

export interface AgentReply {
  reply: string;
  classification: MessageClassification;
  confidence: number;
  escalated: boolean;
}

const client =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    : null;

function buildSystemPrompt(config: AgentConfig): string {
  const services = config.services
    .map(
      (service, index) =>
        `${index + 1}. ${service.name}\nSummary: ${service.description}\nHighlights:\n- ${service.responseHighlights.join("\n- ")}`,
    )
    .join("\n\n");

  return [
    `You are "${config.companyName}" WhatsApp agent.`,
    `Primary mission: respond to inbound client WhatsApp messages with a ${config.tone} tone.`,
    `Business hours: ${config.businessHours}.`,
    `If the client asks for something outside of these services or it's outside business hours, use the fallback messaging.`,
    `Escalation email: ${config.escalationEmail ?? "not provided"}.`,
    "When answering, always do the following:",
    "- Greet clients by name if they provide it or if it's available in metadata.",
    "- Summarize the client's request in one sentence to confirm understanding.",
    "- Present the most relevant service with specifics from the highlights.",
    "- Offer a clear next step (booking a call, requesting details, etc.).",
    "- Keep replies under 1200 characters. Use short paragraphs and bullet points when helpful.",
    "- If escalation is required, clearly state that a human teammate will follow up, and mention the escalation email if present.",
    "- Never invent prices or policies that were not provided.",
    "- If unsure, fall back to the generic fallback message.",
    "",
    "Service catalog:",
    services,
  ].join("\n");
}

function buildUserPrompt(input: AgentReplyInput, config: AgentConfig): string {
  return [
    `Incoming message body:\n${input.body}`,
    `Client phone number: ${input.from}`,
    input.timestamp ? `Received at: ${input.timestamp}` : "",
    "",
    "Return a JSON object with the following shape:",
    `{
  "reply": string,
  "classification": "lead" | "support" | "pricing" | "off-hours" | "not-understood",
  "confidence": number between 0 and 1,
  "escalated": boolean
}`,
    "Use the fallback messages when appropriate:",
    `- Generic fallback: ${config.fallbacks.generic}`,
    `- Outside hours fallback: ${config.fallbacks.outsideHours}`,
    `- Escalation fallback: ${config.fallbacks.escalation}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFallbackReply(
  input: AgentReplyInput,
  config: AgentConfig,
): AgentReply {
  return {
    reply: `${config.fallbacks.generic}\n\n(Automated reply to ${input.from})`,
    classification: "not-understood",
    confidence: 0.35,
    escalated: true,
  };
}

export async function generateAgentReply(
  input: AgentReplyInput,
): Promise<AgentReply> {
  const config = getAgentConfig();

  if (!client) {
    return buildFallbackReply(input, config);
  }

  try {
    const completion = await client.chat.completions.create({
      model: config.openAIDefaultModel,
      temperature: config.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(config),
        },
        {
          role: "user",
          content: buildUserPrompt(input, config),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return buildFallbackReply(input, config);
    }

    const parsed = JSON.parse(raw) as AgentReply;
    return {
      reply: parsed.reply?.trim() ?? config.fallbacks.generic,
      classification: parsed.classification ?? "not-understood",
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(parsed.confidence, 1))
          : 0.5,
      escalated: Boolean(parsed.escalated),
    };
  } catch (error) {
    console.error("Failed to generate agent reply", error);
    return buildFallbackReply(input, config);
  }
}
