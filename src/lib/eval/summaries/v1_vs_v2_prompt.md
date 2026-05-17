# V1 vs V2_PROMPT Evaluation Diff

Generated: 2026-05-17

## Scores

| Metric | v1 | v2_prompt | Δ |
|---|---:|---:|---:|
| Factual pass rate | 100% | 100% | 0pp |
| Quality overall avg | 2.8/4 | 3.4/4 | +0.6 |
| Skeptic fit-level accuracy | 25% | 42% | +17pp |
| Skeptic target alignment | 3.0/4 | 3.3/4 | +0.3 |
| Skeptic fit calibration | 2.4/4 | 2.8/4 | +0.4 |
| Skeptic explanation overall avg | 2.8/4 | 3.2/4 | +0.4 |

## Latency

| Metric | v1 | v2_prompt | Δ |
|---|---:|---:|---:|
| Overall mean total | 10.4s | 10.6s | 0.2s (regression) |
| Overall mean first delta | 10.1s | 10.2s | 0.1s (regression) |
| Websearch mean | 0.0s | 5.9s | 5.9s (regression) |
| Context mean | 0.0s | 2.8s | 2.8s (regression) |
| Answer mean | 0.0s | 6.1s | 6.1s (regression) |

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
