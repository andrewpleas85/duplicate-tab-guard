#!/usr/bin/env python3
"""Generate the extension icons (pure standard library, no Pillow needed).

Two overlapping browser-window shapes (title bar line) (front one up-left, small x on the back one),
transparent background, artwork is 75% of the canvas (16px padding at 128px).
Run from anywhere: python3 images/make_icons.py
"""
import os, struct, zlib

BLUE, ORANGE, WHITE = (37, 99, 235), (249, 115, 22), (255, 255, 255)
SS = 8  # supersampling per axis, for smooth edges at every size

def rrect(x, y, x0, y0, x1, y1, r):
    if not (x0 <= x <= x1 and y0 <= y <= y1):
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def tab(x, y, x0, y0, w, h, grow=0):
    # browser-window body; art units (0..96)
    x0, y0, x1, y1 = x0 - grow, y0 - grow, x0 + w + grow, y0 + h + grow
    return rrect(x, y, x0, y0, x1, y1, 6 + grow)

def bar(x, y, x0, y0):  # title bar divider line
    return x0 + 6 <= x <= x0 + 54 and y0 + 13 <= y <= y0 + 18

def in_x(x, y, cx=81, cy=72, d=8, t=4.5):
    for sign in (1, -1):  # distance to each diagonal segment
        px, py = x - cx, (y - cy) * sign
        if abs(px) <= d + t and abs(py) <= d + t and abs(px - py) <= t * 1.4143:
            return True
    return False

def sample(x, y):  # art coordinates -> (r, g, b, a) or None
    if tab(x, y, 0, 0, 60, 60):
        return WHITE if bar(x, y, 0, 0) else BLUE
    if tab(x, y, 36, 36, 60, 60) and not tab(x, y, 0, 0, 60, 60, grow=5):
        return WHITE if (in_x(x, y) or bar(x, y, 36, 36)) else ORANGE
    return None

def render(size):
    art = size * 96 / 128
    off = (size - art) / 2
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            r = g = b = n = 0
            for sy in range(SS):
                for sx in range(SS):
                    ax = (px + (sx + .5) / SS - off) * 96 / art
                    ay = (py + (sy + .5) / SS - off) * 96 / art
                    c = sample(ax, ay)
                    if c:
                        r += c[0]; g += c[1]; b += c[2]; n += 1
            a = n / (SS * SS)
            row += bytes((round(r / n), round(g / n), round(b / n), round(255 * a)) if n else (0, 0, 0, 0))
        rows.append(bytes(row))
    return rows

def write_png(path, size, rows):
    raw = b"".join(b"\x00" + r for r in rows)
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d))
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    for s in (128, 48, 32, 16):
        write_png(os.path.join(here, f"icon{s}.png"), s, render(s))
        print("wrote", f"icon{s}.png")
