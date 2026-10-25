---
name: Chord Changes
description: Find chord progressions, hear them, understand why they work, and take them into your music app.
colors:
  cobalt: "#3355FF"
  cobalt-wash: "#E9EDFF"
  on-cobalt: "#FFFFFF"
  playhead-amber: "#F28A1B"
  playhead-wash: "#FFF1E2"
  fn-in-key: "#8A93A6"
  fn-borrowed: "#8B5CF6"
  fn-secondary: "#EA6A2A"
  fn-jazz: "#10A38C"
  fn-chromatic: "#E0457B"
  desk: "#F3F4F6"
  paper: "#FFFFFF"
  tray: "#F1F2F5"
  pencil: "#15171C"
  graphite: "#687080"
  hairline: "#E2E4E9"
  faint-rule: "#ECEDF1"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(30px, 4.4vw, 40px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  chord-display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    letterSpacing: "-0.015em"
  chord-name:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"ss01\", \"tnum\""
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  mono:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "10.5px"
    fontWeight: 400
    lineHeight: 1
rounded:
  pill: "999px"
  card-hero: "18px"
  card: "14px"
  inset: "12px"
  clip: "10px"
  control: "9px"
  control-sm: "8px"
spacing:
  xxs: "2px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pencil}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 14px"
  button-hover:
    backgroundColor: "{colors.tray}"
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 14px"
  button-small:
    rounded: "{rounded.control-sm}"
    height: "30px"
    padding: "0 10px"
  button-play:
    backgroundColor: "{colors.pencil}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pencil}"
    rounded: "{rounded.pill}"
    padding: "5px 13px"
  chip-selected:
    backgroundColor: "{colors.pencil}"
    textColor: "{colors.desk}"
  chip-genre-selected:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
  segmented:
    backgroundColor: "{colors.tray}"
    rounded: "{rounded.clip}"
    padding: "3px"
  segmented-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pencil}"
  select:
    backgroundColor: "{colors.tray}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 10px"
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "20px"
  chart-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card-hero}"
    padding: "20px 22px"
  chord-clip:
    rounded: "{rounded.clip}"
    typography: "{typography.chord-name}"
    padding: "5px 10px 6px 13px"
  chord-clip-playing:
    backgroundColor: "{colors.playhead-wash}"
  section-label:
    backgroundColor: "{colors.pencil}"
    textColor: "{colors.desk}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
---

# Design System: Chord Changes

## Overview

**Creative North Star: "The Writing Desk"**

Chord Changes should feel like a calm, well-lit workbench next to the instrument. The chart is the page you're working on. It sits in the middle, on the brightest paper, with the most lift. Tools are laid out within reach on either side: Create on the left, the selected chord and its swap ideas on the right, the Play bar pinned along the front edge. Nothing on the desk is showy. The desk is grey, the paper is white, and colour belongs to the music.

The tone is friendly and approachable. Pill-shaped chips for moods and genres, generous rounded corners, a soft cobalt wash behind the one-tap card in Simple view and plain-language hints in muted grey all tell a newcomer they can't break anything. Beneath that warmth there's a quiet precision: tabular figures, mono bar numbers, beats snapped to a grid. It's still a real tool for working songwriters. Density stays moderate. Advanced adds more tools, but never makes them smaller or heavier.

It is deliberately **not a toy** (no cartoon, gamified or kid-app styling, even in Simple view), **not a DAW clone** (no dark, dense, knob-heavy pro-audio skin), and **not a theory textbook** (no notation-first, academic presentation; theory appears as plain words and colour).

**Key Characteristics:**
- Neutral grey desk, white paper surfaces, colour reserved for meaning
- Chords drawn as tinted clips on a timeline, coloured by harmonic function
- Cobalt means "selected or act", amber means "playing now", and nothing else uses them
- One typeface (Geist) for everything, with Geist Mono for small numbers
- Soft rounded forms and pill chips; one ambient lift, on the chart alone
- Full light and dark themes, following the system with a manual override

## Colors

A quiet neutral desk with five harmonic-function tints and two signal colours. Every colour on screen either carries meaning or stays out of the way.

### Primary
- **Cobalt** (`cobalt`): the action and selection colour. It's used for the primary button (Generate, Put in this slot, Export), the ring around the selected chord clip, focus outlines, checkboxes, selected genre chips, and drop indicators while dragging. In dark mode it lifts to a softer periwinkle (#7088FF).
- **Cobalt Wash** (`cobalt-wash`): the tinted ground for the Simple-view quick card gradient, the quiz card and the "text updated" flash in the chart editor.

