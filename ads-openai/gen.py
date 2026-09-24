"""Renders the four OpenAI ads creatives. python3 gen.py, then render.sh.

The card shows the square at about 155px, 39% of the 400px canvas, so a
word under 40px here is unreadable in the feed. One headline, one shape.
"""
FONT = '<style>' + ''.join(
    '@font-face{font-family:Geist;src:url(geist-%d.ttf);font-weight:%d}' % (w, w)
    for w in (400, 500, 600, 700)) + '</style>'
BASE = '''<!doctype html><html><head><meta charset="utf-8">%s<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:400px;height:400px;overflow:hidden}
body{font-family:Geist,sans-serif;background:#a61e4d;color:#fff;padding:34px 34px 36px;
  display:flex;flex-direction:column;justify-content:space-between;font-feature-settings:"tnum"}
.brand{font-size:19px;font-weight:600;display:flex;align-items:center;gap:8px;opacity:.9}
.brand i{width:10px;height:10px;border-radius:50%%;background:#fff;display:block}
.h{font-size:58px;font-weight:700;letter-spacing:-.045em;line-height:.98}
.soft{color:#f2a8c0}
%s</style></head><body><div class="brand"><i></i>GoodSocials</div>%s</body></html>'''

ads = {
    # Stay visible without writing: the week, filled.
    '1-week': ('''.dots{display:flex;gap:14px}.dots i{width:44px;height:44px;border-radius:50%;background:#fff;display:block}''',
               '<div class="h">Next week,<br><span class="soft">written.</span></div>'
               '<div class="dots"><i></i><i></i><i></i><i></i><i></i></div>'),
    # Sound like me: the AI word, crossed out.
    '2-voice': ('''.x{font-size:46px;font-weight:600;letter-spacing:-.03em;color:#f2a8c0;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:#fff}''',
                '<div class="x">game-changing</div>'
                '<div class="h">Sounds like<br><span class="soft">you, not AI</span></div>'),
    # Turn traction into proof: the number is the post.
    '3-numbers': ('''.n{font-size:104px;font-weight:700;letter-spacing:-.06em;line-height:.9}.n small{font-size:40px;letter-spacing:-.03em;color:#f2a8c0;margin-left:6px}''',
                  '<div class="n">+18%<small>MRR</small></div>'
                  '<div class="h">Metrics in,<br><span class="soft">posts out</span></div>'),
    # Agency: twelve clients, one of them is you, all posting.
    '4-agency': ('''.g{display:grid;grid-template-columns:repeat(6,34px);gap:12px}.g i{width:34px;height:34px;border-radius:50%;background:#fff;display:block}''',
                 '<div class="g">' + '<i></i>' * 12 + '</div>'
                 '<div class="h">12 clients.<br><span class="soft">One board.</span></div>'),
}
for k, (css, body) in ads.items():
    open(f'{k}.html', 'w').write(BASE % (FONT, css, body))
