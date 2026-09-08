# Algorithm Arena — "Brick Racer" UI/UX Design Guide
### A LEGO Party!–inspired visual system for the pathfinding algorithm race visualizer

---

## 0. Reference & Design Brief

**Source inspiration:** *LEGO Party!* (SMG Studio, 2025) — a four-player digital board game built entirely from brick-built dioramas: glossy primary-color plastic, stud-textured baseplates, chunky game-show-style HUD, a visual "randomizer" instead of dice, and distinct themed boards (Pirates, Space, Ninjago, Theme Park) that players race across collecting gold bricks.

**What we're borrowing, and why it fits this app:**
- The core loop of *LEGO Party!* — multiple racers moving across a physical-feeling board toward a goal — maps almost exactly onto Algorithm Arena's loop: multiple search algorithms racing across a grid toward a goal cell.
- The brick-built diorama look gives every abstract concept (wall, frontier, visited node, shortest path) a tangible physical object: a wall becomes a stud brick, a visited cell becomes a snapped-down translucent plate, the shortest path becomes a trail of gold studs.
- The game-show HUD energy (bold numbers, chunky buttons, bright rails) replaces the earlier minimalist glassmorphism direction with something louder, friendlier, and more legible for a "spectator sport" — you're watching seven algorithms race, so the interface should feel like a live leaderboard, not a quiet lab tool.

**Design pivot from the previous direction:** the earlier Algorithm Arena visual language (Hitman GO / Lara Croft GO isometric minimalism + floating glass HUD) is replaced, not layered — flat glass panels become raised brick plates, muted diorama tones become saturated primary plastic, and thin sans HUD type becomes chunky rounded display type. Keep the isometric camera; change everything about the material and color language sitting on top of it.

**Subject grounding:** the "characters" of this app aren't minifigures with personalities — they're seven algorithms (A\*, Dijkstra, BFS, DFS, Greedy Best-First, Hill Climbing, Simulated Annealing). Each gets a fixed brick color the way each *LEGO Party!* board has a fixed theme. Consistency of that color across every surface (menu chip, HUD row, 3D racer, path trail) is the single most important rule in this guide — it's how a spectator tracks seven simultaneous racers at a glance.

---

## 1. Design Principles

1. **One racer, one color, everywhere.** An algorithm's color never changes across board, HUD, legend, or leaderboard.
2. **Everything reads as a physical brick.** No flat material anywhere in the 3D scene — every surface has a stud, a bevel, or a plate edge.
3. **Chunky over subtle.** Buttons, counters, and cards use thick borders, high corner radius, and visible "press" depth — nothing thin or hairline.
4. **Primary colors carry meaning; neutrals carry structure.** Bright plastic colors are reserved for racers, actions, and state — backgrounds and chrome stay in the dark-bluish-grey/white neutral family so the racers pop.
5. **Baseplate green is the app's "home" color**, the way felt-green is a poker table's home color — it appears wherever the board itself is present, never in UI chrome.
6. **Motion always answers an action.** A brick "snaps" when a wall is placed, a racer "hops" per step, studs "burst" on finish — no idle ambient animation.

---

## 2. Color System

### 2.1 Core Brick Palette (base UI colors)

| Name | Hex | Role |
|---|---|---|
| Brick Red | `#C91A09` | Primary action color (Play, Start Race, main CTA) |
| Brick Yellow | `#F2CD37` | Highlight / attention (gold bricks, active tool, best-path glow) |
| Brick Blue | `#0055BF` | Secondary action / links / info states |
| Baseplate Green | `#237841` | Board floor color, "home" surface — board chrome only, never buttons |
| Dark Bluish Grey | `#595D60` | Primary UI chrome: toolbars, panel backgrounds, dock plates |
| Light Bluish Grey | `#A3A2A4` | Secondary chrome, disabled states, dividers |
| Brick Black | `#05131D` | Text on light surfaces, board grid lines, deep shadow |
| Brick White | `#F4F4F4` | Card surfaces, modal backgrounds, primary UI text on dark chrome |

### 2.2 Algorithm Racer Palette

