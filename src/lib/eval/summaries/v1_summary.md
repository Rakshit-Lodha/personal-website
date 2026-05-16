# V1 Evaluation Summary

Date: 2026-05-16
System prompt SHA: 8081e28e638ec9d57a4e851a52eee6376d0ef54c

## Scores

| Test Set | N | Metric | Score |
|---|---:|---|---:|
| Factual | 20 | Pass rate | 100% |
| Quality | 20 | Specificity (avg) | 3.0/4 |
| Quality | 20 | Evidence-citation (avg) | 2.8/4 |
| Quality | 20 | Anti-hallucination (avg) | 2.7/4 |
| Quality | 20 | Overall avg | 2.8/4 |
| Skeptic | 12 | Fit-level accuracy | 25% |
| Skeptic | 12 | Target alignment (avg) | 3.0/4 |
| Skeptic | 12 | Fit calibration (avg) | 2.4/4 |
| Skeptic | 12 | Explanation overall avg | 2.8/4 |

## Latency

| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |
|---|---:|---:|---:|---:|---:|
| Factual | 20 | 5.8s | 4.8s | 15.2s | 5.6s |
| Quality | 20 | 8.1s | 7.6s | 11.4s | 7.8s |
| Skeptic | 12 | 22.0s | 21.9s | 34.5s | 21.5s |
| **All** | 52 | 10.4s | 7.0s | 25.1s | 10.1s |

## Stage Latency (mean)

| Stage | Mean |
|---|---:|
| Websearch | 0.0s |
| Context | 0.0s |
| Answer | 0.0s |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
