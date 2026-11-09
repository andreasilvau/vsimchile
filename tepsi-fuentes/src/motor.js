/* ---------- Malla del niño ---------- */
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const n=DATA.n,S=DATA.S;
const q0=new Int16Array(b64(DATA.base).buffer);
const BASE=new Float32Array(n*3);for(let i=0;i<n*3;i++)BASE[i]=q0[i]*S;
const TG={};
for(const k in DATA.t){const [ii,dd]=DATA.t[k];const ix=new Uint16Array(b64(ii).buffer);const qd=new Int16Array(b64(dd).buffer);const d=new Float32Array(qd.length);for(let i=0;i<qd.length;i++)d[i]=qd[i]*S;TG[k]={idx:ix,d};}
const SUELO=DATA.suelo;
const idx=new Uint16Array(b64(DATA.idx).buffer);
const TIPOS={A:b64(DATA.col),B:b64(DATA.colB)};

const visor=$('#visor');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){$('#cargando').textContent='Este navegador no puede mostrar 3D (WebGL desactivado).';return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding=THREE.sRGBEncoding;
visor.insertBefore(renderer.domElement,visor.firstChild);
$('#cargando').remove();
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(36,4/3,.02,20);
scene.add(new THREE.HemisphereLight(0xffffff,0x8a8378,.5));
const sol=new THREE.DirectionalLight(0xfff4ea,.62);sol.position.set(1,2,1.5);scene.add(sol);
const rel=new THREE.DirectionalLight(0xcfe6ff,.25);rel.position.set(-1.2,.8,-1);scene.add(rel);
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// piso de sala
/* ---------- Box de atención primaria (escenario) ---------- */
const sombraBlob=(()=>{
  const X0=-2.2,X1=2.2,Z0=-1.7,Z1=2.9,ALTO=2.5;
  const tex=(w,h,dibujar,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;dibujar(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);}return t;};
  const std=(o)=>new THREE.MeshStandardMaterial(o);
  const caja=(w,h,d,mat,x,y,z,ry=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m;};
  const cil=(r,h,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),mat);m.position.set(x,y,z);scene.add(m);return m;};
  // piso de baldosas claras 60 x 60 cm
  const baldosa=tex(512,512,(g,w,h)=>{g.fillStyle='#a9a39a';g.fillRect(0,0,w,h);
    for(let i=0;i<2;i++)for(let j=0;j<2;j++){const v=214+((i*7+j*13)%9)-4;g.fillStyle=`rgb(${v},${v-5},${v-14})`;g.fillRect(i*256+3,j*256+3,250,250);
      for(let k=0;k<60;k++){g.fillStyle=`rgba(180,170,155,${Math.random()*.08})`;g.beginPath();g.arc(i*256+3+Math.random()*250,j*256+3+Math.random()*250,Math.random()*18,0,7);g.fill();}}},[ (X1-X0)/1.2,(Z1-Z0)/1.2 ]);
  const piso=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),std({map:baldosa,roughness:.55,metalness:0}));
  piso.rotation.x=-Math.PI/2;piso.position.set((X0+X1)/2,0,(Z0+Z1)/2);scene.add(piso);
  // muros gris azulado (solo se ven desde adentro)
  const matMuro=std({color:lin('#c3cfd6'),roughness:.9});
  const muro=(w,x,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,ALTO),matMuro);m.position.set(x,ALTO/2,z);m.rotation.y=ry;scene.add(m);
    const z0=new THREE.Mesh(new THREE.PlaneGeometry(w,.08),std({color:lin('#9aa7ae'),roughness:.6}));z0.position.set(x,.04,z);z0.rotation.y=ry;z0.translateZ(.004);scene.add(z0);};
  muro(X1-X0,(X0+X1)/2,Z0,0);muro(Z1-Z0,X0,(Z0+Z1)/2,Math.PI/2);muro(Z1-Z0,X1,(Z0+Z1)/2,-Math.PI/2);muro(X1-X0,(X0+X1)/2,Z1,Math.PI);
  scene.background=lin('#c3cfd6');
  // ventana con vidrio empavonado
  const marco=std({color:lin('#5b6166'),roughness:.4,metalness:.5});
  const vidrio=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.15),new THREE.MeshBasicMaterial({color:lin('#f4f8fb')}));vidrio.position.set(.85,1.72,Z0+.01);scene.add(vidrio);
  [[.85,2.3,1.08,.05],[.85,1.14,1.08,.06],[.33,1.72,.05,1.2],[1.37,1.72,.05,1.2],[.85,1.72,.035,1.15]].forEach(([x,y,w,h])=>caja(w,h,.06,marco,x,y,Z0+.03));
  caja(1.12,.04,.14,std({color:lin('#e9ecee'),roughness:.5}),.85,1.1,Z0+.07);
  // reloj de pared
  const reloj=new THREE.Group();
  const esf=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.03,40),[std({color:0x222222}),std({map:tex(256,256,(g)=>{g.fillStyle='#fbfbf8';g.fillRect(0,0,256,256);g.fillStyle='#222';for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillRect(128+Math.sin(a)*104-3,128-Math.cos(a)*104-8,6,16);}g.strokeStyle='#222';g.lineCap='round';g.lineWidth=7;g.beginPath();g.moveTo(128,128);g.lineTo(128+60*Math.sin(5.2),128-60*Math.cos(5.2));g.stroke();g.lineWidth=5;g.beginPath();g.moveTo(128,128);g.lineTo(128+90*Math.sin(1.1),128-90*Math.cos(1.1));g.stroke();}),roughness:.4}),std({color:0x222222})]);
  esf.rotation.x=Math.PI/2;esf.rotation.y=Math.PI;reloj.add(esf);reloj.position.set(-.25,1.95,Z0+.02);scene.add(reloj);
  // cuadro sobre la camilla (lámina de anatomía genérica)
  const lamina=tex(256,320,(g)=>{g.fillStyle='#efe6cf';g.fillRect(0,0,256,320);g.strokeStyle='#7a5b3a';g.lineWidth=2;
    for(let i=0;i<3;i++){const x=50+i*78;g.beginPath();g.arc(x,70,14,0,7);g.stroke();g.beginPath();g.moveTo(x,84);g.lineTo(x,180);g.moveTo(x-30,110);g.lineTo(x,96);g.lineTo(x+30,110);g.moveTo(x,180);g.lineTo(x-18,260);g.moveTo(x,180);g.lineTo(x+18,260);g.stroke();}
    g.fillStyle='#7a5b3a';g.fillRect(40,288,176,3);g.fillRect(70,298,116,2);});
  const cuadro=new THREE.Group();
  cuadro.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.62,.03),std({color:lin('#6b4a2e'),roughness:.6})));
  const papel=new THREE.Mesh(new THREE.PlaneGeometry(.42,.54),std({map:lamina,roughness:.9}));papel.position.z=.017;cuadro.add(papel);
  cuadro.position.set(X1-.02,1.65,-.85);cuadro.rotation.y=-Math.PI/2;scene.add(cuadro);
  // tallímetro de pared (control infantil)
  const regla=tex(64,512,(g)=>{g.fillStyle='#ffffff';g.fillRect(0,0,64,512);g.fillStyle='#1d6fa3';g.fillRect(0,0,10,512);g.fillStyle='#333';g.font='bold 16px sans-serif';
    for(let cm=0;cm<=150;cm+=1){const y=512-cm*512/150;const L=cm%10===0?26:cm%5===0?18:10;g.fillRect(10,y-1,L,cm%10===0?2:1);if(cm%10===0&&cm>0)g.fillText(String(cm),36,y+6);}});
  const tall=new THREE.Mesh(new THREE.PlaneGeometry(.11,1.5),std({map:regla,roughness:.6}));tall.position.set(-.85,.75+.02,Z0+.012);scene.add(tall);
  // espejo en el muro izquierdo
  caja(.04,1.5,.62,std({color:lin('#f2f2f2'),roughness:.5}),X0+.02,1.05,1.35);
  const esp=new THREE.Mesh(new THREE.PlaneGeometry(.54,1.42),std({map:tex(64,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#d9e2e7');gr.addColorStop(.5,'#b8c6ce');gr.addColorStop(1,'#e5ecef');g.fillStyle=gr;g.fillRect(0,0,w,h);}),roughness:.05,metalness:.3}));
  esp.position.set(X0+.045,1.05,1.35);esp.rotation.y=Math.PI/2;scene.add(esp);
  // escritorio de vidrio con estructura metálica
  const metal=std({color:lin('#a9b0b5'),roughness:.35,metalness:.8});
  const dx=-1.6,dz=-1.38;
  const cubierta=new THREE.Mesh(new THREE.BoxGeometry(1.0,.012,.58),new THREE.MeshStandardMaterial({color:lin('#b9d6dc'),transparent:true,opacity:.45,roughness:.05}));cubierta.position.set(dx,.73,dz);scene.add(cubierta);
  [[-.47,-.26],[.47,-.26],[-.47,.26],[.47,.26]].forEach(([a,b])=>caja(.025,.72,.025,metal,dx+a,.36,dz+b));
  caja(.94,.02,.02,metal,dx,.12,dz-.26);caja(.94,.012,.5,new THREE.MeshStandardMaterial({color:lin('#b9d6dc'),transparent:true,opacity:.35}),dx,.2,dz);
  caja(.22,.07,.16,std({color:lin('#2d2d2d'),roughness:.5}),dx-.25,.77,dz+.05);caja(.3,.02,.22,std({color:lin('#f5f5f5'),roughness:.9}),dx+.18,.745,dz+.06);
  // silla de escritorio negra
  const negro=std({color:lin('#1e1f22'),roughness:.55});
  const sx=-1.55,sz=-.95;
  caja(.46,.08,.44,negro,sx,.47,sz);caja(.44,.52,.07,negro,sx,.8,sz+.2);caja(.05,.04,.3,negro,sx-.24,.65,sz);caja(.05,.04,.3,negro,sx+.24,.65,sz);
  cil(.025,.4,metal,sx,.24,sz);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const m=caja(.28,.025,.04,negro,sx+Math.sin(a)*.13,.06,sz+Math.cos(a)*.13,a+Math.PI/2);}
  // dos sillas de espera tapizadas
  const beige=std({color:lin('#c8b89a'),roughness:.8});
  [.05,.62].forEach(z=>{const x=X0+.32;caja(.44,.05,.42,beige,x,.46,z);caja(.05,.4,.42,beige,x-.2,.72,z);
    [[-.18,-.17],[.18,-.17],[-.18,.17],[.18,.17]].forEach(([a,b])=>caja(.02,.46,.02,negro,x+a,.23,z+b));});
  // camilla de examen con papel y peldaño
  const cx=X1-.42,cz=-.45,L=1.85;
  const vinilo=std({color:lin('#26292c'),roughness:.45});
  caja(.64,.1,L,vinilo,cx,.75,cz);
  const resp=new THREE.Mesh(new THREE.BoxGeometry(.64,.1,.55),vinilo);resp.position.set(cx,.86,cz-L/2+.3);resp.rotation.x=-.32;scene.add(resp);
  caja(.4,.08,.22,std({color:lin('#3a3d40'),roughness:.5}),cx,.97,cz-L/2+.2);
  caja(.5,.005,.9,std({color:lin('#f7f7f5'),roughness:.95}),cx,.803,cz-.1);
  [[-.27,-.85],[.27,-.85],[-.27,.85],[.27,.85]].forEach(([a,b])=>caja(.03,.7,.03,metal,cx+a,.35,cz+b));
  caja(.58,.025,.025,metal,cx,.18,cz-.85);caja(.58,.025,.025,metal,cx,.18,cz+.85);caja(.025,.025,1.7,metal,cx-.27,.18,cz);caja(.025,.025,1.7,metal,cx+.27,.18,cz);
  caja(.4,.04,.26,std({color:lin('#2f3236'),roughness:.6}),cx-.55,.2,cz+.55);[[-.17,-.1],[.17,-.1],[-.17,.1],[.17,.1]].forEach(([a,b])=>caja(.02,.2,.02,metal,cx-.55+a,.1,cz+.55+b));
  // sombra suave bajo el niño
  const sombra=new THREE.Mesh(new THREE.PlaneGeometry(.75,.75),new THREE.MeshBasicMaterial({map:tex(128,128,(g)=>{const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(20,25,30,.55)');r.addColorStop(1,'rgba(20,25,30,0)');g.fillStyle=r;g.fillRect(0,0,128,128);}),transparent:true,depthWrite:false}));
  sombra.rotation.x=-Math.PI/2;sombra.position.y=.003;scene.add(sombra);
  const techo=new THREE.PointLight(0xfff6ea,.35,8);techo.position.set(0,2.4,.4);scene.add(techo);
  return sombra;
})();

const geo=new THREE.BufferGeometry();
const POS=new Float32Array(BASE);
geo.setAttribute('position',new THREE.BufferAttribute(POS,3));
geo.setIndex(new THREE.BufferAttribute(idx,1));
const PALS={
  A:['#e8b494','#a9cfec','#3e6189','#f2f2f2','#22305c','#6b4a2e','#f7f3ee','#2c1d17','#98c2e2','#f4f4f4','#a9cfec'],
  B:['#c98e6c','#1e2840','#1e2840','#f7f7f7','#141414','#1f1612','#f7f3ee','#21150f','#1e2840','#0c0c0c','#fbfbfb']
};
const col=new Float32Array(n*3);
geo.setAttribute('color',new THREE.BufferAttribute(col,3));
function vestir(c){const c0=c;if(c==='C')c='A';const P=PALS[c].map(lin),tipo=TIPOS[c];falda.visible=c==='B';falda.material.color.copy(P[1]);borde.visible=c==='A';borde.material.color.copy(P[1]);pelo.visible=true;melena.visible=false;coleta.visible=c==='B';moños.visible=c==='B';[casco,melena,coleta].forEach(m=>m.material.color.copy(P[5]));if(c==='A'){casco.scale.set(hrx*1.07,hry*.95,hrz*1.08);casco.rotation.x=-.45;}else{casco.scale.set(hrx*1.1,hry*.98,hrz*1.1);casco.rotation.x=-.35;}for(let i=0;i<n;i++){const k=P[tipo[i]];col[i*3]=k.r;col[i*3+1]=k.g;col[i*3+2]=k.b;}geo.attributes.color.needsUpdate=true;
  c=c0;GLB=GLBS[c];for(const k in GLBS)if(GLBS[k].raiz)GLBS[k].raiz.visible=k===c;nino.visible=false;pelo.visible=false;borde.visible=false;falda.visible=false;
  if(!GLB.raiz){$('#estadoTxt').textContent=chico()?'Cargando niño…':'Cargando niña…';document.querySelectorAll('.aplicar').forEach(b=>b.disabled=true);}}
geo.computeVertexNormals();
const nino=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7}));
const cuerpo=new THREE.Group();cuerpo.add(nino);scene.add(cuerpo);
// falda del vestido (cono abierto desde la cintura hasta sobre la rodilla)
const FD=DATA.falda,altoF=.25;
const gF=new THREE.CylinderGeometry(FD.rx*1.1,FD.rx*1.75,altoF,48,1,true);
{const p=gF.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const a=Math.atan2(z,x);const baja=y<0?1:.35;const f=1+(Math.cos(a*24)>0?.045:-.045)*baja;p.setX(i,x*f);p.setZ(i,z*f);}gF.computeVertexNormals();}
const falda=new THREE.Mesh(gF,new THREE.MeshStandardMaterial({color:0x1e2840,roughness:.85,side:THREE.DoubleSide,flatShading:true}));
falda.position.set(FD.x,FD.yTop+.035-altoF/2,FD.z+.01);falda.scale.z=.95;
falda.visible=false;cuerpo.add(falda);
// borde suelto de la polera (sobre el pantalón)
const RP=DATA.ropa;
const borde=new THREE.Mesh(new THREE.CylinderGeometry(RP.rx*1.06,RP.rx*1.13,.05,40,1,true),new THREE.MeshStandardMaterial({color:0x2f86b8,roughness:.8,side:THREE.DoubleSide}));
borde.position.set(0,RP.yHem+.004,RP.zc);borde.scale.z=RP.rz/RP.rx*1.08;borde.visible=false;cuerpo.add(borde);
// pelo largo: casquete + melena, sigue la orientación de la cabeza
const CB=DATA.cabeza,[hrx,hry,hrz]=CB.r;const _cr=CB.crown;const HC=new THREE.Vector3(CB.c[0],BASE[_cr*3+1]-hry*.95,BASE[_cr*3+2]-.006);
const pelo=new THREE.Group();pelo.matrixAutoUpdate=false;pelo.visible=false;cuerpo.add(pelo);
const matPelo=new THREE.MeshStandardMaterial({color:0x1f1612,roughness:.85,side:THREE.DoubleSide});
const casco=new THREE.Mesh(new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI*.56),matPelo);
casco.scale.set(hrx*1.1,hry*.98,hrz*1.1);casco.position.copy(HC).add(new THREE.Vector3(0,.004,0));casco.rotation.x=-.35;pelo.add(casco);
const altoM=.21;
const melena=new THREE.Mesh(new THREE.CylinderGeometry(hrx*1.1,hrx*1.55,altoM,36,4,true,Math.PI-1.75,3.5),matPelo.clone());
melena.position.copy(HC).add(new THREE.Vector3(0,-altoM/2+.02,0));melena.scale.z=hrz/hrx*1.05;pelo.add(melena);
// coleta baja y cintas blancas (peinado escolar)
const coleta=new THREE.Mesh(new THREE.CylinderGeometry(.02,.007,.15,18),matPelo.clone());
coleta.position.copy(HC).add(new THREE.Vector3(0,-.075,-hrz*1.05));coleta.rotation.x=.3;coleta.scale.set(1.15,1,1.15);pelo.add(coleta);
const moños=new THREE.Group();const matCinta=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});
for(const sx of[-1,1]){const m=new THREE.Group();
  for(const lx of[-1,1]){const lazo=new THREE.Mesh(new THREE.SphereGeometry(.013,14,10),matCinta);lazo.scale.set(1.25,.75,.5);lazo.position.x=lx*.014;m.add(lazo);}
  const nudo=new THREE.Mesh(new THREE.SphereGeometry(.007,10,8),matCinta);m.add(nudo);
  m.scale.setScalar(1.7);m.position.copy(HC).add(new THREE.Vector3(sx*.04,hry*.9,-.004));m.rotation.set(-.35,0,sx*.45);moños.add(m);}
