# V3PIPELINE_TIGHTENED Evaluation Summary

Date: 2026-05-30
Prompt version: v1
Profile version: v2
System prompt SHA: ae763816fdc4ce047b378915666bcbc3ff5068e0

## Scores

| Test Set | N | Metric | Score |
|---|---:|---|---:|
| Factual | 20 | Pass rate | 100% |
| Quality | 20 | Specificity (avg) | 3.6/4 |
| Quality | 20 | Evidence-citation (avg) | 3.5/4 |
| Quality | 20 | Anti-hallucination (avg) | 3.4/4 |
| Quality | 20 | Overall avg | 3.5/4 |
| Skeptic | 12 | Fit-level accuracy | 58% |
| Skeptic | 12 | Target alignment (avg) | 3.7/4 |
| Skeptic | 12 | Fit calibration (avg) | 3.2/4 |
| Skeptic | 12 | Explanation overall avg | 3.6/4 |

## Latency

| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |
|---|---:|---:|---:|---:|---:|
| Factual | 20 | 10.9s | 9.9s | 15.6s | 10.8s |
| Quality | 20 | 21.1s | 20.7s | 32.5s | 20.5s |
| Skeptic | 12 | 41.7s | 36.1s | 104.9s | 41.0s |
| **All** | 52 | 21.9s | 17.7s | 42.4s | 21.5s |

## Stage Latency (mean)

| Stage | Mean |
|---|---:|
| Websearch | 7.6s |
| Context | 0.0s |
| Answer | 7.3s |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
