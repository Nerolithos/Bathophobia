"""Pack existing image-model poses; vectorized segmentation and palette mapping.
Run offline with Python + Pillow/numpy/scipy. Never redraws anatomy or overwrites player-art.js.
"""
from pathlib import Path
import json,time
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parent.parent;DEST=ROOT/'assets/characters/player-detail';DEST.mkdir(exist_ok=True)
PALETTE=['#34463f','#655950','#837269','#a18e7e','#b7a28f','#d6c3ac','#d7a6a1','#eec8b0','#f5d7c0','#c29e88','#d29c91','#275b4d','#4c9c77','#90b596','#f2eedc','#284638','#355b47','#4e7d60','#7f9c7b','#493b36','#6b5041','#96765a','#b29672','#c9b486','#77877f','#b5c2b7']
RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE],dtype=np.int32);start=time.time()
def quantize(a):
 rgb=a[:,:,:3].astype(np.int32);out=np.zeros_like(a)
 for y in range(0,len(a),32):
  strip=rgb[y:y+32];idx=np.argmin(np.sum((strip[:,:,None,:]-RGB[None,None,:,:])**2,axis=3),axis=2);out[y:y+32,:,:3]=RGB[idx]
 out[:,:,3]=a[:,:,3];return Image.fromarray(out)
def clean(path,opaque=False):
 a=np.array(Image.open(path).convert('RGBA'));rgb=a[:,:,:3].astype(np.int32)
 if opaque:
  bg=np.median(np.concatenate([rgb[:12].reshape(-1,3),rgb[-12:].reshape(-1,3)]),axis=0);mask=np.max(np.abs(rgb-bg),axis=2)>27
  mask=ndimage.binary_closing(mask,iterations=2);mask=ndimage.binary_fill_holes(mask)
 else:mask=(a[:,:,3]>190)&~((rgb[:,:,0]>180)&(rgb[:,:,1]<90)&(rgb[:,:,2]<90))&~((rgb[:,:,0]>170)&(rgb[:,:,1]>120)&(rgb[:,:,2]<65))
 labels,n=ndimage.label(mask);counts=np.bincount(labels.ravel());keep=counts>200;keep[0]=False;mask=keep[labels];a[:,:,3]=mask*255;return a,mask
sources={}
CONFIG={'motion':([0,460,887],343,[407,852],[['walk-'+str(i)for i in range(6)],['run-'+str(i)for i in range(6)]]),'action':([0,450,887],346,[419,858],[['jump-'+str(i)for i in range(6)],['mine-'+str(i)for i in range(6)]]),'special':([0,330,580,887],291,[306,545,861],[['idle-0','idle-1','blink-0','idle-2','stop-0','turn-0'],['swim-'+str(i)for i in range(6)],['hurt-0','hurt-1','death-0','death-1','death-2','fly-0']])}
for name,(bands,ref,bases,names)in CONFIG.items():
 a,mask=clean(ROOT/'design/character-animation/source'/f'{name}.png');labels,n=ndimage.label(mask);counts=np.bincount(labels.ravel());boxes=[]
 for label,box in enumerate(ndimage.find_objects(labels),1):
  if box and counts[label]>600:boxes.append((box[1].start,box[0].start,box[1].stop,box[0].stop))
 for row in range(len(names)):
  cells=sorted([b for b in boxes if bands[row]<=(b[1]+b[3])/2<bands[row+1]],key=lambda b:b[0]);assert len(cells)==6,(name,row,len(cells))
  for key,(x0,y0,x1,y1)in zip(names[row],cells):
   rg=a[y0:y1,x0:x1,:3].astype(np.int32);green=mask[y0:y1,x0:x1]&(rg[:,:,1]>rg[:,:,0]*1.05)&(rg[:,:,1]>rg[:,:,2]*1.06)&(rg[:,:,1]>35);ys,xs=np.nonzero(green);cx=x0+float(np.median(xs))if len(xs)else(x0+x1)/2
   sources[key]=(Image.fromarray(a[y0:y1,x0:x1]),cx-x0,bases[row]-y0,128/ref)
