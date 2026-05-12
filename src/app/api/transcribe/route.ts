import { SarvamAIClient } from "sarvamai";

export const runtime = "nodejs";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

function getSarvamApiKey() {
  return process.env.SARVAM_API_KEY || process.env.SARVAM_API_SUBSCRIPTION_KEY;
}

function getSupportedAudioType(type: string) {
  const mimeType = type.split(";")[0]?.trim().toLowerCase();

  if (mimeType === "audio/webm" || mimeType === "video/webm") return mimeType;
  if (mimeType === "audio/mp4" || mimeType === "audio/x-m4a") return mimeType;
  if (mimeType === "audio/mpeg" || mimeType === "audio/mp3") return mimeType;
  if (mimeType === "audio/wav" || mimeType === "audio/x-wav" || mimeType === "audio/wave") return mimeType;
  if (mimeType === "audio/ogg" || mimeType === "audio/opus") return mimeType;

  return "audio/webm";
}

export async function POST(request: Request) {
  const apiSubscriptionKey = getSarvamApiKey();

  if (!apiSubscriptionKey) {
    return Response.json({ error: "SARVAM_API_KEY is not configured." }, { status: 500 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Please upload audio as multipart form data." }, { status: 400 });
  }

  const audio = formData.get("audio");

  if (!(audio instanceof File)) {
    return Response.json({ error: "No audio uploaded." }, { status: 400 });
  }

  if (audio.size > MAX_AUDIO_SIZE) {
    return Response.json({ error: "Audio must be 25MB or smaller." }, { status: 400 });
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const client = new SarvamAIClient({ apiSubscriptionKey });
  const contentType = getSupportedAudioType(audio.type);

  try {
    const result = await client.speechToText.transcribe({
      file: {
        data: buffer,
        filename: audio.name || "voice-message.webm",
        contentType,
        contentLength: audio.size,
      },
      model: "saaras:v3",
      mode: "transcribe",
      language_code: "unknown",
    });

    const transcript = result.transcript.trim();

    if (!transcript) {
      return Response.json({ error: "No speech detected. Please try again." }, { status: 422 });
    }

    return Response.json({
      transcript,
      languageCode: result.language_code ?? null,
      languageProbability: result.language_probability ?? null,
    });
  } catch (error) {
    console.error("Sarvam transcription error", error);
    return Response.json({ error: "Could not transcribe this audio. Please try again." }, { status: 502 });
  }
}
