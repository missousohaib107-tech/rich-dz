"""Soundtrack for a RICH DZ film: a soft music bed plus a whoosh on every scene change
and a small pop where something lands. Everything is synthesised here, nothing is sampled.

  python3 audio.py '<json from: render.py info FILM>' out.wav
"""
import json
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
BEAT = 0.6            # 100 BPM
BAR = 4 * BEAT

# IV – V – vi – I in C major: bass root, then the pad notes (Hz)
CHORDS = [
    (87.31, [174.61, 220.00, 261.63, 329.63]),
    (98.00, [196.00, 246.94, 293.66, 392.00]),
    (110.00, [220.00, 261.63, 329.63, 392.00]),
    (130.81, [196.00, 261.63, 329.63, 392.00]),
]


def tone(freq, dur, attack, release, detune=0.0, harmonic=0.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * freq * (1 + detune) * t)
    if harmonic:
        x += harmonic * np.sin(2 * np.pi * 2 * freq * t)
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    return x * np.clip(env, 0, 1)


def pluck(freq, dur=0.5):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 18)
    return x * np.exp(-t * 7) * np.minimum(1, t / 0.004)


def kick():
    t = np.arange(int(0.28 * SR)) / SR
    f = 46 + 70 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 13)


def whoosh(rng, dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    x = sosfilt(butter(2, [500, 3200], btype="band", fs=SR, output="sos"), noise)
    env = np.exp(-((t - 0.32) ** 2) / (2 * 0.11 ** 2))
    return x * env


def pop(freq=940.0):
    t = np.arange(int(0.11 * SR)) / SR
    f = freq * (1 + 0.25 * np.minimum(1, t / 0.03))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 42) * np.minimum(1, t / 0.003)


def add(mix, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i < 0:
        x, i = x[-i:], 0
    x = x[: max(0, mix.shape[0] - i)]
    mix[i:i + len(x), 0] += x * gain * (1 - max(0, pan))
    mix[i:i + len(x), 1] += x * gain * (1 + min(0, pan))


def build(info):
    scenes = info["scenes"]
    total = sum(scenes)
    mix = np.zeros((int(total * SR) + SR, 2))
    rng = np.random.default_rng(7)

    bars = int(np.ceil(total / BAR))
    for b in range(bars):
        at = b * BAR
        root, notes = CHORDS[b % 4]
        full = b >= 1 and at < total - BAR          # first bar is pad only; last bar rings out
        for k, f in enumerate(notes):                # pad, slightly detuned between ears
            add(mix, tone(f, BAR + 0.5, 0.45, 0.7, detune=0.0025, harmonic=0.12), at, 0.050, pan=-0.5)
            add(mix, tone(f, BAR + 0.5, 0.45, 0.7, detune=-0.0025, harmonic=0.12), at, 0.050, pan=0.5)
        add(mix, tone(root, BAR, 0.05, 0.35, harmonic=0.2), at, 0.16 if full else 0.08)
        if full:
            add(mix, kick(), at, 0.42)
            add(mix, kick(), at + 2 * BEAT, 0.34)
        order = [0, 2, 1, 3, 2, 1, 3, 2] if b % 2 == 0 else [3, 1, 2, 0, 2, 3, 1, 2]
        for i, n in enumerate(order):                # arpeggio on eighth notes, one octave up
            if at + i * BEAT / 2 > total - 1.6:
                break
            pan = 0.45 if i % 2 else -0.45
            add(mix, pluck(notes[n] * 2), at + i * BEAT / 2, 0.085, pan)
            add(mix, pluck(notes[n] * 2), at + i * BEAT / 2 + 0.3, 0.030, -pan)   # one echo

    start = 0.0
    for i, dur in enumerate(scenes):
        if i:
            add(mix, whoosh(rng), start - 0.32, 0.10, pan=0.3 if i % 2 else -0.3)
        for j, cue in enumerate(info["cues"][i]):
            add(mix, pop(940 if j % 2 == 0 else 1175), start + cue, 0.07)
        start += dur

    mix = mix[: int(total * SR)]
    fade = int(1.4 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    mix[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
    mix = np.tanh(mix * 1.6) / 1.6
    mix *= 0.7 / np.max(np.abs(mix))
    return (mix * 32767).astype(np.int16)


if __name__ == "__main__":
    wavfile.write(sys.argv[2], SR, build(json.loads(sys.argv[1])))
    print("audio ->", sys.argv[2])
