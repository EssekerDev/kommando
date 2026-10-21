#!/usr/bin/env python3
"""Kommando logo concepts. Black geometry only.

Symbols sit on a 256 canvas. Diagonals are true 30° (tan 30° = 1/√3).
Marche's lower leg is five equal stairs: every outer corner lies on one 30° line,
and the gap between that stair and the inner edge stays constant.
"""

from __future__ import annotations

import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "concepts")
TAN = math.tan(math.radians(30))

# Wordmark metrics (lockup height 256).
CAP_Y = 74.0
BASE = 210.0
CAP = BASE - CAP_Y
XH = 100.0
XH_TOP = BASE - XH
OVER = 7.0
STEM = 26.0


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


def svg_doc(title: str, body: str, w: float, h: float) -> str:
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {fmt(w)} {fmt(h)}" width="{fmt(w)}" height="{fmt(h)}" '
        'role="img" aria-labelledby="title">\n'
        f"  <title id=\"title\">{title}</title>\n"
        f"{body}\n"
        "</svg>\n"
    )


def write(name: str, text: str) -> None:
    os.makedirs(OUT, exist_ok=True)
    dest = os.path.join(OUT, name)
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(dest)


def fit_translate(pts: list[tuple[float, float]], size: float = 256, pad: float = 22, lift: float = 4):
    """Uniform-fit a point list into the canvas. Optical centre sits `lift` above middle."""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    bw, bh = maxx - minx, maxy - miny
    avail = size - 2 * pad
    s = min(avail / bw, avail / bh)
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    tx = size / 2 - cx * s
    ty = size / 2 - lift - cy * s
    return s, tx, ty


def group(paths: list[str], s: float, tx: float, ty: float, gid: str = "symbol") -> str:
    inner = "\n".join(f'    <path fill="#000" d="{p}"/>' for p in paths)
    return (
        f'  <g id="{gid}" transform="translate({fmt(tx)} {fmt(ty)}) scale({s:.5f})">\n'
        f"{inner}\n"
        f"  </g>"
    )


# --- A · Marche --------------------------------------------------------------

def marche_geometry() -> list[tuple[float, float]]:
    """Flat cap, 30° upper arm, five stairs on the leg.

    Each tread is 36 and each riser is 36·tan 30°, so the outer corners sit on
    a true 30° line. The black band above the stairs is one clear module, and
    the right-hand face is the same height as that band.
    """
    sl, sr = 0.0, 70.0
    top = 0.0
    cy_u = 82.0
    yl = cy_u + 20.0
    tread = 36.0
    steps = 5
    riser = tread * TAN
    root = 36.0
    y0 = yl + root
    cut = 18.0
    reach_u = (cy_u - top) / TAN
    tip_x = sr + reach_u - cut
    term_y = top + cut * TAN
    foot_x = sr + steps * tread
    foot_y = y0 + steps * riser
    inner_end_y = yl + steps * tread * TAN

    # Stairs, outer corners, from the stem outward.
    corners = []
    for i in range(1, steps + 1):
        corners.append((sr + i * tread, y0 + i * riser))

    pts = [
        (sl, top),
        (sr, top),
        (tip_x, top),
        (tip_x, term_y),
        (sr, cy_u),
        (sr, yl),
        (foot_x, inner_end_y),
        (foot_x, foot_y),
    ]
    # Back along the stairs: left along the tread, up the riser.
    for i in range(steps, 0, -1):
        x = sr + i * tread
        y_bot = y0 + i * riser
        y_top = y0 + (i - 1) * riser
        pts.append((x - tread, y_bot))
        pts.append((x - tread, y_top))
    pts.append((sr, foot_y))
    pts.append((sl, foot_y))

    # The inner edge must stay clear of every tread.
    gap = root - riser
    if gap < 14:
        raise SystemExit(f"leg gap {gap:.1f} is too tight")
    return pts


def symbol_marche() -> tuple[str, list[str], float, float, float]:
    pts = marche_geometry()
    s, tx, ty = fit_translate(pts, pad=26, lift=2)
    tx += 4  # stem is heavier than the stairs; a small shift keeps the mass centred
    body = group([d_points(pts)], s, tx, ty)
    doc = svg_doc("Kommando — Marche, symbol", body, 256, 256)
    return doc, [d_points(pts)], s, tx, ty


# --- C · Intervalle ----------------------------------------------------------

def intervalle_geometry() -> list[list[tuple[float, float]]]:
    """Stem plus a detached chevron. The gap is the beat before the answer.

    Arms are 30°. Their outer tips set the cap and the baseline, and the stem
    shares those two lines so the three pieces read as one letter.
    """
    sw = 62.0
    gap = 40.0
    blunt = 26.0
    arm_dx = 96.0
    thick = 48.0
    mid = 0.0
    px = sw + gap

    def arm(sign: float) -> list[tuple[float, float]]:
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


def symbol_intervalle() -> tuple[str, list[str], float, float, float]:
    parts = intervalle_geometry()
    flat = [p for part in parts for p in part]
    s, tx, ty = fit_translate(flat, pad=28, lift=3)
    ds = [d_points(p) for p in parts]
    body = group(ds, s, tx, ty)
    doc = svg_doc("Kommando — Intervalle, symbol", body, 256, 256)
    return doc, ds, s, tx, ty


