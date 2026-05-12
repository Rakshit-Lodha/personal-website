# Main Page

This file maps the current homepage structure and the main places to edit copy.

## Page Structure

The homepage is composed in `src/app/page.tsx`:

1. `Nav`
2. `Hero`
3. `MyStory`
4. `Projects`
5. `SkillMap` — rendered inside `Projects.tsx`, below the Projects content and above Education
6. Education — still rendered inside `Projects.tsx`
7. `CtaSection`
8. `ChatDrawer`

## Hero

Component: `src/components/Hero.tsx`

Use this file to edit:

- Main headline
- Blue Rakshit text
- "and I love building" line
- Hero buttons
- Social links
- Scroll cue

Recent change:

- Removed the small blue dot above the headline.

## My Story

Component: `src/components/MyStory.tsx`

Use this file to edit:

- My Story heading
- Chapter metadata
- Chapter lesson copy
- Shipped proof lists
- Agent question links

The chapter content lives in the local `chapters` array inside `MyStory.tsx`.

Current layout:

- Uses the shared 640px content column.
- Section title is 32px mobile / 40px desktop, font weight 500.
- Chapters render as a vertical stack with muted meta text, narrative copy, left-rule shipped lists, and agent links.

## Projects

Component: `src/components/Projects.tsx`

This section is now a visual project showcase, not a 2x2 grid.

Current layout:

- The `Projects` title aligns to the exact same 640px content column as `My Story`.
- Krux.news renders as a full-width hero card with a screenshot slot.
- MF Search, US Stocks Agent, and Feedback Intelligence render as text-only cards in a horizontally scrollable snap strip.
- The scroll strip starts at the shared content column and breaks right toward the viewport edge.
- Proof content is rendered as multi-line left-rule lists, not truncated one-line text.
- `Also built` rows render below the strip within the 640px content column.
- `More on GitHub ↗` renders as a single text link.
- The skills prose line and old technical skills chip cards are intentionally removed.

Edit these local constants in `Projects.tsx`:

- `heroProject`
- `stripProjects`
- `otherProjects`
- `githubProfileUrl`

Important:

- The Krux screenshot slot currently points to `/krux-news-screenshot.png`.
- If that asset does not exist, the UI shows a quiet placeholder.
- The current project copy and URLs are placeholders by design.

## Skill Map

Component: `src/components/SkillMap.tsx`

This is a clean card-grid view of skills across product, AI, analytics, design, and engineering.

Current behavior:

- Hardcodes the `skills`, `anchorSkills`, and `categoryLabels` data inside the component.
- Uses normal CSS Grid and flex-wrap text flow. No absolute positioning, collision math, canvas, SVG, or skill-coordinate logic.
- Uses Framer Motion for a one-time card entrance animation.
- Cards fade in and translate up by 12px when the section enters the viewport.
- Card animation order follows the data order: AI Product, Technical Tools, Product Management, Analytics & Experimentation, Research & Design.
- Skills inside a card appear together with the card; individual skills do not stagger.
- Respects `prefers-reduced-motion` by rendering cards fully visible immediately.
- Cards have a subtle hover lift and faint shadow, but remain non-clickable with the default cursor.
- No tooltips, popovers, project links, category colors, icons, idle animation, breathing, drift, or pulsing.

Layout:

- Desktop row 1: AI Product (~58%) and Technical Tools (~42%).
- Desktop row 2: Product Management (~30%), Analytics & Experimentation (~38%), Research & Design (~32%).
- Mobile: all five cards stack vertically in the same order.
- Category cards use a faint `bg-neutral-50` surface, 12px radius, and no heavy chrome.
- Skills are text-only chips with no pill background or border.
- Anchor skills are larger and bolder than non-anchor skills.

Alignment:

- The `Skill Map` title uses the same 640px content column as `My Story` and `Projects`.
- The card grid is wider than the text column (`max-w-[1040px]`) and centers around the same page axis.

Dependency note:

- `animejs` was removed because Skill Map now uses Framer Motion only.

## Shared Content Data

File: `src/lib/resumeData.ts`

Use this file to edit:

- `PROJECTS`
- `TECHNICAL_SKILLS`
- `EDUCATION`
- `CHAT_PROMPTS`

Notes:

- The current My Story chapter copy is self-contained in `src/components/MyStory.tsx`, not in `resumeData.ts`.
- The current homepage Projects showcase data is self-contained in `src/components/Projects.tsx`, not in `resumeData.ts`.
- The current Skill Map data is self-contained in `src/components/SkillMap.tsx`.