pelo.add(moños);
const moñosVis=v=>moños.visible=v;
const vtx=i=>new THREE.Vector3(POS[i*3],POS[i*3+1],POS[i*3+2]);
function base3(){const L=vtx(CB.earL),Rr=vtx(CB.earR),C=vtx(CB.crown);const m=L.clone().add(Rr).multiplyScalar(.5);
  const x=L.sub(Rr).normalize();const y0=C.sub(m);const z=new THREE.Vector3().crossVectors(x,y0).normalize();const y=new THREE.Vector3().crossVectors(z,x);
  return {m,M:new THREE.Matrix4().makeBasis(x,y,z)};}
const B0=base3(),B0inv=B0.M.clone().invert();
function seguirCabeza(){const b=base3();const rot=b.M.clone().multiply(B0inv);
  pelo.matrix.copy(new THREE.Matrix4().makeTranslation(b.m.x,b.m.y,b.m.z).multiply(rot).multiply(new THREE.Matrix4().makeTranslation(-B0.m.x,-B0.m.y,-B0.m.z)));}
// pelota
const pelota=new THREE.Mesh(new THREE.SphereGeometry(.045,24,16),new THREE.MeshStandardMaterial({color:lin('#f3a712'),roughness:.5}));
pelota.visible=false;scene.add(pelota);
// vaso con agua para la marcha
const vaso=new THREE.Group();
vaso.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.024,.08,20,1,true),new THREE.MeshStandardMaterial({color:0xddeeff,transparent:true,opacity:.45,side:THREE.DoubleSide,roughness:.1})));
const agua=new THREE.Mesh(new THREE.CylinderGeometry(.027,.023,.06,20),new THREE.MeshStandardMaterial({color:lin('#5dade2'),transparent:true,opacity:.75}));agua.position.y=-.008;vaso.add(agua);
vaso.visible=false;scene.add(vaso);
// hoja en el piso para el salto de 20 cm
const hojaPiso=new THREE.Mesh(new THREE.PlaneGeometry(.297,.21),new THREE.MeshStandardMaterial({color:0xfafafa,roughness:.9}));
hojaPiso.rotation.x=-Math.PI/2;hojaPiso.position.set(0,.004,.24);hojaPiso.visible=false;scene.add(hojaPiso);
// cinta en el piso para la marcha punta-talón
const cinta=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.035),new THREE.MeshStandardMaterial({color:lin('#00b0e1'),roughness:.6}));
cinta.rotation.x=-Math.PI/2;cinta.position.set(0,.004,.15);cinta.visible=false;scene.add(cinta);
const _hp=n=>{const b=GLB.huesos[n];b.updateWorldMatrix(true,false);return new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);};
const palma=(s='R')=>_hp('wrist'+s).lerp(_hp('finger3-1'+s),.5);
// punto donde queda el vaso: en la palma, desplazado hacia donde mira la palma
const vasoPos=()=>{if(!usaGLB()){const p=manoPos();p.y+=.045;return p;}const w=_hp('wristR'),f=_hp('finger3-1R'),k=_hp('finger5-1R');const n=f.clone().sub(w).cross(k.clone().sub(w)).normalize();return palma('R').addScaledVector(n,.036).add(new THREE.Vector3(0,-.005,0));};
const entreManos=()=>palma('L').add(palma('R')).multiplyScalar(.5);
const manoPos=()=>{if(usaGLB())return palma('R');const i=DATA.lm.manoD;nino.updateWorldMatrix(true,false);return new THREE.Vector3(POS[i*3],POS[i*3+1],POS[i*3+2]).applyMatrix4(nino.matrixWorld);};
/* ---------- Personaje MPFB (.glb) para el caso A ---------- */
const chico=()=>caso==='A'||caso==='C';
const nuevoGLB=()=>({raiz:null,huesos:{},reposo:{},poses:{},pies:[],sueloRef:0});
const GLBS={A:nuevoGLB(),B:nuevoGLB(),C:nuevoGLB()};let GLB=GLBS.A;
const usaGLB=()=>!!GLB.raiz;
// Expresiones faciales: formas (morph targets) de la cara y las cejas + apertura de mandíbula (poses con el mismo nombre)
const EXPR={sonrisa:{sonrisa:1},
  alegria:{sonrisa:1,sonrisaAncha:1,cejasArriba:.25,ojosEntornados:.4},
  enojo:{ceno:1,labiosTensos:1,bocaCaida:.7,ojosEntornados:.5},
  miedo:{cejasArriba:.6,cejasInt:1,ojosAbiertos:1,bocaEstirada:.8,bocaCaida:.3},
  sorpresa:{cejasArriba:1,ojosAbiertos:1,bocaO:.7}};
