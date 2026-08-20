# Zero-G

**Status:** Idea
**Plugins:** Physics2DPlugin, Draggable

## The idea

Kill layout entirely. Everything floats, drifts, and slowly collides. The
wordmark is never quite assembled — it's six pieces perpetually almost-aligned.
The only way to read it is to stop moving your mouse, at which point they gently
settle into place. Move again and it all comes apart.

Subtle, but it changes the entire feel of the page.

## How it works

Letters get absolute positions and continuous slow drift velocities. Pointer
movement adds energy to the system; stillness applies damping and a return force
toward formation. Effectively a tiny physics sim on six bodies.

## Open questions

- Legibility risk — the brand name is unreadable most of the time.
- Might work better as a mode you enter, not the default.
