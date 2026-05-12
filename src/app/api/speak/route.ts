import { SarvamAIClient } from "sarvamai";

export const runtime = "nodejs";

const MAX_TTS_CHARS = 2500;

function getSarvamApiKey() {
  return process.env.SARVAM_API_KEY || process.env.SARVAM_API_SUBSCRIPTION_KEY;
}

function cleanTextForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

export async function POST(request: Request) {
  const apiSubscriptionKey = getSarvamApiKey();

  if (!apiSubscriptionKey) {
    return Response.json({ error: "SARVAM_API_KEY is not configured." }, { status: 500 });
  }

  let payload: { text?: unknown };

  try {
    payload = (await request.json()) as { text?: unknown };
  } catch {
    return Response.json({ error: "Please send text as JSON." }, { status: 400 });
  }

  if (typeof payload.text !== "string") {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }

  const text = cleanTextForSpeech(payload.text);

  if (!text) {
    return Response.json({ error: "No readable text to speak." }, { status: 422 });
  }

  const client = new SarvamAIClient({ apiSubscriptionKey });

  try {
    const result = await client.textToSpeech.convert({
      text,
      target_language_code: "en-IN",
      model: "bulbul:v3",
      speaker: "shubh",
      pace: 1,
      output_audio_codec: "wav",
    });

    const audio = result.audios[0];

    if (!audio) {
      return Response.json({ error: "No audio returned." }, { status: 502 });
    }

    return new Response(Buffer.from(audio, "base64"), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Sarvam text-to-speech error", error);
    return Response.json({ error: "Could not generate speech. Please try again." }, { status: 502 });
  }
}
