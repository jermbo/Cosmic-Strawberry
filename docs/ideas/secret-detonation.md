# Secret Detonation

**Status:** Built
**Plugins:** Physics2DPlugin
**Files:** `src/lib/interactions.ts`

## The idea

The infinite yoyo loop is gone — the intro plays once and settles. In its place,
a secret: type `strawberry` anywhere on the page and the wordmark detonates.
Letters, characters, and the tagline fly apart in zero gravity with random spin
while 70 confetti dots burst from the logo's center. Everything clears and the
intro re-forms.

## How it works

A rolling keystroke buffer trimmed to the secret's length, compared on every
keydown. On match, `physics2D` with `gravity: 0` sends each piece out at a random
angle and velocity — zero-G scatter reads more "space" than an arced confetti
fall. Confetti dots are throwaway DOM spans in a fixed layer, removed on
complete.

## Open questions

- Second secret word? Different payloads per word.
- Mobile has no keyboard — needs a touch equivalent (long press? shake?).
