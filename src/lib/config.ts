import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  responseHighlights: z.array(z.string()).default([]),
});

const agentConfigSchema = z.object({
  companyName: z.string().min(1),
  companyDescription: z.string().min(1),
  services: z.array(serviceSchema).min(1),
  tone: z.string().default("friendly and professional"),
  escalationEmail: z.string().email().optional(),
  businessHours: z.string().default("Monday to Friday, 9am - 5pm"),
  fallbacks: z.object({
    generic: z
      .string()
      .default(
        "Thanks for reaching out! I’ll pass this along to our human team and they’ll follow up shortly.",
      ),
    outsideHours: z
      .string()
      .default(
        "Thanks for contacting us. Our team is currently offline, but we’ll respond as soon as we’re back in the office.",
      ),
    escalation: z
      .string()
      .default(
        "This request looks like it needs a specialist. I will connect you with a teammate for further help.",
      ),
  }),
  openAIDefaultModel: z.string().default("gpt-4o-mini"),
  temperature: z.coerce.number().min(0).max(2).default(0.5),
});

export type ServiceDefinition = z.infer<typeof serviceSchema>;
export type AgentConfig = z.infer<typeof agentConfigSchema>;

const fallbackServices: ServiceDefinition[] = [
  {
    name: "General Consultation",
    description:
      "15-minute discovery call to understand client needs and recommend the right service plan.",
    responseHighlights: [
      "Consultations are free to book",
      "Held remotely via Google Meet or WhatsApp call",
      "Available within 1-2 business days",
    ],
  },
  {
    name: "Full-Service Engagement",
    description:
      "Hands-on support package covering strategy, implementation, and ongoing optimization for client projects.",
    responseHighlights: [
      "Projects start within 7 business days after contract signing",
      "Custom proposals sent within 24 hours",
      "Multi-channel communication with dedicated account manager",
    ],
  },
];

function parseJsonEnv<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON environment variable:", error);
    return fallback;
  }
}

export function getAgentConfig(): AgentConfig {
  const rawConfig = {
    companyName:
      process.env.COMPANY_NAME?.trim() ?? "Acme Client Services & Co.",
    companyDescription:
      process.env.COMPANY_DESCRIPTION?.trim() ??
      "We help small and mid-sized businesses streamline their operations with tailored consulting, automation, and customer support solutions.",
    services: parseJsonEnv<ServiceDefinition[]>(
      process.env.COMPANY_SERVICES,
      fallbackServices,
    ),
    tone: process.env.AGENT_TONE?.trim() ?? "warm, clear, and proactive",
    escalationEmail: process.env.AGENT_ESCALATION_EMAIL?.trim(),
    businessHours:
      process.env.AGENT_BUSINESS_HOURS?.trim() ??
      "Monday to Friday • 9:00 – 17:00 (local time)",
    fallbacks: {
      generic:
        process.env.AGENT_FALLBACK_GENERIC ??
        "Thanks for reaching out! I’ll pass this along to our human team and they’ll follow up shortly.",
      outsideHours:
        process.env.AGENT_FALLBACK_OUTSIDE_HOURS ??
        "Thanks for contacting us. Our team is currently offline, but we’ll get back to you as soon as we return.",
      escalation:
        process.env.AGENT_FALLBACK_ESCALATION ??
        "This request looks like it needs a specialist. I will connect you with a teammate for further help.",
    },
    openAIDefaultModel: process.env.OPENAI_MODEL?.trim() ?? "gpt-4o-mini",
    temperature:
      process.env.AGENT_TEMPERATURE !== undefined
        ? Number.parseFloat(process.env.AGENT_TEMPERATURE)
        : 0.5,
  };

  const parsed = agentConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    console.error(
      "Invalid agent configuration detected, falling back to defaults.",
      parsed.error.flatten().fieldErrors,
    );

    return agentConfigSchema.parse({
      companyName: rawConfig.companyName,
      companyDescription: rawConfig.companyDescription,
      services: fallbackServices,
      tone: "warm, clear, and proactive",
      escalationEmail: undefined,
      businessHours: rawConfig.businessHours,
      fallbacks: rawConfig.fallbacks,
      openAIDefaultModel: rawConfig.openAIDefaultModel,
      temperature: 0.5,
    });
  }

  return parsed.data;
}

export function getWhatsAppWebhookSecret(): string | undefined {
  return process.env.WHATSAPP_WEBHOOK_SECRET?.trim();
}
