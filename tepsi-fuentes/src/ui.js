/* ---------- Estado de la sesión ---------- */
let etapa='consulta';
const resp={},respEl={};let revisado=false,selec=null,actual=0;
const charla=[];                 // historial de la consulta
const form={};                   // datos ingresados en el formulario
const conducta={sel:new Set(),plan:''};
const subDe=it=>SUBS.find(s=>s.id===it.sub);
const tuPB=s=>ITEMS.filter(i=>i.sub===s&&resp[i.id]==='e').length;
const pbReal=s=>ITEMS.filter(i=>i.sub===s&&R(i.id).ok).length;
const correcta=id=>R(id).ok?'e':'f';
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Etapas ---------- */
const ETAPAS=[['consulta','Consulta'],['evaluacion','Evaluación'],['formulario','Formulario'],['conducta','Conducta']];
function pintarEtapas(){
  const e=$('#etapas');e.innerHTML=ETAPAS.map(([id,t],i)=>`<button class="etapa${id===etapa?' on':''}" data-e="${id}" aria-current="${id===etapa?'step':'false'}"><span>${i+1}</span>${t}</button>`).join('');
  e.querySelectorAll('button').forEach(b=>b.onclick=()=>irEtapa(b.dataset.e));
}
function irEtapa(id){
  if(id!=='evaluacion'&&ocupado)detenerItem();
  etapa=id;pintarEtapas();
  $('#pConsulta').hidden=id!=='consulta';$('#barra').hidden=id!=='evaluacion';$('#pFormulario').hidden=id!=='formulario';$('#pConducta').hidden=id!=='conducta';talla();
  document.body.dataset.etapa=id;
  MADRE.exT={};for(const e in EXPR)inf[e]=0;sucio=true;document.querySelectorAll('.exp-b').forEach(b=>b.setAttribute('aria-pressed',b.dataset.x==='neutral'));
  if(id!=='evaluacion'){mesaVacia();limpiarDialogo();}
  if(id==='formulario')pintarFormulario();
  if(id==='conducta')pintarConducta();
  if(id==='consulta')pintarConsulta();
  if(!ocupado){camAnim=null;irA(id==='consulta'?'consulta':'frente',700);}
  if(id==='evaluacion')pintarItem();
  talla();
}

