import random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
F='/usr/share/fonts/truetype/google-fonts/ofl/comicrelief/ComicRelief-Regular.ttf'
FB='/usr/share/fonts/truetype/google-fonts/ofl/comicrelief/ComicRelief-Bold.ttf'
random.seed(4)
def board(path, draw_fn):
    W,H=1600,1100
    im=Image.new('RGB',(W,H),(236,238,236)); d=ImageDraw.Draw(im)
    # whiteboard glare gradient
    for x in range(W):
        v=int(8*math.sin(x/W*math.pi))
        d.line([(x,0),(x,H)],fill=(238+v//2,240+v//2,238+v//2))
    # ghost marks of erased writing
    for _ in range(14):
        x,y=random.randint(80,W-300),random.randint(80,H-80)
        d.line([(x,y),(x+random.randint(80,260),y+random.randint(-10,10))],fill=(222,224,224),width=random.randint(6,14))
    draw_fn(im,d)
    im=im.rotate(-1.2,resample=Image.BICUBIC,expand=False,fillcolor=(90,90,90))
    # aluminium frame + wall
    out=Image.new('RGB',(W+120,H+120),(158,150,140)); fr=ImageDraw.Draw(out)
    fr.rectangle([40,40,W+80,H+80],fill=(190,192,196)); out.paste(im,(60,60))
    fr.rectangle([60,H+60,W+60,H+80],fill=(170,172,176))
    out=out.filter(ImageFilter.GaussianBlur(0.8))
    # noise
    px=out.load()
    for _ in range(60000):
        x,y=random.randrange(out.width),random.randrange(out.height); r,g,b=px[x,y]; n=random.randint(-10,10)
        px[x,y]=(max(0,min(255,r+n)),max(0,min(255,g+n)),max(0,min(255,b+n)))
    out=out.resize((1200,int(1200*out.height/out.width)),Image.LANCZOS)
    out.save(path,quality=82)

INK=(22,40,120); RED=(170,30,30); BLK=(30,30,30)
def txt(d,xy,s,size=54,fill=INK,bold=False):
    f=ImageFont.truetype(FB if bold else F,size); x,y=xy
    for ch in s:
        d.text((x,y+random.randint(-2,2)),ch,font=f,fill=fill); x+=f.getlength(ch)
    return x
def line(d,a,b,fill=INK,w=5):
    pts=[]; n=12
    for i in range(n+1):
        t=i/n; pts.append((a[0]+(b[0]-a[0])*t+random.uniform(-1.5,1.5),a[1]+(b[1]-a[1])*t+random.uniform(-1.5,1.5)))
    d.line(pts,fill=fill,width=w,joint='curve')
def frac(d,x,y,top,bot,size=54,fill=INK):
    f=ImageFont.truetype(F,size); w=max(f.getlength(top),f.getlength(bot))+20
    txt(d,(x+(w-f.getlength(top))/2,y-size-6),top,size,fill); line(d,(x,y+6),(x+w,y+6),fill,4)
    txt(d,(x+(w-f.getlength(bot))/2,y+14),bot,size,fill); return x+w

def b51(im,d):
    txt(d,(90,60),'5.1  Law of Sines',72,BLK,True); line(d,(90,150),(700,150),BLK,4)
    txt(d,(90,190),'works for ANY triangle (not just right ones!)',46)
    x=frac(d,150,370,'a','sin A',64); x=txt(d,(x+20,330),'=',64); x=frac(d,x+20,370,'b','sin B',64); x=txt(d,(x+20,330),'=',64); frac(d,x+20,370,'c','sin C',64)
    txt(d,(90,520),'each side goes with the angle ACROSS from it',48,RED)
    txt(d,(90,610),'use it: you know a side + its opposite angle',46)
    txt(d,(90,700),'angles add up to 180°',50); txt(d,(140,780),'A + B + C = 180°',60,BLK)
    # triangle sketch
    A,B,C=(1080,820),(1480,820),(1270,430)
    line(d,A,B); line(d,B,C); line(d,C,A)
    txt(d,(1045,830),'A',54,BLK); txt(d,(1490,830),'B',54,BLK); txt(d,(1255,365),'C',54,BLK)
    txt(d,(1395,600),'a',54,RED); txt(d,(1060,560),'b',54); txt(d,(1270,830),'c',54)
    d.arc([A[0]-60,A[1]-60,A[0]+60,A[1]+60],-62,0,fill=RED,width=4)
    txt(d,(1110,960),'a is across from A',40,RED)

def b53(im,d):
    txt(d,(90,60),'5.3  Law of Cosines',72,BLK,True); line(d,(90,150),(760,150),BLK,4)
    txt(d,(90,190),'"fixing" Pythagoras for ANY triangle',46)
    txt(d,(130,300),'c² = a² + b² − 2ab cos C',72,BLK)
    txt(d,(90,450),'C = the angle BETWEEN sides a and b',48,RED)
    txt(d,(90,540),'use it for:  2 sides + angle between (SAS)',46)
    txt(d,(330,610),'or all 3 sides (SSS)',46)
    txt(d,(90,720),'if C = 90°, cos C = 0, so c² = a² + b²',46)
    A,B,C=(1020,860),(1480,860),(1180,470)
    line(d,A,B); line(d,B,C); line(d,C,A)
    txt(d,(985,870),'A',54,BLK); txt(d,(1490,870),'B',54,BLK); txt(d,(1165,405),'C',54,BLK)
    txt(d,(1350,630),'a',54); txt(d,(1060,630),'b',54); txt(d,(1230,870),'c = ?',54,RED)
    d.arc([C[0]-55,C[1]-55,C[0]+55,C[1]+55],62,112,fill=RED,width=4)

board('/home/claude/lmd-math-archive/public/assets/board-5-1.jpg',b51)
board('/home/claude/lmd-math-archive/public/assets/board-5-3.jpg',b53)

def buc(im,d):
    txt(d,(90,60),'Unit Circle',72,BLK,True); line(d,(90,150),(520,150),BLK,4)
    txt(d,(90,200),'points on the unit circle (r = 1)',46)
    txt(d,(130,300),'x = cos θ      y = sin θ',64,BLK)
    txt(d,(90,440),'at θ = π/3 the point is',48)
    txt(d,(140,520),'(1/2 , √3/2)',64,RED)
    cx,cy,r=1180,560,300
    line(d,(cx-r-40,cy),(cx+r+40,cy)); line(d,(cx,cy-r-40),(cx,cy+r+40))
    d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=INK,width=5)
    px,py=cx+r*0.5,cy-r*0.866
    line(d,(cx,cy),(px,py),RED); line(d,(px,py),(px,cy),RED,3)
    d.arc([cx-70,cy-70,cx+70,cy+70],-60,0,fill=RED,width=4)
    txt(d,(cx+75,cy-70),'π/3',40,RED); txt(d,(px+12,py-60),'(1/2, √3/2)',38,RED)
board('/home/claude/lmd-math-archive/public/assets/board-unit-circle.jpg',buc)
