import random
FONT='<style>@font-face{font-family:Geist;src:url(geist-400.ttf);font-weight:400}@font-face{font-family:Geist;src:url(geist-500.ttf);font-weight:500}@font-face{font-family:Geist;src:url(geist-600.ttf);font-weight:600}</style>'
BASE='''<!doctype html><html><head><meta charset="utf-8">%s<style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:400px;height:400px;overflow:hidden}
body{font-family:Geist,sans-serif;background:#f7f6f3;color:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;letter-spacing:-.01em}
%s</style></head><body>%s</body></html>'''
def grid(n_ink, size, gap, today=True, hair='#dcdad5', ink='#000', total=25):
    dots=[]
    for i in range(total):
        c = ink if i<n_ink else ('#A61E4D' if (today and i==n_ink) else hair)
        dots.append(f'<i style="background:{c}"></i>')
    return f'<div class="g" style="--s:{size}px;--gap:{gap}px">{"".join(dots)}</div>'
GCSS='.g{display:grid;grid-template-columns:repeat(5,var(--s));gap:var(--gap)}.g i{width:var(--s);height:var(--s);border-radius:50%;display:block}'

ads={}
# 1 streak
ads['1-streak']=(GCSS+'.cap{margin-top:34px;font-size:26px;font-weight:600}.sub{margin-top:6px;font-size:17px;color:#6e6e73}',
 grid(18,30,16)+'<div class="cap">19 days in a row</div><div class="sub">on LinkedIn</div>')
# 2 approval card
ads['2-approve']=('''.card{width:320px;background:#fff;border-radius:18px;padding:24px;box-shadow:0 1px 0 rgba(0,0,0,.04),0 12px 32px rgba(0,0,0,.08)}
.meta{font-size:14px;color:#6e6e73;display:flex;justify-content:space-between}.meta b{color:#A61E4D;font-weight:500}
.l{height:11px;border-radius:6px;background:#e8e6e1;margin-top:12px}.first{margin-top:20px;background:#000;height:13px;width:88%}
.acts{display:flex;gap:8px;margin-top:26px}.acts span{flex:1;text-align:center;font-size:15px;font-weight:500;padding:11px 0;border-radius:999px;border:1px solid #dcdad5}
.acts .a{background:#A61E4D;border-color:#A61E4D;color:#fff}''',
 '<div class="card"><div class="meta"><span>Draft</span><b>Tue 09:00</b></div><div class="l first"></div><div class="l"></div><div class="l" style="width:94%"></div><div class="l" style="width:61%"></div><div class="acts"><span class="a">Approve</span><span>Revise</span><span>Reject</span></div></div>')
# 3 price on ink
ads['3-price']=('''body{background:#000;color:#fff;align-items:flex-start;padding:0 44px;background-image:radial-gradient(circle at 105% -5%,rgba(166,30,77,.55),transparent 55%)}
.p{white-space:nowrap;font-size:84px;font-weight:600;letter-spacing:-.045em;line-height:1}.u{font-size:34px;font-weight:500;color:#98989d;margin-top:10px}
.s{margin-top:40px;font-size:19px;color:#fff;display:flex;align-items:center;gap:10px}.s i{width:12px;height:12px;border-radius:50%;background:#f2799f;display:block}''',
 '<div class="p">100 USD</div><div class="u">a month</div><div class="s"><i></i>A LinkedIn post, most days</div>')
# 4 agency
random.seed(4)
tiles=''.join('<div class="t">'+grid(random.randint(9,20),9,5)+'</div>' for _ in range(12))
ads['4-agency']=(GCSS+'''.w{display:grid;grid-template-columns:repeat(4,72px);gap:10px}.t{width:72px;height:72px;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.cap{margin-top:30px;font-size:24px;font-weight:600}.sub{margin-top:6px;font-size:17px;color:#6e6e73}''',
 '<div class="w">'+tiles+'</div><div class="cap">12 clients. One board.</div><div class="sub">1000 USD a month</div>')
for k,(css,body) in ads.items():
    open(f'{k}.html','w').write(BASE%(FONT,css,body))
