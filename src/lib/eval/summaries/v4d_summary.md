# V4D Evaluation Summary

Date: 2026-05-30
Prompt version: v1
Profile version: v2
System prompt SHA: 4ee93feabec0ac241d2ab8c0855e4f8ace0c7962

## Scores

| Test Set | N | Metric | Score |
|---|---:|---|---:|
| Factual | 20 | Pass rate | 100% |
| Quality | 20 | Specificity (avg) | 3.4/4 |
| Quality | 20 | Evidence-citation (avg) | 3.3/4 |
| Quality | 20 | Anti-hallucination (avg) | 3.1/4 |
| Quality | 20 | Overall avg | 3.3/4 |
| Skeptic | 12 | Fit-level accuracy | 92% |
| Skeptic | 12 | Target alignment (avg) | 3.8/4 |
| Skeptic | 12 | Fit calibration (avg) | 3.8/4 |
| Skeptic | 12 | Explanation overall avg | 3.9/4 |

## Latency

| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |
|---|---:|---:|---:|---:|---:|
| Factual | 20 | 14.8s | 11.3s | 32.2s | 13.5s |
| Quality | 20 | 15.5s | 15.1s | 23.1s | 10.9s |
| Skeptic | 12 | 37.7s | 36.7s | 53.9s | 25.5s |
| **All** | 52 | 20.3s | 16.1s | 41.5s | 15.3s |

## Stage Latency (mean)

| Stage | Mean |
|---|---:|
| Websearch | 10.2s |
| Context | 0.0s |
| Answer | 10.2s |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