/* ---------- Consulta ---------- */
let tabConsulta='entrevista';
function pintarEstadoIA(){const s=$('#iaEstado');if(!s)return;s.textContent=iaListo?'Puedes escribir tu propia pregunta.':'La pregunta libre necesita Claude; usa las preguntas sugeridas.';$('#libreFila').hidden=!iaListo;}
function pintarConsulta(){
  const C=CASOS[caso];$('#cTit').textContent=`Consulta con ${C.mama.nombre}, madre de ${C.nombre}`;
  $('#tabEnt').setAttribute('aria-selected',tabConsulta==='entrevista');$('#tabDat').setAttribute('aria-selected',tabConsulta==='datos');
  $('#cEnt').hidden=tabConsulta!=='entrevista';$('#cDat').hidden=tabConsulta!=='datos';
  pintarChat();pintarSugeridas();pintarEstadoIA();pintarIdent($('#cDat'));
}
function pintarChat(){
  const L=$('#chat');const C=CASOS[caso];
  L.innerHTML=charla.length?charla.map(m=>`<div class="cm ${m.quien}"><b>${m.quien==='est'?'Tú':esc(C.mama.nombre)}</b>${esc(m.txt)}</div>`).join(''):`<p class="vacio">Saluda y pregunta lo que necesites saber antes de evaluar. Toca una pregunta sugerida o escribe la tuya.</p>`;
  L.scrollTop=L.scrollHeight;
}
function pintarSugeridas(){
  const hechas=new Set(charla.filter(m=>m.quien==='est').map(m=>m.txt));
  const grupos=[...new Set(PREGUNTAS.map(p=>p.g))];
  $('#sug').innerHTML=grupos.map(g=>`<div class="sg"><span class="lbl">${g}</span><div>${PREGUNTAS.filter(p=>p.g===g).map(p=>`<button class="chipq${hechas.has(p.q)?' hecha':''}" data-q="${esc(p.q)}">${esc(p.q)}</button>`).join('')}</div></div>`).join('');
  $('#sug').querySelectorAll('.chipq').forEach(b=>b.onclick=()=>preguntaGuiada(b.dataset.q));
}
let hablandoMama=false;
async function decirMama(txt){charla.push({quien:'mama',txt});pintarChat();madreHabla(txt);hablarTTS(txt,false,true);}
async function preguntaGuiada(q){
  if(hablandoMama)return;const p=PREGUNTAS.find(x=>x.q===q);charla.push({quien:'est',txt:q});pintarChat();pintarSugeridas();
  hablandoMama=true;await new Promise(r=>setTimeout(r,500));await decirMama(p[caso]);hablandoMama=false;
}
async function preguntaLibre(){
  const inp=$('#libre'),q=inp.value.trim();if(!q||hablandoMama)return;inp.value='';
  charla.push({quien:'est',txt:q});pintarChat();hablandoMama=true;$('#enviar').disabled=true;
  const tmp=document.createElement('div');tmp.className='cm mama pensando';tmp.innerHTML=`<b>${esc(CASOS[caso].mama.nombre)}</b>…`;$('#chat').appendChild(tmp);$('#chat').scrollTop=1e6;
  try{const t=await preguntarIA(charla);tmp.remove();await decirMama(t);}
  catch(e){tmp.remove();if(e&&e.code==='not_granted'){iaListo=false;pintarEstadoIA();}
    charla.push({quien:'mama',txt:'(No pude responder ahora. Prueba con una pregunta sugerida.)'});pintarChat();}
  hablandoMama=false;$('#enviar').disabled=false;
}
/* ---------- Identificación (compartida entre consulta y formulario) ---------- */
const CAMPOS=[['nombre','Nombre del niño o niña','text'],['run','R.U.N.','text'],['nac','Fecha de nacimiento','date'],['ficha','Número de ficha','text'],['examen','Fecha del examen','date'],['examinador','Examinador/a','text']];
function pintarIdent(cont){
  if(form.examen===undefined)form.examen=CASOS[caso].ident.examen;
  cont.innerHTML=`<div class="ident">${CAMPOS.map(([k,t,ty])=>`<label class="campo"><span>${t}</span><input type="${ty}" data-k="${k}" value="${esc(form[k]||'')}"></label>`).join('')}
    <fieldset class="campo edad"><legend>Edad del niño o niña</legend><label><input type="number" min="0" max="9" data-k="ea" value="${esc(form.ea??'')}"> años</label><label><input type="number" min="0" max="11" data-k="em" value="${esc(form.em??'')}"> meses</label><label><input type="number" min="0" max="31" data-k="ed" value="${esc(form.ed??'')}"> días</label></fieldset></div>
    <p class="nota">Calcula la edad cronológica a partir de la fecha de nacimiento y la fecha del examen.</p>`;
  cont.querySelectorAll('input').forEach(i=>i.oninput=()=>{form[i.dataset.k]=i.value;});
}
function edadReal(){const n=new Date(CASOS[caso].ident.nac+'T12:00'),e=new Date(CASOS[caso].ident.examen+'T12:00');let a=e.getFullYear()-n.getFullYear(),m=e.getMonth()-n.getMonth(),d=e.getDate()-n.getDate();if(d<0){m--;d+=new Date(e.getFullYear(),e.getMonth(),0).getDate();}if(m<0){a--;m+=12;}return [a,m,d];}

