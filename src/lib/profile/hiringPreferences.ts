export const HIRING_PREFERENCES = {
  availability: {
    noticePeriod: "30 days",
  },
  workMode: {
    preferred: "Onsite",
    flexibility:
      "Open to exploring remote or hybrid roles when the opportunity is a strong fit.",
  },
  locations: {
    current: "Gurgaon",
    openTo: ["Mumbai", "Bengaluru", "Pune", "Hyderabad"],
    note: "Open to relocating beyond these cities for the right opportunity.",
  },
  compensation: {
    current: "INR 38 LPA",
    target: "Around INR 45 LPA",
  },
  engagementType: {
    preferred: "Full-time roles",
    notTargeting: ["contract", "consulting"],
  },
} as const;

export type HiringPreferences = typeof HIRING_PREFERENCES;