Each algorithm owns a **torso color** (racer + HUD chip + leaderboard row) and a **trail color** (a translucent version used for visited/frontier/path plates on the board). Keep saturation and value identical across all seven so no racer visually dominates by brightness alone.

| Algorithm | Racer Color | Hex | Trail Color (40% opacity plate) |
|---|---|---|---|
| A\* | Bright Red | `#C91A09` | `rgba(201,26,9,0.4)` |
| Dijkstra | Bright Blue | `#0055BF` | `rgba(0,85,191,0.4)` |
| BFS | Bright Yellow | `#F2CD37` | `rgba(242,205,55,0.4)` |
| DFS | Bright Green | `#4B9F4A` | `rgba(75,159,74,0.4)` |
| Greedy Best-First | Bright Orange | `#FE8A18` | `rgba(254,138,24,0.4)` |
| Hill Climbing | Bright Purple | `#923978` | `rgba(146,57,120,0.4)` |
| Simulated Annealing | Medium Azure | `#36AEBF` | `rgba(54,174,191,0.4)` |

> Placement rule: the racer color is always the **fill**; black (`#05131D`) is always the **outline** (a 2px brick-style outline on every chip, minifigure, and legend swatch). Never use two racer colors adjacent without a neutral divider between them (grey rail or black gridline) — this is what keeps a 7-way race legible.

### 2.3 Semantic Board-State Colors

| State | Color | Hex / Value | Where it appears |
|---|---|---|---|
| Empty walkable cell | Baseplate green (stud texture) | `#237841` | Default board tile |
| Wall / obstacle | Reddish Brown brick stack | `#582A12` | User-painted walls |
| Start node | Warm Gold brick + flag | `#AA7F2E` | Single fixed tile |
| Goal node | Bright Yellow brick + checker flag | `#F2CD37` | Single fixed tile |
| Visited (explored) | Racer trail color, 25% opacity plate | per-algorithm | Snapped flat plate, no height |
| Frontier (queued) | Racer trail color, 55% opacity, pulsing | per-algorithm | Slightly raised plate, soft glow |
| Final shortest path | Solid gold stud line | `#AA7F2E` → `#F2CD37` gradient | Drawn after a racer finishes |
| Invalid action | Warning red outline | `#C91A09` | e.g. wall on start/goal |

### 2.4 Neutral & Surface Colors (chrome, not board)

| Token | Hex | Use |
|---|---|---|
| `--surface-panel` | `#595D60` | Toolbars, docks, HUD bar background |
| `--surface-panel-raised` | `#6C6E68` | Card / modal top face (catches light) |
| `--surface-card` | `#F4F4F4` | Modal and menu card body |
| `--surface-overlay` | `rgba(5,19,29,0.6)` | Modal backdrop scrim |
| `--text-primary` | `#05131D` | Body text on light cards |
| `--text-inverse` | `#F4F4F4` | Text on dark chrome |
| `--text-muted` | `#A3A2A4` | Secondary labels, timestamps |
| `--border-strong` | `#05131D` | 2–3px "brick outline" borders |
| `--border-soft` | `#A3A2A4` | Dividers within a panel |

### 2.5 Color Placement Map

| Screen zone | Dominant color | Accent color |
|---|---|---|
| Page background (outside diorama) | Dark Bluish Grey `#595D60` | — |
| 3D board floor | Baseplate Green `#237841` | Per-algorithm trails |
| Top HUD bar | Dark Bluish Grey panel | Racer color chips + Brick Yellow stud counter |
| Left tool dock | Dark Bluish Grey panel | Brick Red for active tool |
| Right leaderboard rail | Brick White card | Racer colors per row |
| Bottom scrubber | Dark Bluish Grey bar | Brick Blue progress fill |
| Modals / menus | Brick White card on grey scrim | Brick Red primary button |
| Buttons — primary | Brick Red | White label |
| Buttons — secondary | Brick Blue | White label |
| Buttons — destructive (clear maze) | Reddish Brown `#582A12` | White label |
| Disabled states | Light Bluish Grey | Muted text |

---

## 3. Typography

