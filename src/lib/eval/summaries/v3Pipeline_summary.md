# V3PIPELINE Evaluation Summary

Date: 2026-05-20
Prompt version: v3Pipeline
Profile version: v2
System prompt SHA: ae763816fdc4ce047b378915666bcbc3ff5068e0

## Scores

| Test Set | N | Metric | Score |
|---|---:|---|---:|
| Factual | 20 | Pass rate | 100% |
| Quality | 20 | Specificity (avg) | 3.3/4 |
| Quality | 20 | Evidence-citation (avg) | 3.2/4 |
| Quality | 20 | Anti-hallucination (avg) | 3.1/4 |
| Quality | 20 | Overall avg | 3.2/4 |
| Skeptic | 12 | Fit-level accuracy | 58% |
| Skeptic | 12 | Target alignment (avg) | 3.7/4 |
| Skeptic | 12 | Fit calibration (avg) | 3.2/4 |
| Skeptic | 12 | Explanation overall avg | 3.4/4 |

## Latency

| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |
|---|---:|---:|---:|---:|---:|
| Factual | 20 | 10.6s | 9.4s | 18.3s | 10.5s |
| Quality | 20 | 16.2s | 14.9s | 21.7s | 15.8s |
| Skeptic | 12 | 33.4s | 32.8s | 44.9s | 32.7s |
| **All** | 52 | 18.0s | 14.6s | 37.9s | 17.7s |

## Stage Latency (mean)

| Stage | Mean |
|---|---:|
| Websearch | 8.3s |
| Context | 0.0s |
| Answer | 6.5s |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
