# Personal Website Design

## Concept

Build a clean, modern personal website for Rakshit Lodha that feels like a polished product experience, not a traditional resume page.

The site should let visitors do two things quickly:

- Scan Rakshit's outcomes and career story.
- Chat with an AI assistant to judge whether he is a good fit for their company or role.

The experience should be simple, low-text, and easy to understand at a glance.

## Design Principles

- Keep the first viewport focused. The hero should show only the headline, nav, CTA buttons, social links, and scroll cue.
- Avoid a sketch-heavy aesthetic. Use clean digital typography and polished UI. A small blue accent underline or line is fine, but doodles should be rare.
- Prefer outcomes over paragraphs. Use numbers, compact labels, and cards instead of long resume text.
- Make the story interactive. Career sections should feel tappable and exploratory, like product UI.
- Keep motion useful. Animations should guide attention, reveal state, and make the page feel alive without distracting.
- Make the site feel human, useful, and premium.

## Visual Direction

### Palette

- Background: warm ivory / off-white.
- Text: near-black.
- Primary accent: electric blue.
- Secondary accents:
  - Green for growth/product outcomes.
  - Amber for revenue/business outcomes.
  - Purple for AI/product system moments.
- Borders: soft gray.
- Surfaces: white or very subtle off-white cards with soft shadows.

### Typography

Use a clean sans-serif for most of the interface, with one editorial serif for the hero line. This keeps the site polished while giving the first viewport a memorable personality.

Recommended font stack:

- Primary UI font: `Inter`
  - Use for nav, buttons, cards, body text, labels, metrics, chat, and project sections.
  - Fallback: `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
- Display serif: `Instrument Serif`
  - Use only for the second hero line: `and I love building`.
  - Fallback: `Georgia`, `Times New Roman`, `serif`.

Usage rules:

- Hero first line, `Hi, my name is Rakshit`, should use `Inter` in a large bold weight.
- Hero second line, `and I love building`, should use `Instrument Serif` for contrast.
- Do not use handwritten fonts for content.
- Do not use a handwritten font for `Rakshit`; use color, underline, or motion to create emphasis instead.
- Keep letter spacing at `0`.
- Use fluid layout spacing, but do not scale font sizes directly with viewport width.
- Product sections should use tight, readable UI type.
- Metrics should be large, simple, and set in `Inter`.

### Layout

- Use spacious sections with strong hierarchy.
- Cards should be clean and tappable.
- Avoid dense dashboards.
- Avoid nested cards unless needed for a real interaction.
- Keep sections readable on mobile with stacked layouts.

## Page Structure

### 1. Hero

The first viewport should not show the full My Story section.

Hero must include:

- Nav bar.
- Identity: `Rakshit Lodha`, `AI Product Manager`.
- Main headline:
  - `Hi, my name is Rakshit`
  - `and I love building`
- Primary CTA: `My Story`.
- Secondary CTA: `Chat with my AI`.
- Social links: `LinkedIn`, `X`, `GitHub`.
- `Scroll to explore` cue.
- Optional tiny hint of next section below the fold.

Hero should feel calm, premium, and extremely readable.

### 2. My Story

This section should tell Rakshit's career story through tappable chapters.

Use company cards or tabs:

- `LearnApp`
- `INDMoney`
- `ET Money`

Each chapter should have:

- Active company state.
- A main story card.
- 2-3 outcome cards.
- A short set of tags.
- Timeline progress.
- Clear affordance that the other company cards can be tapped.

Do not use resume-style bullet walls.

#### LearnApp Chapter

Theme: early builder, content/product/ops, investing education.

Suggested content:

- Title: `Employee #7`
- Main story: `Built investing courses`
- Tags: `Product`, `Content`, `Ops`
- Outcomes:
  - `50% completion`
  - `₹1.2Cr ARR`
  - `Early product belief`

#### INDMoney Chapter

Theme: turning advisory workflows into scalable product systems.

Suggested content:

- Title: `Turned planning into a product system`
- Tags: `Recommendations`, `Planning`, `Insurance`
- Outcomes:
  - `4-5 hrs -> 15 mins`
  - `20,000+ plans`
  - `₹1.5Cr ARR`

#### ET Money Chapter

Theme: AI + fintech products at scale.

Suggested content:

- Title: `Scaled AI + fintech products`
- Tags: `AI support automation`, `Product systems`, `Lending`, `Wealth`
- Outcomes:
  - `17K -> 7K tickets`
  - `₹100Cr disbursals`
  - `₹300Cr AUM`

### 3. Projects

Keep this section simple and scannable.

Use a 2x2 card grid on desktop:

- `Krux.new`
  - `News Agent`
- `Feedback Agent`
- `MF Semantic Search`
- `US Stocks Analysis Agent`

Each card should include:

- Small icon.
- Project name.
- One-line description.
- Optional status chip such as `Live` or `Beta`.
- Arrow affordance for opening details.

Cards can open detail views or modals later, but the default page should stay minimal.

### 4. Education

Keep education as a compact row.

Include:

- `SP Jain GSM`
- `Christ University`
- `LSE`

Do not over-expand education unless the visitor asks via chat or opens details.

### 5. Chat With My AI

The AI chat should feel like a hiring assistant, not a gimmick.

It should help visitors ask:

- `Is Rakshit a fit for our AI PM role?`
- `What problems does he solve?`
- `Share outcomes from Rakshit's projects`
- `How does he approach product strategy?`

The chat assistant should answer from Rakshit's resume, projects, and site content.

### 6. Final CTA

The final CTA must use this heading:

`Want to know more?`

Under it, show two actions:

- `Chat with me`
- `Schedule a call`

This section should feel warm and direct.

## Motion

Use animation to clarify, not decorate.

Good motion ideas:

- Hero text enters with a subtle stagger.
- CTA buttons have soft hover lift.
- Scroll cue gently pulses.
- Story chapter cards animate between states.
- Outcome numbers count up when visible.
- Timeline active dot moves when a chapter is tapped.
- Project cards reveal arrows on hover.
- Chat prompt chips slide or fade in.

Avoid:

- Constant large background motion.
- Excessive parallax.
- Distracting particle systems.
- Cyberpunk/glassy dashboards.

## Content Tone

Keep copy short and confident.

The site should sound like:

- Builder.
- AI product thinker.
- Fintech operator.
- Clear communicator.

Avoid:

- Corporate resume language.
- Long bio paragraphs.
- Overexplaining every project on the main page.
- Generic AI hype.

## Implementation Notes

- Start with a static polished version before adding complex AI behavior.
- Make all major sections responsive from the beginning.
- The story tabs/cards should be keyboard accessible.
- Chat should be usable as a panel on desktop and a full-screen drawer on mobile.
- If live AI is not wired yet, use a resume-grounded local response system with clear suggested prompts.
