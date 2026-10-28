import re, sys, pathlib
OUT = pathlib.Path(sys.argv[1])
# the app's name comes from index.html (const APP_NAME), so a rename is one line there; {APP} in the page bodies stands for it
APP = re.search(r"const APP_NAME='([^']+)'", (OUT / 'index.html').read_text()).group(1)

CSS = r"""
:root{--bg:#F3F4F6;--surface:#FFFFFF;--sunk:#F1F2F5;--ink:#15171C;--muted:#5F6676;--line:#E2E4E9;--accent:#3355FF;--accent-soft:#E9EDFF;
  --t-dia:#8A93A6;--t-bor:#8B5CF6;--t-sec:#EA6A2A;--t-chr:#E0457B;--t-jazz:#10A38C;
  --f-ui:'Geist',ui-sans-serif,system-ui,-apple-system,sans-serif;--f-mono:'Geist Mono',ui-monospace,'SF Mono',Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0C0D10;--surface:#15171B;--sunk:#1C1E23;--ink:#EDEEF0;--muted:#9AA0AC;--line:#262931;--accent:#7088FF;--accent-soft:#1D2440;
  --t-dia:#7D8597;--t-bor:#A78BFA;--t-sec:#FF8A4C;--t-chr:#FF6B9D;--t-jazz:#2DD4B4;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0C0D10;--surface:#15171B;--sunk:#1C1E23;--ink:#EDEEF0;--muted:#9AA0AC;--line:#262931;--accent:#7088FF;--accent-soft:#1D2440;color-scheme:dark}
*{box-sizing:border-box}
html{scroll-padding-top:72px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f-ui);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;padding:0 16px 64px}
a{color:var(--accent)}
.top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px 20px;flex-wrap:wrap;max-width:1180px;margin:0 auto;padding:12px 0;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.top .name{font-weight:600;font-size:18px;letter-spacing:-.02em;text-decoration:none;color:var(--ink)}
.top nav{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;height:36px;padding:0 14px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);font-weight:500;font-size:14px;text-decoration:none}
.btn:hover{background:var(--sunk)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn[aria-current=page]{border-color:var(--accent);color:var(--accent)}
.page{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px;align-items:start}
.toc{position:sticky;top:72px;max-height:calc(100vh - 90px);overflow:auto;font-size:14px;padding-top:28px}
.toc b{display:block;font-size:12px;color:var(--muted);font-weight:500;margin-bottom:6px}
.toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.toc a{display:block;padding:4px 10px;border-radius:7px;color:var(--muted);text-decoration:none}
.toc a:hover{background:var(--sunk);color:var(--ink)}
main{min-width:0;max-width:74ch}
h1{font-size:clamp(30px,4.6vw,42px);line-height:1.1;letter-spacing:-.035em;margin:28px 0 10px}
.lede{font-size:18px;color:var(--muted);margin:0 0 28px;max-width:62ch}
h2{scroll-margin-top:84px;font-size:24px;letter-spacing:-.025em;margin:44px 0 10px;padding-top:4px;border-top:1px solid var(--line);padding-top:28px}
h3{font-size:17px;margin:24px 0 6px}
p,li{max-width:70ch}
ul,ol{padding-left:22px}
li{margin:4px 0}
code,kbd,.mono{font-family:var(--f-mono);font-size:.88em}
code{background:var(--sunk);border-radius:5px;padding:1px 5px}
kbd{border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:0 5px;background:var(--surface)}
pre{background:var(--sunk);border-radius:12px;padding:14px 16px;overflow:auto;font-family:var(--f-mono);font-size:14px;line-height:1.55}
table{border-collapse:collapse;width:100%;font-size:15px;margin:10px 0 18px;display:block;overflow-x:auto}
th,td{text-align:left;padding:8px 12px 8px 0;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:13px;color:var(--muted);font-weight:500}
.note{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:16px 0}
.note b{display:block;margin-bottom:2px}
.steps{counter-reset:s;list-style:none;padding:0;display:grid;gap:10px}
.steps li{counter-increment:s;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px 14px 56px;position:relative;max-width:none}
.steps li::before{content:counter(s);position:absolute;left:16px;top:13px;width:28px;height:28px;border-radius:50%;background:var(--accent);color:#fff;font-weight:600;display:grid;place-items:center;font-size:14px}
.map{display:grid;grid-template-columns:1fr 2fr 1.4fr;grid-template-rows:auto auto auto;gap:6px;margin:14px 0 18px;font-size:13px}
.map div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.map b{display:block;font-size:14px}
.map .tb{grid-column:1 / -1}
.map .ct{border-color:var(--accent);background:var(--accent-soft)}
.map .dk{grid-column:1 / -1}
.flow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:12px 0 18px;font-size:14px}
.flow span{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:5px 12px}
.flow i{color:var(--muted);font-style:normal}
.k{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:0}
footer{max-width:1180px;margin:56px auto 0;color:var(--muted);font-size:14px;border-top:1px solid var(--line);padding-top:16px}
@media (max-width:860px){ .page{display:block} .toc{position:static;max-height:none;padding-top:8px} .toc ol{flex-direction:row;flex-wrap:wrap;gap:4px} .toc a{background:var(--surface);border:1px solid var(--line)} .map{grid-template-columns:1fr} }
"""

def page(fname, title, desc, current, body):
    heads = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
    toc = ''.join(f'<li><a href="#{i}">{re.sub("<[^>]+>","",t)}</a></li>' for i, t in heads)
    nav = ''.join(f'<a class="btn" href="{h}"{" aria-current=page" if h==current else ""}>{l}</a>' for h, l in [('guide.html','How to use'),('how-it-works.html','Under the hood')])
    html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<header class="top"><a class="name" href="./">{APP}</a><nav aria-label="Pages">{nav}<a class="btn primary" href="./">Open the app</a></nav></header>
<div class="page"><nav class="toc" aria-label="On this page"><b>On this page</b><ol>{toc}</ol></nav>
<main>{body}</main></div>
<footer>{APP} runs entirely in your browser. Nothing you make is sent anywhere unless you share or export it. Made by <a href="https://github.com/ssk0011">ssk0011</a>; the source code is <a href="https://github.com/ssk0011/chord-progression-generator">on GitHub</a>.</footer>
</body></html>
"""
    (OUT / fname).write_text(html.replace('{APP}', APP))

page('guide.html', 'How to use {APP}', 'A tour of {APP}: making, editing, hearing, exporting and saving chord progressions.', 'guide.html',
(pathlib.Path(sys.argv[2]) / 'guide.body.html').read_text())
page('how-it-works.html', 'How {APP} works', 'The music theory and code behind {APP}: analysis, generation, voice leading, guitar shapes, sound and file formats.', 'how-it-works.html',
(pathlib.Path(sys.argv[2]) / 'hood.body.html').read_text())
print('built')
