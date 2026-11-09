/* Módulo EEDP 0 a 2 años: interfaz. Usa eedp-logica.js (cargado antes). */
(()=>{
const $=s=>document.querySelector(s);
const MADRE=[10,15,20,30,53,55,60,69,70,73];
const R={};            /* respuestas: nº de ítem → true (logra) | false (no logra) */
const cerrados=new Set();   /* bloques que el examinador cerró a mano */
const fmtFecha=iso=>{const [y,m,d]=iso.split('-');return `${d}/${m}/${y}`;};

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
          <button class="btn" type="button" data-n="${it[0]}" data-v="si" aria-pressed="${v===true}">Logra</button>
          <button class="btn" type="button" data-n="${it[0]}" data-v="no" aria-pressed="${v===false}">No logra</button>
        </span>
      </div>`;
    }
    h+='</details>';
  }
  $('#eedpBloques').innerHTML=h;
}

function pintarResultado(c){
  const out=$('#eedpResultado');
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
    <p class="eedp-supuesto">Déficit: último ítem logrado en un mes menor a los ${r.mesesCumplidos} meses cumplidos. Esta regla es nuestra lectura de la norma; confírmala con el manual antes de usarla en evaluación real.</p>`;
}

function refrescar(){
  const c=pintarEC();
  pintarBloques(c);
  pintarResultado(c);
}

function cargarEjemplo(){
  for(const k of Object.keys(R))delete R[k];
  for(let n=31;n<=44;n++)R[n]=true;
  for(let n=45;n<=50;n++)R[n]=false;
  cerrados.clear();
  refrescar();
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
$('#eedpLimpiar').onclick=()=>{for(const k of Object.keys(R))delete R[k];cerrados.clear();refrescar();};
refrescar();
})();
