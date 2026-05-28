# Multiplication config: three-handle range slider

## Problem

The current `/multiplication` page has two independent on/off blocks ("Random" and
"In-order"), each with its own `from`/`to` number inputs. This lets users create
overlapping ranges (random 2–10, in-order 5–12) and gapped ranges (random 2–5,
in-order 9–12) — both of which are nonsense for the actual mental model: kids
have a contiguous span of tables, where the lower ones are mastered (drill them
random) and the higher ones are still being learned (drill them in-order). The
UI should make that contiguity structural rather than accidental.

## Model

A single range over tables `2..20`, controlled by three handles:

- `floor` — lowest table in the worksheet
- `split` — last table in the random section (in-order starts at `split + 1`)
- `ceiling` — highest table in the worksheet

Derived sets:

- Random tables: `floor..split` (inclusive)
- In-order tables: `split+1..ceiling` (inclusive)
- Tables outside `floor..ceiling` are excluded entirely

### Invariants

```
2 ≤ floor ≤ ceiling ≤ 20
floor − 1 ≤ split ≤ ceiling
```

### Edge cases

- `split = floor − 1` → no random section, everything is in-order
- `split = ceiling` → no in-order section, everything is random
- `floor = ceiling` and `split = floor − 1` → single table, in-order
- `floor = ceiling` and `split = ceiling` → single table, random

### Defaults

`floor = 2`, `split = 7`, `ceiling = 12`. Matches today's preset (random 2–7,
in-order 8–12) so first paint is unchanged.

### Drag behavior

Dragging any one handle never produces an invalid state — it pushes neighbors
as needed:

- Dragging `floor` right past `split` pushes `split` (and then `ceiling`) along
- Dragging `ceiling` left past `split` pushes `split` (and then `floor`) along
- Dragging `split` past either endpoint pushes that endpoint

This keeps the slider always-consistent; we never need a validation error.

## Visual

A single horizontal track spanning the full `2..20` domain. The active region
(`floor..ceiling`) is rendered as two adjacent colored bands:

- **Random band** (pink, `#ff3d6e`) covers `floor..split`
- **In-order band** (blue, `#3aa5f0`) covers `split+1..ceiling`

Outside the active region, the track is faint/empty. Three chunky bordered
handles match the existing carnival aesthetic (heavy black border, hard
drop-shadow). Each handle shows its numeric value directly beneath it. Region
labels `RANDOM` and `IN-ORDER` sit above their bands and disappear when the
corresponding band has zero width.

Below the slider, two compact readouts:

- `Random: 2 → 7 · 72 problems`
- `In-order: 8 → 12 · 5 tables · 60 problems`

The existing big total number and Generate button stay as-is.

## Interaction

- Pointer events (`pointerdown` / `pointermove` / `pointerup`) on each handle —
  works for mouse and touch
- Each handle is independently focusable; left/right arrow keys move by ±1
- Track clicks snap the nearest handle to the click position
- Submit enabled whenever `total > 0`

## Scope

Single file: `src/app/multiplication/page.tsx`.

Removed: `RangeBlock` component, `BigNumberField` component, both toggle states,
the four `from/to` states, and the `clamp` helper (replaced by slider-internal
clamping).

Added: one new `TableRangeSlider` component (defined in the same file — it's
specific to this page and unlikely to be reused).

The worksheet route (`/multiplication/worksheet`) is unchanged. The submit
handler still pushes `?rFrom=&rTo=&ioFrom=&ioTo=` URL params, derived from the
three handles. Empty sections are omitted from the URL.

## Non-goals

- No persistence of slider state across sessions
- No keyboard shortcuts beyond arrow keys
- No animation of handle motion when pushing neighbors (instant follow is fine)
- No third-party slider library — a small custom component is lighter than
  pulling in a dep and easier to style to the carnival aesthetic
