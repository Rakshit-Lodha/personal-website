import mammoth from "mammoth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function extensionFor(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

async function parsePdf(buffer: Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text;
}

async function parseDocx(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File must be 10MB or smaller." }, { status: 400 });
  }

  const extension = extensionFor(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";

    if (extension === "txt") {
      text = buffer.toString("utf-8");
    } else if (extension === "pdf") {
      text = await parsePdf(buffer);
    } else if (extension === "docx") {
      text = await parseDocx(buffer);
    } else {
      return Response.json({ error: "Please upload a PDF, DOCX, or TXT file." }, { status: 400 });
    }

    const cleaned = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!cleaned) {
      return Response.json({ error: "Could not extract text from this file." }, { status: 422 });
    }

    return Response.json({ text: cleaned });
  } catch (error) {
    console.error("JD parse error", error);
    return Response.json({ error: "Could not parse this file. Please paste the JD text instead." }, { status: 422 });
  }
}
