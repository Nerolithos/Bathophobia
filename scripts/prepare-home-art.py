from pathlib import Path
import json
import numpy as np
from PIL import Image
p=Path(__file__).resolve().parent.parent;out=p/'assets/characters/player-detail';source=out/'home-source.png'
a=np.array(Image.open(source).convert('RGBA'));rgb=a[:,:,:3].astype('int32');mask=(a[:,:,3]>180)&~((rgb[:,:,0]>160)&(rgb[:,:,1]<80)&(rgb[:,:,2]<80));a[:,:,3]=mask*255
# One fixed scale for all 12 poses. Cropping/packing only; never redraw anatomy.
h,w=a.shape[:2]
old=json.loads((out/'manifest.json').read_text())
# Read existing palette, preserving exact game color vocabulary.
import re
art=(p/'src/player-art.js').read_text();palette=json.loads(re.search(r'"palette":(\[[^\]]+\])',art).group(1)) if '"palette":' in art else None
if palette is None:
 palette=['#34463f','#655950','#837269','#a18e7e','#b7a28f','#d6c3ac','#d7a6a1','#eec8b0','#f5d7c0','#c29e88','#d29c91','#275b4d','#4c9c77','#90b596','#f2eedc','#284638','#355b47','#4e7d60','#7f9c7b','#493b36','#6b5041','#96765a','#b29672','#c9b486','#77877f','#b5c2b7']
colors=np.array([list(bytes.fromhex(c[1:]))for c in palette],dtype=np.int32)
atlas=Image.new('RGBA',(192*4,160*3));frames={};small={str(n):{}for n in[32,40,48]}
for row in range(3):
 for col in range(4):
  cell=Image.fromarray(a[round(row*h/3):round((row+1)*h/3),round(col*w/4):round((col+1)*w/4)]);box=cell.getbbox();assert box
  crop=cell.crop(box);factor=128/247;im=crop.resize((round(crop.width*factor),round(crop.height*factor)),Image.Resampling.NEAREST);pix=np.array(im);idx=np.argmin(np.sum((pix[:,:,:3,None].transpose(0,1,3,2).astype(np.int32)-colors[None,None,:,:])**2,axis=3),axis=2);pix[:,:,:3]=colors[idx];pix[:,:,3]=(pix[:,:,3]>180)*255;pix[pix[:,:,3]==0,:3]=0;im=Image.fromarray(pix)
  # Last recovery row lies/crouches; anchor the torso, not the long tail.
  cx=im.width*(.62 if row==2 and col<2 else .54)
  frame=Image.new('RGBA',(192,160));frame.paste(im,(round(96-cx),144-im.height));atlas.paste(frame,(col*192,row*160));key=['home-climb-','home-stretch-','home-recover-'][row]+str(col);frames[key]={'x':col*192,'y':row*160}
  for n in[32,40,48]:
   k=n/128;im2=im.resize((max(1,round(im.width*k)),max(1,round(im.height*k))),Image.Resampling.NEAREST);target=Image.new('RGBA',(n+8,n+16));target.paste(im2,(round((n+8)/2-cx*k),n+10-im2.height));pix=np.array(target);idx=np.argmin(np.sum((pix[:,:,:3,None].transpose(0,1,3,2).astype(np.int32)-colors[None,None,:,:])**2,axis=3),axis=2)+1;idx[pix[:,:,3]==0]=0;v=idx.ravel();starts=np.r_[0,np.nonzero(np.diff(v))[0]+1];small[str(n)][key]=np.column_stack((np.diff(np.r_[starts,len(v)]),v[starts])).ravel().tolist()
atlas.save(out/'home-atlas.png');data={'width':192,'height':160,'baseline':144,'sourceHeight':128,'frames':frames,'small':small};(out/'home-manifest.json').write_text(json.dumps(data))
js="""/* Model-painted home gestures, packed offline. No changes to the original atlas. */
(function(root){const data=DATA;if(typeof module!=='undefined')module.exports=data;else{const base=new URL('./',document.currentScript.src);data.load=()=>{if(!data.image){data.image=new Image();data.image.src=new URL(base.pathname.endsWith('/src/')?'../assets/characters/player-detail/home-atlas.png':'characters/player-detail/home-atlas.png',base)}};root.CavePlayerHome=data}})(globalThis);
""".replace('DATA',json.dumps(data,separators=(',',':')));(p/'src/player-home.js').write_text(js)
(out/'home-art-prompt.md').write_text('''# Home gesture artwork

Generated using the built-in imagegen tool, referenced to the existing player-detail atlas. Source retained as home-source.png; home-atlas.png and home-manifest.json are offline vectorized packing derivatives. Original atlas is unchanged.

Prompt: Preserve the existing ash-taupe short-haired catgirl, green explorer dress, belt and boots and original proportions. Transparent 4×3 sheet: four back-facing ladder-climbing poses, four relaxed idle/overhead stretch poses, four side-facing recovery poses after a harmless trip. Uniform upright scale, no ladder/background/text, finite muted palette, crisp pixel clusters. Not a redesign.

Packed with NumPy/SciPy/Pillow at one fixed scale, with nearest-neighbor 32/40/48 fallbacks. No runtime Python or dependencies.
''')
