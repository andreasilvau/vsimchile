/* ---------- Aplicación de los 52 ítems ---------- */
const crono=$('#crono'),medida=$('#medida');
function setAccion(html,activo){$('#accion').innerHTML=html;$('#estado').classList.toggle('activo',!!activo);$('#estadoTxt').textContent=activo?'Aplicando ítem':'Esperando';}
const R=id=>CASOS[caso].r[id];
const nombreN=()=>CASOS[caso].nombre;
// diálogo de varias preguntas con lámina
async function preguntas(id,qs,mostrar){
  const r=R(id);for(let i=0;i<qs.length;i++){if(mostrar)mostrar(i,r);await ex(qs[i]);await ni(r.resp[i]);await espera(150);}
}
async function manipular(fn){await tween({mirarAbajo:1,manos:1},500);await fn();await tween({mirarAbajo:0,manos:0},500);}
async function apuntar(fn){await tween({mirarAbajo:.8,senalar:.8},420);await fn();await tween({mirarAbajo:0,senalar:0},420);}
// reubicar al niño con un fundido corto
async function reubicar(x,z,ry){const c=renderer.domElement;c.style.transition='opacity .22s';c.style.opacity=0;await espera(240);V.posX=x;V.posZ=z;V.rotY=ry;sucio=true;await espera(60);c.style.opacity=1;await espera(240);}
// caminar: pasos medios ciclos; dir 1 adelante, -1 atrás
async function caminar({pasos,largo=.16,dir=1,tipo='normal',dur=560,alPaso}){
  GAIT.tipo=tipo;GAIT.dir=dir;GAIT.fase=0;await tween({gaitW:1},260);
  const id=animId,t0=performance.now(),total=pasos*dur,x0=V.posX,z0=V.posZ,fx=Math.sin(V.rotY),fz=Math.cos(V.rotY);let ult=0;
  await new Promise((res,rej)=>{tweens.push(now=>{if(id!==animId){rej(CANCEL);return false;}
    const t=Math.min(total,now-t0),p=t/dur;GAIT.fase=p*Math.PI*dir;const d=p*largo*dir;V.posX=x0+fx*d;V.posZ=z0+fz*d;sucio=true;
    const n=Math.floor(p);if(n>ult){ult=n;alPaso&&alPaso(n);}
    if(t>=total){res();return false;}return true;});});
  await tween({gaitW:0},300);
}
const contarPasos=n=>{medida.hidden=false;medida.textContent=`Pasos: ${n}`;};
const ANIM={
  // ----- Coordinación -----
  async C1(){setAccion('Pidiendo que pase el agua de un vaso a otro…',1);await ex('Pasa el agua a este otro vaso, sin botar nada.');await manipular(()=>vasos(R('C1').ok));},
  async C2(){setAccion('Construyendo el modelo de puente…',1);await ex('Mira cómo hago un puente. Ahora hazlo tú.');await manipular(()=>puente(R('C2').ok));},
  async C3(){setAccion('Entregando los cubos…',1);await ex('Haz una torre bien alta.');const r=R('C3');await manipular(()=>torre(r.v,r.cae));if(r.cae)await ni('¡Ay! Se cayó.');},
  async C4(){setAccion('Entregando el estuche abotonado…',1);await ex('Desabotóname el estuche.');await manipular(()=>botones('des',R('C4').botones));},
  async C5(){setAccion('Entregando el estuche abierto…',1);await ex('Ahora abotónalo.');const r=R('C5');await manipular(()=>botones('abo',r.botones));if(!r.ok)await ni(chico()?'¿Me ayudai?':'(le pasa el estuche a la mamá)');},
  async C6(){setAccion('Mostrando la aguja y la lana…',1);await ex('Pasa la lana por el hoyito de la aguja.');await manipular(()=>aguja(R('C6').ok));},
  async C7(){setAccion('Mostrando el tablero con el nudo…',1);await ex('Desata este nudo.');await manipular(()=>cordon(R('C7').ok));},
  async C8(){setAccion('Mostrando la lámina 1…',1);await ex('Haz una raya igual a esta.');await manipular(()=>copia('linea',R('C8').ok));},
  async C9(){setAccion('Mostrando la lámina 2…',1);await ex('Haz uno igual a este.');await manipular(()=>copia('circulo',R('C9').ok));},
  async C10(){setAccion('Mostrando la lámina 3…',1);await ex('Haz una igual a esta.');await manipular(()=>copia('cruz',R('C10').ok));},
  async C11(){setAccion('Mostrando la lámina 4…',1);await ex('Haz uno igual a este.');await manipular(()=>copia('triangulo',R('C11').ok));},
  async C12(){setAccion('Mostrando la lámina 5…',1);await ex('Haz uno igual a este.');await manipular(()=>copia('cuadrado',R('C12').ok));},
  async C13(){setAccion('Pidiendo que dibuje una persona…',1);if(dibujoHecho!==caso)await ex('Dibuja una persona.');await manipular(()=>figuraHumana(R('C13').partes));if(dibujoHecho===caso&&R('C13').partes>=3){await ex('¿Quién es?');await ni(chico()?'¡Mi mamá!':'Eto.');}},
  async C14(){setAccion('Revisando el mismo dibujo de la figura humana…',1);await figuraHumana(R('C14').partes);await espera(1200);},
  async C15(){setAccion('Revisando el mismo dibujo de la figura humana…',1);await figuraHumana(R('C15').partes);await espera(1200);},
  async C16(){setAccion('Mostrando el tablero y las barritas…',1);await ex('Ordena las barritas de la más grande a la más chica.');await manipular(()=>barritas(R('C16').orden));},
  // ----- Lenguaje -----
  async L1(){setAccion('Mostrando la lámina 6…',1);const r=R('L1');par('grande',null);await ex('¿Cuál es el grande?');await apuntar(async()=>par('grande',r.sel[0]));await ni(r.resp[0]);await ex('¿Y cuál es el chico?');await apuntar(async()=>par('grande',r.sel[1]));await ni(r.resp[1]);},
  async L2(){setAccion('Mostrando la lámina 7…',1);const r=R('L2');par('mas',null);await ex('¿Dónde hay más?');await apuntar(async()=>par('mas',r.sel[0]));await ni(r.resp[0]);await ex('¿Y dónde hay menos?');await apuntar(async()=>par('mas',r.sel[1]));await ni(r.resp[1]);},
  async L3(){setAccion('Mostrando la lámina 8…',1);const ks=ITEMS.find(i=>i.id==='L3').el;await preguntas('L3',ks.map(()=>'¿Qué es esto?'),i=>grilla('Lámina 8',ks,i));},
  async L4(){setAccion('Mostrando la lámina de objetos…',1);const ks=ITEMS.find(i=>i.id==='L4').el;await preguntas('L4',ks.map(()=>'¿Qué es esto?'),i=>grilla('Lámina 5',ks,i));},
  async L5(){setAccion('Mostrando la lámina 1…',1);const r=R('L5');par('largo',null);await ex('¿Cuál es la línea larga?');await apuntar(async()=>par('largo',r.sel[0]));await ni(r.resp[0]);await ex('¿Y la corta?');await apuntar(async()=>par('largo',r.sel[1]));await ni(r.resp[1]);},
  async L6(){setAccion('Mostrando la lámina 11…',1);const ks=['cortando','saltando','planchando','comiendo'];await preguntas('L6',ks.map(()=>'¿Qué está haciendo el niño?'),i=>grilla('Lámina 11',ks,i));},
  async L7(){setAccion('Preguntando para qué sirven los objetos…',1);mesaVacia();await preguntas('L7',['¿Para qué sirve la cuchara?','¿Y el lápiz?','¿Y el jabón?','¿Y la escoba?','¿Y la cama?','¿Y la tijera?']);},
  async L8(){setAccion('Entregando las bolsas…',1);const r=R('L8');par('pesado',null);await ex('¿Cuál pesa más?');await manipular(async()=>{par('pesado',r.sel[0]);await espera(500);});await ni(r.resp[0]);await ex('¿Y cuál es liviana?');par('pesado',r.sel[1]);await ni(r.resp[1]);},
  async L9(){setAccion('Preguntando su nombre…',1);mesaVacia();await ex('¿Cómo te llamas?');await ni(R('L9').resp[0]);},
  async L10(){setAccion('Preguntando si es niño o niña…',1);mesaVacia();await ex('¿Tú eres niño o niña?');await ni(R('L10').resp[0]);},
  async L11(){setAccion('Preguntando el nombre de sus padres…',1);mesaVacia();await ex('¿Cómo se llaman tu papá y tu mamá?');await ni(R('L11').resp[0]);},
  async L12(){setAccion('Planteando situaciones…',1);mesaVacia();await preguntas('L12',['¿Qué haces cuando tienes hambre?','¿Y cuando estás cansado?','¿Y cuando tienes frío?']);},
  async L13(){setAccion('Dando órdenes con el lápiz y la silla…',1);const r=R('L13');silla(null);for(const [i,o] of ['detrás','sobre','bajo'].entries()){await ex(`Pon el lápiz ${o==='detrás'?'detrás de':o==='sobre'?'sobre':'bajo'} la silla.`);await apuntar(async()=>{silla(r.pos[i]);await espera(400);});}},
  async L14(){setAccion('Planteando analogías…',1);mesaVacia();await preguntas('L14',['El hielo es frío, el fuego es…','El ratón es chico, el elefante es…','Mamá es mujer, papá es…']);},
  async L15(){setAccion('Mostrando los papeles de colores…',1);await preguntas('L15',['¿De qué color es este?','¿Y este?','¿Y este?'],i=>colores(i));},
  async L16(){setAccion('Pidiendo que señale colores…',1);const r=R('L16');colores(null);for(const [i,c] of ['azul','amarillo','rojo'].entries()){await ex(`Muéstrame el ${c}.`);await apuntar(async()=>{colores(r.sel[i]);await espera(500);});}},
  async L17(){setAccion('Mostrando la lámina 12…',1);await preguntas('L17',['¿Qué figura es esta?','¿Y esta?','¿Y esta?'],i=>figuras(i));},
  async L18(){setAccion('Pidiendo que señale figuras…',1);const r=R('L18');figuras(null);for(const [i,f] of ['círculo','cuadrado','triángulo'].entries()){await ex(`Muéstrame el ${f}.`);await apuntar(async()=>{figuras(r.sel[i]);await espera(500);});}},
  async L19(){setAccion('Mostrando las láminas 13 y 14…',1);await preguntas('L19',['Cuéntame qué pasa aquí.','¿Y aquí qué pasa?'],i=>escena(13+i));},
  async L20(){setAccion('Mostrando la lámina 15…',1);escena(15);await ex('¿Qué cosa está mal en este dibujo?');await ni(R('L20').resp[0]);},
  async L21(){setAccion('Mostrando la lámina 16…',1);const r=R('L21');plural(false);await ex('¿Qué hay aquí?');await ni(r.resp[0]);plural(true);await ex('¿Y aquí?');await ni(r.resp[1]);},
  async L22(){setAccion('Mostrando la lámina 17…',1);await preguntas('L22',['¿Qué pasó antes?','¿Y qué pasó después?'],i=>escena(17,i));},
  async L23(){setAccion('Pidiendo que defina palabras…',1);mesaVacia();await preguntas('L23',['¿Qué es una manzana?','¿Qué es una pelota?','¿Qué es un zapato?','¿Qué es un abrigo?']);},
  async L24(){setAccion('Mostrando la pelota, el globo y la bolsa…',1);const ks=['pelota','globo','bolsa'];await preguntas('L24',['¿Cómo es la pelota?','¿Cómo es el globo?','¿Cómo es la bolsa?'],i=>grilla('Objetos',ks,i,3));},
  // ----- Motricidad -----
  async M1(){setAccion('Pidiendo que salte con los pies juntos…',1);await ex('¡Salta como un conejo!');
    for(let i=0;i<R('M1').saltos;i++){await tween({agacha:.85},i?300:460);await espera(70);await Promise.all([tween({agacha:0,vuelo:1},150),tween({saltoY:.11},250,x=>1-(1-x)*(1-x))]);await Promise.all([tween({saltoY:0},230,x=>x*x),tween({vuelo:0},260)]);await tween({agacha:.65},120);await tween({agacha:0},380);}},
  async M2(){setAccion('Caminando con el vaso lleno de agua…',1);const r=R('M2');await reubicar(-.68,.2,Math.PI/2);vaso.visible=true;await ex('Camina hasta allá con el vaso, sin botar el agua.');
    await tween({llevar:1,mirarAbajo:.35},500);contarPasos(0);await caminar({pasos:r.pasos,largo:.17,alPaso:contarPasos});contarPasos(r.pasos);await espera(500);await tween({llevar:0,mirarAbajo:0},450);vaso.visible=false;await reubicar(0,0,0);},
  async M3(){setAccion('Pidiendo que lance la pelota hacia la examinadora…',1);await irA('lado',700);await ex('Tírame la pelota.');
    pelota.visible=true;const id=animId;let lanzada=false,t0=0,p0=null;
    tweens.push(now=>{if(id!==animId){pelota.visible=false;return false;}if(!lanzada){pelota.position.copy(manoPos());return true;}
      const t=(now-t0)/1000;const T=.75;const k=Math.min(1,t/T);const dz=(chico()?1.4:1.3);pelota.position.set(p0.x*(1-k),p0.y+(.045-p0.y)*k+Math.sin(Math.PI*k)*.35,p0.z+dz*k);if(k>=1)return false;return true;});
    await tween({lanzar1:1},550);await espera(150);
    const suelta=tween({lanzar1:0,lanzar2:1},200);await espera(110);p0=manoPos();t0=performance.now();lanzada=true;miraPelota=true;await suelta;
    await tween({lanzar2:0,lanzar3:1},280);await espera(520);miraPelota=false;medida.hidden=false;medida.textContent='Distancia: '+R('M3').d;await tween({lanzar3:0,sonrisa:1},700);await espera(600);},
  async M4(){await unPie('M4');},
  async M5(){await unPie('M5');},
  async M6(){await unPie('M6');},
  async M7(){setAccion('Caminando en punta de pies…',1);const r=R('M7');await reubicar(-.6,.15,Math.PI/2);await ex('Camina en puntitas de pie, así.');contarPasos(0);await caminar({pasos:r.pasos,largo:.13,tipo:'puntillas',dur:600,alPaso:contarPasos});contarPasos(r.pasos);await espera(600);await reubicar(0,0,0);},
  async M8(){setAccion('Pidiendo que salte por encima de la hoja…',1);const r=R('M8');hojaPiso.visible=true;await ex('Salta por encima de la hoja con los pies juntos.');
    await tween({agacha:.9},480);await espera(80);await Promise.all([tween({agacha:0,vuelo:1},160),tween({saltoY:.1},260,x=>1-(1-x)*(1-x)),tween({posZ:r.dist+.2},480,x=>x)]);await Promise.all([tween({saltoY:0},220,x=>x*x),tween({vuelo:0},260)]);await tween({agacha:.7},120);await tween({agacha:0},420);
    medida.hidden=false;medida.textContent=`Distancia: ${Math.round((r.dist)*100)} cm`;await espera(800);await reubicar(0,0,0);hojaPiso.visible=false;},
  async M9(){setAccion('Pidiendo que salte en un pie…',1);const r=R('M9');await ex('Salta en un pie, como un canguro cojo.');await tween({brazosAfuera:.7,unPie:1},500);
    for(let i=0;i<r.saltos;i++){await tween({saltoY:.06},180,x=>1-(1-x)*(1-x));await tween({saltoY:0},170,x=>x*x);await espera(120);medida.hidden=false;medida.textContent=`Saltos: ${i+1}`;}
    await tween({unPie:0},260);if(r.saltos<3)await ni(chico()?'¡Uy, me caí!':'(apoya el pie y se ríe)');await tween({brazosAfuera:0},400);},
  async M10(){setAccion('Lanzando la pelota desde 1 metro…',1);const r=R('M10');await irA('lado',700);
    pelota.visible=true;const p0=new THREE.Vector3(0,1.0,1.2);pelota.position.copy(p0);
    // se prepara: brazos adelante, manos abiertas, mira la pelota
    miraPelota=true;await Promise.all([ex('¡Atrápala!'),tween({atrapar:1},600)]);await espera(250);
    const id=animId,t0=performance.now(),T=620;
    const dest=()=>usaGLB()?entreManos().add(new THREE.Vector3(0,0,.015)):manoPos().lerp(new THREE.Vector3(V.posX,.52,V.posZ+.16),.5);
    let p1=null;
    await new Promise((res,rej)=>{tweens.push(now=>{if(id!==animId){rej(CANCEL);return false;}const k=Math.min(1,(now-t0)/T);const d=dest();pelota.position.set(p0.x+(d.x-p0.x)*k,p0.y+(d.y-p0.y)*k+Math.sin(Math.PI*k)*.2,p0.z+(d.z-p0.z)*k);if(k>=1){res();return false;}return true;});});
    if(r.ok){
      // la atrapa: las manos se cierran sobre la pelota y la llevan al pecho
      const id2=animId;tweens.push(()=>{if(id2!==animId||!ocupado){return false;}pelota.position.copy(dest());return true;});
      await Promise.all([tween({atrapar:0,abrazar:1,parpadeo:1},260),tween({mirarAbajo:.45},300)]);tween({parpadeo:0},150);
      await espera(800);await ni(chico()?'¡La pillé!':'(se ríe)');await espera(300);
      await tween({abrazar:0,mirarAbajo:0},550);
    }else{
      // la pelota le pega en los brazos antes de que cierre las manos, rebota y cae
      const q=pelota.position.clone();const cierre=tween({atrapar:0,abrazar:.7,parpadeo:1},380);
      await anima(650,k=>pelota.position.set(q.x+.12*k,q.y-(q.y-.045)*k*k+Math.sin(Math.PI*Math.min(1,k*1.6))*.04,q.z+.3*k));
      await cierre;tween({parpadeo:0},150);await tween({abrazar:0,mirarAbajo:.5},450);await espera(500);await tween({mirarAbajo:0},400);
    }
    miraPelota=false;pelota.visible=false;},
  async M11(){await puntaTalon('M11',1);},
  async M12(){await puntaTalon('M12',-1);}
};
async function unPie(id){
  const r=R(id);setAccion('Pidiendo que se pare en un pie; cronometrando…',1);
  if(id!=='M4')await ex('Se puntúa con el mismo intento del ítem M4. Lo repetimos para observar.');
  await ex('Párate en un pie, como una garza.');
  crono.hidden=false;crono.textContent='0,0 s';await tween({brazosAfuera:1,unPie:1},600);
  const T=r.t*1000,t0=performance.now(),idA=animId;
  await new Promise((res,rej)=>{tweens.push(now=>{if(idA!==animId){rej(CANCEL);return false;}const t=now-t0;const k=Math.min(t,T);crono.textContent=(k/1000).toFixed(1).replace('.',',')+' s';const amp=.018+.06*Math.pow(k/T,3),f=(chico()?1.3:.9),ts=t/1000;V.balanceo=amp*(.6*Math.sin(ts*2*Math.PI*f)+.3*Math.sin(ts*2*Math.PI*f*2.3+1.3)+.2*Math.sin(ts*2*Math.PI*f*.47+2.1));sucio=true;if(t>=T){res();return false;}return true;});});
  await tween({unPie:0,balanceo:0},300);await ni(chico()?'¡Uy!':'(apoya el pie)');await tween({brazosAfuera:0},500);
}
function anima(ms,fn){const id=animId;if(reduce)ms=Math.min(ms,150);return new Promise((res,rej)=>{const t0=performance.now();tweens.push(now=>{if(id!==animId){rej(CANCEL);return false;}const k=Math.min(1,(now-t0)/ms);fn(k);sucio=true;if(k>=1){res();return false;}return true;});});}
// Punta-talón con pies que se apoyan de verdad: traslado de peso, despegue, avance junto al otro pie y apoyo talón contra punta.
async function tandemGLB(r,dir){
  capturarPies();
  const f=TAND.f,izq=TAND.izq,L=TAND.L,O=new THREE.Vector3(V.posX,0,V.posZ);
  const P={L:{...TAND.rel.L,y:0},R:{...TAND.rel.R,y:0}},B={s:0,l:0};
  const sync=()=>{for(const k of ['L','R'])TAND.meta[k].copy(O).addScaledVector(f,P[k].s).addScaledVector(izq,P[k].l).setY(TAND.h[k]+P[k].y);V.posX=O.x+f.x*B.s+izq.x*B.l;V.posZ=O.z+f.z*B.s+izq.z*B.l;};
  // vaivén fino de equilibrio, mayor cuanto más inestable
  let inest=.35,tb=0;const vaiven=e=>{tb+=1/60;V.balanceo=inest*.045*(Math.sin(tb*5.1)+.5*Math.sin(tb*8.3+1));};
  TAND.w=1;sync();
  try{
  await Promise.all([tween({brazosAfuera:.55,mirarAbajo:.75},500),anima(500,e=>{TAND.drop=.009*ease(e);vaiven();})]);
  contarPasos(0);
  // un paso: carga el peso sobre el pie de apoyo y lleva el otro pie a (s1,l1)
  const paso=async(k,s1,l1,dur,opts={})=>{
    const o=k==='L'?'R':'L',s0=P[k].s,l0=P[k].l,b0={...B},lado=Math.sign(P[k].l||(k==='L'?1:-1));
    const bs=P[o].s+(s1-P[o].s)*.1,bl=P[o].l*.7;
    await anima(dur*.38,e=>{const q=ease(e);B.s=b0.s+(bs-b0.s)*q;B.l=b0.l+(bl-b0.l)*q;vaiven();sync();});
    const b1={...B},bs2=P[o].s+(s1-P[o].s)*.45,bl2=(P[o].l+l1)/2;
    await anima(dur*.62,e=>{const q=ease(e),arc=Math.sin(Math.PI*e);
      P[k].s=s0+(s1-s0)*q;P[k].l=l0+(l1-l0)*q+lado*.035*arc;P[k].y=(opts.alto??.04)*arc;
      TAND.pitch[k]=D2R*(dir>0?(16*arc*(1-e)-7*arc*e):(13*arc));
      B.s=b1.s+(bs2-b1.s)*q;B.l=b1.l+(bl2-b1.l)*q;vaiven();sync();});
    P[k].y=0;TAND.pitch[k]=0;sync();
  };
  const lento=chico()?1:1.25;
  // 1) pone el pie derecho sobre la línea
  await paso('R',0,0,900*lento,{alto:.025});await espera(250);
  // 2) pasos punta-talón: cada pie queda a un largo de pie del otro
  let ult='R';
  for(let i=1;i<=r.pasos;i++){const k=ult==='R'?'L':'R';inest=.35+.25*i;await paso(k,P[ult].s+dir*L*1.02,0,1250*lento);contarPasos(i);ult=k;await espera(200+i*90);}
  // 3) pierde el equilibrio: el pie siguiente cae fuera de la línea y el otro abre la base
  const k=ult==='R'?'L':'R',lado=k==='L'?1:-1;inest=1.6;
  await Promise.all([tween({brazosAfuera:1},300),paso(k,P[ult].s+dir*L*.7,lado*.085,700,{alto:.03})]);
  inest=.8;await paso(ult,P[ult].s+dir*L*.25,-lado*.06,520,{alto:.02});
  inest=.2;contarPasos(r.pasos);
  // 4) vuelve a la postura de pie
  const bfin=(P.L.s+P.R.s)/2;
  await anima(500,e=>{const q=ease(e);B.s+=(bfin-B.s)*q;B.l+=(0-B.l)*q;vaiven();sync();});
  for(const kk of ['L','R'])await paso(kk,B.s+TAND.rel[kk].s,TAND.rel[kk].l,520,{alto:.02});
  await anima(350,e=>{TAND.drop=.009*(1-ease(e));V.balanceo*=.8;});
  }finally{TAND.w=0;TAND.drop=0;V.balanceo=0;sucio=true;}
}
async function puntaTalon(id,dir){
  const r=R(id);setAccion(dir>0?'Caminando hacia delante topando punta y talón…':'Caminando hacia atrás topando punta y talón…',1);
  cinta.visible=true;await reubicar(dir>0?-.55:.55,.15,Math.PI/2);await ex(dir>0?'Camina por la línea, topando la punta con el talón.':'Ahora camina para atrás por la línea, topando el talón con la punta.');
  if(usaGLB()){await tandemGLB(r,dir);await ni(chico()?'¡Me salí!':'(se sale de la línea)');await tween({brazosAfuera:0,mirarAbajo:0},400);await espera(400);await reubicar(0,0,0);cinta.visible=false;return;}
  await tween({brazosAfuera:.6},300);contarPasos(0);
  if(r.pasos>0)await caminar({pasos:r.pasos,largo:.1,dir,tipo:'tandem',dur:900,alPaso:contarPasos});
  // pierde el equilibrio y separa los pies
  await Promise.all([tween({balanceo:.06},260),tween({legExt_D:.4,legExt_I:.4},260)]);await tween({balanceo:0,legExt_D:0,legExt_I:0},400);
  contarPasos(r.pasos);await ni(chico()?'¡Me salí!':'(se sale de la línea)');await tween({brazosAfuera:0},300);await espera(400);await reubicar(0,0,0);cinta.visible=false;
}