const EXPR_JAW={sonrisa:2,alegria:4,miedo:5,sorpresa:9};
function aplicarMorph(mallas,peso,ganancia=1){
  if(!mallas||!mallas.length)return;const w={};
  for(const e in EXPR){const p=peso(e);if(p<1e-3)continue;for(const m in EXPR[e])w[m]=(w[m]||0)+EXPR[e][m]*p;}
  for(const o of mallas){const D=o.morphTargetDictionary,I=o.morphTargetInfluences;for(const m in D)I[D[m]]=Math.min(1.2,(w[m]||0)*ganancia);}
}
const EJES={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)};
function cargarGLB(){
  for(const c of ['A','B','C']){const G=GLBS[c],src=c==='A'?ERNESTO_GLB:c==='B'?MARTINA_GLB:NINO_GLB;
  try{
    const bin=Uint8Array.from(atob(src),ch=>ch.charCodeAt(0)).buffer;
    const GL=new THREE.GLTFLoader();if(window.MeshoptDecoder)GL.setMeshoptDecoder(window.MeshoptDecoder);GL.parse(bin,'',g=>{
      const r=g.scene;r.traverse(o=>{if(o.isBone){G.huesos[o.name]=o;G.reposo[o.name]=o.quaternion.clone();}if(o.isMesh){o.frustumCulled=false;if(o.morphTargetDictionary)(G.morph=G.morph||[]).push(o);}});
      for(const k in POSES_GLB)G.poses[k]=POSES_GLB[k].filter(([b])=>G.huesos[b]).map(([b,a,d])=>[G.huesos[b],EJES[a],d*Math.PI/180,claseHueso(b)]);
      G.pies=['footL','footR','toe1-1L','toe1-1R'].map(n=>G.huesos[n]).filter(Boolean);
      afinarMateriales(r);G.raiz=r;r.visible=false;cuerpo.add(r);
      const prev=GLB;GLB=G;posarGLB();G.sueloRef=minPies();posarGLB();GLB=prev;
      if(caso===c){vestir(c);sucio=true;document.querySelectorAll('.aplicar').forEach(b=>b.disabled=ocupado);$('#estadoTxt').textContent='Esperando';}
    },e=>{console.error(e);});
  }catch(e){console.error(e);}}
}
// cejas, pestañas y pelo: bordes suaves en vez del recorte duro de la transparencia
function afinarMateriales(r){r.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{const n=(m.name||'').toLowerCase();
  if(/eyebrow|eyelash/.test(n)){m.transparent=true;m.alphaTest=.01;m.depthWrite=false;o.renderOrder=2;}
  else if(m.map&&/hair|ponytail|braid|short0|bob|long0|pigtail|afro|ponytail/.test(n)){m.transparent=false;m.alphaTest=.5;m.alphaToCoverage=true;}
  m.needsUpdate=true;});});}