### Secondary
- **Playhead Amber** (`playhead-amber`): "this is sounding now", and only that. It's used for the ring and glow on the playing clip. **Playhead Wash** (`playhead-wash`) fills it.

### Tertiary: harmonic function tints
These colour the chord clips, the legend, swap-idea markers and function pills. They are the app's teaching layer, shown as colour rather than text.
- **In-Key Slate** (`fn-in-key`): chords built entirely from the key. It's deliberately neutral, because most chords are in the key and the eye should go to the exceptions.
- **Borrowed Violet** (`fn-borrowed`): chords borrowed from a parallel mode.
- **Secondary Ember** (`fn-secondary`): secondary dominants and tritone substitutes.
- **Chromatic Rose** (`fn-chromatic`): everything else outside the key. It also marks errors and wrong quiz answers.
- **Approach Teal** (`fn-jazz`): jazz approach chords, and one of the upper-voice lines in the voice-leading view.

### Neutral
- **Desk Grey** (`desk`): the page background behind all surfaces.
- **Paper White** (`paper`): panels, the chart card, buttons and chips at rest.
- **Inset Tray** (`tray`): recessed areas inside paper, such as the chart track, selects, segmented controls, chord-tone tiles, recipe and genre boxes, and button hover.
- **Pencil Ink** (`pencil`): text, the Play button, selected mood chips and section labels.
- **Graphite** (`graphite`): secondary text, labels, hints, Roman numerals and beat counts.
- **Hairline** (`hairline`): 1px borders on panels, buttons, chips and bar lines.
- **Faint Rule** (`faint-rule`): internal dividers within a panel.

### Named Rules
**The Colour Means Something Rule.** A colour on screen is harmonic function, selection, or playback. Don't use any of them as decoration.

**The Two Signals Rule.** Cobalt is "selected or act". Amber is "sounding now". When a clip is both selected and playing, amber wins.

**The Quiet Majority Rule.** In-key chords are tinted slate, not a brand colour. Most of the chart should look calm, so that borrowed, secondary and chromatic chords stand out as the interesting moments.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui, -apple-system)
**Body Font:** Geist (same stack)
**Label/Mono Font:** Geist Mono (with ui-monospace, SF Mono, Menlo) for bar numbers, beat counts, interval labels and the text chart editor

**Character:** One clean, contemporary grotesque does every job. Hierarchy comes from weight (400 / 500 / 600) and size, never from a second display face. Tight negative tracking on large chord names gives them the weight of a lead sheet; tabular figures (`tnum`) and stylistic set `ss01` keep numbers steady.

### Hierarchy
- **Display** (`display`): the "Chord Changes" wordmark. It shrinks to 26px in the top bar and 22px on phones.
- **Chord Display** (`chord-display`): the selected chord's name in the Chord panel. This is the largest type in the app because the chord is the subject (40px under 640px).
- **Headline** (`headline`): panel titles such as "Chart". The Simple-view quick card title runs at 22px.
- **Chord Name** (`chord-name`): chord names inside timeline clips (18px under 640px). Swap-idea chord names sit at 18px with the same weight and tracking.
- **Title** (`title`): sidebar headings such as Create, Generate a progression and section headings in panels.
- **Body** (`body`): running text and controls. Explanations cap at 60–70ch.
- **Label** (`label`): field labels, hints (12.5px) and section pills, set in Graphite.
- **Mono** (`mono`): bar numbers and beat counts on the chart; 10–11px elsewhere for interval tags under chord tones.

### Named Rules
**The Weight Not Face Rule.** Build hierarchy with Geist's weights and sizes. Don't add a second typeface.

**The Chord Is The Headline Rule.** Chord names are always the heaviest, tightest-tracked text in their context. Their Roman numeral or function sits beside or below in Graphite.

## Layout

Desktop (1200px and wider) uses a three-column desk inside a max 1680px container. There's a 320px Create sidebar, a fluid centre column holding the chart, and a 380px Chord / Swap ideas sidebar, with 16px gutters. Both sidebars are sticky and scroll on their own, sized between the sticky blurred top bar and the fixed Play bar.

Between 760px and 1199px, the Create sidebar becomes a slide-out drawer from the left (min(400px, 92vw) wide, slides in over 200ms) and the chord sidebar narrows to 340px.

