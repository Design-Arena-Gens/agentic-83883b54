import { NextResponse } from "next/server";
import { generateAgentReply } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const message = String(payload.message ?? "").trim();
    const from = String(payload.from ?? "whatsapp:+15555550123");

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const reply = await generateAgentReply({
      body: message,
      from,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("Simulation failed", error);
    return NextResponse.json(
      { error: "Failed to simulate agent response." },
      { status: 500 },
    );
  }
}
