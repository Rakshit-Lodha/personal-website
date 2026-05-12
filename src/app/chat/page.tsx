"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Paperclip, X } from "lucide-react";
import Nav from "@/components/Nav";
import type { AgentMode, AgentStreamEvent } from "@/lib/agent/types";

const PROMPT_CHIPS = [
  "Drop a JD to see if Rakshit fits this role",
  "Walk me through the most technical thing he's built",
  "Where would he NOT be a good hire?",
  "What kind of role is he looking for?",
];

const AGENT_AVATAR_URL = "/rakshit-avatar.jpeg";
const DEFAULT_FILE_PROMPT = "Assess fit against the attached job description.";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type UploadedFile = {
  name: string;
  text: string;
  status: string;
  error?: string;
};

let messageCounter = 0;

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `chat-message-${messageCounter++}`;
}

function extensionFor(fileName: string) {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? "";
}

function isFitPrompt(text: string) {
  const normalized = text.toLowerCase();
  return (
    normalized.length > 500 ||
    normalized.includes("job description") ||
    normalized.includes(" jd") ||
    normalized.includes("role") ||
    normalized.includes("fit") ||
    normalized.includes("hiring") ||
    normalized.includes("requirements") ||
    normalized.includes("responsibilities")
  );
}

function getPromptMode(text: string, hasFile: boolean): Exclude<AgentMode, "auto"> {
  if (hasFile) return "fit";

  const normalized = text.toLowerCase();
  const hasGeneralQuestionSignal =
    normalized.includes("background") ||
    normalized.includes("experience") ||
    normalized.includes("project") ||
    normalized.includes("outcome") ||
    normalized.includes("achievement") ||
    normalized.includes("skill") ||
    normalized.includes("work style") ||
    normalized.includes("summarize") ||
    normalized.includes("tell me about");

  if (isFitPrompt(text)) {
    return hasGeneralQuestionSignal && normalized.length < 500 ? "both" : "fit";
  }

  return "ask";
}

function buildAgentContent(text: string, uploadedFile: UploadedFile | null) {
  if (!uploadedFile?.text) return text;

  return [
    text || DEFAULT_FILE_PROMPT,
    `Attached job description (${uploadedFile.name}):`,
    uploadedFile.text,
  ].join("\n\n");
}

function ZeroState({ onPromptSubmit }: { onPromptSubmit: (prompt: string) => void }) {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pt-10 pb-8 md:px-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={AGENT_AVATAR_URL} alt="Rakshit Lodha" className="h-16 w-16 rounded-full border border-[#d9d3ca] bg-white object-cover" />

      <h1 className="mt-4 text-center text-xl font-semibold text-[#111111] md:text-2xl">
        Hey, I&apos;m Rakshit&apos;s AI.
      </h1>
      <p className="mt-4 max-w-[480px] text-center text-[15px] leading-[1.55] text-[#34312c] md:text-base">
        I&apos;ve been trained on every project, role, and decision in his career — including the things he got wrong.
        Ask me anything, or drop a JD to see if he&apos;s a fit.
      </p>

      <div className="mt-10 flex w-full max-w-[480px] flex-col gap-2.5">
        {PROMPT_CHIPS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptSubmit(prompt)}
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#e4e0da] bg-black/[0.025] px-5 py-4 text-left text-sm font-normal text-[#282520] transition-colors duration-150 hover:border-[#cfc8be] hover:bg-[#ede9e3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B6AE7] md:text-[15px]"
          >
            <span>{prompt}</span>
            <span className="shrink-0" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="mb-6 max-w-[75%] whitespace-pre-wrap rounded-[18px] rounded-br-md bg-[#1B6AE7] px-4 py-3 text-[15px] leading-relaxed text-white">
        {text}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Rakshit's AI is typing">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-2 w-2 animate-pulse rounded-full bg-[#6b6860]"
          style={{ animationDelay: `${dot * 140}ms` }}
        />
      ))}
    </span>
  );
}

function AgentMessage({
  text,
  isLoading,
  status,
}: {
  text: string;
  isLoading?: boolean;
  status?: string;
}) {
  return (
    <div className="flex justify-start">
      <div className="mb-8 max-w-[90%] rounded-[18px] rounded-bl-md border border-[#e4e0da] bg-[#faf9f6] px-5 py-4 text-[15px] leading-[1.6] text-[#111111]">
        {isLoading && !text ? (
          <div className="flex items-center gap-3 text-[#6b6860]">
            <TypingDots />
            <span className="text-sm">{status || "Thinking"}</span>
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code className="rounded bg-[#ede9e3] px-1 py-0.5 font-mono text-[0.9em]">{children}</code>
              ),
              pre: ({ children }) => (
                <pre className="mb-3 overflow-x-auto rounded-xl bg-[#ede9e3] p-3 font-mono text-sm last:mb-0">
                  {children}
                </pre>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function ConversationThread({
  messages,
  isRunning,
  status,
}: {
  messages: ChatMessage[];
  isRunning: boolean;
  status: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isRunning]);

  return (
    <section
      role="log"
      aria-live="polite"
      className="mx-auto w-full max-w-[720px] px-6 pt-8 pb-8 md:px-8"
    >
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} text={message.text} />
        ) : (
          <AgentMessage
            key={message.id}
            text={message.text}
            isLoading={isRunning}
            status={message.id === messages.at(-1)?.id ? status : undefined}
          />
        ),
      )}
      <div ref={endRef} />
    </section>
  );
}

