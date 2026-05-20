# V2_PROMPT vs V3PIPELINE Evaluation Diff

Generated: 2026-05-20

## Scores

| Metric | v2_prompt | v3Pipeline | Δ |
|---|---:|---:|---:|
| Factual pass rate | 100% | 100% | 0pp |
| Quality overall avg | 3.4/4 | 3.2/4 | -0.2 (regression) |
| Skeptic fit-level accuracy | 42% | 58% | +17pp |
| Skeptic target alignment | 3.3/4 | 3.7/4 | +0.4 |
| Skeptic fit calibration | 2.8/4 | 3.2/4 | +0.4 |
| Skeptic explanation overall avg | 3.2/4 | 3.4/4 | +0.2 |

## Latency

| Metric | v2_prompt | v3Pipeline | Δ |
|---|---:|---:|---:|
| Overall mean total | 10.6s | 18.0s | 7.4s (regression) |
| Overall mean first delta | 10.2s | 17.7s | 7.4s (regression) |
| Websearch mean | 5.9s | 8.3s | 2.4s (regression) |
| Context mean | 2.8s | 0.0s | -2.8s |
| Answer mean | 6.1s | 6.5s | 0.4s (regression) |

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
