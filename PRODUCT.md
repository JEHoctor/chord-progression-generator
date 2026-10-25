# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: aspiring and established songwriters. Aspiring writers want a progression that sounds right for a feeling or style, fast, without first learning theory. Established writers want ideas, alternatives, playable voicings and a quick way to get the result into their own tools.

Secondary, welcome but not the design target: teachers and students of harmony. Function colouring, plain-language explanations, the "how it works" page and the function quiz already support this audience, and expanding teaching use is a bonus, never a trade-off against songwriters.

When the two songwriter audiences pull in different directions: **Simple first, depth on demand.** The default experience serves the aspiring writer, and an established writer's depth sits one step away in Advanced.

## Product Purpose

Chord Changes helps you find chord progressions, hear them, understand why they work, and take them into your music app. You don't need to know music theory to start. The theory is there when you want it.

Success: a newcomer gets a progression they like within one tap (the Simple view's mood buttons). An experienced writer reshapes it, using swap ideas, locks, restyle, text editing and voicings, then exports it without friction.

## Positioning

- **It explains why.** Every chord is classified by its harmonic job (in the key, secondary dominant, borrowed, tritone substitute, chromatic) and tinted to match. Swap ideas say in plain words why they work. A generator that only outputs chords can't truthfully claim this.
- **Private and offline.** It's one file with no account and no server. Everything runs and stays in the browser.
- **Playable, not just named.** Real guitar shapes (six strings, at most four fingers, alternate tunings and capo) and piano voicings for every chord. This is a core strength, though it isn't the headline claim.

## Operating Context

- People use it at the instrument or in a writing session: tap a chord to hear it, loop the chart, try swaps, play along on guitar or piano.
- Results leave the app as MIDI, MusicXML (Finale, Sibelius, MuseScore, Dorico), a copied text chart, or a printed lead sheet, and land in a DAW or notation app.
- Saved work lives in the in-browser Library. JSON library files can be exported and imported.
- Layout by device: one shell everywhere. The chart stays in the centre, and one navigation (Create, Chord, Tools) picks what the side panel shows; Library, Help and Simple / Advanced sit with it. On desktop the navigation is a rail on the left; on tablet it becomes a top bar; on a phone, tabs along the bottom (Create, Chart, Chord, Tools) show one screen at a time. The Play bar is pinned along the bottom. Simple and Advanced share the shell: Simple shows fewer panels, starting on the one-tap card in Create. Each screen has its own address (#create, #chart, #chord, #tools).

## Capabilities and Constraints

Capabilities (shipped):
- Generate by mood (Uplifting, Melancholy, Dreamy, Dark, Tense, Nostalgic, Epic, Mysterious) and blended genres (Pop through Film score), with a Predictable ↔ Surprising dial, length and chord-change rate.
- Key, mode, meter, tempo, and "Chords allowed" (the chord families permitted anywhere in the app).
- Chart editing: pick, drag, copy, resize, split, lock, Regenerate unlocked, Restyle my chart, transpose, undo, clear, and edit as text with sections.
- Chord detail, swap ideas, chord finder, melody harmonizer, keys and modes palette, rhythmic cycles and drones (talam / taal), function quiz.
- Synth playback with piano and guitar playing styles.

Constraints future work must keep:
- **One HTML file.** No build step, no libraries, plain JavaScript. The help pages (`guide.html`, `how-it-works.html`) are built from `docs-src/` with `python3 docs-src/build.py . docs-src`.
- **No server, no tracking.** State lives only in localStorage (`changes-v1`, `changes-library-v1`, `changes-quiz-v1`, plus layout preferences). Nothing is sent anywhere.
- **Phone to desktop.** Every capability must work on phone, tablet and desktop.

Terminology to keep: Chart, Create, Chord, Swap ideas, Chords allowed, Simple / Advanced, Library, Lock, Regenerate unlocked, Restyle my chart, Export.

Known limits (stated honestly in the product): the synth is for hearing harmony, not production. Generation and swaps are rule-based heuristics. The talam, taal and drone options are sketching aids built on Western chord thinking, not representations of Carnatic or Hindustani music.

Undecided: hosting is not a binding constraint (the repo name suggests GitHub Pages, but it was not confirmed as required).

## Evidence on Hand

- User guide: `docs-src/guide.body.html` → `guide.html`
- Technical explainer: `docs-src/hood.body.html` → `how-it-works.html`
- Smoke tests and screenshots: `tests/smoke.mjs`, `tests/out/` (phone, tablet, desktop, dark-mode captures, sample MIDI, MusicXML, lead-sheet PDF)

There are no testimonials, user counts, press or customer quotes. Future work must not invent them.

## Product Principles

1. **One tap to music.** A newcomer should hear something good before they have to make a decision they don't understand.
2. **Depth is one step away, never in the way.** Advanced features stay reachable without crowding the Simple path.
3. **Show the reason.** Whenever the app suggests or changes a chord, it can say why in plain words. Teaching value comes from this, not from a separate mode.
4. **Your music stays yours.** No accounts, no server, works offline. Nothing leaves the browser except files the user exports.
5. **Playable on real instruments.** Names are not enough. Every chord comes with shapes a person can actually play.

## Accessibility & Inclusion

No formal standard was confirmed. The existing code already supports keyboard shortcuts, visible focus rings, ARIA labelling and a reduced-motion path. Future work should keep these.