function FileChip({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  return (
    <div className="mb-3 flex w-fit max-w-full items-center gap-2 rounded-full border border-[#e4e0da] bg-white px-3 py-1.5 text-xs text-[#6b6860]">
      <span className="truncate">
        {file.name}
        {file.status ? ` - ${file.status}` : ""}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-0.5 text-[#6b6860] transition-colors hover:bg-[#ede9e3] hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
        aria-label="Remove uploaded file"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function MessageInput({
  input,
  uploadedFile,
  isRunning,
  onInputChange,
  onSend,
  onFileSelect,
  onFileRemove,
}: {
  input: string;
  uploadedFile: UploadedFile | null;
  isRunning: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = (input.trim().length > 0 || Boolean(uploadedFile?.text)) && !isRunning;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  return (
    <footer className="shrink-0 bg-[#F5F3EF] px-6 md:px-8">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="mb-3 h-px w-full bg-[#e4e0da]" />
        {uploadedFile && <FileChip file={uploadedFile} onRemove={onFileRemove} />}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileSelect(file);
            event.currentTarget.value = "";
          }}
        />

        <div className="flex min-h-[52px] items-end gap-2 rounded-[28px] border border-[#d8d1c8] bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6b6860] transition-colors hover:bg-[#ede9e3] hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
            aria-label="Upload a job description"
          >
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={1}
            aria-label="Message Rakshit's AI"
            placeholder="Ask anything, or drop a JD here…"
            className="max-h-[200px] min-h-7 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-[15px] leading-6 text-[#111111] outline-none placeholder:text-[#9a948b]"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B6AE7] text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#e4e0da] disabled:text-[#8a847c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B6AE7]"
            aria-label="Send message"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="pt-3 pb-4 text-center text-xs text-[#6b6860]">
          Responses are AI-generated and may be wrong.
        </p>
      </div>
    </footer>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get("q")?.trim() ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  function updateAssistant(id: string, updater: (message: ChatMessage) => ChatMessage) {
    setMessages((previous) => previous.map((message) => (message.id === id ? updater(message) : message)));
  }

  async function handleFile(file: File) {
    const extension = extensionFor(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadedFile({
        name: file.name,
        text: "",
        status: "PDF, DOCX, or TXT only",
        error: "Unsupported file type.",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadedFile({
        name: file.name,
        text: "",
        status: "File must be 10MB or smaller",
        error: "File too large.",
      });
      return;
    }

    setUploadedFile({ name: file.name, text: "", status: "Extracting..." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse-jd", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { text?: string; error?: string };

      if (!response.ok || !payload.text) {
        throw new Error(payload.error || "Could not parse this file.");
      }

      setUploadedFile({ name: file.name, text: payload.text, status: "Ready" });
    } catch (error) {
      setUploadedFile({
        name: file.name,
        text: "",
        status: error instanceof Error ? error.message : "Could not parse this file",
        error: "Parse failed.",
      });
    }
  }

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    const hasReadyFile = Boolean(uploadedFile?.text);
    if ((!trimmed && !hasReadyFile) || isRunning) return;

    const displayText = trimmed || DEFAULT_FILE_PROMPT;
    const agentContent = buildAgentContent(displayText, uploadedFile);
    const userMessage: ChatMessage = { id: createId(), role: "user", text: displayText };
    const assistantId = createId();
    const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", text: "" };
    const requestMessages = [...messages, { ...userMessage, text: agentContent }]
      .filter((message) => message.text.trim())
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));
    const mode = getPromptMode(agentContent, hasReadyFile);

    setMessages((previous) => [...previous, userMessage, assistantMessage]);
    setInput("");
    setUploadedFile(null);
    setIsRunning(true);
    setStatus("Starting");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: requestMessages }),
      });

      if (!response.ok || !response.body) throw new Error("Agent request failed.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          const line = rawEvent.split("\n").find((eventLine) => eventLine.startsWith("data: "));
          if (!line) continue;

          const event = JSON.parse(line.slice(6)) as AgentStreamEvent;
          if (event.type === "status") {
            setStatus(event.message);
          }
          if (event.type === "delta") {
            updateAssistant(assistantId, (message) => ({
              ...message,
              text: `${message.text}${event.text}`,
            }));
          }
          if (event.type === "final") {
            updateAssistant(assistantId, (message) => ({
              ...message,
              text: message.text || event.response.answerText,
            }));
          }
          if (event.type === "error") {
            updateAssistant(assistantId, (message) => ({
              ...message,
              text: event.message,
            }));
          }
        }
      }
    } catch {
      updateAssistant(assistantId, (message) => ({
        ...message,
        text: "I could not reach Rakshit's AI right now. Please try again in a moment.",
      }));
    } finally {
      setStatus("");
      setIsRunning(false);
    }
  }

  return (
    <>
      <Nav sectionHrefPrefix="/" />
      <main
        className="flex h-dvh flex-col overflow-hidden bg-[#F5F3EF] pt-16 text-[#111111]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files.item(0);
          if (file) handleFile(file);
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <ZeroState onPromptSubmit={(prompt) => sendMessage(prompt)} />
          ) : (
            <ConversationThread messages={messages} isRunning={isRunning} status={status} />
          )}
        </div>

        <MessageInput
          input={input}
          uploadedFile={uploadedFile}
          isRunning={isRunning}
          onInputChange={setInput}
          onSend={() => sendMessage()}
          onFileSelect={handleFile}
          onFileRemove={() => setUploadedFile(null)}
        />
      </main>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageContent />
    </Suspense>
  );
}
