import { z } from "zod";

/** Muse edition JSON contract (see ROMAN_WEBSITE_BUILD_PLAN.md, "Muse publication contract"). */
export const museEditionSchema = z.object({
  schemaVersion: z.literal(1),
  date: z.iso.date(),
  timezone: z.literal("Asia/Kolkata"),
  title: z.string().min(1),
  summary: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  sources: z.array(
    z.object({
      url: z.url({ protocol: /^https?$/ }),
      label: z.string().min(1),
      author: z.string().min(1).optional(),
    }),
  ),
  /** null for a text-only edition. */
  audioAssetId: z.string().min(1).nullable(),
  audioTranscript: z.string().min(1).nullable(),
  status: z.enum(["draft", "published", "text-only"]),
});

export type MuseEdition = z.infer<typeof museEditionSchema>;