/* ---------- Barra del ítem (evaluación) ---------- */
function pintarAvance(){
  const av=$('#avance');av.innerHTML='';
  SUBS.forEach(s=>{const g=document.createElement('div');g.className='grupo';const its=ITEMS.filter(i=>i.sub===s.id);
    g.innerHTML=`<span>${s.id} ${tuPB(s.id)}/${its.length}</span>`;
    its.forEach(it=>{const i=ITEMS.indexOf(it);const b=document.createElement('button');b.className='punto';
      if(resp[it.id])b.classList.add(revisado?(resp[it.id]===correcta(it.id)?'bien':'mal'):'marcado');
      if(i===actual)b.classList.add('actual');b.title=`${it.id} · ${it.nombre}`;b.setAttribute('aria-label',`${it.id} ${it.nombre}${resp[it.id]?(resp[it.id]==='e'?', éxito':', fracaso'):''}`);
      b.onclick=()=>irItem(i);g.appendChild(b);});
    av.appendChild(g);});
  const n=ITEMS.filter(i=>resp[i.id]).length;
  av.insertAdjacentHTML('beforeend',`<span class="cuenta">${n}/${ITEMS.length}</span>`);
  const t=$('#avTog'),ab=t.getAttribute('aria-expanded')==='true';
  t.innerHTML=`<span>${SUBS.map(s=>`${s.id} ${tuPB(s.id)}/${ITEMS.filter(i=>i.sub===s.id).length}`).join(' · ')}</span><span>${n}/${ITEMS.length} ítems ${ab?'▴':'▾'}</span>`;
}
$('#avTog').onclick=()=>{const t=$('#avTog');t.setAttribute('aria-expanded',t.getAttribute('aria-expanded')==='true'?'false':'true');pintarAvance();};
function pintarItem(){
  const it=ITEMS[actual],mia=resp[it.id];
  $('#itCod').textContent=it.id;$('#itNom').textContent=it.nombre;$('#itSub').textContent=`${subDe(it).nombre} · ${it.mat}`;
  $('#itCons').textContent=it.consigna;$('#itCrit').textContent=it.criterio;
  const els=$('#itEl');
  if(it.el){const set=respEl[it.id]||(respEl[it.id]=new Set());els.hidden=false;
    els.innerHTML=`<span class="lbl">Marca los logrados</span>${it.el.map((e,k)=>`<button class="elx${set.has(k)?' on':''}" data-k="${k}" aria-pressed="${set.has(k)}">${esc(e)}</button>`).join('')}<span class="cnt">${set.size}/${it.el.length}</span>`;
    els.querySelectorAll('.elx').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;set.has(k)?set.delete(k):set.add(k);pintarItem();});}
  else{els.hidden=true;els.innerHTML='';}
  for(const v of['e','f']){const r=$('#o-'+v);r.checked=mia===v;r.disabled=revisado;}
  $('#prev').disabled=actual===0;
  $('#next').textContent=actual===ITEMS.length-1?'Ir al formulario ›':'Siguiente ›';
  $('#itRes').innerHTML=revisado&&mia?(()=>{const ok=correcta(it.id),bien=mia===ok;return `<div class="res ${bien?'bien':'mal'}"><strong>${bien?'Correcto':'Revisa'}: ${ok==='e'?'Éxito':'Fracaso'}.</strong> ${esc(R(it.id).exp)}</div>`;})():'';
  pintarAvance();
}
function pintarProtocolo(){
  const cont=$('#protocolo');cont.innerHTML='';
  SUBS.forEach(s=>{
    const its=ITEMS.filter(i=>i.sub===s.id);const box=document.createElement('div');
    box.innerHTML=`<div class="sec-h"><h3>${s.nombre}</h3><span>Puntaje bruto: ${tuPB(s.id)} / ${its.length}</span></div>`;
    its.forEach(it=>{const i=ITEMS.indexOf(it),m=resp[it.id];
      const est=!m?'<span class="est">—</span>':revisado?`<span class="est ${m===correcta(it.id)?'bien':'mal'}">${m==='e'?'1':'0'}</span>`:`<span class="est ${m}">${m==='e'?'1':'0'}</span>`;
      const b=document.createElement('button');b.className='fila'+(i===actual?' actual':'');b.innerHTML=`<span class="cod">${it.id}</span><span class="nom">${esc(it.nombre)}</span>${est}`;
      b.onclick=()=>{irEtapa('evaluacion');irItem(i);cerrarPauta();};box.appendChild(b);});
    cont.appendChild(box);
  });
}
function refrescar(){pintarItem();pintarProtocolo();}
function detenerItem(){animId++;ocupado=false;tweens=[];limpiarDialogo();crono.hidden=true;medida.hidden=true;pelota.visible=false;vaso.visible=false;hojaPiso.visible=false;cinta.visible=false;miraPelota=false;
  for(const k in inf)inf[k]=0;Object.assign(V,{saltoY:0,balanceo:0,posX:0,posZ:0,rotY:0,gaitW:0});sucio=true;renderer.domElement.style.opacity=1;irA('frente',500);document.querySelectorAll('.aplicar').forEach(b=>b.disabled=!GLB.raiz);}
