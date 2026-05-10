export const EDUCATION = [
  {
    school: "SP Jain Global School of Management",
    credential: "MBA (Executive)",
    start: "Aug 2025",
    end: "Jan 2027",
  },
  {
    school: "Christ University",
    location: "Bengaluru",
    credential: "BBA Finance & International Business",
    start: "Jun 2017",
    end: "Apr 2020",
  },
  {
    school: "London School of Economics",
    credential: "Summer School: Alternative Investments",
    start: "Jun 2018",
    end: "Jul 2018",
  },
] as const;

export type Education = (typeof EDUCATION)[number];
