// Headless smoke test for index.html (Chord Changes Workbench). Run: cd tests && npm test   (or: node smoke.mjs 1 2 3 to pick phases)
import { chromium, webkit, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tests', 'out');
fs.mkdirSync(OUT, { recursive: true });
const PHASES = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [1, 2, 3];

// ---------- tiny static server ----------
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${server.address().port}/index.html`;

// ---------- MIDI parser (enough for files this app writes) ----------
export function parseMidi(buf) {
  const b = Buffer.from(buf); let o = 0;
  const str = n => { const s = b.toString('latin1', o, o + n); o += n; return s; };
  const u32 = () => { const v = b.readUInt32BE(o); o += 4; return v; };
  const u16 = () => { const v = b.readUInt16BE(o); o += 2; return v; };
  if (str(4) !== 'MThd') throw new Error('no MThd');
  if (u32() !== 6) throw new Error('bad header length');
  const format = u16(), ntrk = u16(), ppq = u16(), tracks = [];
  for (let t = 0; t < ntrk; t++) {
    if (str(4) !== 'MTrk') throw new Error('no MTrk ' + t);
    const len = u32(), end = o + len, evs = []; let tick = 0, status = 0;
    const vlq = () => { let v = 0, c; do { c = b[o++]; v = (v << 7) | (c & 0x7f); } while (c & 0x80); return v; };
    while (o < end) {
      tick += vlq(); let st = b[o];
      if (st & 0x80) { o++; status = st; } else st = status;
      if (st === 0xff) { const type = b[o++], l = vlq(); evs.push({ tick, meta: type, data: b.subarray(o, o + l) }); o += l; if (type === 0x2f) break; }
      else { const hi = st & 0xf0, n = hi === 0xc0 || hi === 0xd0 ? 1 : 2; evs.push({ tick, st: hi, ch: st & 15, d: [...b.subarray(o, o + n)] }); o += n; }
    }
    o = end; tracks.push(evs);
  }
  if (o !== b.length) throw new Error('trailing bytes');
  return { format, ntrk, ppq, tracks };
}

// ---------- harness ----------
const results = []; let failures = 0;
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); if (!ok) failures++; };
// headless Chromium on a machine with no audio device can stall creating an AudioContext; this flag gives it a silent output
const browser = await chromium.launch({ args: ['--disable-audio-output'] });
async function openPage(opts = {}) {
  const { noReveal, ...o } = opts;
  const ctx = await browser.newContext({ acceptDownloads: true, ...o });
  const page = await ctx.newPage(); page.errors = []; page.setDefaultTimeout(5000);
  // controls now live in tabs, the Create drawer and popovers: reveal one the way a person would before using it
  if (!noReveal) for (const m of ['click', 'fill', 'selectOption', 'check', 'uncheck', 'dblclick', 'setInputFiles', 'press']) {
    const orig = page[m].bind(page);
    page[m] = async (sel, ...rest) => { if (typeof sel === 'string' && !/>>|:has|text=/.test(sel)) await page.evaluate(q => { try { const el = document.querySelector(q); if (el && window.revealEl) revealEl(el); } catch (e) {} }, sel).catch(() => {}); return orig(sel, ...rest); };
  }
  page.on('console', m => { if (m.type() === 'error') page.errors.push(m.text()); });
  page.on('pageerror', e => page.errors.push(String(e)));
  return { ctx, page };
}
// toasts sit at the bottom edge and can cover a button Playwright scrolls into view; dismiss them before clicking
const tap = async (page, sel) => { await page.evaluate(() => { document.querySelector('#toast').hidden = true; }); 
  // export actions live in the Export menu: open it first, as a person would
  if (!/>>|:has|text=/.test(sel) && await page.evaluate(s => { const el = document.querySelector(s); return !!(el && el.closest('#exportMenu') && document.querySelector('#exportMenu').hidden); }, sel)) await page.click('#exportBtn');
  await page.click(sel); };
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

// ===================================================== PHASE 1
async function phase1() {
  const { ctx, page } = await openPage();
  // an old-format save (no genres, "blues" as a mood, no library yet) must still load
  await page.goto(URL_);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('changes-v1', JSON.stringify({ S: { tonic: 2, mode: 'dorian', meter: '4/4', tempo: 100, level: 2, mood: 'blues' }, chords: [{ id: 'x1', root: 2, q: 'm7', bass: null, beats: 4 }, { id: 'x2', root: 7, q: '7', bass: null, beats: 4 }], sel: 'x1' })); });
  await page.reload();
  const old = await page.evaluate(() => ({ n: chords.length, names: chords.map(c => chordName(c)).join(' '), g: S.genres, mood: S.mood, lib: JSON.parse(localStorage.getItem('changes-library-v1')) }));
  check('old changes-v1 save loads', old.n === 2 && old.names === 'Dm7 G7', old.names);
  check('old Bluesy mood becomes the Blues genre', old.g.includes('blues') && old.mood === '');
  check('old save migrated into library as "Untitled"', old.lib && old.lib.version === 1 && old.lib.items[0]?.name === 'Untitled');

  check('all eight moods are offered', await page.evaluate(() => MOODS.map(m => m.name).join() === 'Uplifting,Melancholy,Dreamy,Dark,Tense,Nostalgic,Epic,Mysterious'));
  // generate, edit, play
  await tap(page, '#gen');
  check('generate makes a progression', await page.evaluate(() => chords.length > 0 && chords.every(c => c.beats > 0)));
  await page.evaluate(() => stopAll()); // Generate plays what it made
  await page.fill('#prog', '[Verse]\nC | Am | F | G:2 G7:2\n[Chorus]\nF | G | C | C');
  await tap(page, '#load');
  const loaded = await page.evaluate(() => ({ text: document.querySelector('#prog').value, n: chords.length }));
  check('typed chart loads', loaded.n === 9 && loaded.text.includes('[Chorus]'), loaded.text.replace(/\n/g, ' / '));
  await tap(page, '#play'); await page.waitForTimeout(700);
  check('play highlights a chord', await page.evaluate(() => !!document.querySelector('.slot.playing')));
  await tap(page, '#play');
  check('stop clears playback', await page.evaluate(() => !playing && !document.querySelector('.slot.playing')));

  // MIDI export: parse the generated bytes and compare with the chart and the player's voicings
  for (const withBass of [false, true]) {
    const r = await page.evaluate(wb => ({ bytes: [...buildMidi(wb)], tempo: S.tempo, num: barLen(), den: den(),
      voices: chords.filter(real).map(c => { const v = chartPlan().get(c.id); return { all: v.all.length, rh: v.rh.length, bass: v.bass }; }),
      beats: chords.map(c => c.beats), real: chords.map(real) }), withBass);
    const m = parseMidi(r.bytes), tpb = m.ppq * 4 / r.den;
    const tempoEv = m.tracks[0].find(e => e.meta === 0x51), ts = m.tracks[0].find(e => e.meta === 0x58);
    const bpm = 60e6 / ((tempoEv.data[0] << 16) | (tempoEv.data[1] << 8) | tempoEv.data[2]);
    const ons = t => m.tracks[t].filter(e => e.st === 0x90 && e.d[1] > 0), offs = t => m.tracks[t].filter(e => e.st === 0x80 || (e.st === 0x90 && e.d[1] === 0));
    const starts = []; let acc = 0; r.beats.forEach((b, i) => { if (r.real[i]) starts.push(acc * tpb); acc += b; });
    const onTicks = [...new Set(ons(1).map(e => e.tick))];
    const label = withBass ? 'chords + bass' : 'chords only';
    check(`MIDI ${label}: format 1, ${withBass ? 3 : 2} tracks`, m.format === 1 && m.ntrk === (withBass ? 3 : 2));
    check(`MIDI ${label}: tempo ${r.tempo} bpm`, Math.abs(bpm - r.tempo) < 0.01, bpm.toFixed(2));
    check(`MIDI ${label}: time signature ${r.num}/${r.den}`, ts.data[0] === r.num && 2 ** ts.data[1] === r.den);
    const expectOn = r.voices.reduce((a, v) => a + (withBass ? v.rh : v.all), 0);
    check(`MIDI ${label}: chord note count matches the voicings`, ons(1).length === expectOn && offs(1).length === expectOn, `${ons(1).length}/${expectOn}`);
    check(`MIDI ${label}: chord onsets match the chart order and durations`, JSON.stringify(onTicks) === JSON.stringify(starts), onTicks.join(','));
    check(`MIDI ${label}: last note ends with the chart`, Math.max(...offs(1).map(e => e.tick)) === acc * tpb);
    if (withBass) check('MIDI bass track: one note per chord, matching the bass line', ons(2).length === r.voices.length && ons(2).every((e, i) => e.d[0] === r.voices[i].bass));
    check(`MIDI ${label}: section markers`, m.tracks[0].filter(e => e.meta === 0x06).map(e => e.data.toString()).join(',') === 'Verse,Chorus');
  }
  const dlP = page.waitForEvent('download');
  await tap(page, '#midiExport');
  const dl = await dlP, dlPath = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(dlPath);
  check('Export MIDI button downloads <key>-<mode>-<tempo>bpm.mid', /^[A-G](sharp|flat)?-[a-z]+-\d+bpm\.mid$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  let parsedOk = true; try { parseMidi(fs.readFileSync(dlPath)); } catch (e) { parsedOk = false; }
  check('downloaded .mid parses', parsedOk);
  // notation export: the Export menu downloads MusicXML that parses, with one bar per chart bar and a symbol per chord
  const xdlP = page.waitForEvent('download'); await tap(page, '#xmlExport'); const xdl = await xdlP, xpath = path.join(OUT, xdl.suggestedFilename()); await xdl.saveAs(xpath);
  const xml = fs.readFileSync(xpath, 'utf8');
  const xr = await page.evaluate(x => { const d = new DOMParser().parseFromString(x, 'application/xml'); const L = barLen(), total = chords.reduce((a, c) => a + c.beats, 0);
    return { err: !!d.querySelector('parsererror'), measures: d.querySelectorAll('measure').length, bars: Math.ceil(total / L), harm: d.querySelectorAll('harmony').length, real: chords.filter(real).length, reh: [...d.querySelectorAll('rehearsal')].map(r => r.textContent).join(',') }; }, xml);
  check('Export notation downloads MusicXML (.musicxml)', /\.musicxml$/.test(xdl.suggestedFilename()) && xml.startsWith('<?xml') && /score-partwise/.test(xml), xdl.suggestedFilename());
  check('MusicXML parses with a bar per chart bar, a chord symbol per chord and section marks', !xr.err && xr.measures === xr.bars && xr.harm === xr.real && xr.reh === 'Verse,Chorus', JSON.stringify(xr));
  // the zip wrapper used inside the artifact viewer
  const zip = Buffer.from(await page.evaluate(() => [...zipStore([{ name: 'a.mid', data: buildMidi(false) }])]));
  check('zip wrapper has a valid end record and CRC', zip.readUInt32LE(zip.length - 22) === 0x06054b50 && zip.readUInt32LE(14) === await page.evaluate(() => crc32(buildMidi(false))));

  // share link round trip, in a fresh browser profile
  const link = await page.evaluate(() => shareLinkURL());
  const before = await page.evaluate(() => ({ text: serialize(), k: S.tonic, m: S.mode, t: S.meter, b: S.tempo }));
  const { ctx: ctx2, page: p2 } = await openPage();
  await p2.goto(link); await p2.waitForTimeout(200);
  const after = await p2.evaluate(() => ({ text: serialize(), k: S.tonic, m: S.mode, t: S.meter, b: S.tempo, hash: location.hash, toast: document.querySelector('#toast').textContent }));
  check('share link restores key, mode, meter, tempo and chart with sections', JSON.stringify({ ...after, hash: 0, toast: 0 }) === JSON.stringify({ ...before, hash: 0, toast: 0 }), after.text.replace(/\n/g, ' / '));
  check('share link shows a toast and clears the hash', /shared/.test(after.toast) && after.hash === '');
  await p2.evaluate(() => { document.querySelector('#library').open = true; });
  await p2.fill('#shareIn', 'not a link'); await tap(p2, '#shareOpen');
  check('bad share code is rejected with a message', /not a Chord Changes/.test(await p2.textContent('#toast')));
  check('no console errors (share page)', p2.errors.length === 0, p2.errors.join(' | '));
  await ctx2.close();
  await tap(page, '#shareLink'); await page.waitForTimeout(150);
  check('Share link button copies or shows the copy box', await page.evaluate(() => /copied/.test(document.querySelector('#toast').textContent) || !document.querySelector('#copybox').hidden));
  if (await page.evaluate(() => !document.querySelector('#copybox').hidden)) await page.click('#copyboxDone');

  // library: save, save again (update), open, rename, duplicate, delete with undo, export and import
  await tap(page, '#library summary');
  await page.fill('#libName', 'Verse idea'); await tap(page, '#libSaveBtn');
  await page.fill('#libName', 'Verse idea'); await tap(page, '#libSaveBtn');
  let lib = await page.evaluate(() => LIB.items.map(i => i.name));
  check('library saves by name and updates on the same name', lib.filter(n => n === 'Verse idea').length === 1 && lib.includes('Untitled'), lib.join(', '));
  await tap(page, '[data-lib] >> text=Untitled'); // open
  check('opening an item loads it', await page.evaluate(() => chords.map(c => chordName(c)).join(' ') === 'Dm7 G7'));
  check('opening an item closes the Library so the chart shows', await page.evaluate(() => !document.querySelector('#library').open));
  await page.evaluate(() => { document.querySelector('#library').open = true; });
  await tap(page, '[data-lib]:has-text("Verse idea") [data-la="rename"]');
  await page.fill('[data-lib] input', 'Verse A'); await page.press('[data-lib] input', 'Enter');
  await tap(page, '[data-lib]:has-text("Verse A") [data-la="dup"]');
  await tap(page, '[data-lib]:has-text("Verse A copy") [data-la="del"]');
  lib = await page.evaluate(() => LIB.items.map(i => i.name));
  check('rename, duplicate and delete work', lib.includes('Verse A') && !lib.includes('Verse A copy'), lib.join(', '));
  await page.click('#toast .toast-act');
  lib = await page.evaluate(() => JSON.parse(localStorage.getItem('changes-library-v1')).items.map(i => i.name));
  check('delete can be undone and is stored', lib.includes('Verse A copy'), lib.join(', '));
  const jdl = page.waitForEvent('download'); await tap(page, '#libExport'); const jd = await jdl; const jpath = path.join(OUT, jd.suggestedFilename()); await jd.saveAs(jpath);
  const exported = JSON.parse(fs.readFileSync(jpath, 'utf8'));
  check('library exports as versioned JSON', exported.version === 1 && exported.items.length === lib.length);
  await page.evaluate(() => { LIB.items = []; libSave(); renderLibrary(); });
  await page.setInputFiles('#libImport', jpath);
  await page.waitForTimeout(200);
  check('library imports from the exported JSON', await page.evaluate(n => LIB.items.length === n, exported.items.length));

  // print stylesheet: only the lead sheet shows, black on white
  await page.evaluate(() => { document.querySelector('#printSheet').innerHTML = leadSheetHTML(); });
  await page.emulateMedia({ media: 'print' });
  const pr = await page.evaluate(() => ({ sheet: getComputedStyle(document.querySelector('#printSheet')).display, wrap: getComputedStyle(document.querySelector('.wrap')).display,
    bars: document.querySelectorAll('#printSheet .bar').length, sec: [...document.querySelectorAll('#printSheet h2')].map(h => h.textContent).join(','), bg: getComputedStyle(document.body).backgroundColor, num: !!document.querySelector('#printSheet .cell i') }));
  check('print shows only the lead sheet', pr.sheet === 'block' && pr.wrap === 'none');
  check('lead sheet has bars, numerals, white page', pr.bars > 0 && pr.num && pr.bg === 'rgb(255, 255, 255)', `${pr.bars} bars, sections ${pr.sec}`);
  await page.pdf({ path: path.join(OUT, 'lead-sheet.pdf') }).catch(() => {});
  await page.emulateMedia({ media: 'screen' });

  // live MIDI out: picking "Connect" must either list devices or explain the block, never throw
  if (await page.evaluate(() => 'requestMIDIAccess' in navigator)) {
    await page.selectOption('#midiOut', '__connect'); await page.waitForTimeout(800);
    const mo = await page.evaluate(() => ({ opts: [...document.querySelector('#midiOut').options].map(o => o.text), toast: document.querySelector('#toast').textContent }));
    check('MIDI out connect lists outputs or explains a block', mo.opts.length >= 1 && (mo.opts.includes('Off') || /blocked/.test(mo.toast)), mo.opts.join(' / '));
    await tap(page, '#play'); await page.waitForTimeout(300); await tap(page, '#play');
  }
  // reload keeps the last state
  const lastText = await page.evaluate(() => serialize());
  await page.reload();
  check('reload restores the last progression', await page.evaluate(t => serialize() === t, lastText));
  check('no console errors (main page)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}


// ===================================================== PHASE 2
async function phase2() {
  const { ctx, page } = await openPage();
  await page.goto(URL_); await page.evaluate(() => { localStorage.clear(); }); await page.reload();
  await page.fill('#prog', 'C | Am | F | G | Em | ? | Dm | G7'); await tap(page, '#load');

  // 2.1 every idea on every slot has theory name, specific sentence, voice-leading line and A/B
  const audit = await page.evaluate(() => {
    const out = { items: 0, missing: [], generic: [], dupes: 0 };
    for (const c of chords) {
      sel = c.id; renderAll(); openGroups.clear(); document.querySelectorAll('#subs [data-more]').forEach(b => openGroups.add(b.dataset.more)); renderSubs();
      const items = [...document.querySelectorAll('#subs .item')], seen = new Set();
      for (const it of items) {
        out.items++;
        const tn = it.querySelector('.tn')?.textContent.trim(), why = it.querySelector('.why')?.textContent.trim(), vl = it.querySelector('.vl')?.textContent.trim(), ab = it.querySelector('[data-ab]');
        const names = [...it.querySelectorAll('.names .nm')].map(n => n.textContent);
        if (!tn || !why || why.length < tn.length + 20 || !vl || !ab) out.missing.push(chordName(c) + ' → ' + names.join(' '));
        // specific, not filler: the sentence names the idea (and the original when there is one), the VL line names a neighbour
        const body = why.slice(tn.length);
        if (!names.some(n => body.includes(n)) || (real(c) && names.length === 1 && !body.includes(chordName(c)) && !/fills the gap/.test(body))) out.generic.push(names.join(' ') + ': ' + body);
        if (seen.has(body)) out.dupes++; seen.add(body);
      }
    }
    return out;
  });
  check('2.1 every suggestion has theory name, sentence, voice-leading and A/B', audit.items > 50 && audit.missing.length === 0, `${audit.items} ideas; missing: ${audit.missing.slice(0, 3).join(' | ')}`);
  check('2.1 explanations name the specific chords (no generic filler)', audit.generic.length === 0, audit.generic.slice(0, 2).join(' | '));
  check('2.1 no two ideas for a slot share an explanation', audit.dupes === 0, String(audit.dupes));
  const vlLine = await page.evaluate(() => { sel = chords[1].id; renderAll(); return document.querySelector('#subs .item .vl').textContent; });
  check('2.1 voice-leading line lists held notes and semitone moves', /From C:/.test(vlLine) && /semitone/.test(vlLine) && /[+−]\d/.test(vlLine), vlLine);
  const chartBefore = await page.evaluate(() => serialize());
  await tap(page, '#subs [data-ab]'); await page.waitForTimeout(400);
  const abOn = await page.evaluate(() => ({ pressed: document.querySelector('#subs [data-ab][aria-pressed="true"]') != null, stat: document.querySelector('.abstat')?.textContent || '' }));
  check('2.1 A/B plays original then substitute and shows which', abOn.pressed && /Playing A: Am/.test(abOn.stat), abOn.stat);
  await page.waitForTimeout(Math.ceil(60 / 88 * 4 * 1000) + 300);
  check('2.1 A/B moves on to B', /Playing B:/.test(await page.evaluate(() => document.querySelector('.abstat')?.textContent || '')));
  await tap(page, '#subs [data-ab][aria-pressed="true"]');
  check('2.1 A/B never changes the chart and stops on a second click', await page.evaluate(b => serialize() === b && !document.querySelector('.abstat') && !document.querySelector('#subs [data-ab][aria-pressed="true"]'), chartBefore));
  await tap(page, '#subs [data-use]');
  check('2.1 Put in this slot replaces the chord', await page.evaluate(b => serialize() !== b, chartBefore));
  await page.evaluate(() => undo());

  // 2.2 voice-leading X-ray
  await page.check('#vlToggle');
  const x = await page.evaluate(() => ({ shown: !document.querySelector('#vlx').hidden, lines: document.querySelectorAll('#vlx svg line').length, held: document.querySelectorAll('#vlx line[stroke="var(--accent)"][stroke-width="5"]').length, cap: document.querySelector('#vlx .cap').textContent }));
  check('2.2 voice-leading X-ray draws voices with held tones marked', x.shown && x.lines > 20 && x.held > 0, `${x.lines} lines, ${x.held} held`);
  check('2.2 caption names smoothest and roughest transitions', /Smoothest: .+ → .+Roughest: .+ → /.test(x.cap), x.cap);
  const sameEngine = await page.evaluate(() => { const c = chords.find(real), v = chartPlan().get(c.id); const ys = [...document.querySelectorAll('#vlx svg line title')].filter(t => t.textContent.startsWith(chordName(c) + ':')).length; return ys === v.all.length; });
  check('2.2 the picture uses the playback voicings', sameEngine);

  // 2.3 surprise dial: outside-chord rate rises with the dial; vocabulary and Keep my mode still hold
  const rates = await page.evaluate(() => {
    const r = {}; S.vocab = [...PRESETS.Simple]; S.genres = []; S.mood = 'uplift'; S.lock = true; S.mode = 'ionian';
    for (const v of [0, 100]) { S.surprise = v; let out = 0, tot = 0, vocabBad = 0, modeMoved = 0;
      for (let k = 0; k < 60; k++) { generate(); if (S.mode !== 'ionian') modeMoved++; for (const c of chords) if (real(c)) { tot++; if (analyze(c).kind !== 'dia') out++; if (!qOn(c.q) || (c.bass != null && !famOn('slash'))) vocabBad++; } }
      r[v] = { rate: out / tot, vocabBad, modeMoved }; }
    return r;
  });
  check('2.3 dial at Surprising gives far more outside chords than Predictable', rates[100].rate > rates[0].rate + 0.2, `${(rates[0].rate * 100).toFixed(0)}% → ${(rates[100].rate * 100).toFixed(0)}%`);
  check('2.3 dial respects the vocabulary cap and Keep my mode', rates[0].vocabBad + rates[100].vocabBad === 0 && rates[0].modeMoved + rates[100].modeMoved === 0);
  const tens = await page.evaluate(() => ({ dots: document.querySelectorAll('#tension circle').length, n: chords.filter(real).length }));
  check('2.3 tension curve has one point per chord', tens.dots === tens.n && tens.n > 0, `${tens.dots}/${tens.n}`);

  // 2.4 lock and regenerate
  await page.evaluate(() => { S.lock = false; S.surprise = 30; S.vocab = [...PRESETS.Color]; });
  await page.fill('#prog', '[A]\nC | Am:2 ? | F | G7\n[B]\nDm | G | C | C'); await tap(page, '#load');
  await page.evaluate(() => { chords[0].lock = true; chords[3].lock = true; chords[2].lock = true; sel = chords[3].id; renderAll(); });
  check('2.4 lock icon shows on locked slots', await page.evaluate(() => document.querySelectorAll('#rows .slot .lk').length === 2));
  const before = await page.evaluate(() => ({ names: chords.map(c => chordName(c)), beats: chords.map(c => c.beats).join(), text: serialize() }));
  let lockOk = true, lenOk = true, qFilled = true, changed = false;
  for (let k = 0; k < 8; k++) {
    await tap(page, '#regen');
    const a = await page.evaluate(() => ({ names: chords.map(c => chordName(c)), beats: chords.map(c => c.beats).join(), secs: chords.map(c => c.sec || '').join(), empty: chords.filter(c => !real(c)).length }));
    if (a.names[0] !== before.names[0] || a.names[3] !== before.names[3]) lockOk = false;
    if (a.beats !== before.beats || a.secs !== ',,,,,B,,,'.replace(/^/, 'A') && a.secs !== 'A,,,,,B,,,') lenOk = false;
    if (a.empty) qFilled = false;
    if (a.names.join() !== before.names.join()) changed = true;
  }
  check('2.4 locked chords survive Regenerate unlocked', lockOk);
  check('2.4 slot lengths and sections are kept', lenOk);
  check('2.4 ? slots count as unlocked and get filled (even if flagged)', qFilled);
  check('2.4 unlocked slots do change', changed);
  await page.evaluate(() => { const b = document.querySelector('#rows .slot.locked .lk'); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  check('2.4 clicking the lock icon unlocks', await page.evaluate(() => document.querySelectorAll('#rows .slot .lk').length === 1));
  await page.evaluate(() => { sel = chords[3].id; renderAll(); });
  await tap(page, '#detail [data-act="lock"]');
  check('2.4 Lock button in the detail panel toggles', await page.evaluate(() => !chords[3].lock && document.querySelector('#detail [data-act="lock"]').textContent === 'Lock'));
  check('no console errors (phase 2)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}


// ===================================================== PHASE 3
async function phase3() {
  const { ctx, page } = await openPage();
  await page.goto(URL_); await page.evaluate(() => { localStorage.clear(); }); await page.reload();
  await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; S.vocab = [...PRESETS.Color]; renderAll(); });
  await page.fill('#prog', 'C | E7 | Am | D♭7 | C | A♭ | F | G7'); await tap(page, '#load');

  // 3.1 quiz
  await page.check('#quizOn');
  const hidden = await page.evaluate(() => ({ on: document.body.classList.contains('quiz-on'), num: getComputedStyle(document.querySelector('#rows .slot .cr')).visibility, legend: getComputedStyle(document.querySelector('.legend')).display, tint: getComputedStyle(document.querySelectorAll('#rows .slot')[1]).getPropertyValue('--k').trim() === getComputedStyle(document.querySelectorAll('#rows .slot')[0]).getPropertyValue('--k').trim() }));
  check('3.1 quiz hides numerals, colours and legend', hidden.on && hidden.num === 'hidden' && hidden.legend === 'none' && hidden.tint);
  const answers = await page.evaluate(() => chords.map(c => quizAnswer(c)));
  check('3.1 answer key covers all five functions in this chart', ['dia', 'sec', 'tri', 'bor'].every(k => answers.includes(k)), answers.join(','));
  await page.evaluate(() => { sel = chords[1].id; renderAll(); });
  check('3.1 clicking a chord asks "What function is this?" with five choices', await page.evaluate(() => /What function is E7/.test(document.querySelector('.quiz h3').textContent) && document.querySelectorAll('[data-quiz]').length === 5 && getComputedStyle(document.querySelector('#detail .pill')).visibility === 'hidden'));
  await tap(page, '[data-quiz="sec"]');
  const right = await page.evaluate(() => ({ h: document.querySelector('.quiz h3').textContent, p: document.querySelector('.quiz p').textContent, pill: getComputedStyle(document.querySelector('#detail .pill')).visibility, score: JSON.parse(localStorage.getItem('changes-quiz-v1')) }));
  check('3.1 a right answer is confirmed with the 2.1 explanation and the labels come back', /^Right/.test(right.h) && /Secondary dominant \(V7\/vi\)/.test(right.p) && right.pill === 'visible', right.p);
  await page.evaluate(() => { sel = chords[3].id; renderAll(); });
  await tap(page, '[data-quiz="chr"]');
  const wrong = await page.evaluate(() => ({ h: document.querySelector('.quiz h3').textContent, score: JSON.parse(localStorage.getItem('changes-quiz-v1')) }));
  check('3.1 a wrong answer shows the right one', /^Not quite: it’s tritone sub/.test(wrong.h), wrong.h);
  check('3.1 score is tracked in localStorage', wrong.score.correct === 1 && wrong.score.total === 2, JSON.stringify(wrong.score));
  await page.reload();
  check('3.1 score survives a reload', await page.evaluate(() => quizScore.correct === 1 && quizScore.total === 2 && S.quiz));
  await page.uncheck('#quizOn');

  // 3.2 talam / taal grids
  await page.selectOption('#meter', '8/4 adi');
  const adi = await page.evaluate(() => ({ L: barLen(), marks: [...document.querySelectorAll('#rows .bar')[0].querySelectorAll('.ticks i[data-m]')].map(i => i.dataset.m).join(','), note: document.querySelector('#cycleNote').hidden ? '' : document.querySelector('#cycleNote').textContent, tag: document.querySelector('#keytag').textContent, opt: document.querySelector('#meter').selectedOptions[0].textContent }));
  check('3.2 Adi talam grid: 8 beats marked I4 O O', adi.L === 8 && adi.marks === 'I4,O,O', adi.marks);
  check('3.2 cycles are labelled as sketching aids', /sketching aid/.test(adi.note) && /sketching aids/.test(await page.evaluate(() => document.querySelector('#meter optgroup').label)), adi.note.slice(0, 80));
  check('3.2 key line names the cycle', /Adi talam \(4\+2\+2\)/.test(adi.tag), adi.tag);
  const m8 = parseMidi(Buffer.from(await page.evaluate(() => [...buildMidi(false)]))), ts8 = m8.tracks[0].find(e => e.meta === 0x58);
  check('3.2 MIDI export writes the cycle length as the time signature', ts8.data[0] === 8 && 2 ** ts8.data[1] === 4);
  await page.selectOption('#meter', '16/4 teental');
  check('3.2 Teental grid: 16 beats marked X 2 0 3, two bars a row', await page.evaluate(() => barLen() === 16 && [...document.querySelector('#rows .bar').querySelectorAll('[data-m]')].map(i => i.dataset.m).join('') === 'X203' && document.querySelector('#rows .row').querySelectorAll('.bar').length <= 2));
  await page.evaluate(() => { S.drone = true; S.droneMode = 'dorian'; S.tonic = 2; renderAll(); });
  await tap(page, '#gen');
  const dr = await page.evaluate(() => ({ mode: S.mode, pedal: chords.every(c => c.root === S.tonic || c.bass === S.tonic || !famOn('slash')), recipe: document.querySelector('#recipe').textContent, names: chords.map(c => chordName(c)).join(' ') }));
  check('3.2 drone vamp: chosen mode, tonic pedal, explained', dr.mode === 'dorian' && dr.pedal && /Sa–Pa drone/.test(dr.recipe), dr.names);
  await tap(page, '#play'); await page.waitForTimeout(500); await tap(page, '#play');
  await page.evaluate(() => { S.drone = false; S.meter = '4/4'; S.tonic = 0; S.mode = 'ionian'; renderAll(); });

  // 3.3 melody in, chords out
  await page.fill('#melIn', 'E D C D | E E E - | D D D - | E G G - | E D C D | E E E E | D D E D | C - - -');
  await tap(page, '#melGo');
  const mel = await page.evaluate(() => ({ n: MEL.results.length, rows: [...document.querySelectorAll('.mel-row')].map(r => r.querySelector('.mc').textContent + ' :: ' + r.querySelector('.ms').textContent), ratios: MEL.results.map(r => r.hits / r.strong) }));
  check('3.3 suggests 3 to 5 progressions', mel.n >= 3 && mel.n <= 5, mel.rows.join(' || '));
  check('3.3 ranked by strong-beat chord tones', mel.ratios.every((r, i) => i === 0 || r <= mel.ratios[i - 1]) && mel.ratios[0] >= 0.75, mel.ratios.map(r => r.toFixed(2)).join(','));
  check('3.3 a sensible harmonization starts and ends on the tonic', /^C(maj7)? \|.*\| C(maj7|6|add9|6\/9)?$/.test(mel.rows[0].split(' :: ')[0]), mel.rows[0]);
  await tap(page, '[data-mplay="0"]'); await page.waitForTimeout(300); await page.evaluate(() => stopAll());
  // where the chords go: never a silent replace
  const H = () => page.evaluate(() => MEL.results[0].list.map(c => chordName(c)).join(' '));
  const h0 = await H();
  await page.evaluate(() => { chords = parseProg('Am | F | G | E').chords; sel = chords[1].id; renderAll(); });
  check('3.3 the default puts the chords at the end and keeps the chart', await page.evaluate(() => S.melPlace === 'end' && document.querySelector('#melPlace').value === 'end'));
  await tap(page, '[data-muse="0"]');
  const e1 = await page.evaluate(() => ({ names: chords.map(c => chordName(c)).join(' '), br: !!chords[4].br, toast: document.querySelector('#toast').textContent }));
  check('3.3 Add to chart appends after what is there, on a new line, with Undo', e1.names === 'Am F G E ' + h0 && e1.br && /at the end, bars 5–12/.test(e1.toast) && /Undo/.test(e1.toast), JSON.stringify(e1));
  await page.click('#toast button');
  check('3.3 Undo takes it back out', await page.evaluate(() => serialize() === 'Am | F | G | E'));
  await page.evaluate(() => { sel = chords[1].id; renderAll(); }); await page.selectOption('#melPlace', 'before'); await tap(page, '[data-muse="0"]');
  check('3.3 Before the selected chord inserts it there', await page.evaluate(h => chords.map(c => chordName(c)).join(' ') === 'Am ' + h + ' F G E', h0), await page.evaluate(() => chords.map(c => chordName(c)).join(' ')));
  await page.evaluate(() => { chords = parseProg('Am | F | G | E | Am | F | G | E | Dm | E').chords; sel = chords[1].id; renderAll(); }); await page.selectOption('#melPlace', 'over'); await tap(page, '[data-muse="0"]');
  check('3.3 Over the selected chord replaces just that many bars', await page.evaluate(h => chords.map(c => chordName(c)).join(' ') === 'Am ' + h + ' E', h0), await page.evaluate(() => chords.map(c => chordName(c)).join(' ')));
  await page.selectOption('#melPlace', 'all'); await tap(page, '[data-muse="0"]');
  check('3.3 In place of the whole chart replaces it, one chord per bar', await page.evaluate(() => chords.length === 8 && chords.every(c => c.beats === 4)));
  await page.reload(); await page.evaluate(() => revealEl(document.querySelector('#melIn')));
  check('3.3 the placement choice is remembered', await page.evaluate(() => S.melPlace === 'all'));
  await page.evaluate(() => { S.melPlace = 'end'; save(); });
  await page.selectOption('#melRate', '2'); await tap(page, '#melGo');
  check('3.3 two chords per bar works', await page.evaluate(() => MEL.results.length >= 3 && MEL.results[0].list.length === 16));
  await page.fill('#melIn', 'E D X9 C'); await tap(page, '#melGo');
  check('3.3 bad notes get a clear message', /Couldn’t read “X9”/.test(await page.textContent('#melOut')));

  // alternate guitar tunings
  await page.fill('#prog', 'G | C | D | G'); await tap(page, '#load');
  await page.evaluate(() => { sel = chords[0].id; renderAll(); });
  await page.selectOption('#tuneSel', 'openG');
  const og = await page.evaluate(() => ({ t: S.tuning, std: guitarShapes(chords[0]).filter(v => v.common).map(v => v.fr.map(x => x < 0 ? 'x' : x).join('')), badge: !!document.querySelector('#detail .badge.std'), hint: document.querySelector('#detail').textContent.includes('searched for Open G'), strings: [...document.querySelectorAll('#finder .fb .sl')].map(e => e.textContent).join('') }));
  check('tunings: Open G shows x00000 as the standard grip for G', og.t === 'openG' && og.std.includes('x00000') && og.badge && og.hint, og.std.join(' '));
  check('tunings: finder fretboard relabels its strings', og.strings === 'dBGDGD', og.strings);
  const valid = await page.evaluate(() => { let bad = 0; for (const id of Object.keys(TUNINGS)) { setTuning(id); for (const n of ['C', 'G', 'D', 'Am', 'Em', 'F', 'Bb', 'E7', 'Dsus4', 'D5']) { const c = parseChord(n); for (const v of guitarShapes(c)) { const ps = v.fr.map((f, i) => f < 0 ? null : TUNING[i] + f).filter(x => x != null); if (mod(Math.min(...ps)) !== c.root || !ps.every(m => pcsOf(c).includes(mod(m)))) bad++; } } } setTuning('openG'); return bad; });
  check('tunings: every shape in every tuning sounds the chord with its root as the lowest note', valid === 0, String(valid));
  await page.reload();
  check('tunings: the chosen tuning is remembered', await page.evaluate(() => S.tuning === 'openG' && TUNING[0] === 38));
  await page.evaluate(() => { setTuning('standard'); renderAll(); });
  // sound: guitar playback follows the smoothest guitar path, with capo; pins override per chord
  await page.fill('#prog', 'G | Em | C | D'); await tap(page, '#load');
  await page.evaluate(() => { setTuning('standard'); S.capo = 2; renderAll(); });
  await page.selectOption('#instrument', 'guitar');
  const gs = await page.evaluate(() => chords.map(c => { const v = playedVoicing(c), sh = guitarPlan().get(c.id); return { gtr: !!v.gtr, ok: mod(v.bass) === c.root && v.all.every(m => pcsOf(c).includes(mod(m))), match: JSON.stringify(v.all) === JSON.stringify(sh.fr.map((f, i) => f < 0 ? null : TUNING[i] + f + 2).filter(m => m != null).sort((a, b) => a - b)) }; }));
  check('sound: guitar playback uses the smoothest-path shapes at concert pitch with the capo', gs.every(x => x.gtr && x.ok && x.match), JSON.stringify(gs));
  await tap(page, '#play'); await page.waitForTimeout(400); await tap(page, '#play');
  const gm = parseMidi(Buffer.from(await page.evaluate(() => [...buildMidi(false)])));
  const gExpect = await page.evaluate(() => chords.reduce((a, c) => a + playedVoicing(c).all.length, 0));
  check('sound: MIDI export follows the guitar voicings (program 25)', gm.tracks[1].filter(e => e.st === 0x90).length === gExpect && gm.tracks[1].some(e => e.st === 0xc0 && e.d[0] === 25));
  await page.evaluate(() => { S.showVL = true; renderAll(); });
  check('sound: voice-leading picture shows the guitar notes', await page.evaluate(() => { const c = chords[0]; return [...document.querySelectorAll('#vlx svg line title')].filter(t => t.textContent.startsWith(chordName(c) + ':')).length === playedVoicing(c).all.length; }));
  // pin a different guitar shape on the first chord
  await page.evaluate(() => { sel = chords[0].id; renderAll(); });
  const alt = await page.evaluate(() => { const cards = [...document.querySelectorAll('#detail [data-shape]')]; return cards.findIndex(b => !b.classList.contains('ctx')); });
  await page.evaluate(i => document.querySelectorAll('#detail [data-shape]')[i].click(), alt);
  check('sound: clicking a shape selects it with In context and Use for this chord', await page.evaluate(() => !!document.querySelector('#detail .pickbar [data-gctx]') && !!document.querySelector('#detail .pickbar [data-gpin]')));
  await tap(page, '#detail .pickbar [data-gctx]'); await page.waitForTimeout(200);
  await tap(page, '#detail .pickbar [data-gpin]');
  const pin = await page.evaluate(() => ({ pin: chords[0].gpin, plan: guitarPlan().get(chords[0].id).fr, badge: document.querySelector('#detail .shape.ctx .badge')?.textContent }));
  check('sound: pinned shape drives playback and is marked Your pick', pin.pin && JSON.stringify(pin.pin.fr) === JSON.stringify(pin.plan) && /^Your pick · capo 2$/.test(pin.badge), JSON.stringify(pin));
  await page.reload();
  check('sound: pins and sound choice survive a reload', await page.evaluate(() => S.instrument === 'guitar' && gpinOk(chords[0]) && guitarPlan().get(chords[0].id).pinned));
  await page.evaluate(() => { S.capo = 0; sel = chords[0].id; renderAll(); });
  check('sound: a pin for another capo is set aside, with a note', await page.evaluate(() => !guitarPlan().get(chords[0].id).pinned && /pinned shape for Standard/.test(document.querySelector('#detail').textContent)));
  await page.evaluate(() => { S.capo = 2; renderAll(); });
  await tap(page, '#detail .pickbar [data-gunpin]');
  check('sound: unpin returns to the smoothest path', await page.evaluate(() => !chords[0].gpin && !guitarPlan().get(chords[0].id).pinned));
  // piano voicing pin
  await page.selectOption('#instrument', 'piano');
  await page.evaluate(() => { sel = chords[1].id; renderAll(); });
  await page.evaluate(() => document.querySelectorAll('#detail [data-pv]')[3].click());
  await tap(page, '#detail .pickbar [data-pctx]'); await page.waitForTimeout(200);
  await tap(page, '#detail .pickbar [data-ppin]');
  check('sound: pinned piano voicing drives playback', await page.evaluate(() => { const c = chords[1], v = chartPlan().get(c.id); return ppinOk(c) && v.bass === c.ppin.bass && v.rh.join() === c.ppin.rh.join() && /Your pick/.test(document.querySelector('#detail .pv.ctx .ty').textContent); }));
  await page.selectOption('#instrument', 'guitar');
  await page.evaluate(() => { const it = document.querySelector('#subs [data-aud]'); it.click(); document.querySelector('#subs [data-ab]').click(); stopAll(); setTuning('standard'); S.capo = 0; S.instrument = 'piano'; chords.forEach(c => { delete c.gpin; delete c.ppin; }); renderAll(); });
  check('sound: idea auditions and A/B run with guitar sound', page.errors.length === 0, page.errors.join(' | '));
  // resize chords by dragging their right edge
  await page.fill('#prog', 'C | Am | F | G'); await tap(page, '#load');
  await page.evaluate(() => { document.querySelector('#toast').hidden = true; document.querySelector('#rows').scrollIntoView({ block: 'center' }); });
  const geo = async id => page.evaluate(i => { const s = document.querySelectorAll('#rows .slot')[i], h = s.querySelector('.rz').getBoundingClientRect(), row = s.closest('.row'); return { x: h.left + h.width / 2, y: h.top + h.height / 2, beat: row.getBoundingClientRect().width / +row.dataset.rb }; }, id);
  let g = await geo(0);
  await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x + g.beat * 1.1, g.y, { steps: 4 }); await page.mouse.move(g.x + g.beat * 2.1, g.y, { steps: 4 });
  const tip = await page.evaluate(() => document.querySelector('.rztip').textContent); await page.mouse.up();
  const r1 = await page.evaluate(() => ({ beats: chords.map(c => c.beats).join(), text: document.querySelector('#prog').value, rt: parseProg(document.querySelector('#prog').value).chords.map(c => c.beats).join() }));
  check('resize: dragging the right edge lengthens the chord by whole beats', r1.beats === '6,4,4,4' && /C: 6 beats/.test(tip), `${r1.beats}; tip "${tip}"`);
  check('resize: the text box is rewritten and reads back the same lengths', r1.rt === r1.beats, r1.text.replace(/\n/g, ' / '));
  g = await geo(1);
  await page.keyboard.down('Shift'); await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x - g.beat * 1.1, g.y, { steps: 5 }); await page.mouse.up(); await page.keyboard.up('Shift');
  const r2 = await page.evaluate(() => chords.map(c => c.beats).join());
  check('resize: Shift trades beats with the next chord so later chords stay put', r2 === '6,3,5,4', r2);
  await page.evaluate(() => { undo(); });
  check('resize: each drag is one undo step', await page.evaluate(() => chords.map(c => c.beats).join() === '6,4,4,4'));
  await page.evaluate(() => { undo(); });
  check('resize: undo returns to the original lengths', await page.evaluate(() => chords.map(c => c.beats).join() === '4,4,4,4'));
  const mid = await page.evaluate(() => { const r = document.querySelectorAll('#rows .slot')[0].getBoundingClientRect(), t = document.querySelectorAll('#rows .slot')[2].getBoundingClientRect(); return { x: r.left + r.width / 3, y: r.top + r.height / 2, tx: t.left + t.width * .75, ty: t.top + t.height / 2 }; });
  await page.mouse.move(mid.x, mid.y); await page.mouse.down(); await page.mouse.move(mid.tx, mid.ty, { steps: 6 }); await page.mouse.up();
  check('resize: dragging the middle of a chord still reorders', await page.evaluate(() => chords.map(c => chordName(c)).join(' ') === 'Am F C G'));
  // in-chart picker and the + Add chord tile
  await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; S.vocab = [...PRESETS.Color]; });
  await page.fill('#prog', '[Verse]\nC | Am | F | G'); await tap(page, '#load');
  await page.evaluate(() => { chords[0].lock = true; renderAll(); document.querySelector('#rows').scrollIntoView({ block: 'center' }); });
  check('picker: the chart ends with a + Add chord tile', await page.evaluate(() => /Add chord/.test(document.querySelector('#rows .addtile')?.textContent || '')));
  await tap(page, '#rows .addtile');
  const added = await page.evaluate(() => ({ n: chords.length, last: chords[chords.length - 1], open: !document.querySelector('#cpick').hidden, text: document.querySelector('#prog').value }));
  check('picker: + Add chord appends a blank bar and opens the picker on it', added.n === 5 && added.last.root === null && added.last.beats === 4 && added.open && /\?/.test(added.text), added.text.replace(/\n/g, ' / '));
  await page.click('#cpick [data-cpq] >> text=Dm');
  const chipped = await page.evaluate(() => ({ name: chordName(chords[4]), closed: document.querySelector('#cpick').hidden, text: document.querySelector('#prog').value }));
  check('picker: a chip applies straight away and closes the picker', /^Dm/.test(chipped.name) && chipped.closed && chipped.text.includes(chipped.name.replace('♭', 'b')), `${chipped.name}; ${chipped.text.replace(/\n/g, ' / ')}`);
  await page.click('#rows .slot >> nth=0 >> .cpk');
  check('picker: the ▾ on a chord opens its picker', await page.evaluate(() => cpFor === chords[0].id && !document.querySelector('#cpick').hidden));
  await page.selectOption('#cpRoot', '2'); await page.selectOption('#cpQual', '7'); await page.selectOption('#cpBass', '6');
  check('picker: the header previews the chord being built', (await page.textContent('#cpName')) === 'D7/F♯');
  await page.click('#cpick [data-cpapply]');
  const applied = await page.evaluate(() => ({ c: chords[0], name: chordName(chords[0]), text: document.querySelector('#prog').value }));
  check('picker: Apply sets the chord and keeps its length, section and lock', applied.name === 'D7/F♯' && applied.c.beats === 4 && applied.c.sec === 'Verse' && applied.c.lock && applied.text.startsWith('[Verse]\nD7/F#'), applied.text.replace(/\n/g, ' / '));
  await page.evaluate(() => { sel = chords[1].id; renderAll(); document.querySelector('#rows .slot.sel').focus(); });
  await page.keyboard.press('e');
  check('picker: E opens the picker for the selected chord', await page.evaluate(() => cpFor === chords[1].id));
  await page.keyboard.press('Escape');
  check('picker: Escape closes it', await page.evaluate(() => document.querySelector('#cpick').hidden));
  await page.dblclick('#rows .slot >> nth=2 >> .cn');
  check('picker: double-clicking a chord opens its picker', await page.evaluate(() => cpFor === chords[2].id));
  await page.click('#cpick [data-cpblank]');
  check('picker: Make blank turns the chord into a ? slot', await page.evaluate(() => !real(chords[2]) && /\| \? \|/.test(document.querySelector('#prog').value)));
  await page.click('#rows .slot >> nth=1 >> .cpk'); await page.mouse.click(5, 5);
  check('picker: clicking elsewhere closes it', await page.evaluate(() => document.querySelector('#cpick').hidden));
  await page.evaluate(() => { undo(); undo(); undo(); undo(); });
  check('picker: every pick is one undo step', await page.evaluate(() => document.querySelector('#prog').value === '[Verse]\nC | Am | F | G'), await page.evaluate(() => document.querySelector('#prog').value.replace(/\n/g, ' / ')));
  // genre chords, separate from Chords allowed
  await page.evaluate(() => { S.tonic = 7; S.mode = 'ionian'; S.mood = ''; S.genres = ['blues']; S.genreVocab = false; S.vocab = [...PRESETS.Simple]; S.lock = false; renderAll(); });
  const gc = await page.evaluate(() => ({ shown: !document.querySelector('#genreChords').hidden, row: document.querySelector('#genreChords .gc-row b')?.textContent, chips: [...document.querySelectorAll('#genreChords [data-gchord]')].map(b => b.firstChild.textContent + (b.classList.contains('off') ? '(off)' : '')), title: document.querySelector('.vocabp h2').textContent }));
  check('genre chords: Blues shows its own chords in the key, greyed where Chords allowed excludes them', gc.shown && gc.row === 'Blues' && gc.chips.some(c => /^G7.*\(off\)$/.test(c)), gc.chips.join(' '));
  check('genre chords: the limits panel is now called Chords allowed', gc.title === 'Chords allowed');
  await page.evaluate(() => document.querySelector('#genreChords [data-gchord]').click());
  const gen = async () => page.evaluate(() => { let sev = 0, n = 0; for (let k = 0; k < 20; k++) { generate(); chords.forEach(c => { if (real(c)) { n++; if (Q[c.q].iv.length > 3) sev++; } }); } return sev / n; });
  const off = await gen();
  await page.check('#genreVocab');
  const on = await gen();
  check('genre chords: off keeps Blues within Chords allowed; on lets Blues use its 7ths', off === 0 && on > 0.5 && /genre chooses the chords/.test(await page.textContent('#recipe')), `7th-or-richer share: off ${off.toFixed(2)}, on ${on.toFixed(2)}`);
  await page.evaluate(() => { S.genreVocab = false; S.genres = []; S.vocab = [...PRESETS.Color]; S.tonic = 0; renderAll(); });
  // playing styles: the picker follows the instrument; MIDI export writes the pattern on the grid
  await page.fill('#prog', 'G | C | D | G'); await tap(page, '#load');
  await page.evaluate(() => { S.meter = '4/4'; S.instrument = 'piano'; S.pstyle = 'block'; S.gstyle = 'strum1'; S.capo = 0; setTuning('standard'); renderAll(); });
  const pOpts = await page.evaluate(() => [...document.querySelectorAll('#pstyle option')].map(o => o.value).join());
  await page.selectOption('#instrument', 'guitar');
  const gOpts = await page.evaluate(() => [...document.querySelectorAll('#pstyle option')].map(o => o.value).join());
  check('styles: the style picker offers piano and guitar styles to match the sound', pOpts === 'block,ballad,pulse,arp' && gOpts === 'strum1,strum,pick', `${pOpts} / ${gOpts}`);
  await page.selectOption('#pstyle', 'strum');
  const sm = parseMidi(Buffer.from(await page.evaluate(() => [...buildMidi(false)]))), onsTicks = [...new Set(sm.tracks[1].filter(e => e.st === 0x90).map(e => e.tick % (480 * 4)))].sort((a, b) => a - b);
  check('styles: guitar strum pattern exports D DU UDU on the eighth-note grid', JSON.stringify(onsTicks) === JSON.stringify([0, 480, 720, 1200, 1440, 1680]), onsTicks.join(','));
  await page.selectOption('#instrument', 'piano'); await page.selectOption('#pstyle', 'arp');
  const am = parseMidi(Buffer.from(await page.evaluate(() => [...buildMidi(true)])));
  const arpOK = am.tracks[2].filter(e => e.st === 0x90).length === 4 && am.tracks[1].filter(e => e.st === 0x90).length === 4 * 8;
  check('styles: piano arpeggio exports one bass note per chord and eight broken-chord notes per bar', arpOK, `${am.tracks[2].filter(e => e.st === 0x90).length} bass, ${am.tracks[1].filter(e => e.st === 0x90).length} treble`);
  await tap(page, '#play'); await page.waitForTimeout(500); await tap(page, '#play');
  check('styles: the chosen style is remembered', await page.evaluate(() => { save(); return JSON.parse(localStorage.getItem('changes-v1')).S.pstyle === 'arp' && S.gstyle === 'strum'; }));
  await page.evaluate(() => { S.pstyle = 'block'; S.gstyle = 'strum1'; S.instrument = 'piano'; renderAll(); });
  // restyle an existing chart in a genre's style; clear the chart
  await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; S.genres = ['blues']; S.genreVocab = true; S.vocab = [...PRESETS.Simple]; renderAll(); });
  await page.fill('#prog', 'C | Am | F | G'); await tap(page, '#load');
  await page.evaluate(() => { chords[1].lock = true; renderAll(); });
  const before3 = await page.evaluate(() => chords.map(c => chordName(c)).join(' '));
  await tap(page, '#genreChords [data-restyle]');
  const rs = await page.evaluate(() => ({ names: chords.map(c => chordName(c)), roots: chords.map(c => c.root).join(), sevenths: chords.filter((c, i) => i !== 1 && Q[c.q].iv.length > 3).length, toast: document.querySelector('#toast').textContent }));
  check('restyle: Blues turns the unlocked chords into 7th chords on the same roots and keeps the locked one', rs.roots === '0,9,5,7' && rs.sevenths === 3 && rs.names[1] === 'Am' && /Restyled 3 chords in the Blues style/.test(rs.toast), `${before3} → ${rs.names.join(' ')}`);
  await page.evaluate(() => undo());
  check('restyle: one undo step restores the chart', await page.evaluate(b => chords.map(c => chordName(c)).join(' ') === b, before3));
  await page.evaluate(() => { S.genres = []; S.genreVocab = false; S.vocab = [...PRESETS.Color]; renderAll(); });
  await tap(page, '#clearChart');
  const cl = await page.evaluate(() => ({ n: chords.length, tile: !!document.querySelector('#rows .addtile'), text: serialize() }));
  await page.evaluate(() => document.querySelector('#toast').hidden = true);
  await page.click('#play'); await page.waitForTimeout(300);
  const cp = await page.evaluate(() => ({ playing, toast: document.querySelector('#toast').textContent, xml: !new DOMParser().parseFromString(buildMusicXML(), 'application/xml').querySelector('parsererror') }));
  check('clear: Clear chart empties it and leaves + Add chord', cl.n === 0 && cl.tile && cl.text === '', JSON.stringify(cl));
  check('clear: Play on an empty chart explains instead of looping, and exports still work', !cp.playing && /Add a chord to play/.test(cp.toast) && cp.xml, JSON.stringify(cp));
  await page.evaluate(() => undo());
  check('clear: Undo brings the chart back', await page.evaluate(b => chords.map(c => chordName(c)).join(' ') === b, before3));
  // swap ideas stack their buttons under the text in the sidebar
  await page.evaluate(() => { sel = chords[0].id; renderAll(); revealEl(document.querySelector('#subs')); });
  const sw2 = await page.evaluate(() => { const it = document.querySelector('#subs .item'), why = it.querySelector('.why').getBoundingClientRect(), btn = it.querySelector('.btns').getBoundingClientRect(), box = it.getBoundingClientRect(); return { whyWidth: Math.round(why.width / box.width * 100), below: btn.top >= why.bottom - 1 }; });
  check('layout: swap ideas give the text the full width with buttons underneath', sw2.whyWidth > 85 && sw2.below, JSON.stringify(sw2));
  // easiest tuning for the chart: musically expected answers
  const expect = [['G | C | D | G', /^Standard tuning is the practical choice/], ['G | Am | C | D | Em', /^Standard tuning is the practical choice/],
    ['F | B♭ | E♭ | Cm', /^Standard tuning with a capo on \d/], ['Dsus4 | Gsus2 | Asus4 | Dsus4', /^DADGAD is the easiest/], ['D5 | C5 | G5 | A5 | F5', /^Drop [CD]/]];
  for (const [chart, re] of expect) {
    await page.fill('#prog', chart); await tap(page, '#load');
    await page.evaluate(() => { S.capo = 0; setTuning('standard'); sel = chords[0].id; renderAll(); });
    await tap(page, '[data-tunefind]'); await page.waitForSelector('#detail .tunes', { timeout: 15000 });
    const lead = await page.textContent('#detail .tunes p');
    check(`easiest tuning: ${chart}`, re.test(lead), lead);
  }
  await tap(page, '#detail .tunes [data-usetune]');
  check('easiest tuning: Use this switches tuning and capo', await page.evaluate(() => { const b = document.querySelector('#detail .tunes li .hint:last-child'); return S.tuning !== 'standard' || S.capo > 0 || !!b; }));
  await page.evaluate(() => { setTuning('standard'); S.capo = 0; renderAll(); });
  // export + reload with the new state
  const dlP = page.waitForEvent('download'); await tap(page, '#midiExport'); await dlP;
  const keep = await page.evaluate(() => serialize()); await page.reload();
  check('3.x reload after phase 3 features restores the chart', await page.evaluate(k => serialize() === k, keep));
  check('no console errors (phase 3)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// editing: one full app for everyone, deleting chords, Harmonize under Create, gapless looping
async function editing() {
  const { ctx, page } = await openPage({ noReveal: true });
  await page.goto(URL_);
  const v0 = await page.evaluate(() => ({ toggle: !!document.querySelector('.viewtoggle'), quick: !!document.querySelector('#quick'), simple: document.body.classList.contains('simple') }));
  check('editing: a first visit opens the full app, with no Simple/Advanced switch', !v0.toggle && !v0.quick && !v0.simple, JSON.stringify(v0));
  await page.evaluate(() => revealEl(document.querySelector('#gen')));
  const before = await page.evaluate(() => serialize());
  await tap(page, '#gen'); await page.waitForTimeout(200);
  check('editing: Generate makes a progression and plays it', await page.evaluate(b => serialize() !== b && playing, before));
  await page.evaluate(() => stopAll());

  await page.evaluate(() => { chords = parseProg('C | F | G | Am').chords; sel = chords[1].id; renderAll(); document.querySelector(`#rows .slot[data-id="${sel}"]`).focus(); });
  await page.keyboard.press('Delete');
  const d1 = await page.evaluate(() => ({ text: serialize(), sel: chordName(chords.find(c => c.id === sel)), toast: document.querySelector('#toast').textContent }));
  check('editing: Delete removes the selected chord and selects the next one', d1.text === 'C | G | Am' && d1.sel === 'G' && /Deleted F/.test(d1.toast), JSON.stringify(d1));
  await page.keyboard.press('Backspace');
  check('editing: Backspace removes it too', await page.evaluate(() => serialize() === 'C | Am'));
  await page.click('#toast button');
  check('editing: Undo in the toast brings the chord back', await page.evaluate(() => serialize() === 'C | G | Am'));
  await page.evaluate(() => { const i = document.querySelector('#libName'); revealEl(i); i.focus(); });
  await page.keyboard.press('Backspace');
  check('editing: Backspace while typing in a box leaves the chart alone', await page.evaluate(() => serialize() === 'C | G | Am'));
  await page.evaluate(() => { document.querySelector('#library').open = false; openPicker(chords[0].id); });
  await page.click('#cpick [data-cpdel]');
  check('editing: the in-chart picker has a Delete button', await page.evaluate(() => serialize() === 'G | Am' && document.querySelector('#cpick').hidden));

  const h = await page.evaluate(() => { const t = document.querySelector('#tab-melody'); return { inCreate: !!t.closest('#sideLeft'), tools: [...document.querySelectorAll('#tools [role=tab]')].map(b => b.textContent).join('/') }; });
  check('editing: Harmonize is a Create tab, beside Generate and Key and limits', h.inCreate && h.tools === 'Chord finder/Keys and modes', JSON.stringify(h));
  await page.evaluate(() => revealEl(document.querySelector('#melIn')));
  await page.click('#melody [data-goto="setkey"]');
  check('editing: Harmonize links to the Chords allowed it follows', await page.evaluate(() => document.querySelector('#presets').checkVisibility()));
  // key, mode and time open from the key line under the chart title; tempo lives only in the Play bar
  await page.click('#keyMenu summary');
  check('editing: the key line under Chart opens key, mode and time', await page.evaluate(() => document.querySelector('#keyMenu').open && document.querySelector('#key').checkVisibility() && document.querySelector('#meter').checkVisibility()));
  await page.selectOption('#key', '2');
  check('editing: changing the key there updates the key line', await page.evaluate(() => /^D /.test(document.querySelector('#keytag').textContent)), await page.evaluate(() => document.querySelector('#keytag').textContent + ' ' + S.tonic + ' ' + document.querySelector('#key').value));
  await page.click('#chartTitle');
  check('editing: clicking elsewhere closes it', await page.evaluate(() => !document.querySelector('#keyMenu').open));
  await page.fill('#tempo', '132'); await page.press('#tempo', 'Enter'); await page.click('#tempoUp');
  check('editing: tempo has one control, in the Play bar, typed or nudged', await page.evaluate(() => document.querySelectorAll('input#tempo,#tempoShow').length === 1 && !!document.querySelector('.dock #tempo') && S.tempo === 136 && document.querySelector('#tempo').value === '136'), await page.evaluate(() => S.tempo));

  // a loop pass starts exactly where the last one ended on the audio clock, without a new session cutting the tails
  await page.evaluate(() => { S.tempo = 240; S.meter = '4/4'; S.loop = true; S.gstyle = 'pick'; S.instrument = 'guitar'; chords = parseProg('C | G').chords; renderAll();
    window.__passes = []; const orig = playPass; window.playPass = (t, out) => { __passes.push({ t, out }); return orig(t, out); }; playChart(); });
  await page.waitForTimeout(2600);
  const lp = await page.evaluate(() => { stopAll(); const p = __passes; return { n: p.length, gap: p.length > 1 ? +(p[1].t - p[0].t).toFixed(6) : null, same: p.length > 1 && p[0].out === p[1].out }; });
  check('editing: looping is gapless: the next pass starts on the exact end time, in the same session', lp.n >= 2 && lp.gap === 2 && lp.same, JSON.stringify(lp));
  check('no console errors (editing)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// key changes: per-bar key and mode changes, read from text, analysed locally, kept through edits and exports
async function keyChanges() {
  const { ctx, page } = await openPage();
  await page.goto(URL_); await page.evaluate(() => { stopAll(); S.tonic = 0; S.mode = 'ionian'; renderAll(); });
  await page.fill('#prog', 'C | F | G | C\n[Bridge]\n[Key: D major]\nD | G | A | D'); await tap(page, '#load');
  const a = await page.evaluate(() => ({ kc: chords[4].kc, home: [S.tonic, S.mode], nums: chords.map(c => analyze(c).num).join(' '), kinds: chords.map(c => analyze(c).kind).join(' '), tag: document.querySelector('#keytag').textContent, label: document.querySelector('#rows .sec-label')?.textContent, text: serialize() }));
  check('keys: [Key: D major] starts a key change at that bar', a.kc && a.kc.t === 2 && a.kc.m === 'ionian' && a.home.join() === '0,ionian', JSON.stringify(a));
  check('keys: chords after the change are analysed in the new key', a.nums === 'I IV V I I IV V I' && a.kinds.split(' ').every(k => k === 'dia'), a.nums + ' / ' + a.kinds);
  check('keys: the key line and the chart label show the change', /^C major → D major/.test(a.tag) && /Bridge\s*Key: D major/.test(a.label), a.tag + ' / ' + a.label);
  check('keys: the text form round-trips', a.text === 'C | F | G | C\n[Bridge]\n[Key: D major]\nD | G | A | D', JSON.stringify(a.text));
  const sp = await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; chords = parseProg('C | G\n[Key: Eb major]\nEb | Ab | Bb7 | Cm\n[Key: E Dorian]\nEm | A | D#m7b5').chords; renderAll(); return { names: chords.map(c => chordName(c)).join(' '), nums: chords.map(c => analyze(c).num).join(' '), modes: chords.filter(c => c.kc).map(c => c.kc.m).join() }; });
  check('keys: names are spelled and numbered in their own key, and a key can change mode', sp.names === 'C G E♭ A♭ B♭7 Cm Em A D♯m7♭5' && sp.nums.startsWith('I V I IV V7 vi i IV ') && sp.modes === 'ionian,dorian', JSON.stringify(sp));
  await page.fill('#prog', '[Key: A minor]\nAm | Dm | E7 | Am'); await tap(page, '#load');
  check('keys: a key marker at the top sets the opening key', await page.evaluate(() => S.tonic === 9 && S.mode === 'aeolian' && !chords[0].kc && analyze(chords[1]).num === 'iv'));
  await page.fill('#prog', 'C | F\n[Key: H major]\nG | C'); await tap(page, '#load');
  check('keys: an unreadable key name is reported', await page.evaluate(() => /H major/.test(document.querySelector('#err').textContent) && !document.querySelector('#err').hidden));

  // the Chord panel sets and clears a key change; the swap ideas then speak in the new key
  await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; chords = parseProg('C | F | G | C | F | G').chords; sel = chords[3].id; renderAll(); });
  await page.selectOption('#kcT', '7');
  const k1 = await page.evaluate(() => ({ kc: chords[3].kc, tag: document.querySelector('#keytag').textContent, num: analyze(chords[3]).num, dnum: document.querySelector('#detail .dnum').textContent, hint: document.querySelector('#detail .keychg .hint').textContent }));
  check('keys: the Chord panel sets a key change on a bar', k1.kc && k1.kc.t === 7 && k1.kc.m === 'ionian' && /C major → G major/.test(k1.tag) && k1.num === 'IV' && k1.dnum === 'IV' && /dominant/.test(k1.hint), JSON.stringify(k1));
  await page.selectOption('#kcM', 'mixolydian');
  check('keys: and its mode', await page.evaluate(() => chords[3].kc.m === 'mixolydian' && /G Mixolydian/.test(document.querySelector('#keytag').textContent)));
  await page.evaluate(() => { sel = chords[1].id; renderAll(); });
  check('keys: a chord that starts mid-bar offers no key change', await page.evaluate(() => { chords[1].beats = 2; sel = chords[2].id; renderAll(); return !document.querySelector('#kcT'); }));
  await page.evaluate(() => { chords[1].beats = 4; sel = chords[3].id; renderAll(); });
  await page.selectOption('#kcT', '');
  check('keys: choosing No change removes it', await page.evaluate(() => !chords[3].kc && /^C major ·/.test(document.querySelector('#keytag').textContent)));

  // edits, exports and storage keep it
  await page.evaluate(() => { chords = parseProg('C | F\n[Key: D major]\nD | G').chords; renderAll(); });
  const t = await page.evaluate(() => { transpose(2); return { home: S.tonic, kc: chords[2].kc.t, names: chords.map(c => chordName(c)).join(' ') }; });
  check('keys: transposing moves the key changes too', t.home === 2 && t.kc === 4 && t.names === 'D G E A', JSON.stringify(t));
  const x = await page.evaluate(() => { const xml = buildMusicXML(); return [...xml.matchAll(/<fifths>(-?\d+)<\/fifths>/g)].map(m => m[1]).join(); });
  check('keys: MusicXML gets a new key signature at the change', x === '2,4', x);
  const sv = await page.evaluate(() => { const lib = sanitizeChords(JSON.parse(JSON.stringify(chords))); const code = shareCode(); applyShare(JSON.parse(atob(code.replace(/-/g, '+').replace(/_/g, '/')))); return { lib: lib && lib[2].kc && lib[2].kc.t, share: chords[2].kc && chords[2].kc.t, sheet: /Key: E major/.test(leadSheetHTML()) }; });
  check('keys: library items, share links and the lead sheet keep key changes', sv.lib === 4 && sv.share === 4 && sv.sheet, JSON.stringify(sv));
  await page.evaluate(() => { sel = chords[2].id; renderAll(); document.querySelector(`#rows .slot[data-id="${sel}"]`).focus(); });
  await page.keyboard.press('Delete');
  check('keys: deleting the chord that changes key hands the change to the next chord', await page.evaluate(() => chords.length === 3 && chords[2].kc && chords[2].kc.t === 4));
  await page.evaluate(() => { chords = parseProg('C | F | G | C\n[Key: D major]\nD | G | A | D').chords; renderAll(); regenUnlocked(); });
  const rg = await page.evaluate(() => ({ kc: chords[4].kc && chords[4].kc.t, inKey: chords.slice(4).filter(c => ['dia', 'bor', 'sec'].includes(analyze(c).kind)).length }));
  check('keys: Regenerate unlocked keeps the key change and writes the new chords in that key', rg.kc === 2 && rg.inKey >= 3, JSON.stringify(rg));
  check('keys: S keeps the opening key after all that', await page.evaluate(() => S.tonic === 2 && keyStack.length === 0));
  check('no console errors (key changes)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// notation: chord symbol styles and what the chart shows, on screen and in exports; Help → About
async function notation() {
  const { ctx, page } = await openPage();
  await page.goto(URL_);
  await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; chords = parseProg('Cmaj7 | Dm7 | Bm7b5 | Bdim | Caug | G7#5 | Am(maj7)').chords; renderAll(); });
  const names = await page.evaluate(() => { const o = {}; for (const st of ['classic', 'written', 'jazz']) { S.sym = st; o[st] = chords.map(c => chordName(c)).join(' '); } S.sym = 'classic'; return o; });
  check('notation: three chord symbol styles', names.classic === 'Cmaj7 Dm7 Bm7♭5 B° C+ G7♯5 Am(maj7)' && names.written === 'Cmaj7 Dm7 Bm7♭5 Bdim Caug G7♯5 Am(maj7)' && names.jazz === 'CΔ7 D−7 Bø7 B° C+ G+7 A−Δ7', JSON.stringify(names));
  check('notation: every chord type in every style reads back from text', await page.evaluate(() => { const bad = []; for (const st of ['classic', 'written', 'jazz']) { S.sym = st; for (const q of Object.keys(Q)) { const n = chordName({ root: 0, q, bass: null }, 'sym'); const r = parseChord(n); if (!r || r.q !== q) bad.push(st + ':' + n); } } S.sym = 'classic'; return bad.length === 0 || bad.join(' '); }) === true);
  await page.selectOption('#symStyle', 'jazz');
  const j = await page.evaluate(() => ({ chart: document.querySelector('#rows .slot .cn').textContent, text: serialize(), xml: /<kind text="Δ7" use-symbols="yes">major-seventh<\/kind>/.test(buildMusicXML()), sheet: /CΔ7/.test(leadSheetHTML()) }));
  check('notation: Jazz symbols show in the chart, lead sheet and MusicXML; the text editor keeps the standard spelling', j.chart.startsWith('CΔ7') && j.text.startsWith('Cmaj7 |') && j.xml && j.sheet, JSON.stringify(j));
  await page.evaluate(() => { navigator.clipboard.writeText = async t => { window.__copied = t; }; });
  await tap(page, '#copy');
  check('notation: Copy chart uses the chosen symbols', await page.evaluate(() => /\| CΔ7 \| D−7 \| Bø7/.test(window.__copied || '')), await page.evaluate(() => window.__copied));
  await page.selectOption('#labelMode', 'numerals');
  const n = await page.evaluate(() => { const s = document.querySelector('#rows .slot'); return { big: s.querySelector('.cn').textContent, small: s.querySelector('.cr')?.textContent, xml: (buildMusicXML().match(/<words>[^<]*<\/words>/g) || []).slice(0, 2).join(), sheet: /Imaj7/.test(leadSheetHTML()) }; });
  check('notation: Roman numerals only puts numerals first in the chart, the lead sheet and under the MusicXML staff', n.big.startsWith('Imaj7') && n.small === 'CΔ7' && n.xml === '<words>Imaj7</words>,<words>ii7</words>' && n.sheet, JSON.stringify(n));
  await page.selectOption('#labelMode', 'names');
  check('notation: Chord names only hides the numerals', await page.evaluate(() => !document.querySelector('#rows .slot .cr') && !/<words>/.test(buildMusicXML())));
  await page.reload();
  check('notation: the choices are remembered', await page.evaluate(() => S.sym === 'jazz' && S.labels === 'names' && document.querySelector('#symStyle').value === 'jazz' && document.querySelector('#labelMode').value === 'names'));
  const about = await page.evaluate(() => [...document.querySelectorAll('#helpMenu .help-about a')].map(a => a.href + (a.target === '_blank' ? ' new tab' : '')));
  check('help: About links to the project and its author on GitHub', about.join() === 'https://github.com/ssk0011/chord-progression-generator new tab,https://github.com/ssk0011 new tab', about.join());
  check('no console errors (notation)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// polish: names fit their slots, a clear picker arrow, the metronome in the Play bar, tension framed as a map,
// bigger diagrams with a Zoom switch and a visible capo, and a side panel you can drag wider
async function polish() {
  const LONG = 'Bbm9 | Dbmaj7#11:2 Dbm7:1 Dbm:1 | Abadd9:8\nC#m7b5:1 Ebmaj13:1 F#13#11:1 Gm(maj9):1 | ?:1 G:1 Bbm7(add11):2 | C7sus4 | ?';
  for (const [w, h, tag] of [[1440, 900, 'desktop'], [1100, 800, 'laptop'], [390, 844, 'phone']]) {
    const { ctx, page } = await openPage({ viewport: { width: w, height: h } });
    await page.goto(URL_);
    const r = await page.evaluate(t => { S.tonic = 10; S.mode = 'ionian'; chords = parseProg(t).chords; if (innerWidth < 760) selectTab('phone', 'p-chart'); renderAll();
      return [...document.querySelectorAll('#rows .slot:not(.tie)')].map(s => { const sr = s.getBoundingClientRect(), right = Math.max(...[...s.querySelectorAll('.nr,.nq,.cpk')].filter(e => e.offsetWidth).map(e => e.getBoundingClientRect().right)); return { t: s.querySelector('.cn').textContent.trim(), over: Math.round(right - (sr.right - 8)) }; }).filter(x => x.over > 0); }, LONG);
    check(`polish: every chord name fits its slot (${tag})`, r.length === 0, JSON.stringify(r));
    await ctx.close();
  }
  const { ctx, page } = await openPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL_);
  const a = await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; chords = parseProg('C | ? | G | C').chords; renderAll(); const k = document.querySelector('#rows .slot .cpk').getBoundingClientRect(), e = document.querySelector('#rows .slot.empty .cpk'); return { w: k.width, h: k.height, pick: getComputedStyle(e, '::after').content }; });
  check('polish: the picker arrow is a 24px button, and an empty slot says Pick', a.w >= 24 && a.h >= 24 && a.pick === '"Pick"', JSON.stringify(a));
  await page.click('#click');
  check('polish: the metronome is a toggle in the Play bar', await page.evaluate(() => S.click && !!document.querySelector('.dock #click[aria-pressed="true"]') && !document.querySelector('#chartTools #click')));
  await page.click('#click');
  check('polish: the tension curve says higher is not better', await page.evaluate(() => /not better/.test(document.querySelector('#tension .tl').title) && /map, not a score/.test(document.querySelector('#tension .tl').textContent)));
  await page.evaluate(() => { S.instrument = 'guitar'; S.capo = 3; sel = chords[0].id; renderAll(); selectTab('right', 'chord'); });
  const g = await page.evaluate(() => ({ capo: /CAPO 3/.test(document.querySelector('#detail .shape svg').outerHTML), badge: document.querySelector('#detail .shape .badge')?.textContent, w: document.querySelector('#detail .shape svg').getBoundingClientRect().width }));
  check('polish: chord boxes show the capo, and the smoothest-path badge names it', g.capo && /Smoothest path · capo 3/.test(g.badge) && g.w >= 118, JSON.stringify(g));
  await page.click('#detail [data-zoom]');
  const z = await page.evaluate(() => ({ on: document.body.classList.contains('zoomdiag'), w: document.querySelector('#detail .shape svg').getBoundingClientRect().width }));
  check('polish: Zoom makes the diagrams about twice the size', z.on && z.w >= 200, JSON.stringify(z));
  await page.reload();
  check('polish: Zoom is remembered', await page.evaluate(() => document.body.classList.contains('zoomdiag')));
  await page.evaluate(() => { document.body.classList.remove('zoomdiag'); try { localStorage.removeItem('changes-zoom-v1'); } catch (e) {} });
  // drag the side panel's edge
  const sw = () => page.evaluate(() => Math.round(document.querySelector('#sideRight').getBoundingClientRect().width));
  const w0 = await sw(), box = await page.locator('#sizer').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 200); await page.mouse.down(); await page.mouse.move(box.x - 150, box.y + 200, { steps: 6 }); await page.mouse.up();
  const w1 = await sw();
  check('polish: dragging the side panel edge makes it wider', w1 >= w0 + 140 && w1 <= w0 + 160, `${w0} → ${w1}`);
  await page.focus('#sizer'); await page.keyboard.press('ArrowRight');
  check('polish: the arrow keys nudge it', await sw() === w1 - 16, String(await sw()));
  await page.reload();
  check('polish: the width is remembered', await sw() === w1 - 16, String(await sw()));
  await page.mouse.move(box.x + box.width / 2, box.y + 200); await page.mouse.down(); await page.mouse.move(100, box.y + 200, { steps: 4 }); await page.mouse.up();
  const lim = await page.evaluate(() => ({ chart: document.querySelector('.chart-card').getBoundingClientRect().width, h: document.documentElement.scrollWidth <= innerWidth }));
  check('polish: it stops while the chart still has room, with no sideways scroll', lim.chart >= 400 && lim.h, JSON.stringify(lim));
  await page.dblclick('#sizer');
  check('polish: double-click resets it', await sw() === w0, String(await sw()));
  await page.setViewportSize({ width: 390, height: 844 });
  check('polish: no resize handle on a phone', await page.evaluate(() => !document.querySelector('#sizer').checkVisibility()));
  check('no console errors (polish)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// with 9ths allowed, 7ths stay common: allowed is a ceiling, not a target
async function ceilings() {
  const { ctx, page } = await openPage();
  await page.goto(URL_);
  const g = await page.evaluate(() => { S.vocab = FAMS.map(f => f.id); S.genres = []; S.tonic = 0; S.mode = 'ionian'; const n = {}; for (let k = 0; k < 200; k++) { S.mood = MOODS[k % MOODS.length].id; generate(); chords.forEach(c => { if (real(c)) n[c.q] = (n[c.q] || 0) + 1; }); } return { maj7: n.maj7 || 0, maj9: n.maj9 || 0, m7: n.m7 || 0, m9: n.m9 || 0 }; });
  check('ceilings: Generate with Everything allowed uses maj7 and m7 about as often as maj9 and m9', g.maj7 > 0.3 * (g.maj7 + g.maj9) && g.m7 > 0.25 * (g.m7 + g.m9), JSON.stringify(g));
  await page.evaluate(() => { S.tonic = 0; S.mode = 'ionian'; chords = parseProg('C | Am | F | G').chords; sel = chords[2].id; renderAll(); openPicker(chords[2].id); });
  const pk = await page.evaluate(() => [...document.querySelectorAll('#cpick .cp-row')].map(r => r.getAttribute('aria-label') + ':' + [...r.querySelectorAll('.chip')].map(c => c.firstChild.textContent).join(',')));
  check('ceilings: the picker shows the key’s 7ths and its 9ths in separate rows', pk.some(r => /^Sevenths:.*Fmaj7/.test(r)) && pk.some(r => /^Ninths and beyond:.*Fmaj9/.test(r) && !/m7♭5/.test(r)), pk.join(' | '));
  await page.evaluate(() => closePicker());
  check('ceilings: swap ideas offer 7th chords from the key, not only 9ths', await page.evaluate(() => suggestions(2).groups.flatMap(g => g.items).some(it => it.chords.length === 1 && ['maj7', 'm7', '7'].includes(it.chords[0].q))));
  check('ceilings: Apply chords allowed still takes the richest', await page.evaluate(() => { chords = parseProg('C | Am | F | G').chords; renderAll(); document.querySelector('#recolor').click(); return chords.every(c => Q[c.q].iv.length >= 5); }), await page.evaluate(() => chords.map(c => chordName(c)).join(' ')));
  check('no console errors (ceilings)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// the top-bar menus must be visible and on top at every width, not just "open"
async function menus() {
  for (const [w, h, tag] of [[1440, 900, 'desktop'], [1280, 720, 'small laptop'], [900, 900, 'tablet'], [390, 844, 'phone']]) {
    const { ctx, page } = await openPage({ viewport: { width: w, height: h }, noReveal: true });
    await page.goto(URL_);
    for (const [id, inner] of [['library', '#libName'], ['helpMenu', '.helppop a']]) {
      await page.click(`#${id} > summary`);
      const r = await page.evaluate(s => { const e = document.querySelector(s), pop = e.closest('.libpop'), b = pop.getBoundingClientRect(), r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { onTop: !!hit && (e === hit || e.contains(hit)), inView: b.left >= 0 && b.right <= innerWidth + 0.5 && b.top >= 0 && b.bottom <= innerHeight + 0.5 }; }, inner);
      check(`menus: ${id === 'library' ? 'Library' : 'Help'} opens visibly and on top (${tag})`, r.onTop && r.inView, JSON.stringify(r));
      if (id === 'library') { await page.click(inner);  // reachable by a real click (Help's links would leave the page)
 await page.keyboard.press('Escape'); check(`menus: Escape closes the Library (${tag})`, await page.evaluate(() => !document.querySelector('#library').open)); }
      await page.evaluate(i => { document.getElementById(i).open = false; }, id);
    }
    await ctx.close();
  }
}

// layout: desktop columns, tablet drawer, phone screens, top bar, help pages
async function layout() {
  const { ctx, page } = await openPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL_);
  // one shell: the chart stays in the middle and the navigation rail picks what the side panel shows
  const vis = s => document.querySelector(s).checkVisibility();
  const panelState = () => page.evaluate(() => ({ chart: document.querySelector('#rows').checkVisibility(), create: document.querySelector('#sideLeft').checkVisibility(), chord: document.querySelector('#sideRight').checkVisibility(), tools: document.querySelector('#tools').checkVisibility(), chartX: document.querySelector('.chart-card').getBoundingClientRect().left, railRight: document.querySelector('#phoneTabs').getBoundingClientRect().right }));
  const d0 = await panelState();
  await page.click('#tab-p-create'); const d1 = await panelState();
  await page.click('#tab-p-tools'); const d2 = await page.evaluate(() => ({ tools: document.querySelector('#finder').checkVisibility(), chart: document.querySelector('#rows').checkVisibility() }));
  await page.click('#tab-p-chord');
  check('layout: desktop keeps the chart in view while the rail switches the side panel between Create, Chord and Tools', d0.chart && d0.chord && !d0.create && d1.chart && d1.create && !d1.chord && d2.tools && d2.chart && d0.railRight <= d0.chartX, JSON.stringify({ d0, d1, d2 }));
  check('layout: each screen is in the address, so it can be bookmarked', await page.evaluate(() => location.hash === '#chord'));
  await page.click('#library > summary');
  check('layout: Library opens from the navigation with save, list and import/export', await page.evaluate(() => document.querySelector('#libSaveBtn').checkVisibility() && document.querySelector('#libExport').checkVisibility() && !!document.querySelector('#topbar #library')));
  await page.mouse.click(700, 500);
  check('layout: clicking elsewhere closes the Library', await page.evaluate(() => !document.querySelector('#library').open));
  await page.click('#helpMenu > summary');
  const help = await page.evaluate(() => [...document.querySelectorAll('#helpMenu a:not(.help-about a)')].map(a => a.getAttribute('href')).join());
  check('layout: Help links to How to use and Under the hood', help === 'guide.html,how-it-works.html', help);
  for (const [f, h1] of [['guide.html', 'How to use Chord Changes'], ['how-it-works.html', 'How Chord Changes works']]) {
    const p2 = await ctx.newPage(); const errs = []; p2.on('pageerror', e => errs.push(String(e)));
    const r = await p2.goto(URL_.replace('index.html', f));
    const info = await p2.evaluate(() => ({ h1: document.querySelector('h1').textContent, back: !!document.querySelector('a[href="./"]'), toc: document.querySelectorAll('.toc a').length, missing: [...document.querySelectorAll('.toc a')].filter(a => !document.querySelector(a.getAttribute('href'))).length }));
    check(`help page ${f} loads with its contents list and a link back to the app`, r.ok() && info.h1 === h1 && info.back && info.toc >= 10 && info.missing === 0 && errs.length === 0, JSON.stringify(info));
    await p2.close();
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  const t0 = await page.evaluate(() => ({ chart: document.querySelector('#rows').checkVisibility(), chord: document.querySelector('#sideRight').checkVisibility(), navTop: document.querySelector('#phoneTabs').getBoundingClientRect().top }));
  await page.click('#tab-p-create'); await page.waitForTimeout(100);
  const t1 = await page.evaluate(() => ({ gen: document.querySelector('#gen').checkVisibility(), chart: document.querySelector('#rows').checkVisibility(), chord: document.querySelector('#sideRight').checkVisibility() }));
  await page.click('#tab-p-chord');
  check('layout: tablet keeps the chart beside the panel and switches panels from the top bar', t0.chart && t0.chord && t0.navTop < 80 && t1.gen && t1.chart && !t1.chord, JSON.stringify({ t0, t1 }));
  await page.setViewportSize({ width: 390, height: 844 });
  const seen = {};
  for (const tab of ['p-create', 'p-chord', 'p-tools', 'p-chart']) { await page.click(`#phoneTabs [data-tab="${tab}"]`); seen[tab] = await page.evaluate(() => ({ gen: document.querySelector('#gen').checkVisibility(), detail: document.querySelector('#detail').checkVisibility(), finder: document.querySelector('#finder').checkVisibility(), chart: document.querySelector('#rows').checkVisibility() })); }
  const one = Object.values(seen).every(v => Object.values(v).filter(Boolean).length === 1);
  const bars = await page.evaluate(() => ({ play: document.querySelector('#play').getBoundingClientRect().bottom, dock: document.querySelector('.dock').getBoundingClientRect().bottom, tabs: document.querySelector('#phoneTabs').getBoundingClientRect().top }));
  check('layout: phone Play bar sits fully above the tab bar', bars.dock <= bars.tabs + 1 && bars.play <= bars.tabs, JSON.stringify(bars));
  check('layout: phone shows one screen at a time from the tab bar', one && seen['p-create'].gen && seen['p-chord'].detail && seen['p-tools'].finder && seen['p-chart'].chart && await noHScroll(page), JSON.stringify(seen));
  check('no console errors (layout)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// hardening: untrusted input, regressions from the code review, and real click paths (no auto-reveal)
async function hardening() {
  const { ctx, page } = await openPage({ noReveal: true, viewport: { width: 1440, height: 900 } });
  await page.goto(URL_); await page.evaluate(() => localStorage.clear()); await page.reload();
  const noToast = () => page.evaluate(() => { document.querySelector('#toast').hidden = true; });
  // a poisoned library file: bad settings are dropped, a bad chord list rejects its item, names never become HTML
  const bad = { version: 1, items: [
    { name: '<img src=x onerror="window.__x1=1">Bad', snap: { S: { meter: '0/4', tempo: '<img src=x onerror="window.__x2=1">', mode: 'constructor', tonic: 1.5 }, chords: [{ root: 0, q: '', beats: 4 }, { root: 7, q: '', beats: 4 }] } },
    { name: 'proto', snap: { S: {}, chords: [{ root: 0, q: 'constructor', beats: 4 }] } }] };
  const badPath = path.join(OUT, 'bad-library.json'); fs.writeFileSync(badPath, JSON.stringify(bad));
  await page.click('#library > summary'); await page.setInputFiles('#libImport', badPath); await page.waitForTimeout(200);
  const imp = await page.evaluate(() => ({ n: LIB.items.length, img: !!document.querySelector('#libList img') }));
  check('hardening: a poisoned library imports only the sound item, and names never become HTML', imp.n === 1 && !imp.img, JSON.stringify(imp));
  await page.click('#libList .ln');
  const opened = await page.evaluate(() => { document.querySelector('#printSheet').innerHTML = leadSheetHTML(); return { meter: S.meter, mode: S.mode, tempo: S.tempo, tonic: S.tonic, x: !!(window.__x1 || window.__x2), chords: chords.length, xml: /<per-minute>\d+<\/per-minute>/.test(buildMusicXML()) }; });
  await page.waitForTimeout(100);
  check('hardening: opening it keeps sane settings and runs no injected code', opened.meter === '4/4' && opened.mode === 'ionian' && Number.isInteger(opened.tempo) && Number.isInteger(opened.tonic) && !opened.x && opened.chords === 2 && opened.xml && !(await page.evaluate(() => !!(window.__x1 || window.__x2))), JSON.stringify(opened));
  // prototype-key names in chord text and share codes
  await page.click('#textEdit > summary'); await page.fill('#prog', 'Cconstructor | G | C__proto__ | CtoString'); await page.click('#load');
  const pk = await page.evaluate(() => ({ err: document.querySelector('#err').textContent, names: chords.map(c => chordName(c)).join(' ') }));
  check('hardening: chord names like Cconstructor are rejected with a message, not a crash', /constructor/.test(pk.err) && pk.names === 'G', JSON.stringify(pk));
  const code = await page.evaluate(() => b64url(JSON.stringify({ v: 1, k: 3, m: 'constructor', t: '__proto__', b: 'x', c: 'C | G' })));
  if (!(await page.evaluate(() => document.querySelector('#library').open))) await page.click('#library > summary');
  await page.fill('#shareIn', code); await page.click('#shareOpen');
  check('hardening: a share code with prototype keys keeps the mode and meter', await page.evaluate(() => S.mode === 'ionian' && S.meter === '4/4' && S.tonic === 3 && serialize() === 'C | G'));
  await page.fill('#prog', '[<img src=x onerror="window.__x3=1">]\nC | G'); await page.click('#load'); await page.waitForTimeout(100);
  check('hardening: HTML in a section name is shown as text', await page.evaluate(() => !window.__x3 && /<img/.test(document.querySelector('#rows .sec-label').textContent)));
  // regressions from the review
  for (const [inst, style] of [['piano', 'arp'], ['guitar', 'strum'], ['guitar', 'pick']]) {
    await page.evaluate(([i, st]) => { S.instrument = i; if (i === 'guitar') S.gstyle = st; else S.pstyle = st; chords = parseProg('G | C | D | G').chords; renderAll(); }, [inst, style]);
    const m = parseMidi(Buffer.from(await page.evaluate(() => [...buildMidi(false)])));
    let overlaps = 0; const on = new Map();
    for (const e of m.tracks[1]) { if (e.st === 0x90 && e.d[1] > 0) { if (on.get(e.d[0])) overlaps++; on.set(e.d[0], true); } else if (e.st === 0x80 || (e.st === 0x90 && e.d[1] === 0)) on.set(e.d[0], false); }
    check(`hardening: MIDI ${inst} ${style} has no overlapping notes of the same pitch`, overlaps === 0, String(overlaps));
  }
  await page.evaluate(() => { S.instrument = 'piano'; S.pstyle = 'block'; S.gstyle = 'strum1'; setTuning('standard'); S.capo = 0; chords = parseProg('G | C | D | G').chords; sel = chords[0].id; renderAll(); save(); });
  const ts = await page.evaluate(async () => { const tick = setInterval(() => commit(), 0); await findEasiestTuning(); clearInterval(tick); return { s: S.tuning, low: TUNING[0], stored: JSON.parse(localStorage.getItem('changes-v1')).S.tuning }; });
  check('hardening: the easiest-tuning search never saves a temporary tuning', ts.s === 'standard' && ts.low === 40 && ts.stored === 'standard', JSON.stringify(ts));
  await page.evaluate(() => { pushHist(); chords[0].beats = 8; commit(); });
  await page.selectOption('#tuneSel', 'DADGAD');
  await page.evaluate(() => undo());
  check('hardening: Undo keeps the guitar strings in step with the tuning', await page.evaluate(() => S.tuning === 'standard' && TUNING.join() === '40,45,50,55,59,64'));
  await page.evaluate(() => { sel = chords[0].id; renderAll(); });
  await page.focus('#tab-chord'); await page.keyboard.press('ArrowRight');
  check('hardening: arrow keys on a tab bar switch tabs without moving the chord selection', await page.evaluate(() => sel === chords[0].id && document.querySelector('#tab-swaps').getAttribute('aria-selected') === 'true'));
  if (!(await page.evaluate(() => document.querySelector('#library').open))) await page.click('#library > summary');
  await page.fill('#libName', 'Keep me'); await page.click('#libSaveBtn');
  await page.click('[data-lib]:has-text("Keep me") [data-la="rename"]'); await page.fill('[data-lib] input', 'Changed'); await page.press('[data-lib] input', 'Escape');
  check('hardening: Escape cancels a library rename', await page.evaluate(() => LIB.items.some(i => i.name === 'Keep me') && !LIB.items.some(i => i.name === 'Changed')));
  await page.mouse.click(700, 600);
  await noToast(); await page.click('#play'); await page.waitForTimeout(200);
  const pv = await page.evaluate(() => { const s0 = session; playOne({ root: 0, q: 'maj7', bass: null }); return { same: session === s0, playing }; });
  await page.click('#play');
  check('hardening: hearing a chord during playback leaves the chart playing', pv.same && pv.playing, JSON.stringify(pv));
  const before = await page.evaluate(() => serialize());
  await page.click('#chartTools #clearChart').catch(async () => { await page.evaluate(() => document.querySelector('#clearChart').click()); });
  await page.evaluate(() => { pushHist(); chords.push({ id: uid(), root: 0, q: '', bass: null, beats: 4 }); commit(); });
  await page.click('#toast .toast-act');
  check('hardening: the toast Undo reverts its own action even after another edit', await page.evaluate(b => serialize() === b, before), await page.evaluate(() => serialize()));
  // real click paths: the Swap ideas tab, the tablet drawer, the phone screens
  await page.evaluate(() => { sel = chords[1].id; renderAll(); });
  await page.click('#tab-swaps'); await page.click('#subs [data-use] >> nth=0');
  check('real clicks: Swap ideas tab, then Put in this slot', await page.evaluate(b => serialize() !== b, before));
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.click('#tab-p-create'); await page.waitForTimeout(100); await noToast(); await page.click('#gen');
  check('real clicks: tablet Create panel, then Generate', await page.evaluate(() => chords.length > 0));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('#phoneTabs [data-tab="p-chord"]'); await page.click('#tab-chord'); await noToast(); await page.click('#detail [data-act="lock"]');
  check('real clicks: phone Chord screen, then Lock', await page.evaluate(() => chords.some(c => c.lock)));
  check('no console errors (hardening)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
  // a corrupted saved session must not lock the app
  const { ctx: c2, page: p2 } = await openPage({ noReveal: true });
  await p2.goto(URL_);
  await p2.evaluate(() => localStorage.setItem('changes-v1', JSON.stringify({ S: { meter: '0/4', mode: 'constructor', tempo: '<b>', tuning: '__proto__' }, chords: [{ root: 0, q: 'constructor', beats: 4 }], sel: null })));
  await p2.reload({ timeout: 8000 });
  const boot = await Promise.race([p2.evaluate(() => ({ meter: S.meter, mode: S.mode, tempo: S.tempo, tuning: S.tuning, n: chords.length })), new Promise(r => setTimeout(() => r('HANG'), 5000))]);
  check('hardening: a corrupted saved session starts cleanly instead of hanging', boot !== 'HANG' && boot.meter === '4/4' && boot.mode === 'ionian' && boot.tempo === 88 && boot.tuning === 'standard' && boot.n > 0 && p2.errors.length === 0, JSON.stringify(boot));
  await c2.close();
}

// phone width + dark mode for every panel
async function phoneDark(tag) {
  const { ctx, page } = await openPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await page.goto(URL_); await page.evaluate(() => { document.querySelector('#library').open = true; S.showVL = true; S.quiz = true; S.meter = '16/4 teental'; chords = parseProg('Am | D').chords; sel = chords[0].id; document.querySelector('#melIn').value = 'E D C D | E E E -'; renderAll(); melodySuggest(); });
  await page.evaluate(async () => { await findEasiestTuning(); });
  check(`${tag}: no horizontal scroll at 390px (dark)`, await noHScroll(page));
  check(`${tag}: chord edges have resize handles at phone width`, await page.evaluate(() => [...document.querySelectorAll('#rows .slot:not(.tie)')].every(s => s.querySelector('.rz') || chords.find(c => c.id === s.dataset.id)?.beats > barLen() * 2)));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check(`${tag}: dark theme applies`, bg !== 'rgb(255, 255, 255)' && bg !== 'rgb(243, 244, 246)', bg);
  await page.evaluate(() => { document.querySelector('#rows').scrollIntoView(); openPicker(chords[chords.length - 1].id); });
  check(`${tag}: chord picker fits on a phone`, await page.evaluate(() => { const r = document.querySelector('#cpick').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth; }));
  await page.evaluate(() => closePicker());
  await page.screenshot({ path: path.join(OUT, `${tag}-phone-dark.png`), fullPage: true });
  check(`${tag}: no console errors (phone)`, page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// iPhone: sound must start from a tap, in the media-playback category so the silent switch doesn't mute it
async function iphone() {
  for (const old of [false, true]) {
    const b = await webkit.launch(), ctx = await b.newContext({ ...devices['iPhone 13'] });
    if (old) await ctx.addInitScript(() => { try { Object.defineProperty(Navigator.prototype, 'audioSession', { get: () => undefined, configurable: true }); } catch (e) {} });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto(URL_); await page.tap('#play'); await page.waitForTimeout(700);
    const st = await page.evaluate(() => ({ run: actx.state, t: actx.currentTime, session: navigator.audioSession ? navigator.audioSession.type : 'n/a', clip: silentEl && !silentEl.paused ? 'playing' : (silentEl && silentEl.lastError) || 'none' }));
    const tag = old ? 'iPhone (older iOS, no audio session API)' : 'iPhone (iOS 17+)';
    check(`${tag}: tapping Play starts the audio engine`, st.run === 'running' && st.t > 0.3, JSON.stringify(st));
    check(`${tag}: silent-switch workarounds are active (session ${old ? 'n/a' : 'playback'}, 16-bit clip playing)`, st.clip === 'playing' && st.session === (old ? 'n/a' : 'playback'), JSON.stringify(st));
    // Simple view opens on the one-tap card; Sound check lives on the Chart screen, one tab away
    await page.tap('#tab-p-chart'); await page.tap('#soundCheck'); await page.tap('[data-sb="web"]'); await page.waitForTimeout(500); await page.tap('[data-sb="media"]'); await page.waitForTimeout(500);
    const sb = await page.evaluate(() => ({ open: !document.querySelector('#soundbox').hidden, rows: [...document.querySelectorAll('#soundbox dd')].map(d => d.textContent), beep: beepEl ? (beepEl.lastError || (beepEl.paused && beepEl.currentTime === 0 ? 'not played' : 'played')) : 'none' }));
    check(`${tag}: Sound check shows the audio state and both beeps play`, sb.open && /running/.test(sb.rows[2]) && sb.beep === 'played', JSON.stringify(sb));
    await page.tap('[data-sb="close"]');
    await page.tap('#play'); check(`${tag}: no errors`, errs.length === 0, errs.join(' | '));
    await b.close();
  }
}
const phaseFns = { 1: phase1, 2: phase2, 3: phase3 };
try {
  for (const n of PHASES) { if (phaseFns[n]) { await phaseFns[n](); await phoneDark('phase' + n); } }
  await editing();
  await keyChanges();
  await notation();
  await polish();
  await ceilings();
  await menus();
  await layout();
  await hardening();
  await iphone();
} catch (e) { check('test run finished without throwing', false, e.stack); }
await browser.close(); server.close();
console.log(results.join('\n'));
console.log(failures ? `\n${failures} FAILED` : `\nall ${results.length} checks passed`);
process.exit(failures ? 1 : 0);