function irItem(i){
  if(i===actual)return;if(ocupado)detenerItem();
  actual=i;selec=null;mesaVacia();limpiarDialogo();medida.hidden=true;crono.hidden=true;
  setAccion('Presiona <strong>Aplicar</strong> para ver cómo responde.',0);refrescar();
}
document.querySelectorAll('input[name=resItem]').forEach(r=>r.onchange=()=>{resp[ITEMS[actual].id]=r.value;refrescar();});
$('#btnAplicar').onclick=()=>aplicar(ITEMS[actual].id);
$('#prev').onclick=()=>irItem(Math.max(0,actual-1));
$('#next').onclick=()=>{if(actual<ITEMS.length-1)irItem(actual+1);else irEtapa('formulario');};
async function aplicar(id){
  miraPelota=false;animId++;ocupado=true;selec=id;const mio=animId;
  document.querySelectorAll('.aplicar').forEach(b=>b.disabled=true);
  limpiarDialogo();crono.hidden=true;medida.hidden=true;pelota.visible=false;if(!ITEMS.find(i=>i.id===id).dibujo)mesaVacia();
  try{
    await Promise.all([tween({...reposo(),saltoY:0,balanceo:0},300),irA('frente',400)]);
    await ANIM[id]();
    await tween({...reposo(),saltoY:0,balanceo:0},600);
    if(['M3','M10'].includes(id))await irA('frente',700);
  }catch(e){if(e!==CANCEL)console.error(e);return;}
  if(mio!==animId)return;
  ocupado=false;document.querySelectorAll('.aplicar').forEach(b=>b.disabled=false);
  setAccion('Marca <strong>Éxito</strong> o <strong>Fracaso</strong>, o vuelve a aplicarlo.',0);
}

