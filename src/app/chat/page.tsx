"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Menu,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import type { AgentMode, AgentResponse, AgentStreamEvent } from "@/lib/agent/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  brief?: AgentResponse;
};

const navLinks = [
  { label: "My Story", href: "/#story" },
  { label: "Projects & Skills", href: "/#projects" },
  { label: "Experience", href: "/#story" },
  { label: "Education", href: "/#projects" },
];

const featureCards = [
  {
    title: "Upload a JD",
    description: "Drag & drop a job description (PDF, DOCX, or TXT).",
    icon: Upload,
    bg: "bg-blue-50",
    color: "text-[#2563eb]",
  },
  {
    title: "Get a fit assessment",
    description: "Instant match score with strengths, gaps and key highlights.",
    icon: TrendingUp,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    title: "Ask anything",
    description: "Explore experience, projects, skills and achievements.",
    icon: MessageSquare,
    bg: "bg-violet-50",
    color: "text-violet-600",
  },
];

const suggestedQuestions = [
  "Is Rakshit a fit for our AI PM role?",
  "What outcomes has he driven?",
  "Where is he strongest?",
];

let messageCounter = 0;

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `chat-message-${messageCounter++}`;
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

function AssessmentPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.45, ease: "easeOut" }}
      className="rounded-[22px] border border-[#e7e2db] bg-white p-5 shadow-[0_18px_48px_rgba(17,17,17,0.08)]"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-emerald-600">Strengths</h3>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#34312c]">
        {[
          "AI product thinking with 0→1 execution track record",
          "Deep fintech domain knowledge (lending, wealth, markets)",
          "Proven impact on scale: 60% faster resolution, 58% volume reduction",
          "Strong technical foundation across AI/ML and data systems",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="my-5 h-px bg-[#e7e2db]" />

      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-orange-500" aria-hidden="true" />
        <h3 className="text-lg font-bold text-orange-500">Potential gaps</h3>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#34312c]">
        <li className="flex gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
          <span>Enterprise SaaS exposure may be lighter depending on the role</span>
        </li>
      </ul>
    </motion.div>
  );
}

