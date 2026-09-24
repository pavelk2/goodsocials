"""Renders the four OpenAI ads creatives. python3 gen.py, then render.sh."""
FONT = '<style>' + ''.join(
    '@font-face{font-family:Geist;src:url(geist-%d.ttf);font-weight:%d}' % (w, w)
    for w in (400, 500, 600)) + '</style>'
BASE = '''<!doctype html><html><head><meta charset="utf-8">%s<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:400px;height:400px;overflow:hidden}
body{font-family:Geist,sans-serif;background:#f7f6f3;color:#000;padding:28px;
  display:flex;flex-direction:column;justify-content:center;letter-spacing:-.01em;font-feature-settings:"tnum"}
.h{font-size:25px;font-weight:600;letter-spacing:-.025em;line-height:1.15}
.s{font-size:15px;color:#6e6e73;margin-top:5px}
.card{background:#fff;border:1px solid #e6e6e6;border-radius:14px}
.grey{color:#6e6e73}.plum{color:#a61e4d}
%s</style></head><body>%s</body></html>'''

ads = {}

# JTBD 1. Founder: stay visible to buyers without spending hours writing.
days = [("Mon", "How Fernhill cut onboarding to 3 days"),
        ("Tue", "The pricing test Fernhill ran for 6 weeks"),
        ("Wed", "4 questions Fernhill asks every new hire"),
        ("Thu", "What 212 support tickets taught Fernhill"),
        ("Fri", "Fernhill's checklist for a first sales call")]
rows = ''.join(
    f'<div class="r"><span class="d">{d}</span><span class="t">{t}</span></div>'
    for d, t in days)
ads['1-week'] = ('''.card{margin-top:20px;padding:4px 16px}
.r{display:flex;gap:12px;align-items:baseline;padding:12px 0;border-top:1px solid #eeeeee;font-size:14.5px}
.r:first-child{border-top:0}.d{width:30px;color:#6e6e73;flex:none}
.t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.f{margin-top:14px;font-size:14px;display:flex;align-items:center;gap:8px}
.f i{width:8px;height:8px;border-radius:50%;background:#a61e4d;display:block}''',
    '<div class="h">Next week on LinkedIn,<br>already written</div>'
    f'<div class="card">{rows}</div>'
    '<div class="f"><i></i>5 posts scheduled, 09:00 each day</div>')

# JTBD 2. Anyone burned by AI writing: make it sound like me, and stay that way.
ads['2-voice'] = ('''.card{margin-top:18px;padding:16px;font-size:15px;line-height:1.45}
del{color:#b4b4b8;text-decoration-thickness:1.5px}ins{text-decoration:none;background:#fbecf1;color:#a61e4d;padding:0 3px;border-radius:4px}
.c{margin-top:10px;margin-left:44px;background:#000;color:#fff;border-radius:14px 14px 4px 14px;padding:10px 14px;font-size:14.5px}
.p{margin-top:10px;padding:12px 14px;font-size:14px;line-height:1.35}
.p b{font-weight:600}''',
    '<div class="h">Correct it once.<br><span class="grey">It remembers.</span></div>'
    '<div class="card">Fernhill <del>is revolutionizing</del> <ins>cut</ins> invoice '
    'reconciliation <del>with a game-changing</del> <ins>from 2 days to 40 minutes with one</ins> workflow.</div>'
    '<div class="c">No hype words. Give the number.</div>'
    '<div class="card p"><b>Voice rule updated.</b> <span class="grey">Every future post follows it.</span></div>')

# JTBD 3. Founder with traction: turn real numbers into credible posts.
ads['3-numbers'] = ('''.src{margin-top:18px;display:flex;gap:8px}
.m{flex:1;padding:12px 14px}.m .k{font-size:12.5px;color:#6e6e73}.m .v{font-size:21px;font-weight:600;margin-top:3px;letter-spacing:-.02em}
.m .v small{font-size:13px;color:#a61e4d;font-weight:500;margin-left:4px}
.arr{text-align:center;color:#b4b4b8;font-size:18px;line-height:1;margin:8px 0}
.post{padding:16px;font-size:15px;line-height:1.45}.post .by{font-size:12.5px;color:#6e6e73;margin-bottom:6px}''',
    '<div class="h">Your numbers,<br>written as posts</div>'
    '<div class="src"><div class="card m"><div class="k">Stripe · MRR</div><div class="v">4,210 EUR<small>+18%</small></div></div>'
    '<div class="card m"><div class="k">Plausible · visitors</div><div class="v">9,840<small>+31%</small></div></div></div>'
    '<div class="arr">↓</div>'
    '<div class="card post"><div class="by">Draft · Thu 09:00</div>Fernhill grew MRR 18% in September, '
    'to 4,210 EUR. Three changes did most of it.</div>')

# JTBD 4. Agency: deliver LinkedIn for many clients without a writer per client.
clients = [("AP", "Ada Park", "12 posts this month", False),
           ("LB", "Lukas Brandt", "11 posts this month", False),
           ("SR", "Sofia Reyes", "Reconnect in 5 days", True),
           ("TO", "Tom Okafor", "13 posts this month", False)]
crow = ''.join(
    f'<div class="r"><span class="a">{i}</span><span class="n">{n}</span>'
    f'<span class="{"x plum" if w else "x grey"}">{s}</span></div>'
    for i, n, s, w in clients)
ads['4-agency'] = ('''.card{margin-top:18px;padding:2px 14px}
.r{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid #eeeeee;font-size:14.5px}
.r:first-child{border-top:0}
.a{width:28px;height:28px;border-radius:50%;background:#f1f0ec;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;flex:none}
.n{font-weight:500;flex:1}.x{font-size:13.5px}
.more{font-size:13.5px;color:#6e6e73;padding:10px 0 11px;border-top:1px solid #eeeeee}''',
    '<div class="h">Every client posts.<br><span class="grey">Nobody writes.</span></div>'
    f'<div class="card">{crow}<div class="more">+ 8 more clients</div></div>')

for k, (css, body) in ads.items():
    open(f'{k}.html', 'w').write(BASE % (FONT, css, body))
