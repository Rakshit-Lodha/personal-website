# Profile V2 Deep Evidence

`deepEvidence.ts` is the fill-in layer for richer Q&A answers.

Keep `status: "needs-input"` while an entry is incomplete. Change it to `"ready"` only when the details are accurate enough for the agent to use as evidence.

## Fields To Fill

- `oneLine`: The sharpest one-sentence description of the work.
- `context`: Where this happened and why it mattered at that moment.
- `userOrBusinessProblem`: The concrete user, customer, or business problem.
- `rakshitRole`: What Rakshit personally owned or drove.
- `constraints`: Practical limits, such as time, data quality, legal, compliance, stakeholder, tech, or team constraints.
- `decisions`: Important product or technical decisions, why they were made, alternatives considered, and tradeoffs.
- `executionDetails`: What actually got built, shipped, tested, or changed.
- `metrics`: Before/after numbers, timeframes, and caveats.
- `failureModesOrRisks`: What could go wrong, did go wrong, or needed mitigation.
- `lessonsLearned`: What the work changed about Rakshit's product judgment.
- `evidenceLimits`: Claims the agent should not overstate.
- `goodForQuestionsAbout`: Search tags for questions where this evidence should appear.

## Minimum Bar For Ready

An entry is ready when it can support a 2-4 paragraph answer with:

- one concrete problem,
- one specific Rakshit-owned action,
- one decision or tradeoff,
- one outcome or learning,
- and one caveat if the evidence is limited.
