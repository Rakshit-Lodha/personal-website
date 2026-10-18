import { CURRENT_CAREER_STATUS } from "@/lib/assistantIdentity";

export const HIRING_PREFERENCES = {
  currentSearchStatus: CURRENT_CAREER_STATUS,
  availability: {
    noticePeriod: "30 days",
    note: "This is contractual context, not an indication that Rakshit is seeking a move or available to join.",
  },
  workMode: {
    preferred: "Onsite",
    flexibility: "Not currently exploring other roles or work arrangements.",
  },
  locations: {
    current: "Gurgaon",
    openTo: ["Mumbai", "Bengaluru", "Pune", "Hyderabad"],
    note: "These are background preferences, not an active relocation search.",
  },
  compensation: {
    current: "INR 38 LPA",
    target: "Not currently seeking a new role or negotiating target compensation.",
  },
  engagementType: {
    preferred: "Full-time roles",
    notTargeting: ["contract", "consulting"],
  },
} as const;

export type HiringPreferences = typeof HIRING_PREFERENCES;
