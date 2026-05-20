# V1 vs V3PIPELINE Evaluation Diff

Generated: 2026-05-20

## Scores

| Metric | v1 | v3Pipeline | Δ |
|---|---:|---:|---:|
| Factual pass rate | 100% | 100% | 0pp |
| Quality overall avg | 2.8/4 | 3.2/4 | +0.4 |
| Skeptic fit-level accuracy | 25% | 58% | +33pp |
| Skeptic target alignment | 3.0/4 | 3.7/4 | +0.7 |
| Skeptic fit calibration | 2.4/4 | 3.2/4 | +0.8 |
| Skeptic explanation overall avg | 2.8/4 | 3.4/4 | +0.6 |

## Latency

| Metric | v1 | v3Pipeline | Δ |
|---|---:|---:|---:|
| Overall mean total | 10.4s | 18.0s | 7.6s (regression) |
| Overall mean first delta | 10.1s | 17.7s | 7.5s (regression) |
| Websearch mean | 0.0s | 8.3s | 8.3s (regression) |
| Context mean | 0.0s | 0.0s | 0.0s |
| Answer mean | 0.0s | 6.5s | 6.5s (regression) |

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
