"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "@/components/ChatPanel";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            style={{ maxHeight: "90vh" }}
            role="dialog"
            aria-modal="true"
            aria-label="Chat with Rakshit's AI"
          >
            <div className="bg-white rounded-t-3xl overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-1 rounded-full bg-border" />
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatPanel variant="drawer" onClose={onClose} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
