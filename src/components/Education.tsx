const educationRows = [
  {
    left: "MBA (Executive), SP Jain Global School of Management",
    years: "2025–Present",
  },
  {
    left: "BBA, Finance & International Business, Christ University",
    years: "2017–2020",
  },
  {
    left: "Summer School, Alternative Investments, London School of Economics",
    years: "2018",
  },
];

export default function Education() {
  return (
    <section
      id="education"
      className="mx-auto max-w-[640px] px-1 pt-16 md:px-0 md:pt-24"
    >
      <h2 className="text-[32px] font-medium leading-tight tracking-normal text-[#111111] md:text-[40px]">
        Education
      </h2>

      <div className="mt-12 space-y-4">
        {educationRows.map((row) => (
          <div
            key={row.left}
            className="flex flex-wrap justify-between gap-x-6 gap-y-1"
          >
            <p className="text-[15px] font-normal leading-[1.5] text-[#111111] md:text-base">
              {row.left}
            </p>
            <p className="min-w-full whitespace-nowrap text-[13px] font-normal leading-[1.5] tracking-normal text-neutral-500 md:min-w-0 md:text-sm">
              {row.years}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
