import base64,re
D='/home/claude/tepsi/'
rd=lambda p:open(D+p,encoding='utf-8').read()
head='''<title>Simulación Pediátrica 3D</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>'''+rd('src/base.css')+rd('src/extra.css')+rd('src/modulos.css')+rd('src/eedp.css')+'</style>\n'
loop='''
function loop(now){
  if(document.body.dataset.modulo!=='tepsi'){requestAnimationFrame(loop);return;}
  tweens=tweens.filter(f=>f(now));
  if(camAnim)camAnim(now);
  if(!usaGLB()&&(V.gaitW>.001||inf.pasoD||inf.pasoI||inf.puntillas)){const s=Math.sin(GAIT.fase),g=V.gaitW;inf.pasoD=Math.max(0,s)*g;inf.pasoI=Math.max(0,-s)*g;inf.puntillas=GAIT.tipo==='puntillas'?g:0;sucio=true;}
  if(usaGLB())posarGLB();
  if(MADRE.raiz)posarMadre(now);
  cuerpo.position.x=V.posX;cuerpo.position.z=V.posZ;cuerpo.rotation.y=V.rotY;
  {const dx=(V.posX-ctl.target.x)*.06;if(Math.abs(dx)>1e-4&&!camAnim&&ocupado){ctl.target.x+=dx;cam.position.x+=dx;}}
  if(sucio){let y=V.saltoY;if(!usaGLB()){mezclar();seguirCabeza();for(const k in SUELO)y+=(inf[k]||0)*SUELO[k];}cuerpo.position.y=y;cuerpo.rotation.z=V.balanceo;sucio=false;}
  sombraBlob.position.x=V.posX;sombraBlob.position.z=V.posZ;sombraBlob.material.opacity=Math.max(.25,1-V.saltoY*6);sombraBlob.scale.setScalar(1-V.saltoY*1.5);
  if(vaso.visible)vaso.position.copy(vasoPos());
  if(!reduce&&!ocupado&&!usaGLB()){const r=Math.sin(now/1000*2*Math.PI*.3);nino.scale.set(1,1+r*.004,1);}
  ctl.update();renderer.render(scene,cam);requestAnimationFrame(loop);
}
cargarCaso('A');
cargarGLB();
cargarMadre();
requestAnimationFrame(loop);
'''
main='const DATA=__DATA__;\n(()=>{\nconst $=s=>document.querySelector(s);\nconst reduce=matchMedia(\'(prefers-reduced-motion: reduce)\').matches;\n'+'\n'.join(rd('src/'+f) for f in ['datos.js','motor.js','mesa.js','anim.js','vida.js','consulta.js','ui.js'])+loop+'})();\n'
scripts='''<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/meshoptimizer@0.22.0/meshopt_decoder.js"></script>
<script>const ERNESTO_GLB="__GLB__";const MARTINA_GLB="__GLBM__";const MADRE_GLB="__GLBMA__";const NINO_GLB="__GLBN__";const POSES_GLB=__POSES__;</script>
<script>
'''+main+'</script>\n<script>const RN_GLB="__GLBRN__";\n'+rd('src/rn.js')+'\n'+rd('src/nav.js')+'\n'+rd('src/docente.js')+'</script>\n<script>'+rd('src/eedp-logica.js')+'\n'+rd('src/eedp.js')+'</script>\n'
plantilla=head+rd('src/cuerpo.html').replace('__PORTADA__',rd('src/portada.html')).replace('__RN__',rd('src/rn.html')).replace('__DOCENTE__',rd('src/docente.html')).replace('__EEDP__',rd('src/eedp.html'))+'\n'+scripts
open(D+'app.html','w',encoding='utf-8').write(plantilla)
g=base64.b64encode(open('/home/claude/glb/s_ernesto/final.glb','rb').read()).decode()
grn=base64.b64encode(open('/home/claude/glb/rn/rn-limpio.glb','rb').read()).decode()
gma=base64.b64encode(open('/home/claude/glb/madre3/final.glb','rb').read()).decode()
gm=base64.b64encode(open('/home/claude/glb/s_martina/final.glb','rb').read()).decode()
gn=base64.b64encode(open('/home/claude/glb/nino_c/nino-web.glb','rb').read()).decode()
s=plantilla.replace('__LOGO__',rd('../rn/logo.b64') if False else open('/home/claude/rn/logo.b64').read()).replace('__DATA__',rd('nino.json')).replace('__POSES__',rd('poses_ernesto.json')).replace('__GLBRN__',grn).replace('__GLBMA__',gma).replace('__GLBM__',gm).replace('__GLBN__',gn).replace('__GLB__',g)
open(D+'evaluacion-psicomotora-3d.html','w',encoding='utf-8').write(s)
t=s.replace("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","file:///tmp/claude-0/t/package/build/three.min.js").replace("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js","file:///tmp/claude-0/t/package/examples/js/controls/OrbitControls.js").replace("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js","file:///tmp/claude-0/t/package/examples/js/loaders/GLTFLoader.js").replace("https://cdn.jsdelivr.net/npm/meshoptimizer@0.22.0/meshopt_decoder.js","file:///tmp/claude-0/gt/node_modules/meshoptimizer/meshopt_decoder.js")
open('/tmp/claude-0/test3.html','w',encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>'+t+'</body></html>')
print('ok',len(s)/1e6,'MB')

v='<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style>\n<script>window.TEPSI_API_MAMA="/api/mama";</script>\n</head><body>\n'+s+'\n</body></html>\n'
open(D+'vercel/index.html','w',encoding='utf-8').write(v)
