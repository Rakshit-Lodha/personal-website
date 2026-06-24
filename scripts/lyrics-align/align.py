"""
Forced-alignment of known lyrics to audio using WhisperX.

Usage:
    python align.py                  # align every song that has a matching lyrics file
    python align.py "Open It Up"     # align one song by title

Expects:
    ../../music/<title>.mp3
    lyrics/<title>.txt

Produces:
    output/<title>.json with line- and word-level timestamps.
"""

import json
import re
import sys
from pathlib import Path

import whisperx

ROOT = Path(__file__).resolve().parent
MUSIC_DIR = ROOT.parent.parent / "music"
LYRICS_DIR = ROOT / "lyrics"
OUTPUT_DIR = ROOT / "output"
VOCALS_DIR = ROOT / "separated" / "htdemucs"  # written by `demucs --two-stems=vocals`

SECTION_RE = re.compile(r"^\s*\[[^\]]+\]\s*$")
PUNCT_STRIP = re.compile(r'^[\s"\'(]+|[\s"\'),.!?:;]+$')


def load_lyric_lines(path: Path) -> list[str]:
    """Read lyrics file, drop [Section] markers and blank lines."""
    lines = []
    for raw in path.read_text().splitlines():
        if not raw.strip():
            continue
        if SECTION_RE.match(raw):
            continue
        lines.append(raw.strip())
    return lines


def normalize_word(w: str) -> str:
    """Lowercase + strip punctuation for matching."""
    return PUNCT_STRIP.sub("", w).lower()


def group_words_into_lines(words: list[dict], lines: list[str]) -> list[dict]:
    """Walk aligned words sequentially and assign them to lyric lines."""
    line_outputs = []
    word_idx = 0

    for line in lines:
        line_tokens = [normalize_word(t) for t in line.split() if normalize_word(t)]
        line_words = []
        matched = 0

        while word_idx < len(words) and matched < len(line_tokens):
            w = words[word_idx]
            word_idx += 1
            if "start" not in w or "end" not in w:
                continue
            line_words.append({
                "word": w.get("word", "").strip(),
                "start": round(float(w["start"]), 3),
                "end": round(float(w["end"]), 3),
            })
            matched += 1

        if line_words:
            line_outputs.append({
                "text": line,
                "start": line_words[0]["start"],
                "end": line_words[-1]["end"],
                "words": line_words,
            })
        else:
            line_outputs.append({
                "text": line,
                "start": None,
                "end": None,
                "words": [],
            })

    return line_outputs


def resolve_audio_path(title: str) -> Path:
    """Prefer demucs-separated vocals if present, else original mp3."""
    vocals_path = VOCALS_DIR / title / "vocals.wav"
    if vocals_path.exists():
        return vocals_path
    return MUSIC_DIR / f"{title}.mp3"


def align_song(title: str, align_model, metadata) -> dict:
    audio_path = resolve_audio_path(title)
    lyrics_path = LYRICS_DIR / f"{title}.txt"
    if not audio_path.exists():
        raise FileNotFoundError(audio_path)
    if not lyrics_path.exists():
        raise FileNotFoundError(lyrics_path)

    source_kind = "vocals" if "vocals.wav" in str(audio_path) else "mp3"
    print(f"[{title}] loading audio ({source_kind}: {audio_path.name})…")
    audio = whisperx.load_audio(str(audio_path))
    duration = len(audio) / 16000.0

    lines = load_lyric_lines(lyrics_path)
    full_text = " ".join(lines)
    print(f"[{title}] {len(lines)} lines · {duration:.1f}s audio")

    segment = {"text": full_text, "start": 0.0, "end": duration}

    print(f"[{title}] aligning…")
    aligned = whisperx.align(
        [segment],
        align_model,
        metadata,
        audio,
        device="cpu",
        return_char_alignments=False,
    )

    all_words = aligned.get("word_segments")
    if not all_words:
        all_words = []
        for seg in aligned["segments"]:
            all_words.extend(seg.get("words", []))

    print(f"[{title}] {len(all_words)} aligned words")

    line_outputs = group_words_into_lines(all_words, lines)

    return {
        "title": title,
        "audio": f"music/{title}.mp3",
        "duration": round(duration, 3),
        "lines": line_outputs,
    }


def discover_titles() -> list[str]:
    return sorted(p.stem for p in LYRICS_DIR.glob("*.txt"))


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    titles = [sys.argv[1]] if len(sys.argv) > 1 else discover_titles()
    if not titles:
        print("no lyric files found in lyrics/")
        sys.exit(2)

    print("loading wav2vec2 alignment model…")
    align_model, metadata = whisperx.load_align_model(
        language_code="en", device="cpu"
    )

    for title in titles:
        try:
            result = align_song(title, align_model, metadata)
        except FileNotFoundError as e:
            print(f"[{title}] skipped: {e}")
            continue
        out_path = OUTPUT_DIR / f"{title}.json"
        out_path.write_text(json.dumps(result, indent=2))
        print(f"[{title}] -> {out_path}")


if __name__ == "__main__":
    main()
