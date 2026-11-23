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
| `--brand` | `#000000` | UI states are black: primary buttons, selected cards, active tab, focus ring, "NEW" tag, teacher reply bar |
| `--hover-fill` | `#002BFF` (original blue) | Hover highlight on solid buttons |

**Rule:** text, lines and every UI state (selected, focused, active, primary) are black. Colour comes only from the zine duotones, in illustrations, tags and concept marks. Never put two different blues (or two concept colours) next to each other. The zine cover blue `#002BFF` is now only the Law of Cosines ink.

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

How to apply: `style={tone(topic.color)}` sets `--tone-bg` / `--tone-ink`, then use `.tag.tone`, `.pill.chip`, `<ArtWindow>`, `<ConceptBadge>` or the dropdown `.ctab-menu`.

### Status
`--warn #B45309` on `--warn-soft #FFF4D6`, used only for "check this line" in the teacher transcription and for errors.

---

## 2. Typography
| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Wordmark | Inter | 30px / 700 | tracking −0.06em |
| Display (start screen) | Inter | 88px / 400 | Gumroad style: large and **regular weight**, never bold |
| H1 | Inter | 64px / 400 (52px on detail pages) | tracking −0.035em, line-height 1 |
| Card title | Inter | 38px / 400 | top-left of a card |
| H2 | Inter | 26px / 400 | tracking −0.02em |
| Body | Inter | 17px / 400 | line-height 1.5 |
| Labels, eyebrows, tags, metadata | DM Mono | 11.5–13px / 400, uppercase | letter-spacing 0.02–0.04em |
| Math | KaTeX | — | Formulas are always typeset, never plain text |

---

## 3. Shape & elevation (Gumroad rules)
| Element | Radius | Border | Shadow |
|---|---|---|---|
| Large card / hero | 24px | 1px black | none |
| Panel, list row, post, photo frame | 16px | 1px black | none |
| Input, textarea, select | 4px | 1px black, background `--bg` | none; focus = 2px brand outline |
| Pill button / tag | full | 1px black | none |
| **Any clickable card or button on hover** | — | — | `translate(-4px,-4px)` + `4px 4px 0 #000` |
| Modal | 24px | 1px black | `8px 8px 0 #000` (always on) |

**Rule:** surfaces are flat at rest. The hard offset shadow appears on hover, which makes the element feel like paper you can pick up. Don't add soft or blurred shadows anywhere.

### Buttons
- **Primary**: black fill, white text; hover highlights in blue `#002BFF` with white text. One per screen area (Publish to archive, Post question, Ask the class a question).
- **Secondary**: white fill, black border.
- **Navigation pills**: no border at rest, border on hover, **solid black when active**.
- **Filter chips**: when a chip is active it takes its concept duotone.

---

## 4. Navigation (Gumroad marketplace header)
- **Row 1:** wordmark, then a wide search bar (`/search`), then an outline button (name · Switch) and a solid black button. The solid button is "Ask a question" for students and "Capture board" for teachers. Both buttons have a 4px radius, not pill-shaped.
- **Row 2: tabs.** "All", then one tab per concept, then Discussion / Topic map (students) or Board notes / Questions (teachers). Tabs have no border at rest; the active tab is white with a black border and a 3px black under-shadow.
- **Concept dropdown:** hovering a concept tab opens a panel in that concept's pastel colour, with a caret, underlined links (overview, worked example, worksheet, board notes, questions), and the concept illustration at the bottom.

## 5. Cards, windows and badges (Gumroad)
- **Card** (`.gcard`): white, 1px black, 24px radius, generous padding. Title top-left (regular weight), short description and DM Mono metadata bottom-left, illustration on the right.
- **Illustration window** (`<ArtWindow>`): a little app window with a title bar and three dots (zine red / orange / green), 2px black outline, `6px 6px 0` black shadow, concept-coloured body. Windows may overlap the card edge slightly (about 12px), as on gumroad.com. **Exception: onboarding (the 3 intro screens) keeps illustrations fully inside the frame.**
- **Concept badge** (`<ConceptBadge>`): a square tile in the concept's pastel colour with its illustration, 1.5px black outline and a `3px 3px 0` shadow. Use it to mark a row's concept.
- **Never** use thin vertical colour bars or side stripes as concept markers. Use a badge or a tag instead.

## 6. Illustrations: Math Visual Library
Shapes are the **original vector paths exported from Figma** (node 45:488) and live in `src/components/Art.tsx` (`<Art kind="…" />`). Labels, which were outlined text in Figma, are re-set as live DM Mono text. Everything is drawn in `currentColor`, so each illustration takes its concept's ink colour. Law of Sines and Law of Cosines have no drawing in the library, so they are drawn in the same style.

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