const _q=new THREE.Quaternion(),_v=new THREE.Vector3();
function minPies(){GLB.raiz.updateMatrixWorld(true);let m=1e9;for(const b of GLB.pies){_v.setFromMatrixPosition(b.matrixWorld);m=Math.min(m,_v.y-cuerpo.position.y-GLB.raiz.position.y);}return m;}
// Cadenas: el tronco inicia, brazos y piernas siguen, manos y pies llegan al final (con leve rebote)
const CADENA={core:[20,1],prox:[15,.85],dist:[11,.72],ext:[9,.62],cara:[0,0]};
function claseHueso(n){
  if(/^(jaw|orbicularis|oris|risorius|levator|special|oculi|temporalis|tongue|eye)/.test(n))return 'cara';
  if(/^(spine|root|pelvis|upperleg)/.test(n))return 'core';
  if(/^(upperarm|clavicle|shoulder|lowerleg|neck)/.test(n))return 'prox';
  if(/^(lowerarm|head|foot)/.test(n))return 'dist';
  return 'ext';
}
const RES={};let tAnt=performance.now();
function pesoCadena(k,cls,dt){
  const meta=inf[k]||0;if(cls==='cara'||reduce)return meta;
  const key=k+'|'+cls;let st=RES[key];if(!st)st=RES[key]={x:meta,v:0};
  const [w0,z]=CADENA[cls];const pasos=Math.max(1,Math.ceil(dt/.008)),h=dt/pasos;
  for(let i=0;i<pasos;i++){const acc=w0*w0*(meta-st.x)-2*z*w0*st.v;st.v+=acc*h;st.x+=st.v*h;}
  return st.x;
}
// mirada: hacia la examinadora, la pelota o vistazos al box
const EXAMINADORA=new THREE.Vector3(0,1.05,1.6);
const MIRAR={obj:EXAMINADORA,yaw:0,pitch:0,vy:0,vp:0,hasta:0};
const VISTAZOS=[[-1.6,.8,.35],[1.45,.85,-.4],[.2,.15,.7],[-.9,1.0,-1.5],[.6,1.4,1.4]].map(p=>new THREE.Vector3(...p));
let miraPelota=false;
const _h=new THREE.Vector3(),_d=new THREE.Vector3();
const D2R=Math.PI/180;
function rot(b,ax,rad){if(!b)return;_q.setFromAxisAngle(EJES[ax],rad);b.quaternion.multiply(_q);}
function posarGLB(){
  const now=performance.now(),dt=Math.min(.05,(now-tAnt)/1000);tAnt=now;const t=now/1000;
  const H=GLB.huesos;
  for(const n in H)H[n].quaternion.copy(GLB.reposo[n]);
  if(GLB.poses.parado)for(const [b,ax,rad] of GLB.poses.parado){_q.setFromAxisAngle(ax,rad);b.quaternion.multiply(_q);}
  for(const k in GLB.poses){if(k==='parado')continue;
    const cache={};
    for(const [b,ax,rad,cls] of GLB.poses[k]){const w=cache[cls]??(cache[cls]=pesoCadena(k,cls,dt));if(Math.abs(w)>1e-4){_q.setFromAxisAngle(ax,rad*w);b.quaternion.multiply(_q);}}
  }
  aplicarMorph(GLB.morph,e=>inf[e]||0);
  if(!reduce){
    // respiración, cambio de peso y brazos vivos
    const quieto=1-Math.min(1,(inf.unPie||0)+(inf.agacha||0)+(inf.vuelo||0)+(inf.lanzar1||0)+(inf.lanzar2||0)+(inf.lanzar3||0)+(inf.manos||0)+(inf.atrapar||0)+V.gaitW+TAND.w);
    const resp=Math.sin(t*2*Math.PI*.28);
    rot(H.spine03,'x',1.3*D2R*resp);rot(H.clavicleL,'z',1*D2R*resp);rot(H.clavicleR,'z',-1*D2R*resp);
    const peso=Math.sin(t*2*Math.PI*.11)+.35*Math.sin(t*2*Math.PI*.27+1.7);
    rot(H.spine05,'z',2.2*D2R*peso*quieto);rot(H.spine02,'z',-1.4*D2R*peso*quieto);
    rot(H.upperarm01L,'x',2.2*D2R*Math.sin(t*1.05+1)*quieto);rot(H.upperarm01R,'x',2.2*D2R*Math.sin(t*.93+2.3)*quieto);
    rot(H.lowerarm01L,'x',3*D2R*Math.sin(t*.8+.4)*quieto);rot(H.lowerarm01R,'x',3*D2R*Math.sin(t*.71+2.9)*quieto);
    for(const n of ['finger2-1L','finger3-1L','finger4-1L','finger2-1R','finger3-1R','finger4-1R'])rot(H[n],'x',6*D2R*(.5+.5*Math.sin(t*.6+n.length))*quieto);
    // equilibrio en un pie: brazos y tronco corrigen la inclinación
    const u=Math.max(inf.unPie||0,TAND.w*.8);
    if(u>.01){const b=V.balanceo;rot(H.upperarm01L,'z',b*140*D2R*u);rot(H.upperarm01R,'z',b*140*D2R*u);rot(H.spine03,'z',-b*.9*u);rot(H.head,'z',-b*.6*u);}
    // mirada
    if(!ocupado&&now>MIRAR.hasta){const otro=MIRAR.obj!==EXAMINADORA||Math.random()<.45;MIRAR.obj=otro&&MIRAR.obj===EXAMINADORA?VISTAZOS[Math.floor(Math.random()*VISTAZOS.length)]:EXAMINADORA;MIRAR.hasta=now+(MIRAR.obj===EXAMINADORA?3500+Math.random()*4000:900+Math.random()*900);}
    if(ocupado&&!miraPelota)MIRAR.obj=EXAMINADORA;
    const obj=miraPelota?pelota.position:MIRAR.obj;
    GLB.raiz.updateMatrixWorld(true);H.neck01.getWorldPosition(_h);_d.copy(obj).sub(_h).applyAxisAngle(EJES.y,-V.rotY);
    const yawM=Math.max(-55,Math.min(55,Math.atan2(_d.x,_d.z)/D2R)),pitM=Math.max(-25,Math.min(35,Math.atan2(-_d.y,Math.hypot(_d.x,_d.z))/D2R));
    const w0=7,z=.9;MIRAR.vy+=(w0*w0*(yawM-MIRAR.yaw)-2*z*w0*MIRAR.vy)*dt;MIRAR.yaw+=MIRAR.vy*dt;MIRAR.vp+=(w0*w0*(pitM-MIRAR.pitch)-2*z*w0*MIRAR.vp)*dt;MIRAR.pitch+=MIRAR.vp*dt;
    const gw=1-Math.min(1,inf.mirarAbajo||0);
    rot(H.neck02,'y',MIRAR.yaw*.4*D2R*gw);rot(H.head,'y',MIRAR.yaw*.5*D2R*gw);rot(H.neck02,'x',MIRAR.pitch*.35*D2R*gw);rot(H.head,'x',MIRAR.pitch*.55*D2R*gw);
  }
  // capa de marcha (caminar, punta de pies, punta-talón)
  const gw=V.gaitW;
  if(gw>.001){const f=GAIT.fase,T=GAIT.tipo,s=Math.sin(f),c=Math.cos(f)*GAIT.dir;
    const amp=T==='tandem'?9:T==='puntillas'?17:24,kn=T==='tandem'?16:T==='puntillas'?26:38,ba=T==='tandem'?3:14;
    rot(H.upperleg01L,'x',-amp*s*D2R*gw);rot(H.upperleg01R,'x',amp*s*D2R*gw);
    rot(H.lowerleg01L,'x',kn*Math.max(0,c)*D2R*gw);rot(H.lowerleg01R,'x',kn*Math.max(0,-c)*D2R*gw);
    rot(H.footL,'x',-8*Math.max(0,c)*D2R*gw);rot(H.footR,'x',-8*Math.max(0,-c)*D2R*gw);
    if(!(inf.llevar>.1))rot(H.upperarm01R,'x',ba*s*D2R*gw);rot(H.upperarm01L,'x',-ba*s*D2R*gw);
    rot(H.spine03,'y',3*s*D2R*gw);
    if(T==='puntillas'){rot(H.footL,'x',30*D2R*gw);rot(H.footR,'x',30*D2R*gw);}
  }
  GLB.raiz.position.y=0;GLB.raiz.updateMatrixWorld(true);
  const g=GLB.sueloRef!==undefined?GLB.sueloRef-minPies():0;
  if(TAND.w>0){GLB.raiz.position.y=g*(1-TAND.w)-TAND.drop;syncCuerpo();GLB.raiz.updateMatrixWorld(true);for(const k of ['L','R'])ikPierna(k,TAND.meta[k],TAND.pitch[k]);}
  else GLB.raiz.position.y=g;
}
/* ---------- Marcha punta-talón: cada pie se apoya en un punto fijo del piso (IK de dos huesos) ---------- */
const TAND={w:0,drop:0,meta:{L:new THREE.Vector3(),R:new THREE.Vector3()},pitch:{L:0,R:0},qRel:{},h:{},rel:{},L:.13,f:new THREE.Vector3(),izq:new THREE.Vector3()};
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_m=new THREE.Vector3(),_q2=new THREE.Quaternion(),_q3=new THREE.Quaternion(),_q4=new THREE.Quaternion();
function syncCuerpo(){cuerpo.position.set(V.posX,V.saltoY,V.posZ);cuerpo.rotation.y=V.rotY;cuerpo.rotation.z=V.balanceo;cuerpo.updateMatrixWorld(true);}
function capturarPies(){
  const H=GLB.huesos;syncCuerpo();GLB.raiz.updateMatrixWorld(true);
  TAND.f.set(Math.sin(V.rotY),0,Math.cos(V.rotY));
  const pL=H.footL.getWorldPosition(new THREE.Vector3()),pR=H.footR.getWorldPosition(new THREE.Vector3());
  TAND.izq.copy(pL).sub(pR).setY(0);TAND.izq.addScaledVector(TAND.f,-TAND.izq.dot(TAND.f)).normalize();
  _q2.setFromAxisAngle(EJES.y,V.rotY).invert();
  let lt=0;
  for(const [k,p] of [['L',pL],['R',pR]]){
    TAND.h[k]=p.y-V.saltoY;_a.set(p.x-V.posX,0,p.z-V.posZ);TAND.rel[k]={s:_a.dot(TAND.f),l:_a.dot(TAND.izq)};
    H['foot'+k].getWorldQuaternion(_q3);TAND.qRel[k]=_q2.clone().multiply(_q3);
    H['toe1-1'+k].getWorldPosition(_b);lt+=Math.hypot(_b.x-p.x,_b.z-p.z)/2;
    TAND.meta[k].copy(p);TAND.pitch[k]=0;
  }
  TAND.L=lt*1.75;
}
function ikPierna(k,meta,pitch){
  const H=GLB.huesos,up=H['upperleg01'+k],lo=H['lowerleg01'+k],ft=H['foot'+k];if(!up||!lo||!ft)return;
  up.getWorldPosition(_a);lo.getWorldPosition(_b);ft.getWorldPosition(_c);
  const a=_a.distanceTo(_b),b=_b.distanceTo(_c),d=Math.min(a+b-1e-4,Math.max(Math.abs(a-b)+1e-4,_a.distanceTo(meta)));
  const cur=_v.copy(_a).sub(_b).angleTo(_m.copy(_c).sub(_b)),des=Math.acos(Math.max(-1,Math.min(1,(a*a+b*b-d*d)/(2*a*b))));
  const delta=cur-des;rot(lo,'x',delta);lo.updateMatrixWorld(true);
  lo.getWorldPosition(_b);ft.getWorldPosition(_c);
  const nuevo=_v.copy(_a).sub(_b).angleTo(_m.copy(_c).sub(_b));
  if(Math.abs(nuevo-des)>Math.abs(cur-des)+1e-4){rot(lo,'x',-2*delta);lo.updateMatrixWorld(true);}
  ft.getWorldPosition(_c);
  _v.copy(_c).sub(_a).normalize();_m.copy(meta).sub(_a).normalize();_q2.setFromUnitVectors(_v,_m);
  up.parent.getWorldQuaternion(_q3);_q4.copy(_q3).invert().multiply(_q2).multiply(_q3);up.quaternion.premultiply(_q4);up.updateMatrixWorld(true);
  _q2.setFromAxisAngle(EJES.y,V.rotY).multiply(TAND.qRel[k]);_q2.multiply(_q4.setFromAxisAngle(EJES.x,pitch));
  ft.parent.getWorldQuaternion(_q3);ft.quaternion.copy(_q3.invert().multiply(_q2));ft.updateMatrixWorld(true);
}

