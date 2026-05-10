"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SUGGESTED_PROMPTS } from "@/lib/profile";
import type { AgentMode, AgentResponse, AgentStreamEvent } from "@/lib/agent/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  brief?: AgentResponse;
};

let fallbackId = 0;

interface ChatPanelProps {
  variant?: "sidebar" | "drawer";
  onClose?: () => void;
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `message-${fallbackId++}`;
}

function BriefCards({ brief }: { brief: AgentResponse }) {
  const sections = [
    { label: "Proof", items: brief.proofPoints },
    { label: "Projects", items: brief.relevantProjects },
    { label: "Outcomes", items: brief.relevantOutcomes },
    { label: "Gaps", items: brief.gapsOrUnknowns },
    { label: "Ask next", items: brief.suggestedFollowups },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-3 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1B6AE7]">
            {brief.mode === "fit" ? "Fit brief" : "Evidence brief"}
          </p>
          <h4 className="mt-1 text-sm font-semibold leading-snug text-foreground">{brief.headline}</h4>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#1B6AE7] ring-1 ring-blue-100">
          {brief.fitLevel}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{brief.summary}</p>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.label} className="rounded-xl bg-white p-3 ring-1 ring-border/70">
            <p className="mb-1.5 text-[11px] font-semibold text-foreground">{section.label}</p>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item} className="text-xs leading-relaxed text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-foreground ring-1 ring-border/70">
        {brief.cta}
      </div>
    </div>
  );
}

export default function ChatPanel({ variant = "sidebar", onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-agent-message",
      role: "assistant",
      text: "Hi, I'm Rakshit's Agent. Paste a role, product problem, or ask a question, and I'll map it to evidence from Rakshit's work.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Exclude<AgentMode, "auto">>("fit");
  const [isTyping, setIsTyping] = useState(false);
  const [promptsHidden, setPromptsHidden] = useState(false);
  const [status, setStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isTyping]);

  function updateAssistant(id: string, updater: (message: Message) => Message) {
    setMessages((prev) => prev.map((message) => (message.id === id ? updater(message) : message)));
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    if (isTyping) return;

    const userMessage: Message = { id: createId(), role: "user", text: text.trim() };
    const assistantId = createId();
    const assistantMessage: Message = { id: assistantId, role: "assistant", text: "" };
    const historyForRequest = [...messages, userMessage]
      .filter((message) => message.text.trim())
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    setPromptsHidden(true);
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsTyping(true);
    setStatus("Connecting to Rakshit's Agent");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: historyForRequest,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Agent request failed.");
      }

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
          const line = rawEvent
            .split("\n")
            .find((eventLine) => eventLine.startsWith("data: "));
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
        text: "I could not reach Rakshit's Agent right now. Please try again in a moment.",
      }));
    } finally {
      setStatus("");
      setIsTyping(false);
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white ${variant === "sidebar" ? "rounded-2xl border border-border shadow-sm" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#1B6AE7] text-lg" aria-hidden="true">✦</span>
          <span className="font-semibold text-foreground">Chat with my AI</span>
          <span className="w-2 h-2 rounded-full bg-green-500 ml-1" aria-label="Online" />
        </div>
        {variant === "drawer" && onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      <p className="px-5 pb-3 text-xs text-muted-foreground leading-relaxed">
        Paste a role, product problem, or company context. Get a grounded fit brief from Rakshit&apos;s work.
      </p>

      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 rounded-xl bg-muted/50 p-1" role="tablist" aria-label="Agent mode">
          {[
            { id: "fit", label: "Analyze Fit" },
            { id: "ask", label: "Ask" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={mode === option.id}
              onClick={() => setMode(option.id as Exclude<AgentMode, "auto">)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#1B6AE7] ${
                mode === option.id ? "bg-white text-[#1B6AE7] shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-[#1B6AE7] text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.text || (msg.role === "assistant" && isTyping ? status || "Thinking" : "")}
                {msg.brief && <BriefCards brief={msg.brief} />}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{status || "Thinking"}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt chips */}
      <AnimatePresence>
        {!promptsHidden && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3 space-y-2"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M5 1l1 2.5L9 4 6.5 6.5 7 9.5 5 8 3 9.5l.5-3L1 4l3-.5z" fill="#6B6860" />
              </svg>
              Try asking
            </p>
            <div className="space-y-1.5">
              {SUGGESTED_PROMPTS.map((p) => (
                <motion.button
                  key={p}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left text-xs text-[#1B6AE7] hover:text-[#1558c7] flex items-center justify-between gap-2 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
                >
                  <span>{p}</span>
                  <span aria-hidden="true">→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-px bg-border" />

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder={mode === "fit" ? "Paste a role or product problem..." : "Ask anything about Rakshit..."}
          rows={variant === "sidebar" ? 2 : 1}
          className="min-h-10 max-h-28 flex-1 resize-none rounded-xl border-0 bg-muted/40 px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-[#1B6AE7]"
        />
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="bg-[#1B6AE7] hover:bg-[#1558c7] text-white rounded-xl shrink-0 w-9 h-9"
          aria-label="Send"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground pb-3">
        Live AI. Grounded in Rakshit&apos;s profile data.
      </p>
    </div>
  );
}
