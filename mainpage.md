# Main Page

This file maps the current homepage structure and the main places to edit copy.

## Page Structure

The homepage is composed in `src/app/page.tsx`:

1. `Nav`
2. `Hero`
3. `MyStory`
4. `Projects`
5. `CtaSection`
6. `ChatDrawer`

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

- My Story heading/subtext
- Company selector cards
- Chapter titles
- Role/year metadata
- Numbered story points
- Top achievement cards
- Continue the journey link

The chapter content lives in the local `storyChapters` array inside `MyStory.tsx`.

Recent changes:

- Company selector cards sit below the My Story heading in a horizontal card row.
- Chapter content appears below the selector.
- Story point icons were removed.
- Achievement card icons were removed.
- Dotted path decoration beside "Continue the journey" was removed.

## Projects & Skills

Component: `src/components/Projects.tsx`

Project card copy comes from `src/lib/resumeData.ts`, inside the `PROJECTS` array.

Edit these fields for each project:

- `name`: bold project title
- `tag`: blue subtitle
- `description`: grey body copy
- `icon`: project icon
- `iconBg`: icon background color
- `href`: card link

Recent change:

- Removed the `Live` / `Beta` status tags from project cards.

## Shared Content Data

File: `src/lib/resumeData.ts`

Use this file to edit:

- `PROJECTS`
- `TECHNICAL_SKILLS`
- `EDUCATION`
- `CHAT_PROMPTS`

Note: The current My Story chapter copy is self-contained in `src/components/MyStory.tsx`, not in `resumeData.ts`.