Below 760px, the screen shows one panel at a time. A sticky tab bar under the top bar switches between Create, Chart, Chord and Tools. The top bar stops sticking, the tagline hides, and the Play bar compacts to two rows.

Simple view drops the Create column entirely. The layout becomes the chart plus the chord sidebar, with a one-tap quick card on top. Everything else is one switch away in Advanced.

Spacing follows a small rhythm. 6px between chips and small controls, 8px between buttons, 12px inside insets, 16px between panels and as the page gutter, 20px as panel padding. The body keeps a 16px side gutter at every width. Breakpoints observed: 520, 640, 760, 860, 1200px.

The chart track is a CSS grid of bars. Thin hairline bar lines carry mono bar numbers, and dot ticks mark each beat (darker on the beat groups). Clips span their exact beat length.

## Elevation & Depth

Depth comes mostly from tone. Grey desk, white paper on top, a grey tray pressed into the paper. Shadows are rare and each one has a job.

### Shadow Vocabulary
- **Desk lift** (`0 1px 2px rgb(16 20 30 / .04), 0 8px 24px -12px rgb(16 20 30 / .12)`): the chart card only, so the page you're working on sits highest on the desk. In dark mode it becomes a 1px edge plus a deeper falloff.
- **Segment lift** (`0 1px 2px rgb(0 0 0 / .1), 0 0 0 1px var(--line)`): the selected tab or segment, raised out of its tray.
- **Popover** (`0 24px 60px -18px rgb(0 0 0 / .45)`): Library and Export menus, plus the drawer edge (`24px 0 60px -30px`).
- **Playhead glow** (`0 0 24px -4px` amber at 60%): the playing clip. It's the only glow in the system.
- **Function stripe** (`inset 3px 0 0 var(--k)`): the 3px left edge on every chord clip in its function colour. This is a mark, not depth.

Frosted glass (blur 10–12px over 90% surface) appears only on the sticky top bar and the fixed Play bar, so content scrolling under them stays faintly visible.

### Named Rules
**The One Lifted Page Rule.** Only the chart card carries the ambient lift. Other panels sit flat on the desk with a hairline border.

## Shapes

Soft, friendly corners scaled to the size of the object. The hero chart card is 18px, panels are 14px, insets and trays 12px, chord clips 10px, buttons and selects 9px, small buttons 8px. Mood, genre and family chips, section labels, function pills and the Play button are full pills (999px). That's the approachable, touchable note in the system.

In code these are `--r-pill`, `--r` (14), `--r-inset` (12), `--r-clip` (10), `--r-s` (9) and `--r-xs` (8); the hero card's 18px is its only one-off. Shadows used more than once are tokens too: `--lift` (desk lift), `--pop` (popover) and `--seg-lift` (selected segment). New CSS uses these variables rather than raw values.

Borders are 1px hairlines. Dashed borders mean "not a real chord": empty `?` slots, tied continuations, and genre chips outside Chords allowed. Function colour shows as a left-edge stripe (3px on clips, a 3px rounded bar on swap-idea rows) rather than a full fill.

## Components

### Buttons
Calm and tactile. They look like paper keys on the desk.
- **Shape:** gently rounded (`control`), 36px tall; small variant 30px.
- **Default:** paper fill, hairline border, Pencil text, weight 500. Hover fills with Inset Tray.
- **Primary:** Cobalt fill, white text, weight 600. Hover brightens by 8%. One primary per context: Generate, Put in this slot, Export.
- **Play:** the one dark button. It's a Pencil Ink pill (44px tall in the Play bar) with a ▶ glyph, so it reads as the transport, not an ordinary action.
- **Disabled:** 40% opacity, no hover change.
- **Focus:** 2px Cobalt outline, 2px offset, everywhere.

### Chips
- **Style:** paper pill, hairline border, weight 500, 13.5px (15px in the Simple quick card).
- **State:** a selected mood chip inverts to Pencil Ink with a desk-grey label. A selected genre chip fills Cobalt, so mood and genre stay visually distinct. A chip family that's turned off goes Graphite; a chip outside Chords allowed goes dashed at 45% opacity.

### Segmented controls and tabs
- An Inset Tray track with 3px padding. Options are muted text, and the selected one rises as a paper tile with the segment lift. It's used for Simple / Advanced, Generate / Key and limits, Chord / Swap ideas, and the phone tab bar.

