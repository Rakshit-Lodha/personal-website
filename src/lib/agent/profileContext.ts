import { PROFILE_DATA } from "@/lib/profile";

export const PROFILE_SECTIONS = [
  {
    id: "identity",
    title: "Identity, Location, Work Style, and Tools",
    data: PROFILE_DATA.person,
  },
  {
    id: "experience",
    title: "Professional Experience and Outcomes",
    data: PROFILE_DATA.experience,
  },
  {
    id: "projects",
    title: "Featured Projects",
    data: PROFILE_DATA.projects,
  },
  {
    id: "technicalEvidence",
    title: "Technical and PM Craft Evidence",
    data: PROFILE_DATA.technicalEvidence,
  },
  {
    id: "fitThemes",
    title: "Role Fit Themes",
    data: PROFILE_DATA.fitThemes,
  },
  {
    id: "education",
    title: "Education",
    data: PROFILE_DATA.education,
  },
  {
    id: "hiringPreferences",
    title: "Hiring Preferences, Availability, Location, and Compensation",
    data: PROFILE_DATA.hiringPreferences,
  },
] as const;

export type ProfileSectionId = (typeof PROFILE_SECTIONS)[number]["id"];

export function serializeProfileSections() {
  return PROFILE_SECTIONS.map((section) =>
    [
      `Section: ${section.id}`,
      `Title: ${section.title}`,
      `Data: ${JSON.stringify(section.data)}`,
    ].join("\n"),
  ).join("\n\n---\n\n");
}
