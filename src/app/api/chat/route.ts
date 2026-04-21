import { NextRequest } from "next/server";
import Groq from "groq-sdk";

// Corporate SSL-inspection proxy workaround — disable for dev only
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Invalid messages payload", { status: 400 });
  }

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are an advanced real-time AI assistant designed for fast, accurate, and helpful responses.

Core behavior:
- Respond instantly with clear, concise, and useful answers.
- Maintain a friendly, natural conversational tone.
- Adapt responses based on user intent (casual, technical, business, etc.).
- Ask clarifying questions when needed, but avoid unnecessary back-and-forth.

Capabilities:
- Provide step-by-step explanations when helpful.
- Summarize long information into digestible responses.
- Offer actionable suggestions, not just theory.
- Handle multi-turn conversations with context awareness.

Constraints:
- Do not hallucinate facts. If unsure, say so.
- Avoid overly long responses unless explicitly requested.
- Prioritize correctness, speed, and clarity.`,
      },
      ...messages,
    ],
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          controller.enqueue(encoder.encode(delta));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
