# Visual Archive — Design System

The UI combines three sources:

| Source | What we take from it |
|---|---|
| **Discovery Research Zine** (Figma: *Design Research Zine*) | The 6 duotone colour pairs, the brand blue, Inter Bold headlines with tight tracking, DM Mono labels, and the **Math Visual Library** line illustrations |
| **Original wireframes** (Figma: *Wire-frame → Guided class archive V3*) | Information architecture, screen list, folder metaphor, brand blue `#002BFF` |
| **gumroad.com** (measured from the live CSS, Nov 2026) | Component rules: warm off-white base, white cards, 1px black lines, 16/24px radius, pill navigation, hard offset shadow **only on hover** |

All tokens live at the top of `src/index.css`. Concept colours live in `src/lib/content.ts` (`DUOTONES`, `TOPICS`, `FOLDERS`). Illustrations live in `src/components/Art.tsx`.

---

## 1. Colour

### Base (Gumroad rules)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F4F4F0` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Cards, panels, posts, inputs on white |
| `--ink` | `#000000` | All body text and **every border** |
| `--muted` | `rgba(0,0,0,.55)` | Secondary text, subtitles |
| `--brand` | `#002BFF` | Primary buttons, selected role, "NEW" tag, teacher reply bar, focus ring, selection |

**Rule:** text and lines are black. Colour is only used for (a) the brand blue on actions and highlights, and (b) concept duotones. Never mix two concept colours in one element.

### Concept duotones (zine)
Each pair is one pastel background + one ink colour, taken directly from the zine pages. A concept always uses its own pair: folder, topic header, tags, list-row swatch, topic map node, filter chip, and illustration.

| Pair | Background | Ink | Concept |
|---|---|---|---|
| Blue (zine cover) | `#E6E6E6` | `#002BFF` | Law of Cosines |
| Sky | `#FFF584` | `#0966DF` | Law of Sines · Solving triangles folder |
| Red | `#EECED8` | `#DD0C00` | Unit Circle |
| Orange | `#F5EBFF` | `#EF6801` | Radians & Degrees |
| Brown | `#D5F2BC` | `#824326` | Trig Graphs |
| Green | `#D8EDF2` | `#0B8246` | Special Angles |

How to apply: `style={tone(topic.color)}` sets `--tone-bg` / `--tone-ink`, then use the classes `.tag.tone`, `.hero`, `.folder`, `.listcard .swatch`, `.pill.chip`.

### Status
`--warn #B45309` on `--warn-soft #FFF4D6`, used only for "check this line" in the teacher transcription and for errors.

---

## 2. Typography
| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Display (start screen, intro) | Inter | 84px / 700, uppercase | tracking −0.06em; zine cover lockup |
| H1 | Inter | 56px / 700 (48px on detail pages) | tracking −0.045em, line-height 0.98 |
| H2 | Inter | 22px / 700 | tracking −0.02em |
| Body | Inter | 17px / 400 | line-height 1.5 |
| Labels, eyebrows, tags, metadata | DM Mono | 11.5–13px / 400, uppercase | letter-spacing 0.02–0.04em |
| Math | KaTeX | — | Formulas are always typeset, never plain text |

---

## 3. Shape & elevation (Gumroad rules)
| Element | Radius | Border | Shadow |
|---|---|---|---|
| Large card / hero / folder body | 24px | 1px black | none |
| Panel, list row, post, photo frame | 16px | 1px black | none |
| Input, textarea, select | 4px | 1px black, background `--bg` | none; focus = 2px brand outline |
| Pill button / tag | full | 1px black | none |
| **Any clickable card or button on hover** | — | — | `translate(-4px,-4px)` + `4px 4px 0 #000` |
| Modal | 24px | 1px black | `8px 8px 0 #000` (always on) |

**Rule:** surfaces are flat at rest. The hard offset shadow appears on hover, which makes the element feel like paper you can pick up. Don't add soft or blurred shadows anywhere.

### Buttons
- **Primary**: brand blue fill, white text, black border. One per screen area (Publish to archive, Post question, Ask the class a question).
- **Secondary**: white fill, black border.
- **Navigation pills**: no border at rest, border on hover, **solid black when active**.
- **Filter chips**: when a chip is active it takes its concept duotone.

---

## 4. Illustrations: Math Visual Library
Redrawn as SVG components from the zine's *Math Visual Library* (`<Art kind="…" />`). Thin 1.6px strokes and DM Mono labels, drawn in `currentColor` so each illustration takes its concept's ink colour.

| `kind` | Drawing | Used for |
|---|---|---|
| `unit-circle` | Unit circle, radius to (cos θ, sin θ) | Unit Circle, start screen |
| `radians` | Circle with arc θ, 180° = π rad | Radians & Degrees |
| `sine` | sin (solid) and cos (dashed) waves | Trig Graphs |
| `reference` | Reference triangle with θ, 1, sin θ, cos θ | Special Angles |
| `triangles` | Right triangle a, b, c, with a² + b² = c² | Solving triangles folder |
| `sines` | Oblique triangle, a/sin A = b/sin B | Law of Sines |
| `cosines` | Triangle with included angle C, c² = a² + b² − 2ab cos C | Law of Cosines |

Small decorations: `<Glyphs />` (⊕ ◐ ⊘ ⊙), `<Target />` (concentric circles), `<Asterisk />`.

**Rules:** one illustration per card or hero, bottom-right, never behind text. Illustrations decorate and help students recognise a concept; they never carry information the student needs.

---

## 5. Layout
- Page max width 1160px, side gutter 40px
- Header: brand dot + "Visual Archive" on the left, `MATH 3 / CITY OF BRIDGES` (DM Mono) on the right, 1px black rule underneath
- Folder grid: `repeat(auto-fill, minmax(250px, 1fr))`, 24px gap
- Topic and folder pages open with a **hero band** in the concept's duotone with its illustration

## 6. Accessibility notes
- Every duotone pair has its ink on its own background at large text sizes (headings, tags). Body text is always black on white or on `--bg`.
- Concept colour is never the only cue: concept names always appear as text too.
- Focus states use a 2px brand-blue outline.
