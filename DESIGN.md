---
name: Chord Changes
description: Find chord progressions, hear them, understand why they work, and take them into your music app.
colors:
  stage-black: "#141414"
  stage-raised: "#262626"
  stage-ink: "#FFFFFF"
  stage-mute: "#A8A8A3"
  spike-yellow: "#FFD21F"
  spike-wash: "#FFF4C2"
  ink: "#141414"
  accent: "#141414"
  accent-ink: "#FFFFFF"
  play-green: "#12A867"
  play-wash: "#DDF5E8"
  tape-in-key: "#D6D6D1"
  tape-borrowed: "#3D86FF"
  tape-secondary: "#FF4F97"
  tape-chromatic: "#FFD21F"
  tape-approach: "#A77BFF"
  paper: "#FFFFFF"
  sheet: "#F3F3F0"
  muted: "#66665F"
  line: "#E0E0DA"
  rule: "#EBEBE6"
typography:
  chord-detail:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "clamp(64px, 6vw, 96px)"
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: "0em"
  display:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "clamp(40px, 4.4vw, 60px)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "0.005em"
  chord-strip:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "clamp(26px, 24cqi, 42px)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "0.005em"
  nav:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "25px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.03em"
  headline:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
  section:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  title:
    fontFamily: "Big Shoulders Display, Chord Accidentals, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.03em"
  body:
    fontFamily: "Public Sans, Chord Accidentals, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\""
  control:
    fontFamily: "Public Sans, Chord Accidentals, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Public Sans, Chord Accidentals, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.5
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  tape: "2px"
  xs: "8px"
  clip: "10px"
  inset: "12px"
  sheet: "14px"
  stage-corner: "18px"
  pill: "999px"
spacing:
  xxs: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "38px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "38px"
  button-small:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "32px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-mood-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-genre-selected:
    backgroundColor: "{colors.spike-yellow}"
    textColor: "{colors.stage-black}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  field-select:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    height: "38px"
    padding: "0 10px"
  tape-strip:
    backgroundColor: "{colors.tape-in-key}"
    textColor: "{colors.stage-black}"
    typography: "{typography.chord-strip}"
    rounded: "{rounded.tape}"
    padding: "8px 22px 9px 14px"
  function-tag:
    backgroundColor: "{colors.tape-in-key}"
    textColor: "{colors.stage-black}"
    typography: "{typography.label}"
    rounded: "{rounded.tape}"
    padding: "3px 10px"
  chart-sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.sheet}"
    padding: "16px 16px 18px"
  rail:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.stage-ink}"
    width: "200px"
    padding: "24px 14px"
  nav-tab:
    textColor: "{colors.stage-mute}"
    typography: "{typography.nav}"
    padding: "10px 10px 11px"
  nav-tab-selected:
    backgroundColor: "{colors.spike-yellow}"
    textColor: "{colors.stage-black}"
    typography: "{typography.nav}"
  play-bar:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.stage-ink}"
    padding: "10px 16px"
  play-button:
    backgroundColor: "{colors.spike-yellow}"
    textColor: "{colors.stage-black}"
    rounded: "{rounded.pill}"
    height: "50px"
    width: "140px"
  export-button:
    backgroundColor: "{colors.stage-ink}"
    textColor: "{colors.stage-black}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 18px"
  toast:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.stage-ink}"
    rounded: "{rounded.xs}"
    padding: "10px 16px"
---

# Design System: Chord Changes

## Overview

**Creative North Star: "The Setlist"**

The song is laid out like a setlist taped to the stage floor. A stage-black rail and a stage-black Play bar frame a white sheet; on that sheet the chords sit on a beat grid as flat strips of gaffer tape, each strip coloured by its harmonic job and finished with one torn end. Spike yellow, the tape a stage crew uses to mark positions, marks where you are: the current screen in the navigation, the Play button, a picked genre, the notes lit on a guitar or piano diagram. Everything is glanceable from a stool with an instrument in your lap.