| Role | Typeface direction | Weight | Notes |
|---|---|---|---|
| Display / HUD numbers | Chunky rounded geometric sans (e.g. Fredoka, Baloo 2, Nunito ExtraBold) | 700–800 | Used for stud counters, step counts, race timer — should look "moldable," like plastic lettering |
| Headings (menus, modal titles) | Same family as display, one weight down | 700 | Sentence case, never all-caps |
| Body / UI labels | Rounded humanist sans (e.g. Nunito, Quicksand) | 400–600 | Tool tooltips, leaderboard names, settings |
| Numeric-only mono (optional, dev overlay) | Space Mono or similar | 500 | Only in a "debug stats" panel, never in the main HUD |

**Type scale:**

| Token | Size | Use |
|---|---|---|
| `--type-display-lg` | 40px | Main menu title |
| `--type-display-md` | 28px | Modal titles, stud counter |
| `--type-heading` | 20px | Section headers, board select cards |
| `--type-body` | 16px | Default UI text |
| `--type-label` | 13px | Chip labels, tooltips, badges |

Line length for any body copy (rules text, tooltips) stays under 60 characters — this is a game HUD, not a reading surface.

---

## 4. Menu Design Guideline

### 4.1 Main Menu Layout

```
┌───────────────────────────────────────────────┐
│                 ALGORITHM ARENA                │  ← display title, brick-embossed
│           (subtitle: pick a maze, race 7)      │
│                                                 │
│   ┌────────┐   ┌────────┐   ┌────────┐         │
│   │ CASTLE │   │ SPACE  │   │ CITY   │  ← maze │
│   │ board  │   │ board  │   │ board  │   theme │
│   │ thumb  │   │ thumb  │   │ thumb  │   cards │
│   └────────┘   └────────┘   └────────┘         │
│                                                 │
│        [ ▶  START RACE ]   (Brick Red, large)  │
│        [  Settings ]  [  How it Works ]        │
└───────────────────────────────────────────────┘
```

- Layout is **center-aligned**, single column of controls beneath a horizontal row of theme cards — mirrors *LEGO Party!*'s board-select screen.
- Each theme card is a 4:3 brick-plate tile: rounded 16px corners, 3px black outline, thumbnail of that board skin, hover = lifts 4px with drop shadow.
- The primary CTA is always the single largest, reddest element on the screen — one dominant action per menu screen.

### 4.2 Maze Theme / World Select

Offer 3–4 baseplate skins reusing *LEGO Party!*'s board-variety idea, reskinned for a grid maze:
- **Castle** — grey stone-brick walls, warm torch-yellow accents
- **Space** — dark navy baseplate, neon trans-colored walls, star specks
- **City** — tan/orange brick walls, road-marking floor tiles
- **Classic** — plain green baseplate + red/white striped walls (default/no theme)

Only the **wall brick texture and baseplate tint** change between themes — racer colors, HUD, and semantic states stay identical, so switching themes never costs legibility.

### 4.3 Modal & Dialog Styling

- Card: `--surface-card` background, 20px corner radius, 3px `--border-strong` outline, drop shadow `0 8px 0 rgba(5,19,29,0.3)` (a hard offset shadow, like a brick sitting on a plate — not a soft blur).
- A single row of 4 raised "studs" (small circles) decorates the top edge of every modal — a literal LEGO-plate cue that doubles as a drag handle affordance.
- Close button: small circular Reddish-Brown "1x1 round" brick in the top-right corner.
- Scrim behind modal: `--surface-overlay` at 60% — dark enough to focus attention, light enough to keep the board visible behind it (players might be mid-race when opening settings).

### 4.4 Button System

| Variant | Fill | Border | Press state |
|---|---|---|---|
| Primary | Brick Red | 3px black | Sinks 3px, shadow disappears (brick "clicking in") |
| Secondary | Brick Blue | 3px black | Same sink behavior |
| Tertiary / text link | Transparent | none, underline on hover | Color shifts to Brick Blue |
| Icon-only (tool dock) | Dark Bluish Grey, Brick Red when active | 2px black | Sinks + yellow outline glow when active |
| Destructive | Reddish Brown | 3px black | Same sink behavior, confirm modal required |

