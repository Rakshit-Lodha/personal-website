# V1 vs V2_PROFILE Evaluation Diff

Generated: 2026-05-17

## Scores

| Metric | v1 | v2_profile | Δ |
|---|---:|---:|---:|
| Factual pass rate | 100% | 100% | 0pp |
| Quality overall avg | 2.8/4 | 2.9/4 | +0.1 |
| Skeptic fit-level accuracy | 25% | 50% | +25pp |
| Skeptic target alignment | 3.0/4 | 3.4/4 | +0.4 |
| Skeptic fit calibration | 2.4/4 | 2.8/4 | +0.4 |
| Skeptic explanation overall avg | 2.8/4 | 3.1/4 | +0.3 |

## Latency

| Metric | v1 | v2_profile | Δ |
|---|---:|---:|---:|
| Overall mean total | 10.4s | 8.7s | -1.7s |
| Overall mean first delta | 10.1s | 8.4s | -1.7s |
| Websearch mean | 0.0s | 5.0s | 5.0s (regression) |
| Context mean | 0.0s | 2.6s | 2.6s (regression) |
| Answer mean | 0.0s | 4.8s | 4.8s (regression) |

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
