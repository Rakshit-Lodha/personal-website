const footerLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rakshit-lodha-360241187/" },
  { label: "GitHub", href: "https://github.com/Rakshit-Lodha" },
  { label: "X", href: "https://x.com/RAKSHITLODHA" },
];

const actionRows = [
  { text: "Ask my AI agent", href: "/chat" },
  {
    text: "Or you can email me directly",
    href: "mailto:rakshitlodha.business@gmail.com?subject=Hi%20Rakshit",
  },
];

export default function ClosingSection() {
  return (
    <section className="bg-background px-6 pt-16 pb-8 text-[#111111] md:pt-24">
      <div className="mx-auto max-w-[640px]">
        <p className="text-[18px] font-[500] leading-[1.4] tracking-[-0.2px] text-[#111111] md:text-[22px]">
          If you have any more questions
        </p>

        <div className="mt-6 md:mt-8">
          <hr className="m-0 border-0 border-t-[0.5px] border-neutral-200" />
          {actionRows.map((row) => (
            <div key={row.href}>
              <a
                href={row.href}
                className="group flex w-full cursor-pointer items-center justify-between py-5 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B6AE7]/30 md:py-6"
              >
                <span className="text-[16px] font-normal leading-[1.4] text-[#111111] md:text-[18px]">
                  {row.text}
                </span>
                <span className="text-[16px] font-normal leading-[1.4] text-neutral-400 transition-[color,transform] duration-200 ease-out group-hover:translate-x-1 group-hover:text-[#1B6AE7] md:text-[18px]">
                  →
                </span>
              </a>
              <hr className="m-0 border-0 border-t-[0.5px] border-neutral-200" />
            </div>
          ))}
        </div>

        <footer className="mt-16 border-t-[0.5px] border-neutral-200 pt-5 md:mt-24">
          <div className="flex flex-col items-center gap-2 text-[11px] font-normal text-neutral-500 md:flex-row md:justify-between md:gap-0 md:text-[12px]">
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
          </div>
        </footer>
      </div>
    </section>
  );
}
