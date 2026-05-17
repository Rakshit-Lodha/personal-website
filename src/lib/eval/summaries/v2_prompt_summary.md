# V2_PROMPT Evaluation Summary

Date: 2026-05-17
Prompt version: v2Candidate
Profile version: v2
System prompt SHA: 3743b8514c5fb3243b7a1ad9bd7a3a774a82106d

## Scores

| Test Set | N | Metric | Score |
|---|---:|---|---:|
| Factual | 20 | Pass rate | 100% |
| Quality | 20 | Specificity (avg) | 3.4/4 |
| Quality | 20 | Evidence-citation (avg) | 3.4/4 |
| Quality | 20 | Anti-hallucination (avg) | 3.3/4 |
| Quality | 20 | Overall avg | 3.4/4 |
| Skeptic | 12 | Fit-level accuracy | 42% |
| Skeptic | 12 | Target alignment (avg) | 3.3/4 |
| Skeptic | 12 | Fit calibration (avg) | 2.8/4 |
| Skeptic | 12 | Explanation overall avg | 3.2/4 |

## Latency

| Test Set | N | Mean Total | Median Total | p95 Total | Mean First Delta |
|---|---:|---:|---:|---:|---:|
| Factual | 20 | 5.1s | 4.8s | 6.1s | 5.0s |
| Quality | 20 | 8.5s | 8.4s | 11.7s | 8.1s |
| Skeptic | 12 | 23.2s | 21.8s | 32.9s | 22.5s |
| **All** | 52 | 10.6s | 7.8s | 29.2s | 10.2s |

## Stage Latency (mean)

| Stage | Mean |
|---|---:|
| Websearch | 5.9s |
| Context | 2.8s |
| Answer | 6.1s |

Notes:
- Single-run timings. Run-to-run variance from upstream APIs is typically 20-50%.
- Stage means computed only across cases where the stage ran.