function AgentBriefCard({ brief }: { brief: AgentResponse }) {
  const sections = [
    { title: "Strengths", items: brief.proofPoints, icon: CheckCircle2, color: "text-emerald-600" },
    { title: "Relevant projects", items: brief.relevantProjects, icon: Sparkles, color: "text-[#2563eb]" },
    { title: "Relevant outcomes", items: brief.relevantOutcomes, icon: TrendingUp, color: "text-[#2563eb]" },
    { title: "Potential gaps", items: brief.gapsOrUnknowns, icon: AlertTriangle, color: "text-orange-500" },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="mt-4 rounded-[22px] border border-[#e7e2db] bg-white p-4 shadow-[0_14px_36px_rgba(17,17,17,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
            {brief.mode === "fit" ? "Role-fit assessment" : "Evidence brief"}
          </p>
          <h3 className="mt-1 text-base font-bold leading-snug text-[#111111]">{brief.headline}</h3>
        </div>
        {brief.mode === "fit" && brief.fitScore && (
          <span className="rounded-full bg-[#2563eb] px-3 py-1 text-xs font-bold text-white">
            {brief.fitScore}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#6b6860]">{brief.summary}</p>

      <div className="mt-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="rounded-2xl bg-[#faf8f4] p-4 ring-1 ring-[#e7e2db]/80">
              <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${section.color}`} aria-hidden="true" />
                <h4 className={`text-sm font-bold ${section.color}`}>{section.title}</h4>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-[#34312c]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {brief.suggestedFollowups.length > 0 && (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563eb]">Ask next</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.suggestedFollowups.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs text-[#34312c] ring-1 ring-blue-100">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[92%] rounded-[20px] px-4 py-3 text-sm leading-relaxed whitespace-pre-line md:max-w-[84%] ${
          isUser
            ? "rounded-br-md bg-[#2563eb] text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)]"
            : "rounded-bl-md bg-[#f1eee8] text-[#111111]"
        }`}
      >
        {message.text}
        {message.brief && <AgentBriefCard brief={message.brief} />}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isRunning]);

  function updateAssistant(id: string, updater: (message: ChatMessage) => ChatMessage) {
    setMessages((previous) => previous.map((message) => (message.id === id ? updater(message) : message)));
  }

  function populateQuestion(question: string) {
    setInput(question);
  }

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setUploadedFileName("");
      setUploadStatus("File must be 10MB or smaller.");
      setInput("This file is larger than 10MB. Please paste the JD text here instead:\n\n");
      return;
    }

    setUploadedFileName(file.name);
    setUploadStatus("Extracting job description...");

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

      setInput(payload.text);
      setUploadStatus("Job description extracted. You can edit it or send it.");
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Could not parse this file.");
      setInput("Please paste the JD text here instead:\n\n");
    }
  }

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isRunning) return;

    const userMessage: ChatMessage = { id: createId(), role: "user", text: trimmed };
    const assistantId = createId();
    const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", text: "" };
    const requestMessages = [...messages, userMessage]
      .filter((message) => message.text.trim())
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.text,
      }));
    const mode: Exclude<AgentMode, "auto"> = isFitPrompt(trimmed) ? "fit" : "ask";

    setMessages((previous) => [...previous, userMessage, assistantMessage]);
    setInput("");
    setIsRunning(true);
    setStatus("Reading context");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: requestMessages }),
      });

      if (!response.ok || !response.body) throw new Error("Agent request failed");

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
          if (event.type === "status") setStatus(event.message);
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
              brief: event.response,
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
    <main className="min-h-screen bg-[#faf8f4] text-[#111111]">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-[#e7e2db]/80 bg-[#faf8f4]/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-[#2563eb]">
            Rakshit Lodha<span className="text-[#2563eb]">.</span>
          </Link>

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#6b6860] transition-colors hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-[#2563eb]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e7e2db] bg-white px-4 text-sm font-bold text-[#111111] shadow-sm transition-colors hover:border-[#2563eb] focus-visible:outline-2 focus-visible:outline-[#2563eb]"
            >
              Resume
              <Download className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link
              href="/"
              className="group hidden h-11 items-center gap-2 rounded-xl bg-[#2563eb] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] sm:inline-flex"
            >
              Back to Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7e2db] bg-white text-[#111111] shadow-sm focus-visible:outline-2 focus-visible:outline-[#2563eb] lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#e7e2db] bg-[#faf8f4] lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#6b6860] hover:bg-white hover:text-[#111111]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-bold text-white sm:hidden"
                >
                  Back to Portfolio
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl grid-cols-1 gap-10 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(520px,620px)] lg:items-start lg:gap-14 lg:py-16">
        <div className="lg:pt-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <Sparkles className="mb-6 h-8 w-8 fill-[#2563eb] text-[#2563eb]" aria-hidden="true" />
            <h1 className="max-w-3xl text-[clamp(3rem,7vw,4.75rem)] font-black leading-[0.98] tracking-tight text-[#111111] xl:text-[5.25rem]">
              Ask Rakshit&apos;s AI if he fits <span className="text-[#2563eb]">your role</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6b6860] xl:text-xl">
              Upload a job description or ask anything about Rakshit&apos;s experience, projects, outcomes and strengths.
            </p>
          </motion.div>

          <div className="mt-9 grid grid-cols-[repeat(3,minmax(190px,1fr))] gap-4 overflow-x-auto pb-2 md:grid-cols-3 md:overflow-visible">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.45, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  className="min-w-[190px] rounded-[22px] border border-[#e7e2db] bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] transition-shadow hover:shadow-[0_18px_46px_rgba(17,17,17,0.09)]"
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full ${feature.bg}`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-[#111111]">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#6b6860]">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-9">
            <h2 className="text-xl font-bold text-[#111111]">Try asking</h2>
            <div className="mt-4 space-y-3">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={question}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.08, duration: 0.35, ease: "easeOut" }}
                  whileHover={{ x: 4 }}
                  onClick={() => populateQuestion(question)}
                  className="group flex w-full items-center gap-4 rounded-[18px] border border-[#e7e2db] bg-white px-5 py-4 text-left text-sm font-semibold text-[#34312c] shadow-[0_8px_24px_rgba(17,17,17,0.035)] transition-colors hover:border-blue-200 focus-visible:outline-2 focus-visible:outline-[#2563eb]"
                >
                  <Sparkles className="h-5 w-5 shrink-0 fill-[#2563eb] text-[#2563eb]" aria-hidden="true" />
                  <span className="flex-1">{question}</span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#2563eb] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 28, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.16, duration: 0.58, ease: "easeOut" }}
          className="lg:sticky lg:top-24"
        >
          <div className="flex h-[calc(100vh-104px)] min-h-[620px] flex-col rounded-[24px] border border-[#e7e2db] bg-white p-5 shadow-[0_26px_80px_rgba(17,17,17,0.11)] md:p-7 lg:max-h-[760px]">
            <div className="flex items-center gap-3 pb-5">
              <Sparkles className="h-6 w-6 fill-[#2563eb] text-[#2563eb]" aria-hidden="true" />
              <h2 className="text-xl font-black text-[#111111]">Chat with my AI</h2>
              <span className="h-3 w-3 rounded-full bg-emerald-500" aria-label="Online" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
                    className="ml-auto max-w-[88%] rounded-[18px] rounded-br-md bg-[#2563eb] px-5 py-4 text-sm font-medium leading-relaxed text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)]"
                  >
                    Based on this JD, Rakshit looks like a strong fit — 8.2/10.
                  </motion.div>
                  <AssessmentPreview />
                </>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <ChatMessageBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>
              )}

              {isRunning && (
                <div className="flex justify-start">
                  <div className="rounded-[18px] rounded-bl-md bg-[#f1eee8] px-4 py-3 text-sm text-[#6b6860]">
                    {status || "Thinking"}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files.item(0);
                  if (file) handleFile(file);
                }}
                className="group mb-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-[#d8d1c8] bg-[#faf8f4] px-4 py-3 text-left transition-colors hover:border-[#2563eb] hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-[#2563eb]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e7e2db] bg-white transition-transform group-hover:-translate-y-0.5">
                  <Upload className="h-4 w-4 text-[#111111]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#111111]">
                    {uploadedFileName || "Drag & drop a job description here"}
                  </span>
                  <span className="block truncate text-xs text-[#6b6860]">
                    {uploadStatus || "PDF, DOCX or TXT • Max 10MB"}
                  </span>
                </span>
              </button>
              <div className="flex items-end gap-3 rounded-[20px] border border-[#e7e2db] bg-white p-3 shadow-[0_12px_34px_rgba(17,17,17,0.07)]">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Paste a JD or ask anything about Rakshit..."
                  rows={2}
                  className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#111111] outline-none placeholder:text-[#9a948b]"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isRunning}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)] transition-opacity disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
              <p className="mt-3 text-xs text-[#8a847c]">Responses may be AI-generated.</p>
            </div>
          </div>
        </motion.aside>
      </section>
    </main>
  );
}
