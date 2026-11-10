"""Film one RICH DZ motion-graphics piece from film.html.

  python3 render.py frames <film>          a few full-size frames per scene, to look at before rendering
  python3 render.py render <film> <out>    every scene to its own mp4, joined without re-encoding (silent)
  python3 render.py info <film>            scene lengths and sound cues as JSON, for audio.py

Serve the repo root first:  python3 -m http.server 4180   (run from the repo root)
"""
import os
import subprocess
import sys
from playwright.sync_api import sync_playwright

FPS = 30
BASE = "http://localhost:4180/video-src/film.html?v="
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high",
       "-g", "60", "-keyint_min", "60", "-sc_threshold", "0", "-video_track_timescale", "15360"]


def open_film(p, film):
    browser = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--force-color-profile=srgb"])
    page = browser.new_context(viewport={"width": 1080, "height": 1920}, device_scale_factor=1).new_page()
    page.goto(BASE + film, wait_until="networkidle")
    page.evaluate("window.ready")
    return browser, page, page.evaluate("window.filmInfo")


def frames(film, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    with sync_playwright() as p:
        browser, page, info = open_film(p, film)
        for i, dur in enumerate(info["scenes"]):
            for label, t in (("a", dur * 0.3), ("b", dur - 0.7)):
                page.evaluate("([i, t]) => seek(i, t)", [i, t])
                page.screenshot(path=f"{out_dir}/{film}-{i}{label}.jpg", type="jpeg", quality=88)
        browser.close()
    print(film, "frames written to", out_dir)


def render(film, out):
    work = out + ".parts"
    os.makedirs(work, exist_ok=True)
    parts = []
    with sync_playwright() as p:
        browser, page, info = open_film(p, film)
        for i, dur in enumerate(info["scenes"]):
            n = round(dur * FPS)
            final = f"{work}/scene_{i:02d}.mp4"
            tmp = f"{work}/scene_{i:02d}.tmp.mp4"
            ff = subprocess.Popen(
                ["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                 *ENC, "-r", str(FPS), tmp], stdin=subprocess.PIPE)
            for f in range(n):
                page.evaluate("([i, t]) => seek(i, t)", [i, f / FPS])
                ff.stdin.write(page.screenshot(type="jpeg", quality=92))
            ff.stdin.close()
            if ff.wait() != 0:
                sys.exit(f"ffmpeg failed on scene {i}")
            os.replace(tmp, final)
            parts.append(final)
            print(film, "scene", i, n, "frames", flush=True)
        browser.close()
    with open(f"{work}/list.txt", "w") as fh:
        fh.writelines(f"file '{os.path.abspath(x)}'\n" for x in parts)
    tmp = out + ".tmp.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{work}/list.txt", "-c", "copy", tmp], check=True)
    os.replace(tmp, out)
    print(film, "joined ->", out, flush=True)


def info(film):
    import json
    with sync_playwright() as p:
        browser, _page, data = open_film(p, film)
        browser.close()
    print(json.dumps(data))


if __name__ == "__main__":
    mode, film = sys.argv[1], sys.argv[2]
    if mode == "info":
        info(film)
    elif mode == "frames":
        frames(film, sys.argv[3])
    else:
        render(film, sys.argv[3])
