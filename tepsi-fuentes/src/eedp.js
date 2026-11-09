/* Módulo EEDP 0 a 2 años: interfaz. Usa eedp-logica.js (cargado antes). */
(()=>{
const $=s=>document.querySelector(s);
const MADRE=[10,15,20,30,53,55,60,69,70,73];
const R={};            /* respuestas: nº de ítem → true (logra) | false (no logra) */
const cerrados=new Set();   /* bloques que el examinador cerró a mano */

/* --- Panel lateral (ficha caso) --- */
const panelEl=$('#eedpPanel');
const casoBtn=$('#eedpCasoBtn');
if(casoBtn&&panelEl){
  casoBtn.addEventListener('click',()=>{
    const vis=!panelEl.hidden&&!panelEl.classList.contains('min');
    if(vis){panelEl.classList.add('min');}
    else{panelEl.hidden=false;panelEl.classList.remove('min');}
  });
  const minBtn=panelEl.querySelector('[data-min]');
  if(minBtn)minBtn.addEventListener('click',()=>{
    const exp=panelEl.classList.toggle('min');
    minBtn.setAttribute('aria-expanded',!exp);
  });
}

/* --- Slide-in pauta --- */
const pautaEl=$('#eedpPauta');
const pautaBtn=$('#eedpPautaBtn');
const pautaCerrar=$('#eedpPautaCerrar');
function togglePauta(abrir){
  const a=abrir!==undefined?abrir:!pautaEl.classList.contains('abierta');
  pautaEl.classList.toggle('abierta',a);
  if(pautaBtn)pautaBtn.setAttribute('aria-expanded',a);
}
if(pautaBtn)pautaBtn.addEventListener('click',()=>togglePauta());
if(pautaCerrar)pautaCerrar.addEventListener('click',()=>togglePauta(false));

/* --- Panel de resultados --- */
const resPanel=$('#eedpResPanel');
const resBtn=$('#eedpResBtn');
if(resBtn&&resPanel){
  resBtn.addEventListener('click',()=>{
    const vis=!resPanel.hidden;
    resPanel.hidden=vis;
    resBtn.setAttribute('aria-expanded',!vis);
  });
  const minBtn=resPanel.querySelector('[data-min]');
  if(minBtn)minBtn.addEventListener('click',()=>{
    const exp=resPanel.classList.toggle('min');
    minBtn.setAttribute('aria-expanded',!exp);
  });
}

function ec(){
  const n=$('#eedpNac').value,e=$('#eedpEval').value;
  if(!n||!e)return null;
  return eedpEdadCronologica(n,e);
}

function pintarEC(){
  const c=ec(),p=$('#eedpEC');
  if(!c||c.total<=0){p.textContent='Revisa las fechas: la evaluación debe ser posterior al nacimiento.';p.style.color='var(--hi)';return null;}
  p.style.color='';
  p.textContent=`Edad cronológica: ${c.meses} meses y ${c.dias} días = ${c.total} días · mes base ${eedpMesBase(c.total)}`;
  return c;
}

function pintarBloques(c){
  const base=c?eedpMesBase(c.total):0;
  const inicio=c?EEDP_BLOQUES[eedpBloqueInicio(base)]:null;
  let h='';
  for(const b of EEDP_BLOQUES){
    const its=itemsDeBloque(b);
    const ev=its.filter(i=>R[i[0]]!==undefined).length;
    const ex=its.filter(i=>R[i[0]]===true).length;
    const aplica=inicio===null||b>=inicio;
    const abierto=aplica&&!cerrados.has(b);
    h+=`<details class="eedp-bloque ${aplica?'aplica':'no-aplica'}" data-b="${b}"${abierto?' open':''}>
      <summary><span>${b} ${b===1?'mes':'meses'}${aplica?'':' · anterior al inicio'}</span><span class="est">${ex}/${its.length} logra · ${ev} marcados</span></summary>`;
    for(const it of its){
      const v=R[it[0]];
      const area=EEDP_AREAS[it[2][0]];
      h+=`<div class="eedp-item">
        <span class="n">${it[0]}</span>
        <span class="t">${it[3]}${MADRE.includes(it[0])?' <span class="m" title="Pregunta a la madre o acompañante">** madre</span>':''}<small>${area} · ${it[2]} · ${it[4]} c/u${it[5]?' · pregunta a la madre':''}</small></span>
        <span class="eedp-btns" role="group" aria-label="Ítem ${it[0]}">
          <button class="btn" type="button" data-demo="${it[0]}" aria-label="Ver conducta ilustrada del ítem ${it[0]}">▶ Ver</button>
          <button class="btn" type="button" data-n="${it[0]}" data-v="si" aria-pressed="${v===true}">Logra</button>
          <button class="btn" type="button" data-n="${it[0]}" data-v="no" aria-pressed="${v===false}">No logra</button>
        </span>
      </div>`;
    }
    h+='</details>';
  }
  $('#eedpBloques').innerHTML=h;
}

/* Actualizar estado del chip */
function actualizarEstado(){
  const total=Object.keys(R).length;
  const txt=$('#eedpEstadoTxt');
  if(txt){
    if(total===0)txt.textContent='Sin evaluar';
    else txt.textContent=`${total} ítems marcados`;
  }
}

function pintarResultado(c){
  const out=$('#eedpResultado');
  if(!out)return;
  if(!c){out.innerHTML='<p class="eedp-msg">Ingresa fechas válidas para calcular.</p>';return;}
  const r=eedpCalcular(c.total,R);
  if(!r.ok){out.innerHTML=`<p class="eedp-msg">${r.motivo}</p>`;return;}
  const cdCls=r.cd==='Normal'?'normal':(r.cd==='Riesgo'?'riesgo':'retraso');
  const pe=r.PE!==null?r.PE.toFixed(2).replace('.',','):'—';
  const razon=r.razon.toFixed(2).replace('.',',');
  const filas=Object.keys(EEDP_AREAS).map(a=>{
    const p=r.perfil[a];
    const u=p.ultimo?(p.ultimo.zona?p.ultimo.zona:`Ítem ${p.ultimo.item} (${p.ultimo.mes} meses)`):'Sin ítems logrados';
    return `<tr><th scope="row">${EEDP_AREAS[a]}</th><td>${u}</td><td>${p.deficit?'<b style="color:var(--hi)">Déficit</b>':'Normal'}</td></tr>`;
  }).join('');
  const notaPE=r.pe_nota?`<p class="eedp-supuesto">${r.pe_nota}</p>`:'';
  out.innerHTML=`
    <div class="eedp-kpi">
      <div><span>Edad mental</span><b>${r.EM} d</b></div>
      <div><span>Edad cronológica</span><b>${r.EC} d</b></div>
      <div><span>Razón EM/EC</span><b>${razon}</b></div>
      <div><span>Puntaje estándar</span><b>${pe}</b></div>
    </div>
    <span class="eedp-cd ${cdCls}">Coeficiente de desarrollo: ${r.cd??'—'}</span>
    ${notaPE}
    <p class="eedp-supuesto">Línea base: ${r.lineaBase} meses · Puntos adicionales: ${r.EM-r.lineaBase*30} (${r.sumados.length} ítems logrados sobre la línea base: ${r.sumados.join(', ')||'ninguno'}). Parada en ${r.parada??'—'} meses.</p>
    <table class="eedp-tabla" aria-label="Perfil del desarrollo psicomotor">
      <thead><tr><th scope="col">Área</th><th scope="col">Último ítem logrado</th><th scope="col">Perfil</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <p class="eedp-supuesto">Déficit: último ítem logrado en un mes menor a los ${r.mesesCumplidos} meses cumplidos.</p>`;
  /* Mostrar panel de resultados automáticamente al tener datos */
  if(resPanel&&resPanel.hidden&&r.ok){resPanel.hidden=false;if(resBtn)resBtn.setAttribute('aria-expanded','true');}
}

function refrescar(){
  const c=pintarEC();
  pintarBloques(c);
  pintarResultado(c);
  actualizarEstado();
}

function cargarEjemplo(){
  for(const k of Object.keys(R))delete R[k];
  for(let n=31;n<=44;n++)R[n]=true;
  for(let n=45;n<=50;n++)R[n]=false;
  cerrados.clear();
  refrescar();
  /* Abrir pauta para que se vean las respuestas */
  togglePauta(true);
}

$('#eedpBloques').addEventListener('click',e=>{
  const b=e.target.closest('button[data-n]');
  if(!b)return;
  const n=+b.dataset.n,v=b.dataset.v==='si';
  if(R[n]===v)delete R[n];else R[n]=v;
  refrescar();
});
$('#eedpBloques').addEventListener('toggle',e=>{
  const d=e.target;const b=+d.dataset.b;
  if(d.open)cerrados.delete(b);else cerrados.add(b);
},true);
['#eedpNac','#eedpEval'].forEach(s=>$(s).addEventListener('change',refrescar));
$('#eedpEjemplo').onclick=cargarEjemplo;
$('#eedpBloques').addEventListener('click',e=>{const b=e.target.closest('[data-demo]');if(b&&window.EEDP_DEMO)window.EEDP_DEMO(+b.dataset.demo);});
$('#eedpLimpiar').onclick=()=>{for(const k of Object.keys(R))delete R[k];cerrados.clear();refrescar();};


/* ---------- Conductas ilustradas ---------- */
const D2R=Math.PI/180;
const LADO_HUESO={D:'R',I:'L'};
function lado(L,lista){const s=LADO_HUESO[L],sg=L==='D'?-1:1;return lista.map(([b,ax,d])=>[b+s,ax,(ax==='y'||ax==='z')?d*sg:d]);}
const dedos=d=>['2','3','4','5'].flatMap(f=>['1','2','3'].map(j=>[`finger${f}-${j}`,'x',d]));
const pulgar=d=>[['finger1-2','x',d],['finger1-3','x',d]];
const POSE_DEF={
  brazoFlex:[['upperarm01','z',30],['upperarm01','y',-60],['lowerarm01','x',100],['wrist','x',15],...dedos(75),...pulgar(25)],
  piernaFlex:[['upperleg01','x',-80],['upperleg01','z',-35],['lowerleg01','x',105],['foot','x',-15]],
  brazoPresenta:[['upperarm01','y',35],['upperarm01','z',-8],['lowerarm01','x',-45]],
  manoAbierta:[...dedos(-70),...pulgar(-20),['wrist','x',-15]],
  palmar:[...dedos(78),...pulgar(25)],
  pinza:[['finger1-2','x',25],['finger1-3','x',20],['finger2-1','x',45],['finger2-2','x',60],['finger2-3','x',30]],
  brazoExt:[['upperarm01','y',58],['upperarm01','z',10],['lowerarm01','x',-90],['wrist','x',-10],...dedos(-55)],
  piernaExt:[['upperleg01','x',62],['upperleg01','z',12],['lowerleg01','x',-85],['foot','x',12]],
  piernasAdelante:[['upperleg01','x',-85],['lowerleg01','x',0]],
  paso:[['upperleg01','x',-25],['lowerleg01','x',20]],
  pasoAtras:[['upperleg01','x',18],['lowerleg01','x',30]],
  cabezaGira:[['neck02','y',-28],['head','y',-34],['neck02','z',4]],
  cabezaArriba:[['neck02','x',-25],['head','x',-15]]
};
const POSES_DEMO={};
for(const k in POSE_DEF){POSES_DEMO[k+'_D']=lado('D',POSE_DEF[k]);POSES_DEMO[k+'_I']=lado('I',POSE_DEF[k]);}
Object.assign(POSES_DEMO,{
  boca:[['jaw',"x",13]],
  cabeza_D:POSE_DEF.cabezaGira.map(([b,a,d])=>[b,a,d]),
  cabeza_I:POSE_DEF.cabezaGira.map(([b,a,d])=>[b,a,-d]),
  cabezaArriba:POSE_DEF.cabezaArriba,
  brazoFlex_base_D:lado('D',POSE_DEF.brazoFlex),brazoFlex_base_I:lado('I',POSE_DEF.brazoFlex),
  piernaFlex_base_D:lado('D',POSE_DEF.piernaFlex),piernaFlex_base_I:lado('I',POSE_DEF.piernaFlex)
});
const BASE={g:-90,p:{brazoFlex_base_D:1,brazoFlex_base_I:1,piernaFlex_base_D:1,piernaFlex_base_I:1}};
const CONDUCTA={
  reposo:{...BASE,nombre:'Reposo'},
  mirada_D:{g:-90,p:{cabeza_D:1},nombre:'Gira la cabeza hacia el examinador (lado derecho)'},
  mirada_I:{g:-90,p:{cabeza_I:1},nombre:'Gira la cabeza hacia el examinador (lado izquierdo)'},
  sonrisa:{g:-90,p:{boca:1},nombre:'Sonríe'},
  vocaliza:{g:-90,p:{},pulso:true,nombre:'Vocaliza (movimiento de boca)'},
  prono:{g:90,p:{cabezaArriba:1},nombre:'Boca abajo, levanta la cabeza'},
  sentado:{g:0,p:{piernasAdelante_D:1,piernasAdelante_I:1},nombre:'Sentado (sostenido por el examinador)'},
  de_pie:{g:0,p:{},nombre:'De pie'},
  alcanza_D:{g:-90,p:{brazoPresenta_D:1,manoAbierta_D:1},nombre:'Extiende la mano hacia el objeto'},
  pinza_D:{g:-90,p:{brazoPresenta_D:1,pinza_D:1},nombre:'Toma el objeto pequeño con pinza'},
  coge_D:{g:-90,p:{brazoPresenta_D:1,palmar_D:1},nombre:'Toma el objeto con la mano'},
  coge_dos:{g:-90,p:{brazoPresenta_D:1,brazoPresenta_I:1,palmar_D:1,palmar_I:1},nombre:'Toma un objeto en cada mano'},
  palmar_D:{g:-90,p:{palmar_D:1},nombre:'Cierra la mano sobre el dedo del examinador'},
  saludo:{g:-90,p:{brazoExt_D:1},nombre:'Mueve la mano (saludo)'},
  camina:{g:0,p:{paso_D:1,pasoAtras_I:0.6},nombre:'Camina sostenido de los brazos'},
  camina_solo:{g:0,p:{paso_D:1,brazoPresenta_D:0.5,brazoPresenta_I:0.5},nombre:'Camina solo'},
  pie_apoyo:{g:0,p:{brazoPresenta_D:1},nombre:'De pie, apoyado en un mueble'},
  muestra_zapatos:{g:-90,p:{piernaExt_D:1},nombre:'Levanta el pie para mostrar el zapato'}
};
const CONDUCTA_ITEM={1:'mirada_D',2:'mirada_I',3:'palmar_D',4:'mirada_D',5:'prono',6:'sonrisa',7:'vocaliza',8:'mirada_I',9:'sentado',10:'vocaliza',11:'sonrisa',12:'mirada_I',13:'mirada_D',14:'sentado',15:'vocaliza',16:'mirada_D',17:'mirada_I',18:'prono',19:'sentado',20:'sonrisa',21:'mirada_D',22:'alcanza_D',23:'alcanza_D',24:'sentado',25:'sentado',26:'sentado',27:'mirada_I',28:'coge_D',29:'coge_D',30:'vocaliza',31:'sentado',32:'pinza_D',33:'mirada_D',34:'saludo',35:'coge_dos',36:'sentado',37:'de_pie',38:'camina',39:'pinza_D',40:'vocaliza',41:'pie_apoyo',42:'camina',43:'pinza_D',44:'alcanza_D',45:'mirada_D',46:'pinza_D',47:'saludo',48:'coge_D',49:'coge_dos',50:'mirada_I',51:'camina',52:'coge_dos',53:'de_pie',54:'alcanza_D',55:'vocaliza',56:'camina_solo',57:'pinza_D',58:'alcanza_D',59:'coge_D',60:'vocaliza',61:'muestra_zapatos',62:'camina',63:'camina_solo',64:'pinza_D',65:'alcanza_D',66:'mirada_D',67:'vocaliza',68:'coge_dos',69:'vocaliza',70:'vocaliza',71:'pie_apoyo',72:'mirada_D',73:'alcanza_D',74:'mirada_I',75:'coge_dos'};

/* Visor 3D del lactante */
function iniciarVisor(){
  const cv=document.getElementById('eedpCanvas'),msg=document.getElementById('eedpVisorMsg'),demoEl=document.getElementById('eedpDemo');
  const avisar=t=>{msg.textContent=t;msg.classList.remove('oculto');};
  if(!cv||!window.THREE||!THREE.GLTFLoader){avisar('No se pudo cargar el visor 3D (sin conexión a la librería).');return;}
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}
  catch(e){avisar('Este navegador no permite gráficos 3D.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  const ajustar=()=>{const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();};
  const escena=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(28,1,0.01,10);
  escena.add(new THREE.HemisphereLight(0xffffff,0x8899aa,1.5));
  const luz=new THREE.DirectionalLight(0xffffff,1.1);luz.position.set(1,2,2);escena.add(luz);
  let ctl=null;
  if(THREE.OrbitControls){ctl=new THREE.OrbitControls(cam,cv);ctl.enablePan=false;ctl.enableDamping=true;ctl.minDistance=0.3;ctl.maxDistance=2.5;}
  const loader=new THREE.GLTFLoader();
  if(window.MeshoptDecoder)loader.setMeshoptDecoder(window.MeshoptDecoder);

  const H={},REST={};
  const acostar=new THREE.Group();escena.add(acostar);
  let gActual=-90,gDestino=-90;
  const pesoActual={},pesoDestino={};
  let conductaActiva=null,temporizador=null,distancia=1;

  function posar(now){
    for(const k in H)H[k].quaternion.copy(REST[k]);
    gActual+=(gDestino-gActual)*0.12;acostar.rotation.x=gActual*D2R;
    if(Math.abs(gDestino-gActual)>0.05){const r=gActual*D2R;cam.position.set(0,distancia*Math.abs(Math.sin(r)),distancia*(0.12+0.88*Math.abs(Math.cos(r))));cam.lookAt(0,0,0);}
    for(const k in pesoDestino)pesoActual[k]=(pesoActual[k]||0)+((pesoDestino[k]||0)-(pesoActual[k]||0))*0.12;
    if(conductaActiva&&conductaActiva.pulso)pesoDestino.boca=0.5+0.5*Math.sin(now/170);
    for(const k in pesoActual){const w=pesoActual[k];if(Math.abs(w)<0.001)continue;
      for(const [b,ax,d] of POSES_DEMO[k]){const h=H[b];if(!h)continue;const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...(ax==='x'?[1,0,0]:ax==='y'?[0,1,0]:[0,0,1])),d*D2R*w);h.quaternion.multiply(q);}}
  }
  function fijar(c){
    conductaActiva=c;gDestino=c.g;
    for(const k in pesoDestino)pesoDestino[k]=0;
    for(const k in c.p)pesoDestino[k]=c.p[k];
    if(c.pulso)pesoDestino.boca=0.5;
  }
  function demo(n){
    const clave=CONDUCTA_ITEM[n]||'reposo';const c=CONDUCTA[clave]||CONDUCTA.reposo;
    clearTimeout(temporizador);
    fijar(c);
    const it=EEDP_ITEMS.find(i=>i[0]===n);
    if(demoEl){
      demoEl.hidden=false;
      demoEl.textContent=`Ítem ${n}: ${it?it[3]:''}. Conducta: ${c.nombre.toLowerCase()}.`;
    }
    if(clave!=='reposo')temporizador=setTimeout(()=>{fijar(CONDUCTA.reposo);if(demoEl)demoEl.textContent+=' (vuelve a reposo)';},3000);
  }
  window.EEDP_DEMO=demo;

  /* Superficie de apoyo: colchoneta suave bajo el bebé */
  const colchGeo=new THREE.PlaneGeometry(1.2,0.8);
  const colchMat=new THREE.MeshStandardMaterial({color:0xc8dce8,roughness:0.85,metalness:0.0});
  const colchoneta=new THREE.Mesh(colchGeo,colchMat);
  colchoneta.rotation.x=-Math.PI/2;
  colchoneta.position.y=-0.005;
  colchoneta.receiveShadow=true;
  acostar.add(colchoneta);
  const bordeGeo=new THREE.PlaneGeometry(1.28,0.88);
  const bordeMat=new THREE.MeshStandardMaterial({color:0xa8c4d8,roughness:0.9,metalness:0.0});
  const borde=new THREE.Mesh(bordeGeo,bordeMat);
  borde.rotation.x=-Math.PI/2;
  borde.position.y=-0.008;
  acostar.add(borde);
  const pisoGeo=new THREE.PlaneGeometry(4,4);
  const pisoMat=new THREE.MeshStandardMaterial({color:0xe0ecf4,roughness:0.95,metalness:0.0});
  const piso=new THREE.Mesh(pisoGeo,pisoMat);
  piso.rotation.x=-Math.PI/2;
  piso.position.y=-0.012;
  piso.receiveShadow=true;
  escena.add(piso);

  /* Usa el modelo RN embebido (RN_GLB) como placeholder */
  if(!window.RN_GLB){avisar('Modelo 3D no disponible.');return;}
  try{
    const bin=Uint8Array.from(atob(RN_GLB),ch=>ch.charCodeAt(0)).buffer;
    loader.parse(bin,'',g=>{
      const m=g.scene;
      m.traverse(o=>{if(o.isBone){H[o.name]=o;}if(o.isSkinnedMesh)o.frustumCulled=false;});
      /* Escalar a ~52 cm como lactante */
      const ESCALA=0.52/0.686;
      m.scale.setScalar(ESCALA);
      const caja=new THREE.Box3().setFromObject(m);
      const centro=caja.getCenter(new THREE.Vector3()),alto=caja.getSize(new THREE.Vector3()).y;
      m.position.sub(centro);
      m.position.y+=alto*0.5;
      acostar.add(m);
      for(const n in H)REST[n]=H[n].quaternion.clone();
      const d=alto*1.5;distancia=d;
      cam.position.set(0,d*0.8,d*0.6);cam.lookAt(0,alto*0.15,0);
      if(ctl){ctl.target.set(0,alto*0.15,0);ctl.update();}
      fijar(BASE);
      msg.classList.add('oculto');
      ajustar();
    },()=>avisar('No se pudo cargar el modelo 3D.'));
  }catch(e){avisar('Error al cargar el modelo 3D.');}
  window.addEventListener('resize',ajustar);
  const bucle=now=>{
    requestAnimationFrame(bucle);
    if(document.body.dataset.modulo!=='eedp')return;
    if(H.head){posar(now);}
    if(ctl)ctl.update();
    if(cv.clientWidth)ajustar_si_cambia();
    renderer.render(escena,cam);
  };
  let ultimoW=0;
  function ajustar_si_cambia(){if(cv.clientWidth!==ultimoW){ultimoW=cv.clientWidth;ajustar();}}
  requestAnimationFrame(bucle);
}
iniciarVisor();
refrescar();
})();