const ctl=new THREE.OrbitControls(cam,renderer.domElement);
ctl.enableDamping=true;ctl.minDistance=.6;ctl.maxDistance=2.6;ctl.maxPolarAngle=Math.PI*.49;
const VISTAS={consulta:{p:[-.45,1.2,.78],t:[-1.2,.95,-.32]},frente:{p:[.6,.9,2.65],t:[0,.5,0]},lado:{p:[1.95,.95,1.55],t:[0,.42,.55]}};
let camAnim=null;
function irA(v,ms=700){const p1=new THREE.Vector3(...VISTAS[v].p),t1=new THREE.Vector3(...VISTAS[v].t),p0=cam.position.clone(),t0v=ctl.target.clone(),t0=performance.now();if(reduce)ms=1;
  return new Promise(res=>{camAnim=now=>{const k=Math.min(1,(now-t0)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam.position.lerpVectors(p0,p1,e);ctl.target.lerpVectors(t0v,t1,e);if(k>=1){camAnim=null;res();}};});}
cam.position.set(...VISTAS.frente.p);ctl.target.set(...VISTAS.frente.t);ctl.update();
function talla(){const w=visor.clientWidth,h=visor.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;
  const lado=w>=760&&w/h>.72;document.body.classList.toggle('lado',lado);
  // el panel visible (ítem o consulta) define el espacio libre; el niño se centra en ese espacio
  const P=[$('#barra'),$('#pConsulta')].find(e=>!e.hidden),dl=$('#dialogo'),vr=visor.getBoundingClientRect();
  let dx=0,dy=0,zoom=w/h<.8?.78:.9;
  if(P){const r=P.getBoundingClientRect();
    if(r.top>vr.top+h*.3){const bh=vr.bottom-r.top+12;dy=bh/2;zoom=Math.max(.5,Math.min(zoom,(h-bh)/h*1.02));}
    else{const pw=vr.right-r.left+12;dx=pw/2;dy=-h*.03;}}
  cam.zoom=zoom;cam.setViewOffset(w,h,dx,dy,w,h);cam.updateProjectionMatrix();
  const libreW=w-dx*2;dl.style.left=(libreW/2)+'px';dl.style.bottom=(dy>0?dy*2+12:24)+'px';dl.style.width=Math.min(560,libreW-24)+'px';}
const _ro=new ResizeObserver(talla);_ro.observe(visor);_ro.observe($('#barra'));_ro.observe($('#pConsulta'));talla();
document.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>{const p=b.closest('.plegable'),min=p.classList.toggle('min');b.setAttribute('aria-expanded',!min);b.setAttribute('aria-label',min?'Mostrar panel':'Minimizar panel');b.title=b.getAttribute('aria-label');talla();});

