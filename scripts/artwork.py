"""Draw the edition's original paper-cut illustrations. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
import math
import random

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
INK, CREAM, CORAL, GOLD, MINT = '#203a33', '#fff5d5', '#ef7352', '#ffc36a', '#83c5a5'
S = 3

class Paper:
    def __init__(self, width, height, color):
        self.size = width, height
        self.im = Image.new('RGBA', (width*S, height*S), color)
        self.d = ImageDraw.Draw(self.im)
    def box(self, coords): return tuple(round(v*S) for v in coords)
    def pts(self, coords): return [self.box(p) for p in coords]
    def oval(self, coords, color): self.d.ellipse(self.box(coords), fill=color)
    def rect(self, coords, color, radius=0): self.d.rounded_rectangle(self.box(coords), radius=radius*S, fill=color)
    def poly(self, points, color): self.d.polygon(self.pts(points),fill=color)
    def line(self, points, color, width):
        self.d.line(self.pts(points),fill=color,width=round(width*S),joint='curve')
    def arc(self, coords, start, end, color, width):
        self.d.arc(self.box(coords), start, end, fill=color, width=round(width*S))
    def save(self, name, grain=True):
        if grain:
            rng=random.Random(name)
            dust=Image.new('RGBA',self.im.size)
            draw=ImageDraw.Draw(dust)
            for _ in range(self.size[0]*self.size[1]//10):
                x,y=rng.randrange(self.im.width),rng.randrange(self.im.height)
                draw.line([(x,y),(x+rng.randrange(1,5),y+1)],fill=(63,57,43,rng.randrange(7,30)),width=2)
            self.im=Image.alpha_composite(self.im,dust)
        self.im.resize(self.size,Image.Resampling.LANCZOS).save(ASSETS/name,optimize=True)

def sparkle(p,x,y,r,color):
    p.poly([(x,y-r),(x+r*.28,y-r*.25),(x+r,y),(x+r*.28,y+r*.25),
            (x,y+r),(x-r*.28,y+r*.25),(x-r,y),(x-r*.28,y-r*.25)],color)

def herb(p,x,y):
    p.line([(x-13,y+17),(x+9,y-12)],INK,2)
    p.poly([(x-3,y+6),(x-17,y+4),(x-20,y-6),(x-7,y-5),(x-2,y+2)],'#388264')
    p.poly([(x+1,y),(x+11,y+2),(x+18,y-6),(x+8,y-7)],'#5d9f67')
    p.poly([(x+5,y-5),(x+4,y-18),(x+12,y-24),(x+15,y-15)],'#2b715b')

def bowl(name,bg,bowl_color,moon=False):
    p=Paper(360,238,bg)
    p.oval((49,186,314,211),'#00000016')
    if moon:
        p.oval((24,21,82,79),CREAM); p.oval((42,12,96,65),bg)
        sparkle(p,95,35,9,CREAM); sparkle(p,290,46,6,CREAM)
    else:
        for x,y in [(38,74),(292,67),(71,38)]: sparkle(p,x,y,6,CREAM)
    for x,off in [(122,0),(166,-7)]:
        p.line([(x,89),(x-5,79+off),(x+3,70+off),(x+3,60+off)],CREAM,4)
    p.poly([(201,116),(259,25),(264,27),(211,121)],INK)
    p.poly([(213,116),(282,31),(286,34),(223,122)],INK)
    p.oval((143,177,220,205),INK)
    p.poly([(47,111),(312,111),(303,140),(289,158),(269,174),(239,183),(204,193),
            (161,193),(122,183),(98,173),(75,157),(57,137)],bowl_color)
    p.oval((46,87,313,139),CREAM)
    p.oval((56,94,303,133),'#d88b50')
    for i in range(5):
        x=83+i*28
        p.arc((x,103+(i%2)*3,x+60,123+(i%2)*3),170,355,'#ffe09a',3)
    herb(p,130,105); herb(p,222,101)
    p.oval((167,97,207,117),CREAM); p.oval((182,101,196,112),GOLD)
    for x,y in [(97,113),(153,117),(242,112)]:
        p.oval((x-6,y-3,x+5,y+3),CORAL); p.oval((x-2,y-1,x+2,y+1),CREAM)
    p.arc((49,92,310,143),1,179,INK,3)
    for x in [113,139,165,191,217]: p.line([(x,148),(x+6,157),(x+12,148)],CREAM,3)
    p.save(name)

def bread():
    p=Paper(360,238,'#e7a78b')
    p.oval((45,172,304,202),'#00000019')
    sparkle(p,53,54,9,CREAM); sparkle(p,296,148,8,CREAM)
    p.poly([(57,145),(78,117),(252,62),(292,77),(301,106),(282,125),(92,180),(64,172)],'#9f4f2b')
    p.poly([(60,139),(74,118),(96,121),(111,104),(130,109),(152,94),(174,98),
            (194,83),(215,89),(237,77),(265,79),(285,88),(278,107),(82,162)],'#42765b')
    for x,y in [(118,135),(161,117),(210,99)]:
        p.oval((x-18,y-7,x+23,y+7),CORAL);p.line([(x-11,y+2),(x+8,y-3)],CREAM,2)
    p.poly([(54,137),(61,116),(85,95),(230,47),(261,47),(283,59),(291,73),(280,84),
            (109,137),(70,146),(59,145)],GOLD)
    for x,y in [(104,99),(144,86),(184,74),(221,62)]:
        p.poly([(x-3,y+8),(x+5,y-5),(x+14,y-9),(x+9,y+2)],'#a85f32')
    p.save('comet.png')

def tea():
    p=Paper(360,238,'#dfba80')
    p.oval((72,181,289,205),'#0000001a')
    p.arc((220,99,287,164),260,100,INK,12)
    p.poly([(91,103),(236,103),(229,174),(215,186),(122,186),(107,177)],'#227866')
    p.oval((90,90,237,119),CREAM);p.oval((99,96,230,114),'#996047')
    p.arc((90,90,237,119),2,178,INK,3)
    p.line([(176,42),(163,64),(167,83)],CREAM,4);p.line([(148,49),(137,68),(140,81)],CREAM,3)
    p.line([(106,154),(231,154)],CREAM,4);p.line([(108,163),(227,163)],CREAM,2)
    p.line([(204,103),(203,126),(216,132)],INK,2);p.rect((207,129,225,148),CORAL,3)
    sparkle(p,59,74,8,CREAM);sparkle(p,271,47,7,CREAM)
    p.save('paper-rain.png')

def scooter():
    p=Paper(345,235,(0,0,0,0))
    p.oval((66,40,261,219),'#f8c16a');p.rect((36,190,308,218),'#255343')
    p.line([(25,207),(294,207)],MINT,2)
    for x,y,r in [(30,75,6),(275,44,9),(307,144,5)]: sparkle(p,x,y,r,CREAM)
    for x,y in [(42,137),(32,150),(49,161)]: p.line([(x,y),(x+30,y)],MINT,3)
    for x in [107,243]:
        p.oval((x-23,157,x+23,203),INK);p.oval((x-14,166,x+14,194),CREAM)
        p.oval((x-8,172,x+8,188),'#eea55e')
    p.poly([(79,158),(95,145),(132,143),(142,158),(167,170),(191,170),(209,136),
            (211,111),(229,105),(245,154),(232,160),(213,151),(203,174),(190,182),
            (146,182),(138,171),(76,171)],CORAL)
    p.arc((216,155,273,187),182,347,CORAL,8)
    p.rect((84,134,145,145),INK,5)
    p.rect((71,95,117,132),'#3b8068',5);p.rect((67,92,121,99),CREAM,2)
    p.rect((76,100,81,130),'#f38c62');p.poly([(87,111),(109,111),(105,119),(98,122),(91,119)],CREAM)
    p.line([(99,110),(106,103)],CREAM,2)
    p.line([(138,132),(172,137),(164,163),(180,164)],INK,10)
    p.poly([(132,95),(142,86),(158,90),(166,113),(151,135),(124,131)],'#206756')
    p.line([(153,102),(169,115),(195,110)],'#cf754f',8)
    p.line([(193,110),(214,106),(217,130)],INK,4)
    p.rect((214,99,236,109),CREAM,5)
    p.oval((136,65,159,92),'#ad654a')
    p.poly([(134,77),(134,70),(138,63),(147,60),(156,64),(160,72),(164,75),(164,79)],INK)
    p.line([(135,72),(156,69)],MINT,3)
    p.save('courier.png',grain=False)
    f=Paper(128,128,'#205944')
    f.oval((18,45,109,70),CREAM)
    f.poly([(19,59),(107,59),(99,79),(85,89),(65,94),(44,89),(28,78)],CORAL)
    f.line([(70,55),(93,25)],CREAM,5);f.line([(77,55),(105,28)],CREAM,4)
    f.save('favicon.png',grain=False)

if __name__=='__main__':
    bowl('cloud.png','#acd1bd','#346f5f')
    bowl('moon.png','#b6b9d9','#645a89',True)
    bread();tea();scooter()