All buttons use an 8px corner radius (softer than cards) and a **hard drop shadow, not a blur** — `box-shadow: 0 4px 0 #05131D` — so the resting button looks like a raised brick and the pressed button looks like it's been pushed flush into the plate.

### 4.5 Navigation

Tabs (e.g., switching between "Race" / "Compare Stats" / "Maze Editor") render as a horizontal row of connected brick tiles, active tab raised 2px above its neighbors with a Brick Yellow underline stud — inactive tabs sit flush in Dark Bluish Grey.

---

## 5. Toolbar / HUD Design Guideline

### 5.1 Screen Zone Layout

```
┌─────────────────────────────────────────────────────────┐
│  TOP HUD: [●A*][●Dij][●BFS][●DFS][●Gdy][●Hill][●SA]  ⏱ 00:12  🟡 128 studs │
├───────┬───────────────────────────────────────┬─────────┤
│ TOOL  │                                       │  RANK   │
│ DOCK  │            3D ISOMETRIC BOARD          │  RAIL   │
│ (left)│                                       │ (right) │
│       │                                       │         │
├───────┴───────────────────────────────────────┴─────────┤
│  ⏮  ⏸  ⏭   step 42 / 210   ▓▓▓▓▓▓▓▓░░░░░░  speed: ▮▮▮▯▯  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Top HUD Bar

- Fixed height ~56px, `--surface-panel` background, 3px black bottom border separating it from the board.
- Left side: seven **racer chips** in fixed left-to-right order (never reorder even as rankings change — reordering breaks "find my algorithm at a glance"). Each chip = colored circle (racer color, black outline) + short label, dims to 40% opacity if that algorithm has finished exploring.
- Right side: race timer (mono numerals) and the **stud counter** — a Brick Yellow pill badge showing total cells explored across all racers, incrementing with a small bounce animation per tick.

### 5.3 Left Tool Dock (maze editor tools)

Vertical stack of icon-only brick buttons, `--surface-panel` background, 64px wide:
1. Wall brush (stack bricks)
2. Eraser (remove wall)
3. Start flag placer
4. Goal flag placer
5. Random maze generator
6. Clear board

Active tool gets the Brick Red active-fill + a thin Brick Yellow glow ring; a tooltip (Brick White pill, black text, small arrow) appears to the right on hover, matching the "well explained items" clarity *LEGO Party!* is known for.

### 5.4 Right Leaderboard Rail

Live-updating vertical list, one row per algorithm, sorted by progress (cells remaining to goal or nodes explored):
- Row = racer color swatch + name + a mini progress bar in that racer's color + step count.
- 1st place row gets a small gold-stud badge; 2nd silver; 3rd bronze — directly borrowing *LEGO Party!*'s stud-medal treatment.
- Finished racers move to a "Finished" section at the bottom of the rail with their final rank and total steps, in place of removing them.

### 5.5 Bottom Timeline Scrubber

- Playback transport (⏮ step-back, ⏸ pause/play, ⏭ step-forward) as three chunky circular brick buttons, Brick Blue.
- A horizontal progress track styled as a row of studs; filled studs = Brick Yellow, unfilled = Light Bluish Grey.
- Speed control as a 5-notch discrete slider (not continuous) — each notch is a stud the user clicks, matching the chunky/discrete feel over smooth drag interactions.

### 5.6 Responsive Behavior

- **Tablet:** left tool dock collapses into a horizontal strip pinned above the bottom scrubber; leaderboard rail becomes a swipeable drawer from the right edge.
- **Mobile:** top HUD bar keeps only racer chips (timer/stud counter move into a collapsible drawer); tool dock becomes a bottom sheet triggered by a single "Tools" brick button; leaderboard becomes a modal opened from a trophy icon.
- Racer-color consistency (2.2) and outline treatment never change across breakpoints — only layout position changes.

---

## 6. 3D Board / Isometric Diorama Styling Guideline

### 6.1 Camera & Lighting

- Camera: fixed isometric projection, ~30–35° elevation, slight rotate-lock (±15°) allowed for player orbiting, no free-fly.
- Lighting: three-point "toy photography" setup — warm key light from upper-left (`#FFF3D6` tint) casting hard-edged directional shadows, cool fill from upper-right (`#CFE8FF` tint) to soften shadow density, and a subtle rim light on racer minifigures to separate them from the baseplate.
- Shadows: hard-edged contact shadows directly under every brick and racer (not soft/blurred) — reinforces the "physical toy on a table" read.