/* ---------- Formulario TEPSI ---------- */
const CAT=t=>t===''||t==null||isNaN(t)?null:(+t>=40?'Normal':+t>=30?'Riesgo':'Retraso');
function filaRes(k,titulo,pb,orden){
  const f=form[k]||(form[k]={});
  return `<div class="rf"><h4>${titulo}</h4><div class="rf-g">
    <div class="pb"><span class="lbl">Puntaje bruto</span><b>${pb}</b></div>
    <label class="campo pt"><span>Puntaje T</span><input type="number" min="20" max="80" data-r="${k}" data-c="t" value="${esc(f.t??'')}"></label>
    <fieldset class="cat"><legend class="lbl">Categoría</legend>${orden.map(c=>`<label><input type="radio" name="cat-${k}" value="${c}" data-r="${k}" data-c="cat" ${f.cat===c?'checked':''}><span>${c}</span></label>`).join('')}</fieldset></div></div>`;
}
function perfilSVG(){
  const rows=[['total','Test total'],['C','Sub-test coordinación'],['L','Sub-test lenguaje'],['M','Sub-test motricidad']];
  const X=t=>140+(t-20)*(380/60),H=44;
  let s=`<svg viewBox="0 0 540 ${rows.length*H+40}" role="img" aria-label="Perfil TEPSI"><rect x="${X(20)}" y="20" width="${X(30)-X(20)}" height="${rows.length*H}" fill="var(--hi-soft)"/><rect x="${X(30)}" y="20" width="${X(40)-X(30)}" height="${rows.length*H}" fill="var(--wait-soft)"/><rect x="${X(40)}" y="20" width="${X(80)-X(40)}" height="${rows.length*H}" fill="var(--ok-soft)"/>`;
  s+=`<text x="${(X(20)+X(30))/2}" y="14" text-anchor="middle" font-size="11" fill="var(--hi)" font-weight="600">Retraso</text><text x="${(X(30)+X(40))/2}" y="14" text-anchor="middle" font-size="11" fill="var(--wait)" font-weight="600">Riesgo</text><text x="${(X(40)+X(80))/2}" y="14" text-anchor="middle" font-size="11" fill="var(--ok)" font-weight="600">Normalidad</text>`;
  const pts=[];
  rows.forEach(([k,t],i)=>{const y=20+i*H+H/2;s+=`<text x="132" y="${y+4}" text-anchor="end" font-size="12" fill="var(--ink)">${t}</text><line x1="${X(20)}" y1="${y}" x2="${X(80)}" y2="${y}" stroke="var(--line)"/>`;
    const v=+(form[k]?.t);if(form[k]?.t!==''&&form[k]?.t!=null&&!isNaN(v)){const x=X(Math.max(20,Math.min(80,v)));pts.push([x,y]);}});
  for(let t=20;t<=80;t+=10)s+=`<text x="${X(t)}" y="${rows.length*H+36}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${t}</text><line x1="${X(t)}" y1="20" x2="${X(t)}" y2="${20+rows.length*H}" stroke="var(--line)" stroke-dasharray="2 3"/>`;
  if(pts.length>1)s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--brand)" stroke-width="2"/>`;
  pts.forEach(([x,y])=>s+=`<circle cx="${x}" cy="${y}" r="6" fill="var(--brand)" stroke="var(--panel)" stroke-width="2"/>`);
  return s+'</svg>';
}
function pintarFormulario(){
  const C=CASOS[caso];const pbs={C:tuPB('C'),L:tuPB('L'),M:tuPB('M')};const tot=pbs.C+pbs.L+pbs.M;
  const pend=ITEMS.filter(i=>!resp[i.id]).length;
  $('#fCuerpo').innerHTML=`
    <div class="hoja-f"><h3 class="ft">Test de desarrollo psicomotor TEPSI <small>2 – 5 años</small></h3><div id="fIdent"></div></div>
    ${pend?`<p class="aviso">Faltan ${pend} ítems por puntuar en la evaluación. El puntaje bruto se calcula con los ítems marcados.</p>`:''}
    <section class="hoja-f"><h3 class="ft">I. Resultado total del test</h3>${filaRes('total','Total',tot,['Normal','Riesgo','Retraso'])}
      <label class="campo"><span>Observaciones</span><textarea data-o="obsT" rows="2">${esc(form.obsT||'')}</textarea></label></section>
    <section class="hoja-f"><h3 class="ft">II. Resultado por sub-test</h3>${filaRes('C','1. Coordinación',pbs.C,['Retraso','Riesgo','Normal'])}${filaRes('L','2. Lenguaje',pbs.L,['Retraso','Riesgo','Normal'])}${filaRes('M','3. Motricidad',pbs.M,['Retraso','Riesgo','Normal'])}
      <label class="campo"><span>Observaciones</span><textarea data-o="obsS" rows="2">${esc(form.obsS||'')}</textarea></label></section>
    <section class="hoja-f"><h3 class="ft">III. Perfil TEPSI</h3><div class="perfil" id="perfil">${perfilSVG()}</div>
      <p class="nota">Busca el puntaje T de cada puntaje bruto en las tablas del manual, según la edad del niño o niña. El perfil se dibuja con los T que ingreses.</p></section>
    <details class="hoja-f"><summary>Detalle de ítems (1 = éxito, 0 = fracaso)</summary>${SUBS.map(s=>`<div class="det"><h4>${s.nombre}</h4><ol>${ITEMS.filter(i=>i.sub===s.id).map(it=>`<li><span>${esc(it.nombre)}</span><b class="${revisado&&resp[it.id]?(resp[it.id]===correcta(it.id)?'ok':'no'):''}">${resp[it.id]==='e'?1:resp[it.id]==='f'?0:'—'}</b></li>`).join('')}</ol></div>`).join('')}</details>
    <div class="pie"><button class="btn btn-primario" id="revForm">Revisar formulario</button><button class="btn" id="aConducta">Ir a la conducta ›</button></div>
    <div id="fbForm"></div>`;
  pintarIdent($('#fIdent'));
  $('#fCuerpo').querySelectorAll('[data-r]').forEach(i=>i.oninput=i.onchange=()=>{const f=form[i.dataset.r]||(form[i.dataset.r]={});f[i.dataset.c]=i.value;if(i.dataset.c==='t')$('#perfil').innerHTML=perfilSVG();});
  $('#fCuerpo').querySelectorAll('[data-o]').forEach(t=>t.oninput=()=>form[t.dataset.o]=t.value);
  $('#revForm').onclick=revisarFormulario;$('#aConducta').onclick=()=>irEtapa('conducta');
  if(revisado)revisarFormulario(true);
}
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
function revisarFormulario(silencioso){
  const C=CASOS[caso],out=[];const ok=(b,t)=>out.push(`<li class="${b?'ok':'no'}">${t}</li>`);
  const pend=ITEMS.filter(i=>!resp[i.id]).length;
  if(pend&&!revisado){$('#fbForm').innerHTML=`<p class="aviso">Antes de revisar, puntúa los ${pend} ítems pendientes.</p>`;return;}
  revisado=true;
  // identificación
  ok(norm(form.nombre)===norm(C.ident.nombre),`Nombre: ${norm(form.nombre)===norm(C.ident.nombre)?'correcto':'debe ser '+C.ident.nombre}.`);
  ok(norm(form.run)===norm(C.ident.run),`RUN: ${norm(form.run)===norm(C.ident.run)?'correcto':'debe ser '+C.ident.run}.`);
  ok(form.nac===C.ident.nac,`Fecha de nacimiento: ${form.nac===C.ident.nac?'correcta':'revisa con lo que dijo la madre ('+C.ident.nac.split('-').reverse().join('-')+')'}.`);
  const [a,m,d]=edadReal();const eOk=+form.ea===a&&+form.em===m&&+form.ed===d;
  ok(eOk,`Edad cronológica: ${eOk?'correcta':`es ${a} años ${m} meses ${d} días`}.`);
  ok(!!(form.examinador||'').trim(),`Examinador/a: ${(form.examinador||'').trim()?'registrado':'falta tu nombre'}.`);
  // ítems
  const bien=ITEMS.filter(i=>resp[i.id]===correcta(i.id)).length;
  ok(bien===ITEMS.length,`Puntuación de ítems: ${bien} de ${ITEMS.length} coinciden con lo observado. ${bien<ITEMS.length?'Los puntos rojos de la barra de evaluación muestran cuáles revisar.':''}`);
  // puntajes brutos
  for(const s of SUBS){const t=tuPB(s.id),r=pbReal(s.id);ok(t===r,`Puntaje bruto ${s.nombre}: ${t}${t===r?'':` (con la puntuación correcta sería ${r})`}.`);}
  const tt=SUBS.reduce((x,s)=>x+tuPB(s.id),0),tr=SUBS.reduce((x,s)=>x+pbReal(s.id),0);ok(tt===tr,`Puntaje bruto total: ${tt}${tt===tr?'':` (correcto: ${tr})`}.`);
  // T y categoría
  for(const [k,t] of [['total','Total'],['C','Coordinación'],['L','Lenguaje'],['M','Motricidad']]){const f=form[k]||{};const c=CAT(f.t);
    if(!c||!f.cat)ok(false,`${t}: falta ${!c?'el puntaje T':'la categoría'}.`);
    else ok(c===f.cat,`${t}: T ${f.t} → ${c}${c===f.cat?'':` (marcaste ${f.cat})`}.`);}
  $('#fbForm').innerHTML=`<div class="fb"><h4>Revisión del formulario</h4><ul>${out.join('')}</ul><p class="nota">La app comprueba que la categoría calce con el T ingresado (Normal ≥ 40, Riesgo 30–39, Retraso ≤ 29). El valor T de la tabla lo verifica tu docente con el manual.</p><p><strong>Lectura del caso:</strong> ${esc(C.cierre)}</p></div>`;
  pintarAvance();pintarProtocolo();
  if(!silencioso)$('#fbForm').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  $('#fCuerpo').querySelectorAll('.det b').forEach((b,i)=>{const it=ITEMS[i];if(resp[it.id])b.className=resp[it.id]===correcta(it.id)?'ok':'no';});
}

