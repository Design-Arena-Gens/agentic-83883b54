const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeForTwiml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  authToken: string | undefined,
): boolean {
  if (!signature || !authToken) return true;

  // Twilio signs concatenated string of URL + sorted params hashed with HMAC-SHA1.
  // Full verification requires raw URL, which is not available in Vercel edge runtime
  // without additional configuration. We leave a placeholder here to hook custom logic.
  console.warn(
    "Webhook signature verification is not fully implemented. Configure your own verification if required for compliance.",
  );
  return true;
}