### 6.2 Baseplate & Grid

- Each maze cell = one stud unit on a classic green (`#237841`) stud-textured baseplate.
- A thin black grid line (`#05131D`, 10% opacity) traces cell boundaries only when the maze editor is active; hidden during playback for a cleaner race view.
- Coordinate readout (row, col) appears in a small tooltip only on hover during edit mode.

### 6.3 Walls / Obstacles

- Walls render as stacked bricks rising from the baseplate — height communicates nothing functionally, but vary between 1–3 bricks tall at random for visual texture (purely decorative variance, never affects pathing).
- Wall color follows the active board theme (6.4 above): Reddish Brown default, grey stone for Castle, neon trans-color for Space, tan for City.
- Freshly placed walls play a short "snap down" animation (drop 20px + settle) with a soft click.

### 6.4 Start & Goal Markers

- Start: a single Warm Gold (`#AA7F2E`) 2x2 brick with a small flag minifig accessory standing on top, static.
- Goal: a Bright Yellow (`#F2CD37`) brick with a checkered-flag accessory, and a slow vertical bob animation (subtle, ~4px, 2s loop) to draw the eye — this is the only idle-looping animation permitted anywhere in the scene, since it marks the objective.

### 6.5 Path / Visited / Frontier Visualization

- **Visited cells:** a flat, thin translucent plate (2.3, 25% opacity) snaps onto the baseplate the instant a cell is explored — no height, sits flush, so many overlapping visited cells never look cluttered.
- **Frontier cells:** the same plate at 55% opacity, raised 4px above the baseplate, with a slow pulse (opacity 55%→75%→55%, 800ms loop) — signals "about to be explored."
- **Final shortest path:** once an algorithm finishes, replace that algorithm's visited plates along the winning path with a solid gold stud trail (gradient `#AA7F2E` → `#F2CD37`), laid down tile-by-tile in a quick sequential animation from start to goal.
- Overlap rule: when two algorithms' trail colors would occupy the same cell simultaneously, render both as adjacent half-cell triangles rather than blending colors — blending would break the "one racer, one color" principle (1.1).

### 6.6 Racer Minifigures

- Each algorithm is a small blocky minifigure-style token in its racer color (torso + head), black outline, standing on the current cell being explored.
- Movement: discrete **hop** from cell to cell in sync with the step counter (no smooth sliding) — matches the "wobble, jump" character animation language noted in *LEGO Party!* reviews.
- Idle bounce (small, 2px) while "thinking" between steps; a brief spin + confetti burst (6.7-style) on reaching the goal.
- When two racers occupy the same cell, offset them slightly on the tile (front-left / back-right) rather than stacking — keep every racer visible.

### 6.7 Theming Skins

Reuse the theme selection from 4.2 — swapping baseplate tint and wall brick texture only. Racer colors, plate/trail colors, and HUD never change with theme, preserving legibility across all skins.

### 6.8 Material / Render Spec (for Three.js / React Three Fiber)

- Use `MeshPhysicalMaterial` (or equivalent) for all brick geometry: `roughness: 0.35`, `clearcoat: 0.6`, `clearcoatRoughness: 0.25` — this produces the glossy-but-not-mirror plastic look of real ABS brick.
- Stud tops get a slightly higher `clearcoat` (0.8) to catch a crisp specular highlight — the single most recognizable "LEGO" visual cue, worth getting right.
- Translucent trail plates use standard transparent material with `opacity` per 2.2/2.3 values and `depthWrite: false` to avoid z-fighting when stacked.
- Baseplate stud bumps can be a normal map rather than real geometry for performance; walls and racers should be real low-poly geometry since they're focal.

---

## 7. Item, Card & Micro-component Guideline

