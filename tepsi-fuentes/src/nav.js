/* ---------- Portada y cambio de módulo ---------- */
(()=>{
const $=s=>document.querySelector(s);
const TIT={inicio:['Centro de Simulación USS','Simulación pediátrica 3D'],tepsi:['Simulación virtual · Desarrollo infantil','Evaluación Psicomotora TEPSI'],rn:['Simulación virtual · Neonatología','Reflejos del recién nacido'],eedp:['Simulación virtual · Desarrollo infantil','EEDP 0 a 2 años']};
function ir(m,desdeHash){
  if(!TIT[m])m='inicio';
  if(document.body.dataset.modulo==='tepsi'&&m!=='tepsi'&&window.speechSynthesis)speechSynthesis.cancel();
  document.body.dataset.modulo=m;
  $('#portada').hidden=m!=='inicio';$('#appTepsi').hidden=m!=='tepsi';$('#appRN').hidden=m!=='rn';$('#appEedp').hidden=m!=='eedp';
  $('#topSub').textContent=TIT[m][0];$('#topTit').textContent=TIT[m][1];$('#inicioBtn').hidden=m==='inicio';
  if(m==='rn'&&window.RN)RN.iniciar();
  if(m==='inicio')requestAnimationFrame(regla);
  if(!desdeHash){try{history.replaceState(null,'',m==='inicio'?location.pathname+location.search:'#'+m);}catch(e){}}
  if(!desdeHash&&m==='inicio'){const f=$('#portTit');f.tabIndex=-1;f.focus({preventScroll:true});}
}
document.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>ir(b.dataset.ir));
$('#inicioBtn').onclick=()=>ir('inicio');

// tallímetro: cada evaluación queda marcada a la altura de su paciente
const MIN=20,MAX=125;
function regla(){
  const z=$('#reglaZona'),R=$('#regla');if(!z||z.offsetParent===null)return;
  const H=z.clientHeight,niv=[...z.querySelectorAll('.nivel')];
  const y=cm=>H*(MAX-cm)/(MAX-MIN);
  const alto=Math.max(...niv.map(n=>n.querySelector('.nivel-txt').offsetHeight));
  const cms=niv.map(x=>+x.dataset.cm).sort((a,b)=>b-a);const separadas=cms.slice(1).every((c,i)=>y(cms[i])-y(c)>=alto+20);const cabe=z.clientWidth>=560&&separadas&&y(cms[0])>=alto/2&&y(cms[cms.length-1])+alto/2<=H;
  z.classList.toggle('compacta',!cabe);
  if(!cabe){niv.forEach(n=>n.style.top='');R.innerHTML='';return;}
  let h='';
  for(let cm=MIN;cm<=MAX;cm++){const t=cm%10===0?'l':cm%5===0?'m':'s';h+=`<i class="t${t}" style="top:${y(cm)}px"></i>`;if(t==='l')h+=`<b style="top:${y(cm)}px">${cm}</b>`;}
  niv.forEach(n=>{const de=+n.dataset.de,a=+n.dataset.a;h+=`<span class="banda" style="top:${y(a)}px;height:${y(de)-y(a)}px"></span>`;n.style.top=y(+n.dataset.cm)+'px';});
  R.innerHTML=h;
}
new ResizeObserver(()=>{if(document.body.dataset.modulo==='inicio')regla();}).observe($('#reglaZona'));
if(document.fonts)document.fonts.ready.then(regla);
const h0=location.hash.slice(1);ir(TIT[h0]?h0:'inicio',true);
})();