# Fixed cell boundaries, one scale across each authored sequence. No per-frame fit-to-box.
for filename,cols,rows,keys,ref in [('treading-outfit-variants.png',4,2,[['tread-'+str(i)for i in range(4)],['bath-tread-'+str(i)for i in range(4)]],490),('swimsuit-swim-keyframes.png',3,2,[['bath-swim-'+str(i)for i in range(3)],['bath-swim-'+str(i)for i in range(3,6)]],390)]:
 a,mask=clean(ROOT/'assets/characters/water-studies-v2'/filename,True);h,w=mask.shape
 for row in range(rows):
  for col in range(cols):
   x0,x1=round(col*w/cols),round((col+1)*w/cols);y0,y1=round(row*h/rows),round((row+1)*h/rows);cell=Image.fromarray(a[y0:y1,x0:x1]);bbox=cell.getbbox();assert bbox
   l,t,r,b=bbox;crop=cell.crop(bbox)
   # Center the torso, excluding tail and reaching hands, at the common logical actor anchor.
   cx=(col+.5)*w/cols-x0-l
   # The extended swimming body has its torso left of the face; reference cells use same anchor.
   if filename.startswith('swimsuit'):cx=(r-l)*.52
   sources[keys[row][col]]=(crop,cx,b-t,128/ref)
W,H,BASE=192,160,144;atlas=Image.new('RGBA',(W*8,H*((len(sources)+7)//8)));frames={};small={str(size):{}for size in[32,40,48]}
for i,(key,(im,cx,base,scale))in enumerate(sources.items()):
 size=(max(1,round(im.width*scale)),max(1,round(im.height*scale)));resized=quantize(np.array(im.resize(size,Image.Resampling.NEAREST)));frame=Image.new('RGBA',(W,H));x=round(W/2-cx*scale);y=round(BASE-base*scale);frame.paste(resized,(x,y));atlas.paste(frame,((i%8)*W,(i//8)*H));frames[key]={'x':(i%8)*W,'y':(i//8)*H}
 if key.startswith(('tread-','bath-')):
  for native in[32,40,48]:
   width=native+8;height=native+16;baseline=native+10;factor=native/128;out=Image.new('RGBA',(width,height));r=resized.resize((max(1,round(resized.width*factor)),max(1,round(resized.height*factor))),Image.Resampling.NEAREST);out.paste(r,(round(width/2-cx*scale*factor),round(baseline-base*scale*factor)));pixels=np.array(out);indices=np.argmin(np.sum((pixels[:,:,:3,None].transpose(0,1,3,2).astype(np.int32)-RGB[None,None,:,:])**2,axis=3),axis=2)+1;indices[pixels[:,:,3]==0]=0;v=indices.ravel();starts=np.r_[0,np.nonzero(np.diff(v))[0]+1];runs=np.column_stack((np.diff(np.r_[starts,len(v)]),v[starts])).ravel().tolist();small[str(native)][key]=runs
atlas.save(DEST/'atlas.png');data={'width':W,'height':H,'baseline':BASE,'sourceHeight':128,'frames':frames,'water':small};(DEST/'manifest.json').write_text(json.dumps(data,ensure_ascii=False));
js='''/* Offline packed original image-model artwork. */
(function(root){const data=DATA;if(typeof module!=='undefined')module.exports=data;else{let base=new URL('./',document.currentScript.src);data.load=()=>{if(!data.image){data.image=new Image();data.image.src=new URL(base.pathname.endsWith('/src/')?'../assets/characters/player-detail/atlas.png':'characters/player-detail/atlas.png',base)}};root.CavePlayerDetail=data}})(globalThis);
'''.replace('DATA',json.dumps(data,separators=(',',':')));(ROOT/'src/player-detail.js').write_text(js)
print(f'Packed {len(frames)} original poses + small water frames in {time.time()-start:.2f}s')