/* ---------- Conducta ---------- */
function pintarConducta(){
  const grupos=[...new Set(CONDUCTAS.map(c=>c.grupo))];
  const cats=['total','C','L','M'].map(k=>[k,form[k]?.cat]).filter(x=>x[1]);
  $('#kCuerpo').innerHTML=`
    <p class="it-txt">${cats.length?'Según tu formulario: '+cats.map(([k,c])=>`<b>${k==='total'?'Total':SUBS.find(s=>s.id===k).nombre}: ${c}</b>`).join(' · '):'Completa primero la categoría en el formulario.'}</p>
    ${grupos.map(g=>`<fieldset class="kg"><legend class="lbl">${g}</legend>${CONDUCTAS.filter(c=>c.grupo===g).map(c=>`<label class="kc"><input type="checkbox" value="${c.id}" ${conducta.sel.has(c.id)?'checked':''}><span>${c.txt}</span></label>`).join('')}</fieldset>`).join('')}
    <label class="campo"><span>Plan para la familia (qué, quién y cuándo)</span><textarea id="kPlan" rows="3">${esc(conducta.plan)}</textarea></label>
    <div class="pie"><button class="btn btn-primario" id="revK">Revisar conducta</button></div><div id="fbK"></div>`;
  $('#kCuerpo').querySelectorAll('input[type=checkbox]').forEach(c=>c.onchange=()=>{c.checked?conducta.sel.add(c.value):conducta.sel.delete(c.value);});
  $('#kPlan').oninput=e=>conducta.plan=e.target.value;$('#revK').onclick=revisarConducta;
}
function revisarConducta(){
  const cats=['total','C','L','M'].map(k=>form[k]?.cat).filter(Boolean);
  if(cats.length<4){$('#fbK').innerHTML='<p class="aviso">Completa primero las categorías del formulario (total y los tres sub-tests).</p>';return;}
  const alt=cats.some(c=>c!=='Normal'),retraso=cats.includes('Retraso');
  const esperado=new Set(),sugerido=new Set(),noInd=new Set(['urgencia']);
  if(!alt){['felicitar','pautas','control'].forEach(x=>esperado.add(x));noInd.add('madis');}
  else{['pautas','madis','reeval'].forEach(x=>esperado.add(x));sugerido.add('vdi');sugerido.add('felicitar');if(retraso)esperado.add('medico');}
  for(const [id,e] of Object.entries(CASOS[caso].conducta||{})){
    if(e==='esperada'){esperado.add(id);noInd.delete(id);}
    else if(e==='sugerida'){if(!esperado.has(id))sugerido.add(id);noInd.delete(id);}
    else if(e==='no'){esperado.delete(id);sugerido.delete(id);noInd.add(id);}}
  const t=id=>CONDUCTAS.find(c=>c.id===id).txt;const li=[];
  for(const id of esperado)li.push(`<li class="${conducta.sel.has(id)?'ok':'no'}">${conducta.sel.has(id)?'Bien':'Falta'}: ${t(id)}.</li>`);
  for(const id of sugerido)if(!esperado.has(id))li.push(`<li class="${conducta.sel.has(id)?'ok':'sug'}">${conducta.sel.has(id)?'Bien':'Considera'}: ${t(id)}.</li>`);
  for(const id of noInd)if(conducta.sel.has(id))li.push(`<li class="no">No corresponde: ${t(id)}.</li>`);
  const motivo=CASOS[caso].motivo||(alt?'Con una categoría alterada corresponde intervenir y reevaluar, aunque el perfil sea armónico.':'Con un desarrollo normal se refuerza a la familia, se entregan pautas anticipatorias y se mantienen los controles habituales.');
  $('#fbK').innerHTML=`<div class="fb"><h4>Retroalimentación</h4><ul>${li.join('')}</ul><p>${motivo}</p><p class="nota">Basado en tu categorización y en el flujo de la Norma Técnica para la Supervisión de Salud Integral de Niños y Niñas (MINSAL 2021): ante déficit del desarrollo, intervención en una modalidad MADIS, visita domiciliaria integral según riesgo y reevaluación con el instrumento al terminar la intervención. Contrasta con la norma vigente y la orientación de tu docente.</p></div>`;
  $('#fbK').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}

