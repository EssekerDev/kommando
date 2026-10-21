#!/usr/bin/env python3
"""Final Intervalle kit for Kommando.

The chosen mark: a stem and a 30° chevron separated by one measured pause.
Masters are filled paths, no live text. Encre #1C1C1E is the logo colour;
pure black and a thinned white are the reproduction pair.
"""

from __future__ import annotations

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_concepts import (  # noqa: E402
    BASE,
    CAP,
    CAP_Y,
    letter_a,
    letter_d,
    letter_k,
    letter_m,
    letter_n,
    letter_o,
)

TAN = math.tan(math.radians(30))
ENCRE = "#1C1C1E"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kit")


def fmt(n: float) -> str:
    v = round(float(n), 2)
    if abs(v - round(v)) < 1e-9:
        return str(int(round(v)))
    return f"{v:.2f}"


def d_points(pts: list[tuple[float, float]]) -> str:
    cmds = [f"M {fmt(pts[0][0])} {fmt(pts[0][1])}"]
    for x, y in pts[1:]:
        cmds.append(f"L {fmt(x)} {fmt(y)}")
    cmds.append("Z")
    return " ".join(cmds)


def svg(title: str, body: str, x: float, y: float, w: float, h: float) -> str:
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{fmt(x)} {fmt(y)} {fmt(w)} {fmt(h)}" '
        f'width="{fmt(w)}" height="{fmt(h)}" role="img" aria-labelledby="title">\n'
        f'  <title id="title">{title}</title>\n'
        f"{body}\n"
        "</svg>\n"
    )


def intervalle(sw=62.0, gap=40.0, blunt=26.0, arm_dx=96.0, thick=48.0):
    """Stem, upper arm, lower arm. Outer tips share the stem's cap and baseline."""
    px = sw + gap
    mid = 0.0

    def arm(sign: float):
        inner_y = mid - sign * (blunt / 2.0)
        tip_inner_y = inner_y - sign * arm_dx * TAN
        tip_outer_y = tip_inner_y - sign * thick
        outer_y = inner_y - sign * thick
        return [
            (px, inner_y),
            (px, outer_y),
            (px + arm_dx, tip_outer_y),
            (px + arm_dx, tip_inner_y),
        ]

    upper, lower = arm(1.0), arm(-1.0)
    ys = [p[1] for p in upper + lower]
    top, bot = min(ys), max(ys)
    stem = [(0.0, top), (sw, top), (sw, bot), (0.0, bot)]
    return [stem, upper, lower]


def bounds(parts):
    pts = [p for part in parts for p in part]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def paint(parts, fill: str) -> str:
    return "\n".join(f'  <path id="piece-{i}" fill="{fill}" d="{d_points(p)}"/>' for i, p in enumerate(parts))


def square_symbol(parts, title: str, fill: str, pad: float = 26.0, lift: float = 4.0, nudge_x: float = 6.0) -> str:
    """Fit the ink into 256, optical centre a little high, mass nudged right of the bbox."""
    x0, y0, x1, y1 = bounds(parts)
    bw, bh = x1 - x0, y1 - y0
    s = (256 - 2 * pad) / max(bw, bh)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    tx = 128 - cx * s + nudge_x
    ty = 128 - lift - cy * s
    placed = scale_parts(parts, s, tx, ty)
    body = f'  <g id="symbol">\n{paint(placed, fill)}\n  </g>'
    return svg(title, body, 0, 0, 256, 256)


def word_parts(fill: str):
    """Kommando. The K is the solid cousin of the symbol: same 30°, no second pause."""
    x = 0.0
    chunks: list[tuple[str, str]] = []

    def place(fn, after: float, rule: str) -> None:
        nonlocal x
        d, w = fn(x)
        chunks.append((d, rule))
        x += w + after

    place(letter_k, 14, "nonzero")
    place(letter_o, 8, "evenodd")
    place(letter_m, 10, "nonzero")
    place(letter_m, 8, "nonzero")
    place(letter_a, 10, "nonzero")
    place(letter_n, 8, "nonzero")
    place(letter_d, 8, "evenodd")
    place(letter_o, 0, "evenodd")
    body = "\n".join(
        f'  <path fill="{fill}" fill-rule="{rule}" d="{d}"/>' for d, rule in chunks
    )
    return body, x


def scale_parts(parts, s: float, ox: float, oy: float):
    return [[(ox + x * s, oy + y * s) for x, y in part] for part in parts]


