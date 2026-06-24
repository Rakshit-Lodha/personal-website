"""
Repair forced-alignment outputs by removing "ghost word" stretches at line starts.

Problem: wav2vec2 sometimes places early words across instrumental intros (or other
silent / non-vocal regions), giving them durations of many seconds. The remaining
words in the line are usually correctly timed.

Fix: walk each line left-to-right; any leading word whose duration exceeds a
threshold derived from the song's median word duration is treated as a ghost.
Its timestamps are reassigned to be a short, sequential interval leading up to
the first real word.
"""

import json
import statistics
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent / "output"

GHOST_DURATION_MULT = 5.0    # word counts as ghost if dur > median * this
GHOST_GAP_THRESHOLD = 1.0    # OR if gap to next word > this many seconds
MAX_GHOST_PER_LINE = 4       # safety cap


def median_word_duration(data: dict) -> float:
    durs = []
    for ln in data["lines"]:
        for w in ln.get("words", []):
            d = w["end"] - w["start"]
            if 0.05 < d < 1.5:
                durs.append(d)
    if not durs:
        return 0.3
    return statistics.median(durs)


def repair_line(line: dict, median: float, prev_line_end: float | None) -> int:
    words = line.get("words", [])
    if not words:
        return 0

    ghost_threshold = max(1.2, median * GHOST_DURATION_MULT)

    first_real = 0
    for i, w in enumerate(words):
        if i >= MAX_GHOST_PER_LINE:
            break
        dur = w["end"] - w["start"]
        gap = (words[i + 1]["start"] - w["end"]) if i + 1 < len(words) else 0
        if dur > ghost_threshold or gap > GHOST_GAP_THRESHOLD:
            first_real = i + 1
            continue
        break

    if first_real == 0 or first_real >= len(words):
        return 0

    real_start = words[first_real]["start"]
    per_word = min(median, 0.25)
    earliest_allowed = (prev_line_end + 0.05) if prev_line_end is not None else 0.0
    span_start = max(earliest_allowed, real_start - first_real * per_word)
    actual_per_word = (real_start - span_start) / first_real if first_real else per_word

    t = span_start
    for k in range(first_real):
        words[k]["start"] = round(t, 3)
        words[k]["end"] = round(t + actual_per_word * 0.95, 3)
        t += actual_per_word

    line["start"] = words[0]["start"]
    return first_real


def repair(path: Path) -> None:
    data = json.loads(path.read_text())
    median = median_word_duration(data)
    repaired = 0
    prev_end = None
    for ln in data["lines"]:
        n = repair_line(ln, median, prev_end)
        if n:
            repaired += 1
            print(f"  line: shifted {n} ghost word(s) · '{ln['text'][:50]}' -> start={ln['start']:.2f}")
        if ln.get("end") is not None:
            prev_end = ln["end"]
    print(f"[{data['title']}] median word dur={median:.2f}s · repaired {repaired} line(s)")
    path.write_text(json.dumps(data, indent=2))


def main():
    for fp in sorted(OUTPUT_DIR.glob("*.json")):
        repair(fp)


if __name__ == "__main__":
    main()
