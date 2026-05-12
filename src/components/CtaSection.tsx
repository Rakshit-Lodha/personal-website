"use client";

import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section id="contact" className="py-24 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-3"
        >
          Want to know more?
        </motion.h2>
        <div className="w-10 h-0.5 bg-[#1B6AE7] mx-auto mb-12" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.a
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            href="/chat"
            className="group flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-border hover:border-[#1B6AE7] hover:shadow-md hover:-translate-y-0.5 transition-all text-left focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
          >
            <span className="text-2xl" aria-hidden="true">💬</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#1B6AE7] mb-1">Chat with me</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                Have a conversation to see how I think and if I&apos;m a fit for your team.
              </div>
            </div>
            <span className="text-[#1B6AE7] group-hover:translate-x-1 transition-transform shrink-0" aria-hidden="true">→</span>
          </motion.a>

          <motion.a
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            href="https://cal.com/rakshitlodha"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-border hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-left focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <span className="text-2xl" aria-hidden="true">🗓</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-amber-600 mb-1">Schedule a call</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                Let&apos;s connect for a quick call to explore how I can add value.
              </div>
            </div>
            <span className="text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" aria-hidden="true">→</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