# --- Letters -----------------------------------------------------------------

def circle(cx: float, cy: float, r: float, sweep: int) -> str:
    return (
        f"M {fmt(cx + r)} {fmt(cy)} "
        f"A {fmt(r)} {fmt(r)} 0 1 {sweep} {fmt(cx - r)} {fmt(cy)} "
        f"A {fmt(r)} {fmt(r)} 0 1 {sweep} {fmt(cx + r)} {fmt(cy)} Z"
    )


def letter_o(x: float) -> tuple[str, float]:
    ro = XH / 2 + OVER
    ri = ro - STEM
    cx = x + ro
    cy = (XH_TOP - OVER + BASE + OVER) / 2
    return circle(cx, cy, ro, 1) + " " + circle(cx, cy, ri, 0), ro * 2


def letter_n(x: float) -> tuple[str, float]:
    s = STEM
    ri = 22.0
    r = s + ri
    # Spring line sits so the crown of the arch overshoots the x-height by OVER.
    spring = XH_TOP - OVER + r
    width = 2 * r
    d = (
        f"M {fmt(x)} {fmt(BASE)} L {fmt(x)} {fmt(spring)} "
        f"A {fmt(r)} {fmt(r)} 0 0 1 {fmt(x + width)} {fmt(spring)} "
        f"L {fmt(x + width)} {fmt(BASE)} "
        f"L {fmt(x + width - s)} {fmt(BASE)} "
        f"L {fmt(x + width - s)} {fmt(spring)} "
        f"A {fmt(ri)} {fmt(ri)} 0 0 0 {fmt(x + s)} {fmt(spring)} "
        f"L {fmt(x + s)} {fmt(BASE)} Z"
    )
    return d, width


def letter_m(x: float) -> tuple[str, float]:
    """Two n's sharing the middle stem. Nonzero union hides the seam."""
    d1, w = letter_n(x)
    d2, _ = letter_n(x + w - STEM)
    return d1 + " " + d2, w * 2 - STEM


def letter_d(x: float) -> tuple[str, float]:
    ro = XH / 2 + OVER
    ri = ro - STEM
    cy = (XH_TOP - OVER + BASE + OVER) / 2
    cx = x + ro
    stem_r = x + ro * 2 + 1  # a hair past the bowl so the right edge is flat
    stem_l = stem_r - STEM
    d = (
        circle(cx, cy, ro, 1)
        + " "
        + circle(cx, cy, ri, 0)
        + " "
        + f"M {fmt(stem_l)} {fmt(CAP_Y)} L {fmt(stem_r)} {fmt(CAP_Y)} "
        + f"L {fmt(stem_r)} {fmt(BASE)} L {fmt(stem_l)} {fmt(BASE)} Z"
    )
    return d, stem_r - x


def letter_a(x: float) -> tuple[str, float]:
    """Double-story a: round bowl, straight stem, flat top bar.

    A buried stem on a full circle reads as o. The bar is what makes the
    upper story, and it uses the same flat terminal as the K.
    Nonzero winding: the bowl's inner circle is reversed so it stays a hole
    where the bar and the stem overlap the bowl.
    """
    s = STEM
    ro, ri = 44.0, 18.0
    bot = BASE + OVER
    cy = bot - ro
    cx = x + ro
    stem_r = cx + ro + 2.0
    stem_l = stem_r - s
    top = XH_TOP
    bar_l = cx - ro
    d = (
        f"M {fmt(stem_l)} {fmt(top)} L {fmt(stem_r)} {fmt(top)} "
        f"L {fmt(stem_r)} {fmt(bot)} L {fmt(stem_l)} {fmt(bot)} Z "
        + circle(cx, cy, ro, 1)
        + " "
        + circle(cx, cy, ri, 0)
        + " "
        + f"M {fmt(bar_l)} {fmt(top)} L {fmt(stem_l)} {fmt(top)} "
        + f"L {fmt(stem_l)} {fmt(top + s)} L {fmt(bar_l)} {fmt(top + s)} Z"
    )
    return d, stem_r - x


def letter_k(x: float) -> tuple[str, float]:
    """K with a flat cap and matching 30° arms. Both arms span the same
    vertical measure, so the leg does not outrun the cap.
    """
    s = 28.0
    sr = x + s
    top, bot = CAP_Y, BASE
    span = 58.0
    cut = 14.0
    cy_u = top + span
    yl = bot - span
    reach = span / TAN - cut
    tip_x = sr + reach
    term_y = top + cut * TAN
    foot_x = sr + reach
    foot_inner = bot - cut * TAN
    pts = [
        (x, top),
        (sr, top),
        (tip_x, top),
        (tip_x, term_y),
        (sr, cy_u),
        (sr, yl),
        (foot_x, foot_inner),
        (foot_x, bot),
        (sr, bot),
        (x, bot),
    ]
    return d_points(pts), foot_x - x