Hierarchy comes from scale contrast alone. Chord names and headings are set in Big Shoulders Display, condensed and heavy, uppercase for headings and huge for chords; everything around them is small, quiet Public Sans. A chord's name uses the same lettering everywhere it appears: on its strip, in the Chord panel, in swap ideas and in the Play bar. The surface is flat: tape lies on paper, the paper lies on the stage, and only things that really float above the stage (menus, the chord picker, a dragged strip, the toast) cast a shadow.

There is one shell for every view. The chart stays in the centre; a single navigation (Create, Chord, Tools) picks what the side panel shows, and Simple and Advanced share the same frame, with Simple hiding depth rather than rearranging the room. Light and dark themes both keep the stage black and the tape colours constant; only the sheet and the ink swap.

**Key Characteristics:**
- Stage-black rail and Play bar framing a white (or charcoal) sheet.
- Chords as flat 2px-cornered tape strips coloured by harmonic function, each with one torn right edge.
- Spike yellow marks "you are here" and the Play action; a torn, slightly crooked strip of it sits behind the current nav item.
- Controls are ink, never colour: the accent is ink, and colour is reserved for harmonic meaning and position.
- Big Shoulders Display for chord names and headings, Public Sans for the interface, hierarchy by scale alone.
- One mark per state on a chord: outline, green stripe, dashed edge, open frame, fade, lock.

## Colors

A black stage, a white sheet, ink controls, and five tape colours that each mean one harmonic job, with spike yellow reserved for position and Play.