/* ---------- Casos y pauta ---------- */
function pintarCasos(){const c=$('#casos');c.innerHTML='';for(const k in CASOS){const b=document.createElement('button');b.className='btn';b.textContent=`${CASOS[k].nombre} · ${CASOS[k].edad}`;b.setAttribute('aria-pressed',k===caso);b.onclick=()=>{cargarCaso(k);cerrarPauta();};c.appendChild(b);}
  $('#casoNom').textContent=CASOS[caso].nombre;$('#casoEdad').textContent=CASOS[caso].edad;}
function cargarCaso(k){
  animId++;ocupado=false;caso=k;revisado=false;selec=null;actual=0;tweens=[];dibujoHecho=null;
  for(const x in resp)delete resp[x];for(const x in respEl)delete respEl[x];charla.length=0;for(const x in form)delete form[x];conducta.sel.clear();conducta.plan='';
  for(const x in inf)inf[x]=0;Object.assign(V,{saltoY:0,balanceo:0,posX:0,posZ:0,rotY:0,gaitW:0});sucio=true;TAND.w=0;TAND.drop=0;vestir(k);
  vaso.visible=hojaPiso.visible=cinta.visible=false;
  const C=CASOS[k];
  $('#contexto').innerHTML=`<strong>${esc(C.nombre)}, ${esc(C.edad)}.</strong> ${esc(C.ctx)}`;
  $('#ficha').innerHTML=C.ficha.map(([a,b])=>`<div><span class="lbl">${esc(a)}</span><b>${esc(b)}</b></div>`).join('');
  limpiarDialogo();crono.hidden=true;medida.hidden=true;pelota.visible=false;mesaVacia();
  camAnim=null;irA('frente',1);
  setAccion('Presiona <strong>Aplicar</strong> para ver cómo responde.',0);
  if(GLB.raiz)document.querySelectorAll('.aplicar').forEach(b=>b.disabled=false);
  pintarCasos();refrescar();irEtapa('consulta');
}
$('#reiniciar').onclick=()=>{cargarCaso(caso);cerrarPauta();};
const pauta=$('#pauta'),velo=$('#velo');
function abrirPauta(){pintarProtocolo();pauta.classList.add('abierta');pauta.setAttribute('aria-hidden','false');velo.classList.add('on');$('#pautaBtn').setAttribute('aria-expanded','true');setTimeout(()=>$('#cerrarPauta').focus(),50);}
function cerrarPauta(){if(!pauta.classList.contains('abierta'))return;pauta.classList.remove('abierta');pauta.setAttribute('aria-hidden','true');velo.classList.remove('on');$('#pautaBtn').setAttribute('aria-expanded','false');}
$('#pautaBtn').onclick=abrirPauta;$('#casoBtn').onclick=abrirPauta;$('#cerrarPauta').onclick=()=>{cerrarPauta();$('#pautaBtn').focus();};velo.onclick=cerrarPauta;
addEventListener('keydown',e=>{if(e.key==='Escape')cerrarPauta();});
$('#vozBtn').onclick=()=>{const b=$('#vozBtn'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);if(!on)try{speechSynthesis.cancel();}catch(e){}};
$('#mesaMin').onclick=()=>{const m=$('#mesa'),min=m.classList.toggle('min');$('#mesaMin').textContent=min?'Mostrar':'Ocultar';$('#mesaMin').setAttribute('aria-expanded',!min);};
$('#tabEnt').onclick=()=>{tabConsulta='entrevista';pintarConsulta();};$('#tabDat').onclick=()=>{tabConsulta='datos';pintarConsulta();};
$('#enviar').onclick=preguntaLibre;$('#libre').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();preguntaLibre();}};
$('#aEval').onclick=()=>irEtapa('evaluacion');
setTimeout(()=>$('#pista').classList.add('fuera'),7000);
prepararIA();

