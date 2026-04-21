import { NextRequest } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Log environment check
    console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages payload", { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set");
      return new Response("API key not configured", { status: 500 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return Response.json({
      reply,
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
        reply: "Sorry, I'm having trouble responding right now. Please try again."
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}