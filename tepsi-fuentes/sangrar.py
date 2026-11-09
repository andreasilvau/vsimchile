import sys,glob,numpy as np
from PIL import Image
from scipy import ndimage
for f in glob.glob(sys.argv[1]+'/t*.png'):
  im=np.array(Image.open(f).convert('RGBA')).astype(np.float32)
  a=im[...,3];solido=a>=235
  if solido.sum()==0: continue
  _,(iy,ix)=ndimage.distance_transform_edt(~solido,return_indices=True)
  rgb=im[...,:3][iy,ix]          # color del píxel sólido más cercano
  im[...,:3]=np.where(solido[...,None],im[...,:3],rgb)
  Image.fromarray(im.clip(0,255).astype(np.uint8),'RGBA').save(f)
  print(f,'ok')