/* ---------- Datos editables por el docente ---------- */
const ORIG_T={};
const campos=k=>{const C=CASOS[k];return {nombre:C.nombre,edad:C.edad,sexo:C.sexo,ctx:C.ctx,ident:{...C.ident},mama:{nombre:C.mama.nombre,tono:C.mama.tono,hechos:C.mama.hechos},resp:PREGUNTAS.map(p=>p[k]),cierre:C.cierre,conducta:{...(C.conducta||{})},motivo:C.motivo||''};};
for(const k in CASOS)ORIG_T[k]=JSON.parse(JSON.stringify(campos(k)));
window.TEPSI_DOC={
  intento:()=>({caso,revisado,items:ITEMS.map(i=>({id:i.id,mia:resp[i.id]||null,ok:correcta(i.id)})),charla:charla.map(m=>({quien:m.quien,txt:m.txt}))}),
  casos:()=>Object.keys(CASOS).map(k=>({k,nombre:CASOS[k].nombre})),
  leer:k=>JSON.parse(JSON.stringify(campos(k))),
  original:k=>JSON.parse(JSON.stringify(ORIG_T[k])),
  preguntas:()=>PREGUNTAS.map(p=>({g:p.g,q:p.q})),
  conductas:()=>CONDUCTAS.map(c=>({id:c.id,txt:c.txt,grupo:c.grupo})),
  aplicar(k,d){const C=CASOS[k],o=ORIG_T[k];d=d||o;
    C.nombre=d.nombre||o.nombre;C.edad=d.edad||o.edad;C.sexo=d.sexo||o.sexo;C.ctx=d.ctx||o.ctx;
    C.ident=Object.assign({},o.ident,d.ident||{});
    C.mama.nombre=d.mama?.nombre||o.mama.nombre;C.mama.tono=d.mama?.tono||o.mama.tono;C.mama.hechos=d.mama?.hechos||o.mama.hechos;
    PREGUNTAS.forEach((p,i)=>{p[k]=(d.resp&&d.resp[i])||o.resp[i];});
    C.cierre=d.cierre||o.cierre;C.conducta=d.conducta||o.conducta;C.motivo=d.motivo||'';
    C.ficha=[['Edad',C.edad.replace(/ años? /,' a ').replace(/ meses?/,' m')],['Sexo',C.sexo],['Acompaña','Madre']];
    pintarCasos();if(etapa==='consulta'&&k===caso)pintarConsulta();}
};

/* ---------- Expresiones del rostro (botón "Rostro") ---------- */
(()=>{const btn=document.getElementById('expBtn'),pop=document.getElementById('expPop');if(!btn||!pop)return;
  const cerrar=()=>{pop.hidden=true;btn.setAttribute('aria-expanded','false');};
  btn.onclick=e=>{e.stopPropagation();const abre=pop.hidden;pop.hidden=!abre;btn.setAttribute('aria-expanded',abre);};
  document.addEventListener('click',e=>{if(!pop.hidden&&!pop.contains(e.target)&&e.target!==btn)cerrar();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){cerrar();btn.focus();}});
  pop.querySelectorAll('.exp-b').forEach(b=>b.onclick=()=>{
    pop.querySelectorAll('.exp-b').forEach(x=>x.setAttribute('aria-pressed',x===b));
    expresion(b.dataset.x);});
})();
