# V3PIPELINE_TIGHTENED vs V2_PROMPT Evaluation Diff

Generated: 2026-05-20

## Scores

| Metric | v3Pipeline_tightened | v2_prompt | Δ |
|---|---:|---:|---:|
| Factual pass rate | 100% | 100% | 0pp |
| Quality overall avg | 3.5/4 | 3.4/4 | -0.1 (regression) |
| Skeptic fit-level accuracy | 58% | 42% | -17pp (regression) |
| Skeptic target alignment | 3.7/4 | 3.3/4 | -0.4 (regression) |
| Skeptic fit calibration | 3.2/4 | 2.8/4 | -0.4 (regression) |
| Skeptic explanation overall avg | 3.6/4 | 3.2/4 | -0.4 (regression) |

## Latency

| Metric | v3Pipeline_tightened | v2_prompt | Δ |
|---|---:|---:|---:|
| Overall mean total | 21.9s | 10.6s | -11.3s |
| Overall mean first delta | 21.5s | 10.2s | -11.3s |
| Websearch mean | 7.6s | 5.9s | -1.7s |
| Context mean | 0.0s | 2.8s | 2.8s (regression) |
| Answer mean | 7.3s | 6.1s | -1.1s |

Notes:
- Score regressions are lower values.
- Latency regressions are higher values.
