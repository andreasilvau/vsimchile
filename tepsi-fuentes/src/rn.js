/* ---------- Evaluación de reflejos del recién nacido (modelo MPFB con esqueleto) ---------- */
(()=>{
const $=s=>document.querySelector(s);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const D2R=Math.PI/180;
const escH=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Casos y reflejos ---------- */
const CASOS={
  A:{nombre:'Caso A',ctx:'RN de término, parto vaginal sin complicaciones. Está en atención inmediata; corresponde el examen neurológico de rutina.',
     ficha:[['Edad gestacional','38+4 sem'],['Peso','3.320 g'],['Apgar','9 / 10'],['Horas de vida','6 h']],clave:{},
     cierre:['RN de término sano','Todos los reflejos primitivos están presentes, son vigorosos y simétricos. Es el patrón esperado y sirve como referencia para comparar los otros casos.']},
  B:{nombre:'Caso B',ctx:'RN de término, parto vaginal prolongado con distocia de hombros resuelta con maniobras. La matrona de turno nota que mueve menos un brazo.',
     ficha:[['Edad gestacional','40+2 sem'],['Peso','4.250 g'],['Apgar','8 / 9'],['Horas de vida','12 h']],clave:{moro:'asim',tna:'asim'},
     cierre:['Parálisis braquial obstétrica derecha (tipo Erb-Duchenne, C5–C6)','El Moro es asimétrico: el brazo derecho no se abduce ni se extiende y queda en aducción y rotación interna, con la muñeca flectada (postura "en propina"). La prensión palmar se conserva porque depende de C8–T1. Antecedentes clave: macrosomía y distocia de hombros. Corresponde descartar fractura de clavícula y avisar al médico.']},
  C:{nombre:'Caso C',ctx:'RN de término que nació deprimido y requirió ventilación a presión positiva en la reanimación. Está en observación en la unidad.',
     ficha:[['Edad gestacional','39+0 sem'],['Peso','3.180 g'],['Apgar','3 / 6'],['Horas de vida','4 h']],clave:{busqueda:'debil',succion:'debil',palmar:'debil',plantar:'debil',babinski:'debil',moro:'debil',tna:'debil'},
     cierre:['RN hipotónico con reflejos deprimidos','Postura en extensión ("en batracio"), succión débil y reflejos incompletos en ambos lados. En un RN con antecedente de asfixia orienta a encefalopatía hipóxico-isquémica y requiere evaluación médica inmediata, vigilancia de la alimentación y del estado de conciencia.']}
};
const REFL=[
  {id:'busqueda',nombre:'Búsqueda',tec:'Roza con el dedo la comisura labial y la mejilla, primero a un lado y luego al otro.',normal:'Gira la cabeza hacia el estímulo y abre la boca.',desap:'3–4 meses'},
  {id:'succion',nombre:'Succión',tec:'Introduce el dedo enguantado en la boca, con el pulpejo hacia el paladar.',normal:'Succión rítmica y vigorosa, con buen sello labial.',desap:'se vuelve voluntaria cerca de los 4 meses'},
  {id:'palmar',nombre:'Prensión palmar',tec:'Presiona la palma desde el borde cubital con tu dedo índice, en cada mano.',normal:'Flexión de los dedos que toman tu dedo con firmeza.',desap:'3–4 meses'},
  {id:'plantar',nombre:'Prensión plantar',tec:'Presiona con el pulgar la base de los ortejos, en cada pie.',normal:'Flexión de todos los ortejos hacia la planta.',desap:'9–12 meses'},
  {id:'babinski',nombre:'Babinski',tec:'Estimula el borde externo de la planta desde el talón hacia los ortejos.',normal:'Extensión del primer ortejo y apertura en abanico de los demás. En el RN es normal.',desap:'12–24 meses'},
  {id:'moro',nombre:'Moro',tec:'Sostén la cabeza y déjala descender unos 2–3 cm de forma brusca pero segura.',normal:'Abducción y extensión de brazos con manos abiertas, luego aducción ("abrazo") y llanto. Simétrico.',desap:'4–6 meses'},
  {id:'tna',nombre:'Tónico asimétrico del cuello',tec:'Con el RN en supino, gira suavemente su cabeza hacia un lado y luego hacia el otro.',normal:'Postura de "esgrimista": extiende brazo y pierna del lado de la cara y flecta los del lado de la nuca.',desap:'4–6 meses'}
];
const OPC=[['sim','Presente y simétrico'],['asim','Asimétrico'],['debil','Débil o ausente']];
const respCorrecta=(c,id)=>CASOS[c].clave[id]||'sim';

/* ---------- Posturas (hueso, eje, grados), por lado: D = derecho del RN, I = izquierdo ---------- */
const LADO={D:'R',I:'L'};
function lado(L,lista){const s=LADO[L],sg=L==='D'?-1:1;return lista.map(([b,ax,d])=>[b+s,ax,(ax==='y'||ax==='z')?d*sg:d]);}
const dedos=d=>['2','3','4','5'].flatMap(f=>['1','2','3'].map(j=>[`finger${f}-${j}`,'x',d]));
const pulgar=d=>[['finger1-2','x',d],['finger1-3','x',d]];
const DEF={
  brazoFlex:[['upperarm01','z',30],['upperarm01','y',-60],['lowerarm01','x',100],['wrist','x',15],...dedos(75),...pulgar(25)],
  piernaFlex:[['upperleg01','x',-80],['upperleg01','z',-35],['lowerleg01','x',105],['foot','x',-15]],
  brazoHipo:[['upperarm01','z',48],['upperarm01','y',-25],['lowerarm01','x',28],...dedos(18)],
  piernaHipo:[['upperleg01','x',-32],['upperleg01','z',-55],['upperleg01','y',-25],['lowerleg01','x',45],['foot','x',10]],
  erb:[['upperarm01','z',-28],['upperarm01','y',55],['upperarm01','x',14],['lowerarm01','x',6],['wrist','x',60],...dedos(35)],
  manoAbierta:[...dedos(-70),...pulgar(-20),['wrist','x',-15]],
  brazoPresenta:[['upperarm01','y',35],['upperarm01','z',-8],['lowerarm01','x',-45]],
  palmar:[...dedos(78),...pulgar(25)],
  plantar:[['toe1-1','x',38]],
  babinski:[['toe1-1','x',-42],['foot','x',-6]],
  moro1:[['upperarm01','z',38],['upperarm01','y',58],['upperarm01','x',-8],['lowerarm01','x',-92],['wrist','x',-18],...dedos(-72),...pulgar(-25)],
  moro2:[['upperarm01','z',-24],['upperarm01','x',30],['upperarm01','y',22],['lowerarm01','x',-22],...dedos(-30)],
  piernaMoro:[['upperleg01','x',38],['lowerleg01','x',-55],['foot','x',12]],
  brazoExt:[['upperarm01','y',58],['upperarm01','z',10],['lowerarm01','x',-90],['wrist','x',-10],...dedos(-55)],
  piernaExt:[['upperleg01','x',62],['upperleg01','z',12],['lowerleg01','x',-85],['foot','x',12]],
  brazoMasFlex:[['upperarm01','z',22],['lowerarm01','x',28]],
  piernaMasFlex:[['upperleg01','x',-18],['lowerleg01','x',18]],
  pataleo:[['upperleg01','x',-22],['lowerleg01','x',30],['foot','x',-10]]
};
const POSES={};
for(const k in DEF)for(const L of ['D','I'])POSES[k+'_'+L]=lado(L,DEF[k]);
Object.assign(POSES,{
  cabeza_D:[['neck02','y',-28],['head','y',-34],['neck02','z',4]],
  cabeza_I:[['neck02','y',28],['head','y',34],['neck02','z',-4]],
  boca:[['jaw','x',13]],
  succion:[['jaw','x',6]],
  sorpresa:[['jaw','x',9],['head','x',-6]],
  llanto:[['jaw','x',17],['head','x',-4]],
  parpadeo:[['orbicularis03L','x',-34],['orbicularis03R','x',-34]],
  sueno:[['orbicularis03L','x',-28],['orbicularis03R','x',-28]]
});

/* ---------- Escena (se crea al abrir el módulo) ---------- */
let listo=false,iniciado=false,renderer,scene,cam,ctl,modelo,raiz,H={},REST={},guante,camAnim=null,visor;
const inf={};for(const k in POSES)inf[k]=0;
let tweens=[],animId=0,ocupado=false,caso='A',vistaActual='arriba';
const CANCEL={};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
function tween(dest,ms){const id=animId,desde={};for(const k in dest)desde[k]=inf[k]||0;if(reduce)ms=Math.min(ms,120);
  return new Promise((res,rej)=>{const t0=performance.now();tweens.push(now=>{if(id!==animId){rej(CANCEL);return false;}const k=Math.min(1,(now-t0)/ms),e=ease(k);for(const x in dest)inf[x]=desde[x]+(dest[x]-desde[x])*e;if(k>=1){res();return false;}return true;});});}
const espera=ms=>{const id=animId;return new Promise((r,j)=>setTimeout(()=>id===animId?r():j(CANCEL),reduce?Math.min(ms,150):ms));};

function basePostura(c){
  const b={};
  if(c==='C'){b.brazoHipo_D=b.brazoHipo_I=b.piernaHipo_D=b.piernaHipo_I=1;b.sueno=.75;}
  else{b.brazoFlex_I=b.piernaFlex_D=b.piernaFlex_I=1;if(c==='B')b.erb_D=1;else b.brazoFlex_D=1;}
  return b;
}
let base=basePostura('A');
const reposo=()=>{const o={};for(const k in inf)o[k]=base[k]||0;return o;};

// sala de atención inmediata: piso clínico, muros, cuna radiante con lámpara, panel de gases, monitor, carro y reloj
function salaAtencion(mat){
  const Y0=-.66,add=(g,m,x,y,z,rx=0,ry=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,0);scene.add(o);return o;};
  const caja=(w,h,d,m,x,y,z,ry=0)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,0,ry);
  const tx=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);}return t;};
  scene.background=lin('#d7e4e6');
  // piso vinílico clínico con motas
  const pisoT=tx(256,256,(g,w,h)=>{g.fillStyle='#cfd8d3';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=`rgba(${90+Math.random()*60},${110+Math.random()*50},${105+Math.random()*40},${Math.random()*.25})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}},[6,6]);
  add(new THREE.PlaneGeometry(6,6),new THREE.MeshStandardMaterial({map:pisoT,roughness:.5}),0,Y0,0,-Math.PI/2);
  // muros verde agua con guardamuro
  const muro=mat('#cfe2df',{roughness:.95}),guarda=mat('#9fbfba',{roughness:.6});
  for(const [x,z,ry,w] of [[0,-1.6,0,6],[-2.2,0,Math.PI/2,6],[2.2,0,-Math.PI/2,6],[0,2.6,Math.PI,6]]){add(new THREE.PlaneGeometry(w,3),muro,x,Y0+1.5,z,0,ry);const gm=add(new THREE.PlaneGeometry(w,.12),guarda,x,Y0+.9,z,0,ry);gm.translateZ(.005);}
  // estructura de la cuna radiante: columna y cabezal calefactor sobre el RN
  const metal=mat('#d9dee2',{roughness:.35,metalness:.6}),gris=mat('#8d979e',{roughness:.5,metalness:.4}),blanco=mat('#f1f3f4',{roughness:.5});
  caja(.12,1.95,.12,blanco,0,Y0+.98,-.56);
  caja(.1,.08,.6,blanco,0,1.24,-.28);
  const cab=caja(.5,.1,.36,blanco,0,1.22,.02);
  add(new THREE.PlaneGeometry(.42,.28),new THREE.MeshBasicMaterial({color:lin('#ffb36b')}),0,1.168,.02,Math.PI/2);
  const calor=new THREE.PointLight(0xffa860,.35,1.6);calor.position.set(0,1.1,.02);scene.add(calor);
  // panel de control con pantalla de temperatura
  const pan=tx(256,160,(g)=>{g.fillStyle='#1d2a33';g.fillRect(0,0,256,160);g.fillStyle='#4fe08a';g.font='bold 54px monospace';g.fillText('36.8',28,78);g.font='20px sans-serif';g.fillStyle='#9fd7ff';g.fillText('°C piel   SERVO',30,120);});
  caja(.34,.24,.06,blanco,0,.52,-.5);add(new THREE.PlaneGeometry(.28,.17),new THREE.MeshBasicMaterial({map:pan}),0,.52,-.468);
  // ruedas del mueble
  for(const [x,z] of [[-.3,-.42],[.3,-.42],[-.3,.42],[.3,.42]])add(new THREE.CylinderGeometry(.04,.04,.03,14),gris,x,Y0+.04,z,0,0).rotation.z=Math.PI/2;
  // repisa lateral con insumos: bolsa de reanimación, estetoscopio, toalla
  caja(.26,.02,.5,metal,.5,-.02,-.05);
  caja(.08,.3,.02,metal,.37,-.17,-.05);
  const bolsa=add(new THREE.SphereGeometry(.05,16,12),mat('#2f7fb8',{roughness:.4}),.52,.03,-.15);bolsa.scale.set(1.6,1,1);
  add(new THREE.CylinderGeometry(.028,.034,.04,16),mat('#2b2b2b'),.6,.02,-.15).rotation.z=Math.PI/2;
  caja(.18,.03,.16,mat('#ffffff',{roughness:1}),.5,.005,.12);
  const est=add(new THREE.TorusGeometry(.05,.005,8,24,Math.PI*1.4),mat('#222'),.5,.01,.0,Math.PI/2);
  // panel de gases y aspiración en el muro
  caja(1.1,.22,.06,blanco,0,Y0+1.55,-1.57);
  [[-.35,'#3b7d3e'],[-.12,'#e8e8e8'],[.12,'#f2c94c'],[.35,'#2e5aa8']].forEach(([x,c])=>{add(new THREE.CylinderGeometry(.025,.025,.04,16),mat(c,{roughness:.4}),x,Y0+1.55,-1.53,Math.PI/2);});
  const flujo=add(new THREE.CylinderGeometry(.03,.03,.16,14),mat('#e9f6ff',{transparent:true,opacity:.6,roughness:.1}),-.35,Y0+1.4,-1.5);
  // monitor de signos vitales en brazo
  const mon=tx(320,200,(g)=>{g.fillStyle='#0b1218';g.fillRect(0,0,320,200);g.strokeStyle='#3df28b';g.lineWidth=3;g.beginPath();for(let x=0;x<220;x++){const k=x%55;const y=60-(k===20?40:k===22?-14:k>24&&k<34?Math.sin((k-24)/10*Math.PI)*8:0);x?g.lineTo(x+8,y):g.moveTo(8,y);}g.stroke();
    g.strokeStyle='#4fc3ff';g.beginPath();for(let x=0;x<220;x++){const y=135-Math.max(0,Math.sin(x/55*2*Math.PI))*22;x?g.lineTo(x+8,y):g.moveTo(8,y);}g.stroke();
    g.fillStyle='#3df28b';g.font='bold 40px monospace';g.fillText('142',236,62);g.fillStyle='#4fc3ff';g.fillText('97',248,148);g.font='14px sans-serif';g.fillStyle='#9aa';g.fillText('FC',236,24);g.fillText('SpO2',236,110);});
  caja(.04,.04,.5,gris,-.55,1.0,-1.32);
  caja(.42,.3,.05,mat('#2a3138',{roughness:.4}),-.55,1.0,-1.06);add(new THREE.PlaneGeometry(.38,.25),new THREE.MeshBasicMaterial({map:mon}),-.55,1.0,-1.034);
  // carro de insumos a un costado
  caja(.5,.8,.45,mat('#e7ecef',{roughness:.6}),1.35,Y0+.42,-.9);
  for(let i=0;i<4;i++){caja(.46,.16,.01,mat(['#d9534f','#f0ad4e','#5bc0de','#5cb85c'][i],{roughness:.5}),1.35,Y0+.18+i*.19,-.67);}
  // reloj de pared (minuto de vida)
  const rel=tx(128,128,(g)=>{g.fillStyle='#fff';g.beginPath();g.arc(64,64,62,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=5;g.stroke();g.fillStyle='#222';for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillRect(64+Math.sin(a)*50-2,64-Math.cos(a)*50-5,4,10);}g.lineWidth=4;g.beginPath();g.moveTo(64,64);g.lineTo(64+30,64-12);g.moveTo(64,64);g.lineTo(64-6,20);g.stroke();g.strokeStyle='#d33';g.lineWidth=2;g.beginPath();g.moveTo(64,64);g.lineTo(100,90);g.stroke();});
  add(new THREE.CircleGeometry(.16,32),new THREE.MeshStandardMaterial({map:rel,roughness:.6}),.95,Y0+1.95,-1.59);
  // luz cálida general de la sala
  const amb=new THREE.PointLight(0xfff3e4,.25,6);amb.position.set(.6,1.6,1.2);scene.add(amb);
}
function iniciar(){
  if(iniciado)return;iniciado=true;
  visor=$('#rnVisor');
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){$('#rnCargando').textContent='Este navegador no puede mostrar 3D (WebGL desactivado).';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  visor.insertBefore(renderer.domElement,visor.firstChild);
  scene=new THREE.Scene();
  cam=new THREE.PerspectiveCamera(34,4/3,.01,10);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8aa0b4,.6));
  const lampara=new THREE.DirectionalLight(0xfff1e2,.85);lampara.position.set(.15,1.4,.3);scene.add(lampara);
  const rel=new THREE.DirectionalLight(0xd5e8ff,.3);rel.position.set(-.8,.5,-.6);scene.add(rel);
  // cuna radiante: colchón, sábana, paredes de acrílico y mueble
  const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:lin(c),roughness:.85},o));
  const colchon=new THREE.Mesh(new THREE.BoxGeometry(.62,.06,.86),mat('#9ec3d6'));colchon.position.y=-.03;scene.add(colchon);
  const sabT=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#bfe0ef';g.fillRect(0,0,256,256);g.fillStyle='#f7fbff';for(let y=0;y<256;y+=32)for(let x=(y/32%2)*16;x<256;x+=32){g.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?3:7;g.lineTo(x+8+Math.cos(a)*r,y+8+Math.sin(a)*r);}g.fill();}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,4);return t;})();
  const sabana=new THREE.Mesh(new THREE.BoxGeometry(.6,.004,.84),new THREE.MeshStandardMaterial({map:sabT,roughness:.95}));sabana.position.y=.002;scene.add(sabana);
  const acr=mat('#cfe7f5',{transparent:true,opacity:.1,roughness:.1,depthWrite:false});
  for(const [w,d,x,z] of [[.64,.006,0,.435],[.64,.006,0,-.435],[.006,.88,.32,0],[.006,.88,-.32,0]]){const p=new THREE.Mesh(new THREE.BoxGeometry(w,.13,d),acr);p.position.set(x,.035,z);scene.add(p);}
  const mueble=new THREE.Mesh(new THREE.BoxGeometry(.7,.6,.92),mat('#c9d3da'));mueble.position.y=-.36;scene.add(mueble);
  salaAtencion(mat);
  // mano enguantada del examinador (nitrilo azul): índice extendido, resto de los dedos recogidos; el origen es la punta del dedo
  guante=new THREE.Group();
  {const gm=mat('#8fb7e8',{roughness:.4}),pu=mat('#a9c8ee',{roughness:.5}),ma=mat('#f1f4f7',{roughness:.85});
   const V=(x,y,z)=>new THREE.Vector3(x,y,z);
   const seg=(a,b,r,m)=>{const A=V(...a),B=V(...b),d=B.clone().sub(A),L=d.length();
     const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,14),m);c.position.copy(A).add(B).multiplyScalar(.5);c.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());guante.add(c);
     for(const P of [A,B]){const e=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),m);e.position.copy(P);guante.add(e);}};
   const bola=(p,sc,m)=>{const e=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),m);e.position.set(...p);e.scale.set(...sc);guante.add(e);};
   const R0=.0048;
   seg([0,R0,0],[0,.056,0],R0,gm);                              // índice extendido
   bola([-.004,.088,0],[.034,.034,.017],gm);                    // palma y dorso
   // tres dedos recogidos (medio, anular, meñique): tres falanges que se enroscan hacia la palma, cada uno de largo distinto
   [[-.0105,1,.066],[-.021,.96,.064],[-.0305,.8,.06]].forEach(([x,k,y0])=>{
     const r=.0051*k+.0006;
     seg([x,y0+.004,.003],[x,y0-.017*k,.011],r,gm);                       // falange proximal (nudillo)
     seg([x,y0-.017*k,.011],[x,y0-.021*k,.026],r*.95,gm);                // falange media
     seg([x,y0-.021*k,.026],[x,y0-.009*k,.031],r*.88,gm);               // falange distal, la punta vuelve hacia la palma
   });
   bola([-.012,.07,-.008],[.024,.008,.006],gm);                             // relieve de los nudillos en el dorso
   // pulgar: sale del lado de la palma y se apoya sobre los dedos recogidos
   seg([.027,.09,.004],[.031,.073,.012],.0066,gm);seg([.031,.073,.012],[.021,.058,.025],.006,gm);seg([.021,.058,.025],[.008,.054,.031],.0054,gm);
   const pun=new THREE.Mesh(new THREE.CylinderGeometry(.0275,.0255,.03,20),pu);pun.position.set(-.004,.13,0);guante.add(pun);  // puño del guante
   const man=new THREE.Mesh(new THREE.CylinderGeometry(.032,.026,.2,20),ma);man.position.set(-.004,.245,0);guante.add(man);  // manga
  }
  guante.visible=false;scene.add(guante);
  // cámara
  ctl=new THREE.OrbitControls(cam,renderer.domElement);
  ctl.enableDamping=true;ctl.minDistance=.14;ctl.maxDistance=2.2;ctl.maxPolarAngle=Math.PI*.47;
  ctl.addEventListener('start',()=>{$('#rnPista').classList.add('fuera');});
  cam.position.set(...VISTAS.arriba.p);ctl.target.set(...VISTAS.arriba.t);ctl.update();
  new ResizeObserver(talla).observe(visor);new ResizeObserver(talla).observe($('#rnPanel'));talla();
  cargarModelo();
  requestAnimationFrame(loop);
}
const VISTAS={arriba:{p:[.25,1.05,.95],t:[0,.0,-.05]},pies:{p:[.15,.62,1.35],t:[0,.08,-.15]},lado:{p:[1.35,.6,.35],t:[0,.08,-.05]}};
function irA(pos,tgt,ms=700){const p0=cam.position.clone(),t0v=ctl.target.clone(),t0=performance.now();if(reduce)ms=1;
  return new Promise(res=>{camAnim=now=>{const k=Math.min(1,(now-t0)/ms),e=ease(k);cam.position.lerpVectors(p0,pos,e);ctl.target.lerpVectors(t0v,tgt,e);if(k>=1){camAnim=null;res();}};});}
const vista=(v,ms)=>{vistaActual=v;document.querySelectorAll('[data-rnv]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.rnv===v));return irA(new THREE.Vector3(...VISTAS[v].p),new THREE.Vector3(...VISTAS[v].t),ms);};
document.querySelectorAll('[data-rnv]').forEach(b=>b.onclick=()=>{if(iniciado)vista(b.dataset.rnv);});
$('#rnGorro').onclick=()=>{const b=$('#rnGorro'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);if(gorroG)gorroG.visible=on;};
function talla(){
  const w=visor.clientWidth,h=visor.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;
  const P=$('#rnPanel'),vr=visor.getBoundingClientRect(),r=P.getBoundingClientRect();let dx=0,dy=0,zoom=Math.min(1,w/h*1.5);
  if(r.top>vr.top+h*.3){const bh=vr.bottom-r.top+12;dy=bh/2;zoom=Math.max(.5,Math.min(zoom,(h-bh)/h*1.05));}
  else{dx=(vr.right-r.left+12)/2;}
  cam.zoom=zoom;cam.setViewOffset(w,h,dx,dy,w,h);cam.updateProjectionMatrix();
  const a=$('#rnAccion');a.style.left=((w-dx*2)/2)+'px';a.style.bottom=(dy>0?dy*2+12:16)+'px';a.style.maxWidth=Math.min(560,w-dx*2-24)+'px';
}

/* ---------- Modelo ---------- */
const ESCALA=.52/.686;   // ~52 cm de longitud
function cargarModelo(){
  try{
    const bin=Uint8Array.from(atob(RN_GLB),ch=>ch.charCodeAt(0)).buffer;
    new THREE.GLTFLoader().parse(bin,'',g=>{
      modelo=g.scene;let malla=null;
      modelo.traverse(o=>{if(o.isBone){H[o.name]=o;}if(o.isSkinnedMesh){malla=o;o.frustumCulled=false;}});
      modelo.updateMatrixWorld(true);
      const pos=n=>new THREE.Vector3().setFromMatrixPosition(H[n].matrixWorld);
      // proporciones de recién nacido: cabeza algo mayor
      if(H.head)H.head.scale.setScalar(1.1);
      for(const n in H)REST[n]=H[n].quaternion.clone();
      if(malla)vestir(malla,pos);
      ojos(pos);interiorBoca(pos);gorro(pos);
      // acostado de espalda, cabeza hacia el fondo de la cuna
      raiz=new THREE.Group();const acostar=new THREE.Group();acostar.rotation.x=-Math.PI/2;
      modelo.scale.setScalar(ESCALA);acostar.add(modelo);raiz.add(acostar);
      acostar.position.set(0,.045,.2);scene.add(raiz);
      listo=true;$('#rnCargando').remove();cargarCaso(caso);
    },e=>{console.error(e);$('#rnCargando').textContent='No se pudo cargar el modelo del RN.';});
  }catch(e){console.error(e);}
}
// piel por vértices (cabello fino, manos y pies más rosados) y un pañal como malla propia sobre la piel
function vestir(malla,pos){
  const geo=malla.geometry,P=geo.attributes.position,N=geo.attributes.normal,n=P.count;
  const SI=geo.attributes.skinIndex,SW=geo.attributes.skinWeight,huesos=malla.skeleton.bones;
  const col=new Float32Array(n*3);
  const piel=lin('#eaaf9a'),pelo=lin('#5b4334'),rosa=lin('#e29a8c'),mej=lin('#e08a80'),labio=lin('#c9707a'),ceja=lin('#8a6a5c'),oreja=lin('#e39a8e');
  const ojo=pos('eyeL'),boca=pos('oris05'),ojoD=pos('eyeR');
  const gauss=(v,c,rx,ry,rz)=>Math.exp(-(((v.x-c.x)/rx)**2+((v.y-c.y)/ry)**2+((v.z-c.z)/rz)**2));
  const v=new THREE.Vector3();
  const comp=(A,i,k)=>{const x=k===0?A.getX(i):k===1?A.getY(i):k===2?A.getZ(i):A.getW(i);const arr=A.array||A.data.array;return A.normalized?x/(arr instanceof Uint8Array?255:arr instanceof Uint16Array?65535:1):x;};
  const dom=i=>{let m=0,b=0;for(let k=0;k<4;k++){const w=comp(SW,i,k);if(w>m){m=w;b=comp(SI,i,k);}}return huesos[b].name;};
  const enPanal=new Uint8Array(n);
  for(let i=0;i<n;i++){
    v.fromBufferAttribute(P,i);let c=piel;const ax=Math.abs(v.x),d=dom(i),muslo=/^(upper|lower)leg/.test(d);
    if(v.y<.35&&ax<.1&&(muslo?(v.y>.272+(ax-.04)*.3):v.y>.2))enPanal[i]=1;
    if(enPanal[i])c=lin('#f3f5f7');
    else if(v.y>ojo.y+.028&&v.z<.05&&(v.y>ojo.y+.05||v.z<.0)){const k=Math.min(1,(v.y-ojo.y-.028)/.03);c=piel.clone().lerp(pelo,.55*k);}
    else if(v.y<.03||(ax>.16&&v.y<.4)){c=piel.clone().lerp(rosa,.5);}
    if(!enPanal[i]){
      c=c.clone();
      const cm=Math.max(gauss(v,{x:ojo.x*2.1,y:ojo.y-.03,z:ojo.z},.02,.022,.04),gauss(v,{x:ojoD.x*2.1,y:ojoD.y-.03,z:ojoD.z},.02,.022,.04));
      if(cm>.02)c.lerp(mej,.7*cm);
      const lb=gauss(v,{x:boca.x,y:boca.y-.001,z:boca.z},.016,.007,.03);if(lb>.03)c.lerp(labio,.65*lb);
      const cj=Math.max(gauss(v,{x:ojo.x,y:ojo.y+.02,z:ojo.z},.022,.008,.03),gauss(v,{x:ojoD.x,y:ojoD.y+.02,z:ojoD.z},.022,.008,.03));if(cj>.03)c.lerp(ceja,.55*cj);
      if(ax>.06&&v.y>ojo.y-.04&&v.y<ojo.y+.03&&v.z<ojo.z-.02)c.lerp(oreja,.35);
    }
    col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  malla.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.58,skinning:true});
  // pañal: triángulos de la zona, desplazados sobre la piel y con su propio color
  const I=geo.index.array,tri=[];
  const yv=k=>P.getY(k);
  for(let f=0;f<I.length;f+=3)if(enPanal[I[f]]&&enPanal[I[f+1]]&&enPanal[I[f+2]]&&Math.min(yv(I[f]),yv(I[f+1]),yv(I[f+2]))>.256)tri.push(I[f],I[f+1],I[f+2]);
  const usados=new Map();const borde=new Uint8Array(n);
  // vértices del borde (vecinos fuera del pañal) para el puño elástico
  for(let f=0;f<I.length;f+=3){const a=enPanal[I[f]]+enPanal[I[f+1]]+enPanal[I[f+2]];if(a>0&&a<3)for(let k=0;k<3;k++)if(enPanal[I[f+k]])borde[I[f+k]]=1;}
  const mapa=x=>{if(!usados.has(x))usados.set(x,usados.size);return usados.get(x);};
  const idx=tri.map(mapa),m=usados.size;
  const pD=new Float32Array(m*3),nD=new Float32Array(m*3),cD=new Float32Array(m*3),siD=new Float32Array(m*4),swD=new Float32Array(m*4);
  const blanco=lin('#fbfcfd'),pretina=lin('#cde5f5'),puno=lin('#e6eef4'),linea=lin('#efe2a6'),cinta=lin('#8fc3e8'),estampa=lin('#e3f0fa');
  const nn=new THREE.Vector3();
  for(const [o,k] of usados){
    v.fromBufferAttribute(P,o);nn.fromBufferAttribute(N,o);const ax=Math.abs(v.x);
    const grosor=(v.y<.29&&ax<.05)?.0075:.006;
    v.addScaledVector(nn,grosor);pD.set([v.x,v.y,v.z],k*3);nD.set([nn.x,nn.y,nn.z],k*3);
    for(let c=0;c<4;c++){siD[k*4+c]=comp(SI,o,c);swD[k*4+c]=comp(SW,o,c);}
    let c=blanco;
    if(v.y>.338)c=pretina;
    else if(borde[o])c=puno;
    else if(ax<.0026&&v.z>.035&&v.y>.295&&v.y<.33)c=linea;                       // línea indicadora de humedad
    else if(ax>.068&&v.y>.315&&v.z<.03)c=cinta;                          // cintas laterales
    else if(v.z>.04&&v.y>.3&&ax<.032&&((Math.round(v.x*900)+Math.round(v.y*900))%7===0))c=estampa;
    cD.set([c.r,c.g,c.b],k*3);
  }
  // suavizado para que el borde de la entrepierna quede redondeado y sin puntas
  const vec=Array.from({length:m},()=>new Set());
  for(let t=0;t<idx.length;t+=3)for(let a=0;a<3;a++)for(let b=0;b<3;b++)if(a!==b)vec[idx[t+a]].add(idx[t+b]);
  for(let it=0;it<4;it++){const q=pD.slice();for(let k=0;k<m;k++){const nb=vec[k];if(!nb.size)continue;let x=0,y=0,z=0;for(const o of nb){x+=q[o*3];y+=q[o*3+1];z+=q[o*3+2];}const c=nb.size,w=q[k*3+1]<.3?.6:.35;pD[k*3]=q[k*3]*(1-w)+x/c*w;pD[k*3+1]=q[k*3+1]*(1-w)+y/c*w;pD[k*3+2]=q[k*3+2]*(1-w)+z/c*w;}}
  const gD=new THREE.BufferGeometry();
  gD.setAttribute('position',new THREE.BufferAttribute(pD,3));gD.setAttribute('normal',new THREE.BufferAttribute(nD,3));gD.setAttribute('color',new THREE.BufferAttribute(cD,3));
  gD.setAttribute('skinIndex',new THREE.BufferAttribute(siD,4));gD.setAttribute('skinWeight',new THREE.BufferAttribute(swD,4));
  gD.setIndex(idx);gD.computeVertexNormals();
  const panal=new THREE.SkinnedMesh(gD,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,skinning:true}));
  panal.frustumCulled=false;malla.parent.add(panal);panal.position.copy(malla.position);panal.quaternion.copy(malla.quaternion);panal.scale.copy(malla.scale);
  panal.bind(malla.skeleton,malla.bindMatrix);
}
// globos oculares del tamaño de la órbita: esclera, iris grande y pupila, fijos a la cabeza
function ojos(pos){
  const cab=H.head;if(!cab)return;
  const M=(c,r)=>new THREE.MeshStandardMaterial({color:lin(c),roughness:r});
  const esc=M('#f2efec',.25),iri=M('#3d4656',.3),pup=M('#101218',.2);
  const qi=new THREE.Quaternion();cab.getWorldQuaternion(qi);qi.invert();
  const R=.0163;
  for(const s of ['L','R']){const p=pos('eye'+s);
    const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(R,28,20),esc));
    const iris=new THREE.Mesh(new THREE.SphereGeometry(R*1.004,28,10,0,Math.PI*2,0,.47),iri);iris.rotation.x=Math.PI/2;g.add(iris);
    const pupila=new THREE.Mesh(new THREE.SphereGeometry(R*1.008,20,6,0,Math.PI*2,0,.2),pup);pupila.rotation.x=Math.PI/2;g.add(pupila);
    g.position.copy(cab.worldToLocal(p.clone().add(new THREE.Vector3(0,-.0005,.001))));g.quaternion.copy(qi);
    cab.add(g);}
}
// interior de la boca: fondo oscuro (evita ver a través de la cabeza) y lengua que sigue a la mandíbula
function interiorBoca(pos){
  const cab=H.head,mand=H.jaw;if(!cab||!mand)return;
  const m=pos('oris05');
  const fondo=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshStandardMaterial({color:lin('#6a2f35'),roughness:.8,side:THREE.DoubleSide}));
  fondo.position.copy(cab.worldToLocal(m.clone().add(new THREE.Vector3(0,-.003,-.022))));
  fondo.scale.set(.024,.02,.026).divideScalar(1.1);cab.add(fondo);
  const len=new THREE.Mesh(new THREE.SphereGeometry(1,24,14),new THREE.MeshStandardMaterial({color:lin('#d98a8e'),roughness:.55}));
  len.position.copy(mand.worldToLocal(m.clone().add(new THREE.Vector3(0,-.0125,-.016))));
  len.scale.set(.011,.005,.017);mand.add(len);
}
// gorro de punto de maternidad: casquete tejido con franjas y borde enrollado, fijo a la cabeza
let gorroG=null;
function gorro(pos){
  const cab=H.head;if(!cab)return;
  const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');
  g.fillStyle='#f6f4ef';g.fillRect(0,0,256,256);
  [['#7fb9de',70],['#f2a7b6',96],['#7fb9de',122]].forEach(([col,y])=>{g.fillStyle=col;g.fillRect(0,y,256,12);});
  for(let x=0;x<256;x+=8)for(let y=0;y<256;y+=8){g.fillStyle='rgba(0,0,0,.06)';g.beginPath();g.ellipse(x+4,y+4,2.2,3.4,0,0,7);g.fill();}  // puntos del tejido
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.repeat.set(6,1);
  const m=new THREE.MeshStandardMaterial({map:t,roughness:1});
  // casquete elipsoidal ajustado a la cabeza (medidas del modelo), abierto en la frente y la nuca
  const G=new THREE.Group(),T=1.62;
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1,48,24,0,Math.PI*2,0,T),m));
  const borde=new THREE.Mesh(new THREE.TorusGeometry(Math.sin(T),.045,12,64),new THREE.MeshStandardMaterial({color:lin('#f6f4ef'),roughness:1}));
  borde.rotation.x=Math.PI/2;borde.position.y=Math.cos(T);G.add(borde);
  const nudo=new THREE.Mesh(new THREE.SphereGeometry(.16,14,10),m);nudo.position.y=1.02;G.add(nudo);
  G.position.copy(cab.worldToLocal(new THREE.Vector3(0,.6,.006)));
  const qi=new THREE.Quaternion();cab.getWorldQuaternion(qi);qi.invert();
  G.quaternion.copy(qi).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.3));
  G.scale.set(.058,.071,.078);
  cab.add(G);gorroG=G;
}
function posar(){
  for(const n in H)H[n].quaternion.copy(REST[n]);
  const q=new THREE.Quaternion(),EJ={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)};
  for(const k in POSES){const w=inf[k];if(Math.abs(w)<1e-4)continue;
    for(const [b,ax,d] of POSES[k]){const h=H[b];if(!h)continue;q.setFromAxisAngle(EJ[ax],d*D2R*w);h.quaternion.multiply(q);}}
}
// puntos de referencia del cuerpo, en coordenadas del mundo
function lmPos(k){
  const L=k.slice(-1),s=LADO[L]||'',sg=L==='D'?-1:1;
  const bp=n=>{const v=new THREE.Vector3();H[n].getWorldPosition(v);return modelo.worldToLocal(v);};
  let p;
  switch(k.replace(/_[DI]$/,'')){
    case 'mejilla':p=bp('risorius03'+s).add(new THREE.Vector3(.012*sg,-.004,.012));break;
    case 'boca':p=bp('oris05').add(new THREE.Vector3(0,-.002,.008));break;
    case 'palma':p=bp('wrist'+s).lerp(bp('finger3-1'+s),.55);break;
    case 'pie':p=bp('foot'+s);break;
    case 'ortejos':p=bp('toe1-1'+s).add(new THREE.Vector3(0,-.012,.008));break;
    case 'talon':p=bp('foot'+s).add(new THREE.Vector3(.008*sg,-.03,-.02));break;
    case 'ortejo5':p=bp('toe1-1'+s).add(new THREE.Vector3(.016*sg,-.012,.004));break;
    case 'cara':p=bp('head').add(new THREE.Vector3(0,0,.05));break;
    default:p=bp('spine03');
  }
  return modelo.localToWorld(p);
}
async function desdePies(k){const t=lmPos(k);await irA(t.clone().add(new THREE.Vector3(t.x*.6,.07,.2)),t,650);}
async function acercar(k,dist=.22){const t=lmPos(k);const dir=cam.position.clone().sub(ctl.target).normalize();await irA(t.clone().add(dir.multiplyScalar(dist)),t,650);}
const ARR=new THREE.Vector3(0,1,0);
function orientar(k){const p=lmPos(k);const d=new THREE.Vector3(p.x*1.4,0,0);d.y=.9;if(k==='boca')d.set(.55,1,.15);d.normalize();guante.quaternion.setFromUnitVectors(ARR,d);
  const ref=Math.abs(d.y)>.7?new THREE.Vector3(0,0,1):new THREE.Vector3(0,1,0);
  const t=new THREE.Vector3(1,0,0).applyQuaternion(guante.quaternion),pt=ref.clone().sub(d.clone().multiplyScalar(ref.dot(d))),tt=t.clone().sub(d.clone().multiplyScalar(t.dot(d)));
  if(pt.lengthSq()>1e-4){pt.normalize();tt.normalize();let an=Math.acos(Math.max(-1,Math.min(1,tt.dot(pt))));if(tt.clone().cross(pt).dot(d)<0)an=-an;guante.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(d,an));}}
function ponerGuante(k){guante.position.copy(lmPos(k));orientar(k);guante.visible=true;}
function moverGuante(a,b,ms){const id=animId,t0=performance.now();guante.visible=true;if(reduce)ms=1;
  return new Promise((res,rej)=>{tweens.push(now=>{if(id!==animId){rej(CANCEL);return false;}const k=Math.min(1,(now-t0)/ms),e=ease(k);guante.position.lerpVectors(lmPos(a),lmPos(b),e);if(k>=1){res();return false;}return true;});});}
let pegado=null;  // el guante sigue un punto del cuerpo mientras el RN se mueve

/* ---------- Respuestas por caso ---------- */
// la respuesta animada sigue el hallazgo esperado del caso (editable por el docente)
function amp(r,L){const c=respCorrecta(caso,r);if(c==='debil')return .22;if(c==='asim'&&L==='D')return 0;return 1;}
const vel=()=>caso==='C'?1.7:1;
const nomLado=(l,f)=>l==='D'?(f?'derecha':'derecho'):(f?'izquierda':'izquierdo');
function setAccion(html,activo){$('#rnAccion').innerHTML=html;$('#rnEstado').classList.toggle('activo',!!activo);$('#rnEstadoTxt').textContent=activo?'En examen':(caso==='C'?'Somnoliento':'Alerta tranquilo');}
const flexB=L=>caso==='C'?'brazoHipo_'+L:(caso==='B'&&L==='D'?'erb_D':'brazoFlex_'+L);

const ANIM={
  async busqueda(){
    for(const L of ['D','I']){const a=amp('busqueda',L);
      setAccion(`Rozando la mejilla del lado <strong>${nomLado(L)}</strong>…`,1);
      if(L==='D')await acercar('cara',.34);
      pegado='mejilla_'+L;ponerGuante(pegado);await espera(350*vel());
      await tween({['cabeza_'+L]:.9*a,boca:a},700*vel());await espera(700);pegado=null;guante.visible=false;
      await tween({['cabeza_'+L]:0,boca:0},500);await espera(250);}
  },
  async succion(){
    setAccion('Dedo enguantado en la boca…',1);await acercar('cara',.4);
    pegado='boca';ponerGuante('boca');await tween({boca:.45},300);
    const a=amp('succion','D'),nn=caso==='C'?3:7;
    for(let i=0;i<nn;i++){await tween({succion:a},220*vel());await tween({succion:a*.2},220*vel());if(caso==='C')await espera(450);}
    pegado=null;guante.visible=false;await tween({succion:0,boca:0},300);
  },
  async palmar(){
    for(const L of ['D','I']){const a=amp('palmar',L);
      setAccion(`Tomando la mano <strong>${nomLado(L,1)}</strong> y presionando la palma…`,1);
      await tween({['brazoPresenta_'+L]:caso==='B'&&L==='D'?.3:1,['manoAbierta_'+L]:1},600);
      await acercar('palma_'+L,.24);pegado='palma_'+L;ponerGuante(pegado);await espera(350*vel());
      await tween({['manoAbierta_'+L]:0,['palmar_'+L]:a},600*vel());await espera(1000);
      pegado=null;guante.visible=false;await tween({['palmar_'+L]:0,['brazoPresenta_'+L]:0},600);await espera(200);}
  },
  async plantar(){
    for(const L of ['D','I']){const a=amp('plantar',L);
      setAccion(`Presionando la base de los ortejos, pie <strong>${nomLado(L)}</strong>…`,1);
      await desdePies('pie_'+L);pegado='ortejos_'+L;ponerGuante(pegado);await espera(350*vel());
      await tween({['plantar_'+L]:a},600*vel());await espera(1000);pegado=null;guante.visible=false;
      await tween({['plantar_'+L]:0},400);await espera(200);}
  },
  async babinski(){
    for(const L of ['D','I']){const a=amp('babinski',L);
      setAccion(`Estimulando el borde externo de la planta <strong>${nomLado(L,1)}</strong>…`,1);
      await desdePies('pie_'+L);orientar('pie_'+L);
      await moverGuante('talon_'+L,'ortejo5_'+L,900);
      await tween({['babinski_'+L]:a},600*vel());await espera(1000);guante.visible=false;
      await tween({['babinski_'+L]:0},400);await espera(200);}
  },
  async moro(){
    setAccion('Sosteniendo la cabeza y dejándola descender 2–3 cm…',1);await espera(400);
    const aD=amp('moro','D'),aI=amp('moro','I'),g=caso==='C'?.2:1;
    const d1={moro1_D:aD,moro1_I:aI,piernaMoro_D:g,piernaMoro_I:g,sorpresa:g,sueno:0};
    await tween(d1,caso==='C'?700:260);await espera(caso==='C'?400:380);
    if(caso!=='C'){const d2={moro1_D:0,moro1_I:0,moro2_I:aI,piernaMoro_D:.3,piernaMoro_I:.3,sorpresa:0,llanto:1};if(aD>0)d2.moro2_D=aD;
      await tween(d2,520);await espera(1300);}
  },
  async tna(){
    for(const L of ['D','I']){const nuca=L==='D'?'I':'D';
      setAccion(`Girando la cabeza hacia el lado <strong>${nomLado(L)}</strong>…`,1);
      await tween({['cabeza_'+L]:1},700);await espera(350*vel());
      const aF=amp('tna',L),aN=caso==='C'?.22:1,d={['brazoExt_'+L]:aF,['piernaExt_'+L]:caso==='C'?.22:1,['piernaMasFlex_'+nuca]:aN};
      if(!(caso==='B'&&nuca==='D'))d['brazoMasFlex_'+nuca]=aN;
      await tween(d,800*vel());await espera(1200);await tween(reposo(),800);await espera(250);}
  }
};

/* ---------- Vida en reposo ---------- */
setInterval(async()=>{if(!listo||!activo()||ocupado||reduce||caso==='C')return;try{await tween({parpadeo:1},90);await tween({parpadeo:0},140);}catch(e){}},4100);
setInterval(async()=>{if(!listo||!activo()||ocupado||reduce)return;const s=caso==='C'?.15:.8,L=Math.random()<.5?'D':'I';
  try{await tween({['pataleo_'+L]:Math.random()*s},800);if(!ocupado)await tween({['pataleo_'+L]:0},900);}catch(e){}},5200);

/* ---------- Interfaz ---------- */
const respuestas={};let revisado=false,selec=null;
const activo=()=>document.body.dataset.modulo==='rn';
function pintarCasos(){const c=$('#rnCasos');c.innerHTML='';
  for(const k in CASOS){const b=document.createElement('button');b.className='btn';b.textContent=CASOS[k].nombre;b.setAttribute('aria-pressed',k===caso);b.onclick=()=>cargarCaso(k);c.appendChild(b);}}
function pintarReflejos(){
  const cont=$('#rnRefl');cont.innerHTML='';
  REFL.forEach(r=>{
    const d=document.createElement('div');d.className='refl'+(selec===r.id?' sel':'');d.id='r-'+r.id;
    const correcta=respCorrecta(caso,r.id),mia=respuestas[r.id];
    let res='';
    if(revisado){const ok=mia===correcta;res=`<div class="rres ${ok?'bien':'mal'}"><strong>${ok?'Correcto':'Revisa'}: ${OPC.find(o=>o[0]===correcta)[1]}.</strong><p>Respuesta normal: ${r.normal} Desaparece: ${r.desap}.</p></div>`;}
    d.innerHTML=`<div class="refl-top"><h3>${r.nombre}</h3><button class="btn evaluar" data-id="${r.id}" ${listo?'':'disabled'}>Evaluar</button></div>
      <p class="rn-tec">${r.tec}</p>
      <div class="ropc" role="radiogroup" aria-label="Hallazgo ${r.nombre}">
        ${OPC.map(([v,t])=>`<label><input type="radio" name="h-${r.id}" value="${v}" ${mia===v?'checked':''} ${revisado?'disabled':''}><span>${t}</span></label>`).join('')}
      </div>${res}`;
    cont.appendChild(d);});
  cont.querySelectorAll('.evaluar').forEach(b=>b.onclick=()=>evaluar(b.dataset.id));
  cont.querySelectorAll('input[type=radio]').forEach(i=>i.onchange=()=>{respuestas[i.name.slice(2)]=i.value;});
}
async function evaluar(id){
  if(!listo)return;
  animId++;ocupado=true;selec=id;const mio=animId;pegado=null;
  document.querySelectorAll('.refl').forEach(e=>e.classList.toggle('sel',e.id==='r-'+id));
  document.querySelectorAll('#rnRefl .evaluar').forEach(b=>b.disabled=true);
  guante.visible=false;
  // en pantallas angostas el panel se pliega para ver la maniobra
  const P=$('#rnPanel');if(P.getBoundingClientRect().top>visor.getBoundingClientRect().top+visor.clientHeight*.3&&!P.classList.contains('min'))plegar(true);
  try{
    await Promise.all([tween(reposo(),300),vista(vistaActual,400)]);
    await ANIM[id]();
    await tween(reposo(),800);await vista(vistaActual,600);
  }catch(e){if(e!==CANCEL)console.error(e);return;}
  if(mio!==animId)return;
  guante.visible=false;ocupado=false;
  document.querySelectorAll('#rnRefl .evaluar').forEach(b=>b.disabled=false);
  setAccion(`Maniobra terminada: <strong>${REFL.find(r=>r.id===id).nombre}</strong>. Registra tu hallazgo o repítela.`,0);
}
function cargarCaso(k){
  animId++;ocupado=false;caso=k;revisado=false;selec=null;tweens=[];pegado=null;
  for(const x in respuestas)delete respuestas[x];
  base=basePostura(k);for(const x in inf)inf[x]=base[x]||0;
  const C=CASOS[k];
  $('#rnCtx').textContent=C.ctx;
  $('#rnFicha').innerHTML=C.ficha.map(([a,b])=>`<div><span class="lbl">${escH(a)}</span><b>${escH(b)}</b></div>`).join('');
  $('#rnPuntaje').textContent='';$('#rnCierre').innerHTML='';
  if(guante)guante.visible=false;camAnim=null;if(listo)vista(vistaActual,1);
  setAccion('Elige un reflejo y presiona <strong>Evaluar</strong>.',0);
  pintarCasos();pintarReflejos();
}
$('#rnRevisar').onclick=()=>{
  const faltan=REFL.filter(r=>!respuestas[r.id]).length;
  if(faltan&&!revisado){$('#rnPuntaje').textContent=`Faltan ${faltan} reflejo${faltan>1?'s':''} por registrar.`;return;}
  revisado=true;const ok=REFL.filter(r=>respuestas[r.id]===respCorrecta(caso,r.id)).length;
  $('#rnPuntaje').textContent=`${ok} de ${REFL.length} correctos`;
  const [t,p]=CASOS[caso].cierre;$('#rnCierre').innerHTML=`<div class="cierre"><h3>${escH(t)}</h3><p>${escH(p)}</p></div>`;
  pintarReflejos();
};
$('#rnReiniciar').onclick=()=>cargarCaso(caso);
function plegar(min){const P=$('#rnPanel'),b=P.querySelector('[data-rnmin]');P.classList.toggle('min',min);b.setAttribute('aria-expanded',!min);b.setAttribute('aria-label',min?'Mostrar panel':'Minimizar panel');b.title=b.getAttribute('aria-label');if(iniciado)talla();}
document.querySelector('[data-rnmin]').onclick=()=>plegar(!$('#rnPanel').classList.contains('min'));

function loop(now){
  requestAnimationFrame(loop);
  if(!activo())return;
  tweens=tweens.filter(f=>f(now));
  if(camAnim)camAnim(now);
  if(listo){posar();
    if(!reduce){const r=Math.sin(now/1000*2*Math.PI*(caso==='C'?.6:.75));if(H.spine03)H.spine03.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),r*1.6*D2R));}
    if(pegado&&guante.visible){modelo.updateMatrixWorld(true);guante.position.copy(lmPos(pegado));}}
  ctl.update();renderer.render(scene,cam);
}
cargarCaso('A');
const ORIG_R=JSON.parse(JSON.stringify(CASOS));
window.RN_DOC={
  intento:()=>({caso,revisado,lista:REFL.map(r=>({id:r.id,nombre:r.nombre,mia:respuestas[r.id]||null,ok:respCorrecta(caso,r.id)}))}),
  casos:()=>Object.keys(CASOS).map(k=>({k,nombre:CASOS[k].nombre})),
  reflejos:()=>REFL.map(r=>({id:r.id,nombre:r.nombre})),opciones:()=>OPC,
  leer:k=>JSON.parse(JSON.stringify(CASOS[k])),original:k=>JSON.parse(JSON.stringify(ORIG_R[k])),
  aplicar(k,d){const o=ORIG_R[k],C=CASOS[k];d=d||o;C.ctx=d.ctx||o.ctx;C.ficha=(d.ficha&&d.ficha.length===o.ficha.length)?d.ficha:o.ficha;C.clave=d.clave||o.clave;C.cierre=(d.cierre&&d.cierre[0])?d.cierre:o.cierre;
    if(k===caso&&!ocupado){$('#rnCtx').textContent=C.ctx;$('#rnFicha').innerHTML=C.ficha.map(([a,b])=>`<div><span class="lbl">${escH(a)}</span><b>${escH(b)}</b></div>`).join('');if(revisado)pintarReflejos();}}
};
window.RN={iniciar,talla:()=>iniciado&&talla(),_dbg:()=>({cam,ctl,inf,H,THREE,guante,scene})};
})();
