# V2_PROFILE Evaluation Summary

Date: 2026-05-17
Prompt version: v2Candidate
Profile version: v2
System prompt SHA: 3743b8514c5fb3243b7a1ad9bd7a3a774a82106d

## Scores

| Test Set | N | Metric | Score |
|---|---:|---|---:|
| Factual | 20 | Pass rate | 100% |
| Quality | 20 | Specificity (avg) | 3.0/4 |
| Quality | 20 | Evidence-citation (avg) | 2.9/4 |
| Quality | 20 | Anti-hallucination (avg) | 3.0/4 |
| Quality | 20 | Overall avg | 2.9/4 |
| Skeptic | 12 | Fit-level accuracy | 50% |
| Skeptic | 12 | Target alignment (avg) | 3.4/4 |
| Skeptic | 12 | Fit calibration (avg) | 2.8/4 |
| Skeptic | 12 | Explanation overall avg | 3.1/4 |

## Latency

| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |
|---|---:|---:|---:|---:|---:|
| Factual | 20 | 4.9s | 4.4s | 7.5s | 4.8s |
| Quality | 20 | 6.6s | 6.5s | 8.0s | 6.3s |
| Skeptic | 12 | 18.6s | 18.0s | 24.6s | 18.1s |
| **All** | 52 | 8.7s | 6.2s | 23.7s | 8.4s |

## Stage Latency (mean)

| Stage | Mean |
|---|---:|
| Websearch | 5.0s |
| Context | 2.6s |
| Answer | 4.8s |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
