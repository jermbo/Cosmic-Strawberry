# Cold Boot

**Status:** In progress
**Plugins:** TextPlugin, ScrambleTextPlugin, SplitText

## The idea

A total aesthetic pivot. Monospace, CRT scanlines, phosphor glow. The page boots
like a terminal rather than presenting like a hero: telemetry scrolls, systems
report in, the logo renders first as flickering ASCII, and only when the signal
locks does it resolve into the real SVG wordmark.

Gets to be funny in a way the elegant version can't.

## How it works

- **Boot log** — lines type out with TextPlugin, each ending in a right-aligned
  `OK` after a beat. Deliberate uneven pacing so it feels like real hardware.
- **Signal lock** — ScrambleTextPlugin decodes garbage characters into readable
  text, used for the identity line and the tagline.
- **ASCII to SVG** — the wordmark first appears as an ASCII block in a `<pre>`,
  glitching, then a scan wipe passes and leaves the real SVG behind.
- **CRT treatment** — scanline overlay, phosphor bloom via text-shadow, and an
  occasional flicker on a randomized loop.

The starfield stays but recedes: dimmer, treated as what the ship's window sees
behind the HUD.

## Open questions

- How long is too long before the logo appears?
- Skip-on-click, or make people sit through the boot?
- Does the palette stay cyan, or go amber/green phosphor?