| Component | Spec |
|---|---|
| Algorithm legend chip | 24px circle, racer fill, 2px black outline, label in `--type-label`, used in HUD + settings + legend key |
| Leaderboard row | 48px height, racer swatch + name + mini progress bar + step count, medal badge for top 3 |
| Stud counter badge | Pill shape, Brick Yellow fill, black text, small bounce on increment |
| Tooltip | Brick White pill, 2px black border, small triangular pointer, `--type-label` text |
| Toast / notification | Slides in from top, Dark Bluish Grey bar with racer-colored left edge stripe indicating which racer triggered it (e.g., "A\* reached the goal!") |
| Confetti / finish celebration | Burst of small square "stud" particles in the finishing racer's color + gold, falling with slight physics, 1.5s duration |
| Progress bar (per racer) | Track = Light Bluish Grey, fill = racer color, 6px height, rounded ends |
| Settings toggle | Rendered as a 1x2 brick "switch" that physically slides between two brick slots rather than a standard iOS-style toggle |

---

## 8. Motion & Sound Feedback (brief)

- Every discrete action gets a matching discrete sound: brick "click" on wall placement, "snap" on visited-plate placement, soft "pop" per racer hop, triumphant chime on goal reached.
- No looping background animation anywhere except the goal-flag bob (6.4) and frontier pulse (6.5) — both are functional signals, not decoration.
- Page/menu transitions: a single 200–300ms slide, never fade-and-slide combos stacked on multiple elements at once.

---

## 9. Accessibility & Responsive Notes

- Racer palette (2.2) is checked against deuteranopia/protanopia simulation — pair every color cue with the fixed left-to-right chip order and text labels, never color alone, so colorblind users can still track each algorithm.
- Minimum contrast: `--text-primary` on `--surface-card` and `--text-inverse` on `--surface-panel` both meet WCAG AA (4.5:1) at body size.
- All interactive bricks (buttons, tools) have a visible focus ring: 3px Brick Yellow outline, offset 2px — consistent regardless of the element's own color.
- Respect `prefers-reduced-motion`: hops become instant position changes, confetti becomes a static badge, pulses become a static highlight.

---

## 10. Implementation Notes (Next.js)

- Define all Section 2 colors as CSS custom properties in a single `:root` block (or Tailwind theme extension) — never hardcode hex values in components.
- Suggested Tailwind token naming: `bg-brick-red`, `bg-brick-blue`, `text-racer-astar`, `border-brick-black`, etc., mirroring the tables above 1:1 so any dev can trace a class name back to this doc.
- Use Framer Motion (or CSS transitions) for the "press-in" button state (`translateY(3px)` + shadow removal) — keep the spring stiff/short (under 150ms) to feel like plastic, not rubber.
- Keep the 3D scene's material/lighting config (6.8) in a single shared constants file so every board theme (6.7) reuses the same lighting rig and only swaps textures/colors.

### Appendix: CSS Variable Reference

```css
:root {
  /* Core brick palette */
  --brick-red: #C91A09;
  --brick-yellow: #F2CD37;
  --brick-blue: #0055BF;
  --baseplate-green: #237841;
  --dark-bluish-grey: #595D60;
  --light-bluish-grey: #A3A2A4;
  --brick-black: #05131D;
  --brick-white: #F4F4F4;

  /* Racer colors */
  --racer-astar: #C91A09;
  --racer-dijkstra: #0055BF;
  --racer-bfs: #F2CD37;
  --racer-dfs: #4B9F4A;
  --racer-greedy: #FE8A18;
  --racer-hillclimb: #923978;
  --racer-simanneal: #36AEBF;

  /* Semantic board states */
  --state-wall: #582A12;
  --state-start: #AA7F2E;
  --state-goal: #F2CD37;
  --state-path-gold: #F2CD37;

  /* Surfaces & text */
  --surface-panel: #595D60;
  --surface-panel-raised: #6C6E68;
  --surface-card: #F4F4F4;
  --surface-overlay: rgba(5, 19, 29, 0.6);
  --text-primary: #05131D;
  --text-inverse: #F4F4F4;
  --text-muted: #A3A2A4;
  --border-strong: #05131D;
  --border-soft: #A3A2A4;
}
```