/* ---------- Motor de posturas ---------- */
const inf={};for(const k in TG)inf[k]=0;for(const k in POSES_GLB)if(!(k in inf))inf[k]=0;
let sucio=true,saltoY=0,balanceo=0;
function mezclar(){
  POS.set(BASE);
  for(const k in inf){const w=inf[k];if(Math.abs(w)<1e-4||!TG[k])continue;const {idx:ii,d}=TG[k];for(let j=0;j<ii.length;j++){const o=ii[j]*3;POS[o]+=d[j*3]*w;POS[o+1]+=d[j*3+1]*w;POS[o+2]+=d[j*3+2]*w;}}
  geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();
}
/* Expresión facial del personaje visible: 'neutral'|'sonrisa'|'alegria'|'enojo'|'miedo'|'sorpresa' */
function expresion(nombre,ms=450){
  const dest={};for(const e in EXPR)dest[e]=e===nombre?1:0;
  if(document.body.dataset.etapa==='consulta'||!GLB.raiz){MADRE.exT=dest;return Promise.resolve();}
  return tween(dest,ms).catch(()=>{});
}
const CANCEL={};let animId=0,tweens=[];
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
function tween(dest,ms,fn=ease){
  const id=animId,desde={};for(const k in dest)desde[k]=k in inf?inf[k]:V[k];
  if(reduce)ms=Math.min(ms,120);
  return new Promise((res,rej)=>{const t0=performance.now();tweens.push(now=>{if(id!==animId){rej(CANCEL);return false;}const k=Math.min(1,(now-t0)/ms),e=fn(k);for(const x in dest){const v=desde[x]+(dest[x]-desde[x])*e;if(x in inf)inf[x]=v;else V[x]=v;}sucio=true;if(k>=1){res();return false;}return true;});});
}
const V={saltoY:0,balanceo:0,posX:0,posZ:0,rotY:0,gaitW:0};
const GAIT={fase:0,tipo:'normal',dir:1};
const espera=ms=>{const id=animId;return new Promise((r,j)=>setTimeout(()=>id===animId?r():j(CANCEL),reduce?Math.min(ms,150):ms));};
const reposo=()=>{const o={};for(const k in inf)o[k]=0;return o;};