### Cards / Containers
- **Panel:** paper, hairline border, `card` radius, 20px padding (16px in sidebars), flat.
- **Chart card:** paper, `card-hero` radius, desk lift, 20px 22px padding.
- **Inset:** Inset Tray, 12px radius, 12px 14px padding, no border. Used for recipes, the genre chord box, the chord builder and the duration control.
- **Quick card (Simple view):** a panel with a Cobalt-tinted border and a Cobalt Wash to paper vertical gradient, the one warm invitation on the screen.

### Inputs / Fields
- **Style:** selects and number inputs are Inset Tray with a transparent border, 36px tall, `control` radius. A hairline appears on hover. The text-chart textarea uses Geist Mono at 13.5px with 1.7 line height, and turns to paper with a hairline on focus.
- **Checkboxes and range:** native, tinted with `accent-color: cobalt`.
- **Error:** Chromatic Rose text at 13px.

### Navigation
- **Top bar:** sticky, frosted desk-grey. Wordmark and tagline on the left; Library (a menu showing the saved count), Help and the Simple / Advanced switch on the right.
- **Play bar:** fixed to the bottom, frosted paper, hairline top border. It holds Play, "Now" with the current chord, Loop, tempo stepper, sound and playing-style selects, and Export as a Cobalt pill on the far right.
- **Phone tabs:** a segmented control, sticky under the top bar.

### Chord Clip (signature)
A chord drawn as a clip on a timeline track. It's tinted at 11% of its function colour over paper (18% on hover), with a 28% function-colour border and a 3px function stripe on the left edge. The chord name is set in `chord-name`, with the Roman numeral below in Graphite and the beat count in mono at top right.
- **Selected:** a 2px Cobalt ring.
- **Playing:** Playhead Wash fill, amber border, amber stripe, 2px amber ring and soft amber glow.
- **Empty slot:** transparent with a dashed Graphite border and `?`.
- **Tied:** transparent and dashed, with a faded name.
- **Dragging:** the original drops to 30% opacity, and a lifted ghost follows the pointer with a Cobalt ring. Drop points show as a Cobalt edge on the neighbouring clip.
- Background, border and ring changes animate over 150ms, but only when reduced motion is off.

### Swap Idea Row
A list row with a 3px rounded function bar inset on the left. The chord name is 18px semibold, then an arrow and Roman numeral in Graphite, then a one-line "why" in 13px Graphite below. Hear / Use buttons sit on the right. Hover fills with Inset Tray.

### First-run Tip
A one-line suggestion set inline where its moment happens, in Simple view only. Pencil Ink text on Inset Tray at the `inset` radius, with one or two underlined Cobalt text actions and a quiet × to dismiss. Only one tip is ever on screen, each shows once, and none appears before the first tap. There's no entrance animation, no overlay and no modal; it uses a status role so screen readers announce it.

### Function Pill
A small pill in the chord's function colour, on a 14% tint of the same colour (for example "In key" or "Borrowed"). It labels the chord's job beside its name.

## Do's and Don'ts

### Do:
- **Do** keep colour for meaning: function tints on chords, Cobalt for selection or action, amber for playback.
- **Do** put the chart on the brightest, most lifted surface. It's the page on the desk.
- **Do** use pills for choices a beginner taps (moods, genres, families) and rounded rectangles for tools.
- **Do** build hierarchy with Geist weights 400, 500 and 600 and tight tracking on chord names. Use Geist Mono only for small numbers and the text chart.
- **Do** give every new chord-related element its function colour through the shared `--k` variable (`.k-dia`, `.k-bor`, `.k-sec`, `.k-chr`, `.k-jazz`).
- **Do** design every surface for both light and dark themes using the existing tokens, and check it at phone, tablet and desktop widths.
- **Do** keep transitions short (150–200ms) and only when reduced motion is off.

### Don't:
- **Don't** make it a toy: no cartoon illustrations, mascots, confetti, badges or gamified chrome, even in Simple view.
- **Don't** make it a DAW clone: no dark-by-default pro-audio skin, knobs, meters or dense rack layouts.
- **Don't** make it a theory textbook: don't lead with staff notation or academic labels. Show function as colour and plain words first.
- **Don't** use Cobalt or amber decoratively, and don't introduce a new hue unless it maps to a new harmonic category.
- **Don't** give ambient shadows to panels other than the chart card. Stay flat on the desk.
- **Don't** add a second typeface.
