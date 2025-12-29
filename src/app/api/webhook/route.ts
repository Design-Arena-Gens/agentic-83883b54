import { NextResponse } from "next/server";
import { generateAgentReply } from "@/lib/agent";
import { escapeForTwiml, verifyWebhookSignature } from "@/lib/twilio";
import { getWhatsAppWebhookSecret } from "@/lib/config";

export const runtime = "nodejs";

function buildTwiml(body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeForTwiml(body)}</Message></Response>`;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature =
    request.headers.get("x-twilio-signature") ??
    request.headers.get("X-Twilio-Signature");

  if (
    !verifyWebhookSignature(raw, signature, getWhatsAppWebhookSecret()) &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json(
      { error: "Invalid Twilio signature" },
      { status: 401 },
    );
  }

  const params = new URLSearchParams(raw);
  const body = params.get("Body") ?? "";
  const from = params.get("From") ?? "unknown";
  const timestamp = params.get("Timestamp") ?? undefined;

  if (!body) {
    return NextResponse.json(
      { error: "Message body is required" },
      { status: 400 },
    );
  }

  const agentReply = await generateAgentReply({
    body,
    from,
    timestamp,
  });

  return new Response(buildTwiml(agentReply.reply), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