## 7. Layout
- Page max width 1160px, side gutter 40px
- Class archive: a 2-column grid of cards, with this week's topic as a full-width card on top
- Topic and folder pages open with a **hero card** (white) with the concept's illustration window on the right, overlapping the top edge by about 12px

## 8. Accessibility notes
- Every duotone pair has its ink on its own background at large text sizes (headings, tags). Body text is always black on white or on `--bg`.
- Concept colour is never the only cue: concept names always appear as text too.
- Focus states use a 2px brand-blue outline.

## Class archive home
- **This week** is the only card with illustrations. Each illustration window is one topic: its title bar names the topic and lesson (e.g. "Law of Sines · 5.1"), and clicking it opens that topic. An illustration must show that topic's actual math, never decoration.
- **Previous weeks** is a horizontal shelf grouped by month (no exact dates). Newest is on the left; scroll right (or use the arrow buttons) to go back in time. Cards are plain white cards with no illustrations.
- **Navigation**: under the header line there are only section pills: Topic map · Class archive · Discussion for students, and Class archive · Board notes · Questions for teachers. Concepts are reached through the archive, not the nav.

## Archive structure (student side)
- The archive holds one kind of thing: **materials**. A material can be board notes, a handout, slides, class notes, or anything else the teacher adds. Its kind is a small label, never a separate section.
- Folder → (topics, if the unit has more than one) → one list of materials, newest first → open a material → Ask the class a question / Print.
- Class questions sit below the materials, because discussion is not a teacher material.
- **Board notes always link to their original photo.** On the note page a "See original photo" button opens the photo beside the checked notes. The photos for the built-in mock board notes are stand-ins made by `scripts/board-photos.py`; replace them with real board photos when you have them.

## Microcopy
- No meta words that don't help the student act: no "checked by teacher", "updated 10 hours ago", "recorded by voice", counts on the this-week card, "Be the first…", or subtitles that restate the heading. Keep labels that help find things (lesson numbers, material kind, topic, "Original photo") and the privacy hint "Leave your name out."

## Asking questions (student side)
- **Annotate where you're stuck.** On a note, hovering a line shows a "?" button; on any image (worksheet page, original board photo, worked-example diagram) a click drops a numbered pin. Either opens a small box: type the question and Post, or "Add a photo or voice" to open the full form with the spot kept.
- Lines with questions get a dotted underline and a black count bubble; pins stay on the image. Clicking either shows the questions there.
- Anchored questions are normal posts, so they appear in Class discussion with an "About" strip (the quoted line, or a crop of the image around the pin) that links back to the exact spot.
- The general "Ask a question" / "Ask the class a question" entry points stay for questions that aren't about one spot.

## Layout rhythm and type (UI pass, Nov 22)
- Spacing steps: 12 (breadcrumb → title), 40 (title → first block), 64 (between sections). Use `.section` / `.section-first`, not inline margins.
- Type scale: page title 56px · section 28px · card title 30–44px · body 17px · small 15px. All regular weight.
- Small labels (breadcrumbs, tags, months, lesson numbers, material kind) are DM Mono in sentence case, like the zine's running heads. Never all caps.
- One breadcrumb style everywhere (`.crumb`), above the page title.
- Material rows carry the topic's concept tile on the left and the kind ("Board notes", "Handout") under the title; a topic chip appears only in lists that mix topics.
- Empty states are dashed boxes that say what to do next.
- Concept drawings no longer include the decorative glyph row (⊕ ◐ ⊘ ⊙); it had no meaning.

## Zine language in the app
- **Dashed = still open, solid = answered.** A question with no reply has a dashed outline (discussion card, spot list, pin, line count bubble); once someone replies it turns solid. The "?" ask button and the quick-ask box are dashed too.
- **Loose margin marks** (◎ ✳ and a dashed curved arrow) only on the home page, never boxed.
- **Inside a folder, illustrations stay inside their frame** (topic cards, topic hero). The slight overflow is only for the home page cards.
- **Material rows show the material itself**: a small thumbnail of the board photo, the worksheet's first page, or the worked-example diagram. Materials with no picture get a thin line drawing of their kind (slides, page). No coloured tiles or hard shadows in lists.

## Base and type (after the designer's portfolio, Nov 22)
- Background is white graph paper: #FFFFFF with a faint blue 28px grid (rgba(9,102,223,.07)), like a math notebook. Structure comes from 1–1.5px black lines, not grey fills.
- Headings are Inter 600 with very tight tracking (−0.055em titles, −0.04em sections). Section headings sit on a full-width black rule.
- "This week" stays a small black tag. The home arrow is the zine's dashed curve. Don't copy the portfolio's signature marks (circle stickers, looped arrows).