def wordmark(mm_gap: float) -> tuple[list[tuple[str, str]], float]:
    """Each letter is its own path so holes (evenodd) never punch the m's overlap."""
    x = 0.0
    parts: list[tuple[str, str]] = []

    def place(fn, after: float, rule: str) -> None:
        nonlocal x
        d, w = fn(x)
        parts.append((d, rule))
        x += w + after

    place(letter_k, 12, "nonzero")
    place(letter_o, 10, "evenodd")
    place(letter_m, mm_gap, "nonzero")
    place(letter_m, 10, "nonzero")
    place(letter_a, 8, "nonzero")
    place(letter_n, 8, "nonzero")
    place(letter_d, 6, "evenodd")
    place(letter_o, 0, "evenodd")
    return parts, x


# --- B · Doppel --------------------------------------------------------------

def symbol_doppel() -> tuple[str, list[str], float, float, float]:
    d1, w1 = letter_m(0)
    gap = 6.0
    d2, w2 = letter_m(w1 + gap)
    # Art vertical extent: crown of the arch to the baseline.
    ri, r = 22.0, STEM + 22.0
    top = XH_TOP - OVER
    bw = w1 + gap + w2
    bh = BASE - top
    pad = 20.0
    s = (256 - 2 * pad) / max(bw, bh)
    tx = 128 - bw * s / 2
    ty = 124 - ((top + BASE) / 2) * s
    ds = [d1, d2]
    # Crop the viewBox to the arches. A square canvas would letterbox this wide
    # mark and make it look smaller than the Ks beside it.
    left = tx - 18
    right = tx + bw * s + 18
    top_v = ty + top * s - 22
    bot_v = ty + BASE * s + 22
    body = (
        f'  <g id="symbol" transform="translate({fmt(tx)} {fmt(ty)}) scale({s:.4f})">\n'
        f'    <path fill="#000" d="{d1}"/>\n'
        f'    <path fill="#000" d="{d2}"/>\n'
        f"  </g>"
    )
    doc = svg_doc(
        "Kommando — Doppel, symbol",
        body,
        right - left,
        bot_v - top_v,
    ).replace(
        f'viewBox="0 0 {fmt(right - left)} {fmt(bot_v - top_v)}"',
        f'viewBox="{fmt(left)} {fmt(top_v)} {fmt(right - left)} {fmt(bot_v - top_v)}"',
        1,
    )
    return doc, ds, s, tx, ty


def lockup(title: str, symbol_paths: list[str], s: float, tx: float, ty: float, mm_gap: float) -> str:
    word, width = wordmark(mm_gap)
    word_paths = "\n".join(
        f'    <path fill="#000" fill-rule="{rule}" d="{d}"/>' for d, rule in word
    )
    box = 200.0
    # Symbol transform maps raw geometry into 256. We want that 256-box to
    # occupy `box` px inside the lockup, top-aligned with a small optical lift.
    k = box / 256
    gap = 40.0
    left = 8.0
    word_x = left + box + gap
    total = word_x + width + 8
    # Vertically centre the symbol box on the lockup.
    sym_y = (256 - box) / 2 - 2
    sym_x = left
    inner = "\n".join(f'      <path fill="#000" d="{p}"/>' for p in symbol_paths)
    body = (
        f'  <g id="symbol" transform="translate({fmt(sym_x + tx * k)} {fmt(sym_y + ty * k)}) scale({s * k:.5f})">\n'
        f"{inner}\n"
        f"  </g>\n"
        f'  <g id="wordmark" transform="translate({fmt(word_x)} 0)">\n'
        f"{word_paths}\n"
        f"  </g>"
    )
    return svg_doc(title, body, round(total), 256)


def letter_strip() -> str:
    """Isolated letters, for looking at one at a time."""
    letters = [
        ("K", letter_k),
        ("o", letter_o),
        ("m", letter_m),
        ("a", letter_a),
        ("n", letter_n),
        ("d", letter_d),
    ]
    x = 20.0
    parts = []
    for _name, fn in letters:
        d, w = fn(x)
        rule = "evenodd" if fn in (letter_o, letter_a, letter_d) else "nonzero"
        parts.append(f'  <path fill="#000" fill-rule="{rule}" d="{d}"/>')
        x += w + 28
    return svg_doc("letter strip", "\n".join(parts), x, 256)


def main() -> None:
    marche, mp, ms, mtx, mty = symbol_marche()
    write("a-marche.svg", marche)
    doppel, dp, ds, dtx, dty = symbol_doppel()
    write("b-doppel.svg", doppel)
    intervalle, ip, iss, itx, ity = symbol_intervalle()
    write("c-intervalle.svg", intervalle)
    write("a-marche-lockup.svg", lockup("Kommando — Marche, lockup", mp, ms, mtx, mty, mm_gap=16))
    write("b-doppel-lockup.svg", lockup("Kommando — Doppel, lockup", dp, ds, dtx, dty, mm_gap=8))
    write("c-intervalle-lockup.svg", lockup("Kommando — Intervalle, lockup", ip, iss, itx, ity, mm_gap=16))
    write("letter-strip.svg", letter_strip())


if __name__ == "__main__":
    main()
