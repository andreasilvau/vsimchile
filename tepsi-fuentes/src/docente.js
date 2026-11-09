/* ---------- Sección docente: editar los datos de los casos (guardados para todos los estudiantes) ---------- */
(()=>{
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let db=null,editando=null;const guardados={};
const ID=(m,k)=>(m==='t'?'tepsi-':'rn-')+k;
function aplicarDoc(id,datos){const [m,k]=id.split('-');try{if(m==='tepsi')TEPSI_DOC.aplicar(k,datos);else if(m==='rn')RN_DOC.aplicar(k,datos);}catch(e){console.error(e);}}
const campo=(etq,nombre,valor,tipo='text',extra='')=>`<label class="campo"><span>${etq}</span>${tipo==='area'?`<textarea name="${nombre}" rows="${extra||3}" spellcheck="true">${esc(valor)}</textarea>`:`<input type="${tipo}" name="${nombre}" value="${esc(valor)}" spellcheck="false">`}</label>`;

function pintarLista(){
  const L=$('#docLista');
  const it=(m,c,etq)=>`<button type="button" class="doc-it${editando===m+c.k?' on':''}" data-m="${m}" data-k="${c.k}" aria-current="${editando===m+c.k}">${esc(etq)}${guardados[ID(m,c.k)]?'<small>Editado</small>':''}</button>`;
  L.innerHTML=`<p class="doc-grupo">TEPSI</p>${TEPSI_DOC.casos().map(c=>it('t',c,c.nombre)).join('')}<p class="doc-grupo">Recién nacido</p>${RN_DOC.casos().map(c=>it('r',c,c.nombre)).join('')}`;
  L.querySelectorAll('.doc-it').forEach(b=>b.onclick=()=>abrir(b.dataset.m,b.dataset.k));
}
function abrir(m,k){
  editando=m+k;pintarLista();const F=$('#docForm');
  if(m==='t'){const d=TEPSI_DOC.leer(k),P=TEPSI_DOC.preguntas(),K=TEPSI_DOC.conductas();
    const est=[['','Según categorías'],['esperada','Esperada'],['sugerida','Sugerida'],['no','No corresponde']];
    F.innerHTML=`<h3>${esc(d.nombre)} · TEPSI</h3>
    <fieldset><legend>Identificación</legend><div class="doc-grid">
      ${campo('Nombre (como lo llama la app)','nombre',d.nombre)}${campo('Edad (texto)','edad',d.edad)}${campo('Sexo','sexo',d.sexo)}
      ${campo('Nombre completo','ident.nombre',d.ident.nombre)}${campo('RUN','ident.run',d.ident.run)}${campo('N.º de ficha','ident.ficha',d.ident.ficha)}
      ${campo('Fecha de nacimiento','ident.nac',d.ident.nac,'date')}${campo('Fecha del examen','ident.examen',d.ident.examen,'date')}</div>
      ${campo('Contexto del caso','ctx',d.ctx,'area',2)}</fieldset>
    <fieldset><legend>Madre</legend><div class="doc-grid">${campo('Nombre','mama.nombre',d.mama.nombre)}${campo('Tono al responder','mama.tono',d.mama.tono)}</div>
      ${campo('Hechos que conoce (los usa para responder preguntas libres)','mama.hechos',d.mama.hechos,'area',8)}</fieldset>
    <fieldset><legend>Respuestas a las preguntas sugeridas</legend>${P.map((p,i)=>campo(esc(p.q),'resp.'+i,d.resp[i],'area',2)).join('')}</fieldset>
    <fieldset><legend>Cierre y conducta esperada</legend>${campo('Lectura del caso (se muestra al revisar el formulario)','cierre',d.cierre,'area',4)}
      <div class="doc-cond">${K.map(c=>`<label class="campo"><span>${esc(c.txt)}</span><select name="conducta.${c.id}">${est.map(([v,t])=>`<option value="${v}" ${(d.conducta[c.id]||'')===v?'selected':''}>${t}</option>`).join('')}</select></label>`).join('')}</div>
      ${campo('Explicación de la conducta (vacío: automática según categorías)','motivo',d.motivo,'area',3)}</fieldset>`;
  }else{const d=RN_DOC.leer(k),R=RN_DOC.reflejos(),O=RN_DOC.opciones();
    F.innerHTML=`<h3>${esc(d.nombre)} · Recién nacido</h3>
    <fieldset><legend>Antecedentes</legend>${campo('Contexto del caso','ctx',d.ctx,'area',3)}<div class="doc-grid">${d.ficha.map(([a,b],i)=>campo(esc(a),'ficha.'+i,b)).join('')}</div></fieldset>
    <fieldset><legend>Hallazgo esperado (el RN responde según esto)</legend><div class="doc-grid">${R.map(r=>`<label class="campo"><span>${esc(r.nombre)}</span><select name="clave.${r.id}">${O.map(([v,t])=>`<option value="${v}" ${(d.clave[r.id]||'sim')===v?'selected':''}>${t}</option>`).join('')}</select></label>`).join('')}</div>
      <p class="nota">"Asimétrico" deja sin respuesta el lado derecho. La postura de base del RN (sano, brazo en propina o hipotonía) es propia de cada caso.</p></fieldset>
    <fieldset><legend>Cierre</legend>${campo('Diagnóstico','cierre.0',d.cierre[0])}${campo('Explicación','cierre.1',d.cierre[1],'area',4)}</fieldset>`;
  }
  F.insertAdjacentHTML('beforeend',`<div class="doc-acc"><button type="submit" class="btn btn-primario">Guardar para todos</button><button type="button" class="btn" id="docRest">Restaurar original</button><span class="doc-estado" id="docEstado" role="status"></span></div>`);
  if(!db){$('#docEstado').textContent='Sin conexión al almacenamiento compartido: los cambios no se pueden guardar aquí.';F.querySelector('[type=submit]').disabled=true;$('#docRest').disabled=true;}
  $('#docRest').onclick=()=>restaurar(m,k);
  F.scrollTop=0;
}
function recoger(m,k){
  const d=m==='t'?TEPSI_DOC.leer(k):RN_DOC.leer(k);
  for(const el of $('#docForm').querySelectorAll('[name]')){const ruta=el.name.split('.'),v=el.value.trim();
    if(m==='t'&&ruta[0]==='conducta'){if(v)d.conducta[ruta[1]]=v;else delete d.conducta[ruta[1]];continue;}
    if(m==='r'&&ruta[0]==='ficha'){d.ficha[+ruta[1]][1]=v;continue;}
    if(m==='r'&&ruta[0]==='clave'){if(v==='sim')delete d.clave[ruta[1]];else d.clave[ruta[1]]=v;continue;}
    let o=d;for(let i=0;i<ruta.length-1;i++)o=o[ruta[i]];o[ruta[ruta.length-1]]=v;}
  return d;
}
async function guardar(e){e.preventDefault();const m=editando[0],k=editando.slice(1),st=$('#docEstado'),b=$('#docForm [type=submit]');
  const d=recoger(m,k);b.disabled=true;st.textContent='Guardando…';
  try{await db.doc('casos/'+ID(m,k)).set({json:JSON.stringify(d),actualizado:new Date().toISOString()});aplicarDoc(ID(m,k),d);st.textContent='Guardado. Los estudiantes ya ven este cambio.';}
  catch(err){st.textContent=err&&err.code==='not_granted'?'Tu cuenta no tiene permiso para guardar cambios en este simulador.':'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.';}
  b.disabled=false;}
async function restaurar(m,k){if(!confirm('¿Volver a los datos originales de este caso? Se borran los cambios guardados para todos.'))return;
  const st=$('#docEstado');st.textContent='Restaurando…';
  try{await db.doc('casos/'+ID(m,k)).delete();aplicarDoc(ID(m,k),null);abrir(m,k);$('#docEstado').textContent='Caso restaurado al original.';}
  catch(err){st.textContent='No se pudo restaurar. Inténtalo de nuevo.';}}
$('#docForm').onsubmit=guardar;
function abrirDocente(){const D=$('#docente');D.style.top=$('.topbar').offsetHeight+'px';D.hidden=false;pintarLista();if(!editando)abrir('t',TEPSI_DOC.casos()[0].k);$('#docTit').focus();}
function cerrarDocente(){$('#docente').hidden=true;$('#docenteBtn').focus();}
$('#docenteBtn').onclick=abrirDocente;$('#docCerrar').onclick=cerrarDocente;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#docente').hidden)cerrarDocente();});
$('#docTit').tabIndex=-1;

// datos compartidos: todos los leen; solo quienes editan el simulador ven el botón Docente
(async()=>{
  if(!window.claude||!claude.use)return;
  try{db=await claude.use('db');}catch(e){db=null;}
  if(db){db.collection('casos').onSnapshot(snap=>{
      for(const ch of snap.docChanges()){const id=ch.doc.id;
        if(ch.type==='removed'){delete guardados[id];aplicarDoc(id,null);continue;}
        try{const d=JSON.parse(ch.doc.data().json);guardados[id]=1;aplicarDoc(id,d);}catch(e){}}
      if(!$('#docente').hidden)pintarLista();
    },()=>{});}
  try{const u=await claude.use('user');if(u&&await u.canEdit())$('#docenteBtn').hidden=false;}catch(e){}
})();
})();