def horizontal(fill: str) -> str:
    parts = intervalle()
    x0, y0, x1, y1 = bounds(parts)
    s = CAP / (y1 - y0)
    # Ink of the symbol shares the word's cap line and baseline.
    placed = scale_parts(parts, s, -x0 * s, CAP_Y - y0 * s)
    sx0, sy0, sx1, sy1 = bounds(placed)
    # Half a cap height. The mark's own pause is about 23 units after this
    # scale; a gap near that lets the chevron run into the word's K.
    gap = CAP * 0.5
    word, width = word_parts(fill)
    word_x = sx1 + gap
    sym = "\n".join(f'  <path fill="{fill}" d="{d_points(p)}"/>' for p in placed)
    body = f'  <g id="symbol">\n{sym}\n  </g>\n  <g id="wordmark" transform="translate({fmt(word_x)} 0)">\n{word}\n  </g>'
    pad = 2.0
    return svg(
        "Kommando — logo horizontal",
        body,
        -pad,
        CAP_Y - 8,
        word_x + width + pad * 2,
        (BASE + 10) - (CAP_Y - 8),
    )


def stacked(fill: str) -> str:
    parts = intervalle()
    x0, y0, x1, y1 = bounds(parts)
    word, width = word_parts(fill)
    # A near-square mark sized to a fraction of this long name becomes a poster.
    # Two cap-heights keeps the symbol in front and the name readable beside it.
    sym_h = CAP * 2.05
    s = sym_h / (y1 - y0)
    sym_w = (x1 - x0) * s
    sym_x = (width - sym_w) / 2 - x0 * s
    # The stem outweighs the chevron, so the box centre sits left of the eye.
    sym_x += sym_w * 0.045
    placed = scale_parts(parts, s, sym_x, -y0 * s)
    # Visible pause between the symbol's baseline and the word's cap line.
    # The word's own coordinates already start at CAP_Y, so that offset is removed.
    gap = CAP * 0.42
    word_y = sym_h + gap - CAP_Y
    sym = "\n".join(f'  <path fill="{fill}" d="{d_points(p)}"/>' for p in placed)
    body = (
        f'  <g id="symbol">\n{sym}\n  </g>\n'
        f'  <g id="wordmark" transform="translate(0 {fmt(word_y)})">\n{word}\n  </g>'
    )
    # Word ink starts at CAP_Y inside the translated group, so the group's y is word_y
    # and the visible top of the word is word_y + CAP_Y. Include overshoot.
    top = -2
    bot = word_y + BASE + 10
    return svg("Kommando — logo empilé", body, -4, top, width + 8, bot - top)


def wordmark_only(fill: str) -> str:
    word, width = word_parts(fill)
    return svg(
        "Kommando — nom seul",
        f'  <g id="wordmark">\n{word}\n  </g>',
        -2,
        CAP_Y - 8,
        width + 4,
        (BASE + 10) - (CAP_Y - 8),
    )


def write(name: str, text: str) -> str:
    os.makedirs(OUT, exist_ok=True)
    dest = os.path.join(OUT, name)
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(dest)
    return dest


def main() -> None:
    master = intervalle()
    write("symbol.svg", square_symbol(master, "Kommando", ENCRE))
    write("symbol-black.svg", square_symbol(master, "Kommando", "#000000"))
    # White on dark blooms. Thinner stem, thinner arms, a slightly wider pause.
    thin = intervalle(sw=56, gap=44, blunt=30, thick=42, arm_dx=92)
    write("symbol-reversed.svg", square_symbol(thin, "Kommando, inversé", "#FFFFFF", nudge_x=5))
    # Favicon: shorter arms, heavier pieces, a pause that survives 16 px.
    small = intervalle(sw=74, gap=52, blunt=44, thick=58, arm_dx=78)
    write("symbol-small.svg", square_symbol(small, "Kommando, petite taille", ENCRE, pad=22, nudge_x=4))
    write("symbol-small-white.svg", square_symbol(small, "Kommando, petite taille, blanc", "#FFFFFF", pad=22, nudge_x=4))
    write("horizontal.svg", horizontal(ENCRE))
    write("horizontal-white.svg", horizontal("#FFFFFF"))
    write("stacked.svg", stacked(ENCRE))
    write("stacked-white.svg", stacked("#FFFFFF"))
    write("wordmark.svg", wordmark_only(ENCRE))
    write("wordmark-white.svg", wordmark_only("#FFFFFF"))


if __name__ == "__main__":
    main()