### Primary
- **Ink** (ink / accent, #141414; flips to #F2F2EE in dark): every control's voice. Primary buttons, selected mood chips, the selected-chord outline, focus rings, active segmented options, pane tab underlines, link underlines' text. The accent token deliberately equals ink.
- **Spike Yellow** (spike-yellow, the spike and hit tokens): the position marker. The torn "you are here" strip behind the current nav tab, the Play button, a selected genre or style chip, the open Library summary's edge, the link underline colour, the toast action on black, and the lit notes on fretboard and keyboard diagrams (with ink text on top).

### Secondary
- **Play Green** (play-green; #2FD08A in dark): playback only. The 7px stripe along the bottom of the strip that is sounding, and the lowest (bass) note on keyboard diagrams. **Play Wash** (play-wash) is its tint.

### Tertiary: the tape set (constant across themes)
- **In-Key Grey Tape** (tape-in-key): diatonic chords.
- **Spike Blue Tape** (tape-borrowed): chords borrowed from a parallel mode.
- **Hot Pink Tape** (tape-secondary): secondary and tritone dominants.
- **Yellow Tape** (tape-chromatic): chromatic chords. Shares its value with spike yellow.
- **Violet Tape** (tape-approach): jazz approach chords.

Text on every tape colour is stage black (#141414) in both themes.

### Neutral
- **Stage Black** (stage-black; #0A0A0A in dark): the rail, top bar, phone tab bar, Play bar and toast.
- **Stage Raised** (stage-raised; #232323 in dark): hover fill on stage controls, the Simple / Advanced track.
- **Stage Ink** (stage-ink) and **Stage Mute** (stage-mute; #9E9E98 in dark): text on the stage; mute for unselected nav items, nav descriptions and Play bar labels.
- **Paper** (paper; #1E1E1C background and #242422 surface in dark): the page, panes, buttons and chips.
- **Sheet** (sheet; #2C2C2A in dark): the chart sheet under the tape, field fills, inset groups (duration, transport, recipes, tips), and the torn-edge cut-out colour.
- **Muted** (muted; #AEAEA6 in dark): secondary text, roman numerals off the strip, hints.
- **Line** (line; #3D3D3A in dark) and **Rule** (rule; #33332F in dark): control borders and bar lines; dividers between panes, section rules, tab tracks.
- **Spike Wash** (spike-wash; #3A3410 in dark): pick bars, the add-tile hover, the text-editor flash after an edit.

### Named Rules
**The Harmonic Job Rule.** Tape colour states a chord's function and nothing else. A tape colour never decorates a control, a heading or a panel.

**The Ink Controls Rule.** Controls speak in ink. The accent is ink, so a primary button, a selected chip and a selection outline are black on light and near-white on dark; colour is left free to mean harmony.

**The Spike Rule.** Spike yellow marks position and the go action: the current screen, Play, a picked style, the notes lit on a diagram. It is a fill with ink on it, or a mark on stage black; never body text on the light sheet.

## Typography

**Display Font:** Big Shoulders Display (variable 100 to 900, embedded), falling back to sans-serif
**Body Font:** Public Sans (variable 100 to 900, embedded), falling back to ui-sans-serif and system-ui
**Label/Mono Font:** the system monospace (ui-monospace, SF Mono, Menlo) for the text chart editor, fret numbers and voicing notes
**Accidentals:** a "Chord Accidentals" face (the ♭ ♯ ♮ of Noto Music, size-adjusted 112%) sits second in both stacks so real accidentals always render.

**Character:** A condensed poster face for the things you read from across the room, against a plain civic sans for everything you operate. Big Shoulders carries chords, headings, nav and Play; Public Sans stays at 15px and out of the way, with tabular figures throughout.

### Hierarchy
- **Chord Detail** (900, clamp(64px, 6vw, 96px), 0.85): the selected chord's name in the Chord panel.
- **Display** (900, clamp(40px, 4.4vw, 60px), 0.9, uppercase): the chart title.
- **Chord Strip** (900, clamp(26px, 24cqi, 42px), 0.88): the chord name on a tape strip, sized to the strip by container query. The Play bar's now-playing name (28px) and swap-idea names (30px) use the same face and weight.
- **Nav** (800, 25px desktop / 21px tablet / 19px phone, 0.03em, uppercase): Create, Chart, Chord, Tools. The Play label uses 900 at 24px (20px phone); the brand uses 900 at 30px.
- **Headline** (800, 24px, 0.02em, uppercase): pane headings. The Simple quick card heading grows to clamp(30px, 3vw, 40px) at 900.
- **Section** (800, 20px, 0.06em, uppercase): Verse / Chorus labels on the sheet, followed by a 2px rule to the edge.
- **Title** (800, 19px, 0.03em, uppercase): sub-headings in the panes.
- **Body** (Public Sans 400, 15px, 1.5, tabular figures): all running text and hints.
- **Control** (Public Sans 600, 15px; primary 700; small 13.5px): buttons, chips and segmented options.
- **Label** (Public Sans 600, 12.5px, muted): field labels, bar numbers (11.5px), function numerals on a strip (13px).

### Named Rules
**The One Lettering Rule.** A chord's name is Big Shoulders Display at 900 on its strip, in the Chord panel, in swap ideas and in the Play bar, so the chord you hear, see and swap reads as one object. New places that name a single chord follow the same lettering.

**The Scale Alone Rule.** Hierarchy comes from size and the display face, not from colour or boxes. Interface text stays small and quiet so the chords can be huge.

**The Raised Accidental Rule.** In Big Shoulders chord names, ♭ and ♯ stay in the text (so copy, search and screen readers get the real characters) but are painted transparent and overlaid with a raised b or # drawn in the chord face at 0.68em, 0.4em wide (0.46em for #).

## Layout

One shell for every view. The centre column holds the chart and never leaves; the side panel shows Create, Chord or Tools as chosen from a single navigation; Library, Help and Simple / Advanced live with that navigation. Simple and Advanced use the same shell, and Simple hides depth in place.

- **Desktop (1200px and up):** a fixed 200px stage-black rail on the left holds the brand, the three nav items (each with a one-line description), and Library, Help and the Simple / Advanced toggle at its foot. The app area starts at 200px with an 18px rounded top-left corner, so the sheet reads as laid on the stage. It is a two-column grid: the chart centre (28px 32px padding) and a 400px sticky side pane separated by a 2px rule. The Play bar runs along the bottom from the rail's edge.
- **Tablet (760px to 1199px):** the rail becomes a sticky top bar (brand, nav in a row without descriptions, actions pushed right); the side pane narrows to 340px; the Play bar spans the full width.
- **Phone (below 760px):** one screen at a time. A static black top bar holds brand, Library, Help and Simple / Advanced; the four tabs (Create, Chart, Chord, Tools) sit in a fixed stage-black bar along the bottom with 48px minimum targets, and the Play bar sits just above them.
- **Rhythm:** gaps step through 6, 8, 12, 16, 24 and 32px. Centre content is spaced 20px; pane content 16px; the chart sheet pads 16px with 18px between rows; a bar row is at least 116px tall, and strips sit 22px from the bar top for the bar number.
- Inner two-column tool layouts stack below 860px; list rows put their buttons under the text below 520px.

### Named Rules
**The Chart Never Leaves Rule.** Changing what the side panel shows never moves or hides the chart on desktop and tablet; on a phone the chart is its own tab, one tap away.

## Elevation & Depth

Flat by construction. Depth comes from layering materials: stage black under a paper sheet, a sheet-grey chart area on the paper, and flat tape on the sheet. Tape strips, buttons, chips and panels carry no shadow. A shadow appears only on things that genuinely float above the stage.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 24px 60px -18px rgb(0 0 0 / .45)`): the Library and Export menus and the chord picker.
- **Carried strip** (`box-shadow: 0 0 0 3px var(--ink), 0 18px 36px -12px rgb(0 0 0 / .45)`): a strip being dragged.
- **Toast** (`box-shadow: 0 12px 32px -12px rgb(0 0 0 / .45)`): the toast above the Play bar.

### Named Rules
**The Floor Is Flat Rule.** Anything taped down (strips, chips, buttons, panels) lies flat. Only menus, the picker, a dragged strip and the toast lift.

## Shapes

Two shape families that never mix. Tape is nearly square (2px corners) with one torn right edge, an SVG mask cut out of the sheet colour so the tear always matches what is underneath. Every control is a pill (999px): buttons, chips, segmented controls, select-buttons and the Play button. Between them, containers use soft rounding: 8px for fields and the toast, 10px for list rows and menu items, 12px for inset groups and diagram cards, 14px for the chart sheet and floating menus, 18px for the sheet's top-left corner against the rail. Borders are 1.5px on controls and 2px on bar lines and state edges.

The "you are here" marker is a torn strip of spike tape: an SVG mask with jagged ends, rotated -1.1deg, laid behind the current nav item and inset a little past it.

### Named Rules
**The Tape Or Key Rule.** If it represents a chord or a harmonic function, it is tape (2px corners, flat fill). If you press it, it is a key (pill). The function tag beside a chord name is tape too.

## Components

### Buttons
Paper keys with a firm edge; the main action is solid ink.
- **Shape:** pill (999px), 38px tall, 16px side padding; small 32px and 12px.
- **Default:** paper fill, ink text at 600, 1.5px line border. Hover keeps the fill and darkens the border to ink.
- **Primary:** ink fill and border, paper text at 700; hover drops opacity to 0.88.
- **Focus:** 2px ink outline, 2px offset, on every focusable element.
- **Disabled:** 40% opacity, border stays at line colour.
- **Icons:** the authored set (play, stop, left, right, down, x) is drawn on a 16-unit grid at stroke 1.75 with round caps and joins, sized 1em in currentColor. The lock on a strip is a 12-unit filled glyph from the same hand.
- **On the stage:** buttons go transparent with stage-ink text and a #3D3D3A border, hovering to a stage-ink border.

### Chips
- **Style:** pill, paper fill, 1.5px line border, ink text at 600, 6px 14px. Hover darkens the border to ink.
- **State:** a selected mood is ink-filled with paper text; a selected genre or style is spike-yellow with stage-black text, so the two never read alike. A family chip outside the allowed set fades to 45% with a dashed border.

### Segmented Controls
- Sheet-coloured pill track with 3px padding; the active option is a paper pill with a 1.5px ink ring. On the stage (Simple / Advanced) the track is stage-raised and the active option is a stage-ink pill with stage-black text.

### Cards / Containers
- **Chart sheet:** sheet fill, 14px corners, 16px padding, no border, no shadow; bars divided by 2px line rules, section labels followed by a 2px rule.
- **Inset groups** (duration, transport tools, recipes, tips, diagram lists): sheet fill, 12px corners, 8 to 14px padding.
- **Panes:** no card at all; panels inside the side pane drop border, padding and background and sit directly on the paper.

### Inputs / Fields
- **Style:** sheet fill, 1.5px transparent border, 8px corners, 38px tall.
- **Hover / Focus:** border appears in line colour; global 2px ink focus ring.

### Navigation
- **Rail tabs:** Big Shoulders 800 uppercase in stage mute with a Public Sans description below; hover to stage ink. The selected tab turns stage-black on a torn spike-yellow strip laid crooked behind it.
- **Pane tabs** (Chord / Swap ideas and the Tools tabs): Public Sans 700 in muted on a 2px rule track; the selected tab is ink with a 3px ink underline.
- **Phone:** the same tabs, centred, in a bottom stage-black bar with the spike strip behind the current one.

### Tape Strip (signature)
The chord on the beat grid. Flat fill in its function colour, 2px corners, stage-black text, chord name in Big Shoulders 900 sized to the strip, roman numeral below at 13px, beat count top right; a 10px torn right edge cut in the sheet colour. Narrow strips drop the beat count (under 118px) and then the numeral (under 84px). A drag handle on the right edge appears on hover.

States, one mark each:
- **Selected:** a 3px ink outline, offset 3px.
- **Playing:** a 7px play-green stripe inset along the bottom.
- **Outside Chords allowed:** a 2px dashed stage-black edge on three sides; the torn end stays.
- **Empty:** a 2px solid muted frame, no fill, holding a "?".
- **Tie** (the chord carried on): the strip's colour at 40%, no torn end.
- **Locked:** a small lock icon at the strip's bottom right.
- **Dragging:** the source fades to 30%; the carried copy gets the carried-strip shadow; drop targets show a 6px ink bar before or after.
- Background, shadow and border transitions run 0.15s only when reduced motion is not requested.

### Function Tag
The chord's function in the Chord panel: a tape patch (2px corners) in the function colour with stage-black text at 700, 12px. The legend uses 22 by 11px tape swatches.

### Play Bar
The front edge of the stage. Stage-black, fixed to the bottom (from the rail's edge on desktop, above the tab bar on phone). Play is a spike-yellow pill, 50px tall and at least 140px wide, labelled in Big Shoulders 900 uppercase with the play icon; the now-playing chord is Big Shoulders 900 at 28px under a stage-mute label; tempo, sound and style controls are outline pills; Export is a stage-ink pill with stage-black text. Checkboxes on the stage use spike yellow.

### Toast
Stage-black with stage-ink text, 8px corners, above the Play bar; its action is a spike-yellow underlined link.

## Do's and Don'ts

### Do:
- **Do** colour a chord strip only by its harmonic function (tape-in-key, tape-borrowed, tape-secondary, tape-chromatic, tape-approach), with stage-black text on every tape colour in both themes.
- **Do** keep the rail, top bar, phone tab bar, Play bar and toast stage black in both themes.
- **Do** mark the current screen with the torn spike-yellow strip, rotated -1.1deg, behind the nav label.
- **Do** set every chord name in Big Shoulders Display 900, with ♭ and ♯ drawn through the raised overlay.
- **Do** make every control a pill with a 1.5px border, and every chord or function mark a 2px-cornered tape patch.
- **Do** give each chord state exactly one mark: 3px ink outline (selected), 7px green bottom stripe (playing), dashed edge (outside Chords allowed), solid open frame with "?" (empty), 40% fade (tie), lock icon (locked).
- **Do** draw new icons on the 16-unit grid at stroke 1.75, round caps and joins, in currentColor.
- **Do** keep a new view inside the one shell: a side-panel choice in the single navigation, never a new layout.

### Don't:
- **Don't** use a tape colour on a button, heading, panel or chart decoration.
- **Don't** set spike yellow (or the yellow tape colour) as text on the light sheet; it is a fill under ink, or a mark on stage black.
- **Don't** put a shadow on a strip, chip, button or panel; only menus, the chord picker, a dragged strip and the toast float.
- **Don't** round the tape: strips and function tags keep 2px corners and the torn right edge.
- **Don't** add a second state mark to a strip (no glow plus outline, no colour change for selection).
- **Don't** give Simple view its own layout; it hides depth inside the same shell.
