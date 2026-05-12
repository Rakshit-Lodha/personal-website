const footerLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rakshit-lodha-360241187/",
  },
  {
    label: "GitHub",
    href: "https://github.com/Rakshit-Lodha",
  },
  {
    label: "X",
    href: "https://x.com/RAKSHITLODHA",
  },
];

function PromptBlock({
  heading,
  href,
  linkText,
  suffix,
}: {
  heading: string;
  href: string;
  linkText: string;
  suffix: string;
}) {
  return (
    <div>
      <p className="mb-3 text-[22px] font-medium tracking-[-0.5px] text-[#111111] md:text-[28px]">
        {heading}
      </p>
      <p className="text-base font-normal leading-[1.5] text-[#111111] md:text-lg">
        <a
          href={href}
          className="text-[#1B6AE7] underline decoration-1 underline-offset-4 transition-colors duration-150 hover:text-[#1558c7] hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
        >
          {linkText}
        </a>
        {suffix}
      </p>
    </div>
  );
}

export default function ClosingSection() {
  return (
    <section className="bg-background px-6 pt-16 pb-8 text-[#111111] md:pt-24">
      <div className="mx-auto max-w-[640px]">
        <div className="space-y-8 md:space-y-12">
          <PromptBlock
            heading="Any question?"
            href="/chat"
            linkText="Ask my AI agent"
            suffix=" — he'll give you more context. →"
          />
          <PromptBlock
            heading="Want to talk to me directly?"
            href="mailto:rakshitlodha.business@gmail.com?subject=Hi%20Rakshit"
            linkText="Email me"
            suffix=". →"
          />
        </div>

        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-neutral-200 pt-4 text-[11px] font-normal tracking-normal text-neutral-500 md:mt-24 md:flex-row md:justify-between md:gap-0 md:text-xs">
          <span>Rakshit Lodha</span>
          <span>
            {footerLinks.map((link, index) => (
              <span key={link.label}>
                {index > 0 && <span aria-hidden="true">&nbsp;·&nbsp;</span>}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-150 hover:text-[#111111] hover:underline"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </span>
          <span>© 2026</span>
        </footer>
      </div>
    </section>
  );
}