/* ---------- Voz y diálogo ---------- */
const dialogo=$('#dialogo');
let caso='A';
function voces(){try{return speechSynthesis.getVoices();}catch(e){return [];}}
// voz de mujer en español: primero Chile, luego Latinoamérica, luego España; evita voces masculinas conocidas
const FEM=/catalina|sabina|paulina|m[oó]nica|helena|laura|elvira|dalia|lupe|paloma|marisol|soledad|francisca|camila|valentina|ximena|renata|female|mujer|google espa/i;
const MASC=/lorenzo|pablo|jorge|ra[uú]l|diego|alvaro|[áa]lvaro|enrique|carlos|juan|jos[eé]|gonzalo|emilio|male(?!.*female)/i;
let _vozF=null;
function vozFemenina(){if(_vozF)return _vozF;const vs=voces().filter(v=>/^es/i.test(v.lang)&&!MASC.test(v.name));
  const orden=[/es[-_]CL/i,/es[-_](419|MX|AR|CO|PE|US)/i,/es/i];
  for(const re of orden){const f=vs.find(v=>re.test(v.lang)&&FEM.test(v.name));if(f)return _vozF=f;}
  for(const re of orden){const f=vs.find(v=>re.test(v.lang));if(f)return _vozF=f;}
  return null;}
try{speechSynthesis.onvoiceschanged=()=>{_vozF=null;};}catch(e){}
function hablarTTS(t,nino,mama){
  if($('#vozBtn').getAttribute('aria-pressed')!=='true')return;
  t=t.replace(/\([^)]*\)/g,'').trim();if(!t)return;
  try{const u=new SpeechSynthesisUtterance(t.replace(/…/g,', '));const v=vozFemenina();if(v)u.voice=v;u.lang=v?v.lang:'es-CL';u.pitch=nino?1.6:mama?1.05:1;u.rate=nino?.92:mama?.98:1;speechSynthesis.speak(u);}catch(e){}
}
const recortar=()=>{while(dialogo.children.length>3)dialogo.firstElementChild.remove();};
async function ex(t){dialogo.insertAdjacentHTML('beforeend',`<div class="msg ex"><b>Examinadora</b>${t}</div>`);recortar();hablarTTS(t,false);await espera(500+t.length*45);}
async function ni(t){
  const gesto=/^\(.*\)$/.test(t.trim());
  dialogo.insertAdjacentHTML('beforeend',`<div class="msg ni"><b>${CASOS[caso].nombre}</b>${gesto?'<i>'+t.slice(1,-1)+'</i>':t.replace(/\(([^)]*)\)/g,'<i>$1</i>')}</div>`);recortar();
  if(gesto){await espera(1100);return;}
  hablarTTS(t,true);
  const dur=Math.max(700,t.replace(/\([^)]*\)/g,'').length*80);const t0=performance.now();
  while(performance.now()-t0<dur){await tween({boca:.55},110);await tween({boca:.05},110);}
  await tween({boca:0},100);
}
const limpiarDialogo=()=>{dialogo.innerHTML='';try{speechSynthesis.cancel();}catch(e){}};

