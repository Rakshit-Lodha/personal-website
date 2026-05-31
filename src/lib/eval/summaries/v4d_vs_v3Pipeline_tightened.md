# V4D vs V3PIPELINE_TIGHTENED Evaluation Diff

Generated: 2026-05-30

## Scores

| Metric | v4d | v3Pipeline_tightened | Δ |
|---|---:|---:|---:|
| Factual pass rate | 100% | 100% | 0pp |
| Quality overall avg | 3.3/4 | 3.5/4 | +0.2 |
| Skeptic fit-level accuracy | 92% | 58% | -33pp (regression) |
| Skeptic target alignment | 3.8/4 | 3.7/4 | -0.1 (regression) |
| Skeptic fit calibration | 3.8/4 | 3.2/4 | -0.6 (regression) |
| Skeptic explanation overall avg | 3.9/4 | 3.6/4 | -0.3 (regression) |

## Latency

| Metric | v4d | v3Pipeline_tightened | Δ |
|---|---:|---:|---:|
| Overall mean total | 20.3s | 21.9s | 1.6s (regression) |
| Overall mean first delta | 15.3s | 21.5s | 6.3s (regression) |
| Websearch mean | 10.2s | 7.6s | -2.6s |
| Context mean | 0.0s | 0.0s | 0.0s |
| Answer mean | 10.2s | 7.3s | -3.0s |

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
