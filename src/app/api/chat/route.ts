import { NextRequest } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages payload", { status: 400 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // safer model
      messages,
    });

    return Response.json({
      reply: completion.choices[0]?.message?.content || "",
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}