// en pantallas angostas el panel del ítem se pliega al aplicar, para ver al niño completo
$('#btnAplicar').addEventListener('click',()=>{const B=$('#barra');if(!document.body.classList.contains('lado')&&!B.classList.contains('min'))B.querySelector('[data-min]').click();});

/* ---------- La madre: sentada junto al niño, conversa en la consulta y lo mira durante el test ---------- */
const MADRE={raiz:null,H:{},R:{},hasta:0,yaw:0,pitch:0,parp:0,morph:[],ex:{},exT:{}};
const SILLA_M={x:-1.28,z:-.38};
{ // silla para la madre, orientada hacia el niño y la examinadora
  const beige=new THREE.MeshStandardMaterial({color:lin('#c8b89a'),roughness:.8}),negro=new THREE.MeshStandardMaterial({color:lin('#1e1f22'),roughness:.55});
  const g=new THREE.Group();const c=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);};
  c(.46,.05,.44,beige,0,.46,0);c(.46,.42,.05,beige,0,.72,-.21);
  [[-.2,-.19],[.2,-.19],[-.2,.19],[.2,.19]].forEach(([a,b])=>c(.022,.46,.022,negro,a,.23,b));
  g.position.set(SILLA_M.x,0,SILLA_M.z);g.rotation.y=Math.atan2(.35-SILLA_M.x,1.6-SILLA_M.z);scene.add(g);SILLA_M.ry=g.rotation.y;
}
const M_SENTADA=[['upperarm01L','z',-38],['upperarm01R','z',38],['upperarm01L','x',22],['upperarm01R','x',22],['lowerarm01L','x',-8],['lowerarm01R','x',-8],
  ['upperleg01L','x',-88],['upperleg01R','x',-88],['upperleg01L','z',9],['upperleg01R','z',-9],['upperleg01L','y',-9],['upperleg01R','y',9],['lowerleg01L','x',86],['lowerleg01R','x',86],['spine03','x',4]];
function cargarMadre(){
  try{const bin=Uint8Array.from(atob(MADRE_GLB),ch=>ch.charCodeAt(0)).buffer;
    const GL=new THREE.GLTFLoader();if(window.MeshoptDecoder)GL.setMeshoptDecoder(window.MeshoptDecoder);GL.parse(bin,'',g=>{const r=g.scene;
      r.traverse(o=>{if(o.isBone){MADRE.H[o.name]=o;MADRE.R[o.name]=o.quaternion.clone();}if(o.isMesh){o.frustumCulled=false;if(o.morphTargetDictionary)MADRE.morph.push(o);}});
      afinarMateriales(r);MADRE.raiz=r;r.rotation.y=SILLA_M.ry;scene.add(r);posarMadre(0);
      // apoyar la pelvis sobre el asiento
      r.updateMatrixWorld(true);const a=new THREE.Vector3(),b=new THREE.Vector3();MADRE.H.upperleg01L.getWorldPosition(a);MADRE.H.upperleg01R.getWorldPosition(b);a.add(b).multiplyScalar(.5);
      const atras=new THREE.Vector3(-Math.sin(SILLA_M.ry),0,-Math.cos(SILLA_M.ry)).multiplyScalar(.05);
      r.position.set(SILLA_M.x-a.x+atras.x,.485+.085-a.y,SILLA_M.z-a.z+atras.z);
    },e=>console.error(e));
  }catch(e){console.error(e);}
}
function madreHabla(txt){MADRE.hasta=performance.now()+600+txt.length*62;}
const _mq=new THREE.Quaternion(),_mv=new THREE.Vector3(),_mh=new THREE.Vector3();
function posarMadre(now){
  const H=MADRE.H;if(!H.head)return;
  for(const n in H)H[n].quaternion.copy(MADRE.R[n]);
  const r=(n,ax,d)=>{const b=H[n];if(!b)return;_mq.setFromAxisAngle(EJES[ax],d*D2R);b.quaternion.multiply(_mq);};
  for(const [n,ax,d] of M_SENTADA)r(n,ax,d);
  if(!now)return;
  const t=now/1000,habla=now<MADRE.hasta&&!reduce;
  r('spine03','x',1.2*Math.sin(t*2*Math.PI*.25));
  // mira a la examinadora cuando conversa; durante el test mira al niño
  const obj=document.body.dataset.etapa==='consulta'?cam.position:habla?EXAMINADORA:_mv.set(V.posX,.75,V.posZ);
  MADRE.raiz.updateMatrixWorld(true);H.neck01.getWorldPosition(_mh);
  const d=obj.clone().sub(_mh).applyAxisAngle(EJES.y,-SILLA_M.ry);
  const yaw=Math.max(-60,Math.min(60,Math.atan2(d.x,d.z)/D2R)),pit=Math.max(-20,Math.min(30,Math.atan2(-d.y,Math.hypot(d.x,d.z))/D2R));
  const k=reduce?1:.08;MADRE.yaw+=(yaw-MADRE.yaw)*k;MADRE.pitch+=(pit-MADRE.pitch)*k;
  r('neck02','y',MADRE.yaw*.45);r('head','y',MADRE.yaw*.5);r('neck02','x',MADRE.pitch*.4);r('head','x',MADRE.pitch*.5);
  if(habla){
    const a=Math.abs(Math.sin(t*11.5))*(.6+.4*Math.sin(t*3.1));r('jaw','x',2+7*a);
    r('head','x',2.5*Math.sin(t*2.2));r('head','z',1.5*Math.sin(t*1.3));
    const gW=.5+.5*Math.sin(t*1.7);r('upperarm01R','x',14*gW);r('lowerarm01R','x',38*gW);r('wristR','x',-15*gW);
  }else r('jaw','x',-1.2);
  {const k=reduce?1:.1;let mj=0;for(const e in EXPR){const c=MADRE.ex[e]||0,tg=MADRE.exT[e]||0;MADRE.ex[e]=c+(tg-c)*k;mj+=(EXPR_JAW[e]||0)*MADRE.ex[e];}
   if(mj>.01)r('jaw','x',mj*.75);aplicarMorph(MADRE.morph,e=>MADRE.ex[e]||0,.75);}
  // parpadeo
  if(!reduce){if(now>MADRE.parp+3800+Math.random()*900)MADRE.parp=now;const b=(now-MADRE.parp)<140?1:0;r('orbicularis03L','x',-34*b);r('orbicularis03R','x',-34*b);}
}
