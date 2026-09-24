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
               '<div class="dots"><i></i><i></i><i></i><i></i><i></i></div>'
               '<div class="h">LinkedIn,<br><span class="soft">every day</span></div>'),
    # Sound like me: the AI word, crossed out.
    '2-voice': ('''.x{font-size:46px;font-weight:600;letter-spacing:-.03em;color:#f2a8c0;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:#fff}''',
                '<div class="x">game-changing</div>'
                '<div class="h">Sounds like<br><span class="soft">you, not AI</span></div>'),
    # Turn what the business already measures into posts. No invented result.
    '3-data': ('''.bars{display:flex;gap:12px;align-items:flex-end;height:64px}.bars i{width:34px;background:#fff;border-radius:6px;display:block}''',
               '<div class="bars"><i style="height:40%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:100%"></i><i style="height:80%"></i></div>'
               '<div class="h">Your data,<br><span class="soft">on LinkedIn</span></div>'),
    # Agency: twelve clients on one board.
    '4-agency': ('''.g{display:grid;grid-template-columns:repeat(6,34px);gap:12px}.g i{width:34px;height:34px;border-radius:50%;background:#fff;display:block}''',
                 '<div class="g">' + '<i></i>' * 12 + '</div>'
                 '<div class="h">12 clients<br><span class="soft">on LinkedIn</span></div>'),
}
# More ideas in the pattern of 2-voice: the thing people are tired of,
# crossed out, and the fix as a two-line headline.
STRIKE = """.x{font-size:44px;font-weight:600;letter-spacing:-.03em;line-height:1.1;color:#f2a8c0;
text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:#fff}"""

def strike(x, top, soft):
    return (STRIKE, f'<div class="x">{x}</div>'
            f'<div class="h">{top}<br><span class="soft">{soft}</span></div>')

ads.update({
    '05-cringe': strike('Thrilled to<br>announce', 'LinkedIn,', 'minus cringe'),
    '06-delve': strike('Let\'s delve in', 'No AI tells', 'on LinkedIn'),
    '07-tomorrow': strike('Post tomorrow', 'Out today', 'on LinkedIn'),
    '08-lastpost': strike('Last post:<br>4 months ago', 'Back on', 'LinkedIn'),
    '09-blank': strike('Blank page', '7 LinkedIn', 'posts, ready'),
    '10-ghost': strike('Ghostwriter', 'LinkedIn for', '100 USD'),
    '11-logins': strike('12 logins', '12 clients', 'one board'),
    '12-sunday': strike('Sunday nights<br>writing posts', 'LinkedIn,', 'handled'),
})

for k, (css, body) in ads.items():
    open(f'{k}.html', 'w').write(BASE % (FONT, css, body))
