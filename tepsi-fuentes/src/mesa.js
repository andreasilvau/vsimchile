/* ---------- Mesa: materiales, hojas y láminas (SVG) ---------- */
const hoja=$('#hoja'),mesaTit=$('#mesaTit');
const svgHoja=(inner,h=200)=>{$('#mesa').hidden=false;return `<svg viewBox="0 0 400 ${h}" role="img">${inner}</svg>`;};
function mesaVacia(){mesaTit.textContent='Mesa de evaluación';hoja.innerHTML='';$('#mesa').hidden=true;}
const TX=(x,y,t,o='')=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="var(--modelo)" font-family="IBM Plex Sans,sans-serif" ${o}>${t}</text>`;
const marco=(x,y,w,h,on)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${on?'var(--brand-soft)':'none'}" stroke="${on?'var(--cyan)':'var(--hoja-l)'}" stroke-width="${on?2.5:1.5}"/>`;
async function trazar(svg,ms){const ps=[...svg.querySelectorAll('.trazo')];for(const p of ps){const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;}
  for(const p of ps){const L=p.getTotalLength();const t0=performance.now();const dur=Math.max(220,ms*L/600);await new Promise((res,rej)=>{const id=animId;const f=now=>{if(id!==animId)return rej(CANCEL);const k=Math.min(1,(now-t0)/(reduce?1:dur));p.style.strokeDashoffset=L*(1-k);k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);});}
}
// animación genérica de un valor dentro de la mesa
function anim(ms,fn){const id=animId;if(reduce)ms=1;return new Promise((res,rej)=>{const t0=performance.now();const f=now=>{if(id!==animId)return rej(CANCEL);const k=Math.min(1,(now-t0)/ms);fn(ease(k));k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);});}

/* ----- Íconos (centrados en 0,0, ~60 px) ----- */
const IC={
  gato:'<ellipse cx="4" cy="12" rx="20" ry="13" fill="#8a8f98"/><circle cx="-14" cy="-6" r="12" fill="#8a8f98"/><path d="M-24 -14 L-22 -26 L-15 -17 M-6 -16 L-4 -27 L-11 -17" fill="#8a8f98"/><circle cx="-18" cy="-8" r="1.8" fill="#111"/><circle cx="-10" cy="-8" r="1.8" fill="#111"/><path d="M-20 -2 h-10 M-8 -2 h10" stroke="#555" stroke-width="1"/><path d="M24 12 q10 -4 6 -20" stroke="#8a8f98" stroke-width="5" fill="none" stroke-linecap="round"/>',
  perro:'<ellipse cx="2" cy="8" rx="22" ry="12" fill="#b07a4f"/><circle cx="-20" cy="-8" r="11" fill="#b07a4f"/><ellipse cx="-27" cy="-14" rx="4" ry="9" fill="#7a5132"/><circle cx="-23" cy="-10" r="1.8" fill="#222"/><circle cx="-30" cy="-5" r="2.4" fill="#222"/><path d="M-12 18 v10 M12 18 v10 M22 4 q8 -6 6 -14" stroke="#7a5132" stroke-width="4" stroke-linecap="round" fill="none"/>',
  chancho:'<ellipse cx="2" cy="6" rx="24" ry="16" fill="#f0a6b4"/><ellipse cx="-22" cy="4" rx="7" ry="6" fill="#e48a9b"/><circle cx="-24" cy="3" r="1.3" fill="#7a2b3a"/><circle cx="-20" cy="3" r="1.3" fill="#7a2b3a"/><circle cx="-14" cy="-4" r="1.8" fill="#222"/><path d="M-12 -10 l-4 -8 l8 4z" fill="#e48a9b"/><path d="M-10 20 v8 M14 20 v8" stroke="#e48a9b" stroke-width="5" stroke-linecap="round"/><path d="M26 2 q6 -2 4 -8" stroke="#e48a9b" stroke-width="2" fill="none"/>',
  pato:'<ellipse cx="4" cy="10" rx="20" ry="12" fill="#f4d03f"/><circle cx="-14" cy="-8" r="10" fill="#f4d03f"/><path d="M-24 -8 l-10 3 l10 3z" fill="#e67e22"/><circle cx="-16" cy="-10" r="1.8" fill="#222"/><path d="M8 4 q8 -4 14 2" stroke="#d4ac0d" stroke-width="2" fill="none"/><path d="M-2 22 v6 M8 22 v6" stroke="#e67e22" stroke-width="3"/>',
  paloma:'<ellipse cx="4" cy="8" rx="20" ry="11" fill="#a3aab5"/><circle cx="-14" cy="-6" r="8" fill="#8c95a3"/><path d="M-22 -6 l-6 2 l6 2z" fill="#e67e22"/><circle cx="-15" cy="-8" r="1.6" fill="#c0392b"/><path d="M0 2 q14 -14 26 -2 q-12 4 -26 2z" fill="#7f8896"/><path d="M-2 18 v8 M6 18 v8" stroke="#e48a9b" stroke-width="2"/>',
  oveja:'<g fill="#f2efe6" stroke="#cfc9b8" stroke-width="1.5"><circle cx="-8" cy="4" r="11"/><circle cx="6" cy="0" r="12"/><circle cx="16" cy="8" r="10"/><circle cx="0" cy="12" r="11"/></g><ellipse cx="-22" cy="0" rx="8" ry="10" fill="#3d3d3d"/><circle cx="-24" cy="-2" r="1.5" fill="#fff"/><path d="M-6 20 v10 M10 20 v10" stroke="#3d3d3d" stroke-width="4"/>',
  tortuga:'<ellipse cx="2" cy="6" rx="22" ry="14" fill="#5d8a3a"/><path d="M-10 -2 l8 -6 l10 0 l8 6 l-8 8 l-10 0z" fill="#4a7230" stroke="#3a5a25"/><ellipse cx="-26" cy="8" rx="7" ry="6" fill="#8bb05f"/><circle cx="-28" cy="6" r="1.4" fill="#222"/><path d="M-12 18 l-4 6 M14 18 l4 6" stroke="#8bb05f" stroke-width="5" stroke-linecap="round"/>',
  gallina:'<ellipse cx="4" cy="8" rx="18" ry="16" fill="#f7f1e3"/><circle cx="-10" cy="-10" r="9" fill="#f7f1e3"/><path d="M-14 -20 q2 -6 6 -2 q2 -6 6 0 q-6 2 -12 2z" fill="#e74c3c"/><path d="M-19 -10 l-6 2 l6 2z" fill="#f39c12"/><path d="M-14 -4 q2 4 0 6" stroke="#e74c3c" stroke-width="3" fill="none"/><circle cx="-11" cy="-12" r="1.6" fill="#222"/><path d="M0 24 v6 M8 24 v6" stroke="#f39c12" stroke-width="3"/>',
  paraguas:'<path d="M-26 0 Q0 -32 26 0 Q19 -5 13 0 Q6 -5 0 0 Q-6 -5 -13 0 Q-19 -5 -26 0z" fill="#e74c3c"/><path d="M0 -26 v-4" stroke="#555" stroke-width="3"/><path d="M0 0 v22 q0 7 -7 7 q-5 0 -5 -5" stroke="#555" stroke-width="3" fill="none"/>',
  vela:'<rect x="-8" y="-6" width="16" height="32" rx="2" fill="#f7f1e3" stroke="#cfc9b8"/><path d="M0 -6 v-6" stroke="#333" stroke-width="2"/><path d="M0 -26 q8 8 0 14 q-8 -6 0 -14z" fill="#f39c12"/><path d="M0 -21 q3 4 0 7 q-3 -3 0 -7z" fill="#f9e79f"/>',
  escoba:'<path d="M14 -30 L-2 6" stroke="#a0522d" stroke-width="4" stroke-linecap="round"/><path d="M-14 4 L10 10 L4 30 L-26 22z" fill="#d4ac0d"/><path d="M-20 20 l2 -10 M-12 23 l2 -10 M-4 25 l2 -10" stroke="#b7950b" stroke-width="1.5"/>',
  tetera:'<ellipse cx="0" cy="8" rx="20" ry="16" fill="#5dade2"/><path d="M-2 -10 h4 v-4 h-4z" fill="#2e86c1"/><path d="M-12 -6 q12 -8 24 0" fill="#2e86c1"/><path d="M18 2 q12 -2 12 -14" stroke="#2e86c1" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-19 0 q-12 2 -10 14 q2 6 10 4" stroke="#2e86c1" stroke-width="4" fill="none"/>',
  zapatos:'<path d="M-28 6 Q-26 -10 -14 -10 L-6 -2 Q4 0 10 6 L10 12 L-28 12z" fill="#d64a2c" stroke="#7a2614"/><path d="M-8 18 Q-6 2 6 2 L14 10 Q24 12 28 18 L28 24 L-8 24z" fill="#d64a2c" stroke="#7a2614"/>',
  reloj:'<circle r="22" fill="#fdfefe" stroke="#2c3e50" stroke-width="4"/><path d="M0 0 V-14 M0 0 L10 6" stroke="#2c3e50" stroke-width="3" stroke-linecap="round"/><path d="M-6 -24 h12 v-4 h-12z" fill="#2c3e50"/>',
  serrucho:'<path d="M-28 -6 L22 -12 L22 2 L-28 8z" fill="#bdc3c7" stroke="#7f8c8d"/><path d="M-28 8 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4" fill="none" stroke="#7f8c8d" stroke-width="1.5"/><rect x="18" y="-16" width="14" height="22" rx="5" fill="#a0522d"/>',
  taza:'<path d="M-18 -10 h30 v18 q0 12 -15 12 q-15 0 -15 -12z" fill="#f5b041" stroke="#b9770e"/><path d="M12 -4 q12 0 10 10 q-2 6 -10 4" stroke="#b9770e" stroke-width="4" fill="none"/><ellipse cx="-3" cy="26" rx="22" ry="4" fill="#d5dbdb"/>',
  pelota:'<circle r="22" fill="#f3a712" stroke="#a35d00" stroke-width="2"/><path d="M-22 0 Q0 -12 22 0 M-13 -18 Q0 0 -13 18" fill="none" stroke="#a35d00" stroke-width="2"/>',
  globo:'<ellipse cx="0" cy="-6" rx="18" ry="22" fill="#e74c3c"/><path d="M-3 16 l3 4 l3 -4z" fill="#c0392b"/><path d="M0 20 q-6 6 0 12 q6 6 0 12" stroke="#555" fill="none"/><ellipse cx="-6" cy="-14" rx="4" ry="7" fill="#f1948a"/>',
  bolsa:'<path d="M-18 -8 q18 -14 36 0 l4 30 q-22 8 -44 0z" fill="#c8a165" stroke="#8a6436"/><path d="M-6 -14 q6 -8 12 0" stroke="#8a6436" stroke-width="3" fill="none"/>',
  esponja:'<path d="M-18 -8 q18 -14 36 0 l4 30 q-22 8 -44 0z" fill="#c8a165" stroke="#8a6436"/><path d="M-6 -14 q6 -8 12 0" stroke="#8a6436" stroke-width="3" fill="none"/>'
};
// figura simple de niño para escenas de acción
const nene=(extra='',pose='')=>`<g stroke="#2c3e50" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="0" cy="-26" r="8" fill="#f5cba7"/><path d="M0 -18 V6 ${pose||'M0 -12 L-12 -2 M0 -12 L12 -2 M0 6 L-8 24 M0 6 L8 24'}"/></g>${extra}`;
const ACC={
  cortando:nene('<path d="M14 -6 l12 -8 M14 -6 l12 2" stroke="#7f8c8d" stroke-width="2.5"/><rect x="22" y="-10" width="16" height="12" fill="#f9e79f" stroke="#d4ac0d"/>','M0 -12 L12 -6 M0 -12 L-10 -2 M0 6 L-8 24 M0 6 L8 24'),
  saltando:`<g transform="translate(0 -8)">${nene('','M0 -12 L-12 -22 M0 -12 L12 -22 M0 6 L-10 18 M0 6 L10 18')}</g><path d="M-16 28 h32" stroke="#bbb" stroke-width="2" stroke-dasharray="3 3"/>`,
  planchando:nene('<path d="M10 4 h22 q-2 -10 -12 -10 h-10z" fill="#5dade2" stroke="#2e86c1"/><rect x="-4" y="8" width="44" height="4" fill="#bbb"/>','M0 -12 L14 -2 M0 -12 L-10 -2 M0 6 L-8 24 M0 6 L8 24'),
  comiendo:nene('<ellipse cx="18" cy="6" rx="12" ry="3" fill="#fff" stroke="#999"/><path d="M8 -20 l8 14" stroke="#999" stroke-width="2"/>','M0 -12 L8 -20 M0 -12 L-10 -2 M0 6 L-8 24 M0 6 L8 24')
};

/* ----- Escenas de coordinación ----- */
async function vasos(ok){
  mesaTit.textContent='Mesa: dos vasos';
  hoja.innerHTML=svgHoja(`<rect x="0" y="176" width="400" height="24" fill="var(--hoja-l)"/>
    <g id="vA" transform="translate(130 176)"><path d="M-26 -90 L-20 0 L20 0 L26 -90" fill="rgba(200,230,245,.35)" stroke="#7fb3d5" stroke-width="2.5"/><path id="agA" d="M-24 -70 L-20 0 L20 0 L24 -70z" fill="#5dade2" opacity=".7"/></g>
    <g transform="translate(270 176)"><path d="M-26 -90 L-20 0 L20 0 L26 -90" fill="rgba(200,230,245,.35)" stroke="#7fb3d5" stroke-width="2.5"/><path id="agB" d="M-21 0 L20 0z" fill="#5dade2" opacity=".7"/></g>
    <path id="chorro" d="" stroke="#5dade2" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><g id="gotas"></g>`,200);
  const vA=hoja.querySelector('#vA'),agA=hoja.querySelector('#agA'),agB=hoja.querySelector('#agB'),ch=hoja.querySelector('#chorro');
  await anim(700,k=>{vA.setAttribute('transform',`translate(${130+90*k} ${176-60*k}) rotate(${-0*k})`);});
  await anim(500,k=>vA.setAttribute('transform',`translate(220 116) rotate(${70*k})`));
  await anim(1300,k=>{const hA=70*(1-k),hB=66*k;agA.setAttribute('d',`M-${20+4*hA/90} -${hA} L-20 0 L20 0 L${20+4*hA/90} -${hA}z`);agB.setAttribute('d',`M-${20+4*hB/90} -${hB} L-20 0 L20 0 L${20+4*hB/90} -${hB}z`);ch.setAttribute('d',k<.97?'M248 92 Q262 110 264 160':'');
    if(!ok&&k>.3&&k<.8&&Math.random()<.25)hoja.querySelector('#gotas').insertAdjacentHTML('beforeend',`<circle cx="${236+Math.random()*16}" cy="${150+Math.random()*24}" r="${2+Math.random()*3}" fill="#5dade2"/>`);});
  if(!ok)hoja.querySelector('#gotas').insertAdjacentHTML('beforeend','<ellipse cx="240" cy="182" rx="26" ry="4" fill="#5dade2" opacity=".6"/>');
  await anim(500,k=>vA.setAttribute('transform',`translate(${220-90*k} ${116+60*k}) rotate(${70*(1-k)})`));
}
const cubo=(x,y,c)=>`<rect x="${x}" y="${y}" width="26" height="24" rx="2" fill="${c}" stroke="rgba(0,0,0,.25)"/>`;
const CUB=['var(--cubo1)','var(--cubo2)','var(--cubo3)','var(--cubo4)'];
async function puente(ok){
  mesaTit.textContent='Mesa: puente de tres cubos';
  const modelo=cubo(64,140,CUB[2])+cubo(110,140,CUB[2])+cubo(87,116,CUB[0]);
  hoja.innerHTML=svgHoja(`<rect x="0" y="164" width="400" height="16" fill="var(--hoja-l)"/>${modelo}${TX(100,196,'Modelo')}<line x1="200" y1="20" x2="200" y2="170" stroke="var(--hoja-l)" stroke-dasharray="4 5"/><g id="nn"></g>${TX(300,196,'Niño/a')}`,200);
  const g=hoja.querySelector('#nn');const pos=ok?[[264,140,2],[310,140,2],[287,116,0]]:[[274,140,2],[274,116,2],[274,92,0]];
  for(const [x,y,c] of pos){await espera(550);g.insertAdjacentHTML('beforeend',cubo(x,y,CUB[c]));}
}
async function torre(nc,cae){
  mesaTit.textContent='Mesa: torre de cubos';
  hoja.innerHTML=svgHoja(`<rect x="0" y="216" width="400" height="14" fill="var(--hoja-l)"/><g id="cubos"></g>`,230);
  const g=hoja.querySelector('#cubos');const tot=cae?nc+1:nc;
  for(let i=0;i<tot;i++){await espera(380);const y=216-(i+1)*24,x=187+((i*7)%5-2)*1.4;g.insertAdjacentHTML('beforeend',cubo(x,y,CUB[i%4]));}
  if(cae){await espera(250);await anim(600,k=>g.setAttribute('transform',`rotate(${-35*k} 200 216)`));g.removeAttribute('transform');g.innerHTML='';
    for(let i=0;i<tot;i++)g.insertAdjacentHTML('beforeend',`<g transform="translate(${60+i*36+(i%2)*6} ${192-((i*13)%3)*3}) rotate(${(i*37)%40-20})">${cubo(0,0,CUB[i%4])}</g>`);
    g.insertAdjacentHTML('beforeend',TX(200,40,`Se cayó al poner el cubo ${tot}`));}
  else g.insertAdjacentHTML('beforeend',`<text x="250" y="${216-nc*12}" font-size="13" fill="var(--modelo)" font-family="IBM Plex Mono,monospace">${nc} cubos</text>`);
}
async function botones(modo,logrados){
  mesaTit.textContent='Mesa: estuche con botones';
  const tela=`<rect x="90" y="40" width="220" height="130" rx="14" fill="#7fb3d5"/><path id="solapa" d="M90 40 h220 v70 h-220z" fill="#5499c7"/>`;
  hoja.innerHTML=svgHoja(`${tela}<g id="bt"></g>`,200);
  const bt=hoja.querySelector('#bt');const xs=[140,200,260];
  const dibujar=(cerr)=>{bt.innerHTML=xs.map((x,i)=>cerr[i]?`<circle cx="${x}" cy="104" r="10" fill="#f9e79f" stroke="#b7950b" stroke-width="2"/><path d="M${x-3} 101 h1 M${x+2} 101 h1 M${x-3} 107 h1 M${x+2} 107 h1" stroke="#7d6608" stroke-width="2"/>`:`<circle cx="${x}" cy="128" r="10" fill="#f9e79f" stroke="#b7950b" stroke-width="2"/><rect x="${x-9}" y="101" width="18" height="5" rx="2.5" fill="#1b4f72"/>`).join('');};
  const est=modo==='des'?[1,1,1]:[0,0,0];dibujar(est);
  for(let i=0;i<3;i++){await espera(900);if(i<logrados){est[i]=modo==='des'?0:1;dibujar(est);}else{bt.insertAdjacentHTML('beforeend',`<circle cx="${xs[i]}" cy="${modo==='des'?104:128}" r="16" fill="none" stroke="var(--hi)" stroke-width="2" stroke-dasharray="4 3"/>`);}}
}
async function aguja(ok){
  mesaTit.textContent='Mesa: aguja de lana e hilo';
  hoja.innerHTML=svgHoja(`<g transform="translate(250 100) rotate(-20)"><rect x="-4" y="-70" width="8" height="140" rx="4" fill="#bdc3c7" stroke="#7f8c8d"/><ellipse cx="0" cy="-52" rx="2.5" ry="10" fill="var(--hoja)" stroke="#7f8c8d"/></g><path id="hilo" d="" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/>`,200);
  const h=hoja.querySelector('#hilo');
  const intento=async(dx,dy,pasa)=>{await anim(700,k=>{const x=90+(225+dx-90)*k,y=150+(55+dy-150)*k;h.setAttribute('d',`M40 170 Q70 160 ${x} ${y}`);});if(pasa)await anim(500,k=>h.setAttribute('d',`M40 170 Q70 160 225 55 L${225+40*k} ${55-14*k}`));else await anim(400,k=>h.setAttribute('d',`M40 170 Q70 160 ${225+dx-30*k} ${55+dy+20*k}`));};
  if(ok)await intento(0,0,true);else{await intento(-12,14,false);await intento(10,-16,false);await intento(-8,-10,false);}
}
async function cordon(ok){
  mesaTit.textContent='Mesa: tablero con cordón';
  hoja.innerHTML=svgHoja(`<rect x="70" y="40" width="260" height="120" rx="10" fill="#d9b382" stroke="#8a6436" stroke-width="2"/><circle cx="170" cy="100" r="6" fill="#6e4b2a"/><circle cx="230" cy="100" r="6" fill="#6e4b2a"/><g id="cd"></g>`,200);
  const cd=hoja.querySelector('#cd');
  const nudo=a=>`<path d="M170 100 Q200 ${80-a*20} 200 92 Q200 ${80-a*20} 230 100" stroke="#e74c3c" stroke-width="5" fill="none"/><circle cx="200" cy="92" r="${8-a*5}" fill="#c0392b"/><path d="M200 92 q-20 ${30+a*30} -40 ${40+a*40} M200 92 q20 ${30+a*30} 40 ${40+a*40}" stroke="#e74c3c" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  cd.innerHTML=nudo(0);await espera(500);
  if(ok){await anim(1200,k=>cd.innerHTML=nudo(k));cd.innerHTML=`<path d="M170 100 Q160 140 120 150 M230 100 Q240 140 280 150" stroke="#e74c3c" stroke-width="5" fill="none" stroke-linecap="round"/>`;}
  else{await anim(1200,k=>cd.innerHTML=nudo(-k*.5));cd.insertAdjacentHTML('beforeend',TX(200,186,'El nudo quedó más apretado'));}
}
const MODELOS={linea:'<path d="M60 100 H140" stroke="var(--modelo)" stroke-width="3"/>',circulo:'<circle cx="100" cy="100" r="40" fill="none" stroke="var(--modelo)" stroke-width="3"/>',cruz:'<path d="M100 58 V142 M58 100 H142" stroke="var(--modelo)" stroke-width="3" fill="none"/>',
  triangulo:'<path d="M100 58 L142 140 H58z" fill="none" stroke="var(--modelo)" stroke-width="3"/>',cuadrado:'<rect x="62" y="62" width="76" height="76" fill="none" stroke="var(--modelo)" stroke-width="3"/>'};
const COPIAS={
  linea:{ok:'<path class="trazo" d="M256 104 C280 102 320 100 346 98"/>',no:'<path class="trazo" d="M256 90 C280 130 310 70 346 116"/>'},
  circulo:{ok:'<path class="trazo" d="M300 58 C340 56 348 96 334 122 C318 146 270 146 260 114 C250 84 264 58 302 60"/>',no:'<path class="trazo" d="M296 60 C330 50 352 90 338 120 C326 146 290 150 266 132 C246 114 256 70 290 62 L300 58"/>'},
  cruz:{ok:'<path class="trazo" d="M302 54 C301 84 303 120 300 148"/><path class="trazo" d="M256 100 C282 103 320 98 346 102"/>',no:'<path class="trazo" d="M268 56 C272 90 276 120 280 148"/><path class="trazo" d="M318 54 C322 88 328 118 336 146"/>'},
  triangulo:{ok:'<path class="trazo" d="M300 56 L344 142 L258 140 Z"/>',no:'<path class="trazo" d="M300 58 C336 60 346 110 324 136 C300 154 262 140 264 104 C266 76 284 60 302 60"/>'},
  cuadrado:{ok:'<path class="trazo" d="M262 62 L340 64 L338 140 L260 138 Z"/>',no:'<path class="trazo" d="M290 62 C330 56 346 92 336 126 C324 150 276 150 262 120 C250 92 266 66 292 62"/>'}
};
async function copia(fig,ok){
  mesaTit.textContent='Hoja: copia de figura';
  hoja.innerHTML=svgHoja(`<g>${MODELOS[fig]}</g>${TX(100,186,'Lámina')}<line x1="200" y1="20" x2="200" y2="180" stroke="var(--hoja-l)" stroke-dasharray="4 5"/><g fill="none" stroke="var(--lapiz)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${COPIAS[fig][ok?'ok':'no']}</g>${TX(300,186,'Dibujo del niño/a')}`);
  await trazar(hoja.querySelector('svg'),1300);
}
let dibujoHecho=null;
async function figuraHumana(partes){
  mesaTit.textContent='Hoja: figura humana';
  const d=partes>=3?'<circle class="trazo" cx="200" cy="78" r="40"/><circle class="trazo" cx="186" cy="70" r="4"/><circle class="trazo" cx="214" cy="70" r="4"/><path class="trazo" d="M186 94 Q200 106 214 94"/><path class="trazo" d="M186 116 L172 176"/><path class="trazo" d="M214 116 L228 176"/>'
    :'<path class="trazo" d="M150 120 C170 40 260 40 250 110 C240 170 160 170 170 100 C178 60 230 70 226 110 C222 140 190 140 196 104"/><path class="trazo" d="M168 84 L196 120 L180 70 L214 116 L206 74 L232 108"/>';
  hoja.innerHTML=svgHoja(`<g fill="none" stroke="var(--lapiz)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${d}</g>${partes>=3?TX(320,60,'Partes:')+TX(320,78,'cabeza · ojos')+TX(320,94,'boca · piernas'):''}`);
  if(dibujoHecho===caso){hoja.querySelectorAll('.trazo').forEach(p=>p.style.strokeDasharray='none');return;}
  await trazar(hoja.querySelector('svg'),1500);dibujoHecho=caso;
}
async function barritas(orden){
  mesaTit.textContent='Mesa: tablero y barritas';
  const alto=n=>30+n*22;
  hoja.innerHTML=svgHoja(`<rect x="40" y="170" width="320" height="14" rx="3" fill="#d9b382" stroke="#8a6436"/><g id="br"></g>`,200);
  const br=hoja.querySelector('#br');const des=[4,2,5,1,3];
  const pint=o=>br.innerHTML=o.map((n,i)=>`<rect x="${80+i*52}" y="${170-alto(n)}" width="24" height="${alto(n)}" rx="3" fill="${['#e74c3c','#f39c12','#27ae60','#2980b9','#8e44ad'][n-1]}"/>`).join('');
  pint(des);await espera(700);
  const o=[...des];for(let i=0;i<5;i++){o[i]=orden[i];pint(o.map((v,j)=>j<=i?v:des[j]));await espera(450);}
  pint(orden);
}

/* ----- Láminas de lenguaje ----- */
const PARES={
  grande:{t:'Lámina 6',a:'<circle cx="120" cy="100" r="46" fill="#f3a712" stroke="#a35d00" stroke-width="2"/>',b:'<circle cx="280" cy="118" r="20" fill="#f3a712" stroke="#a35d00" stroke-width="2"/>'},
  mas:{t:'Lámina 7',a:[0,1,2,3,4,5].map(i=>`<circle cx="${90+(i%3)*28}" cy="${84+Math.floor(i/3)*30}" r="11" fill="#e74c3c"/>`).join('')+'<ellipse cx="118" cy="140" rx="64" ry="10" fill="none" stroke="#999" stroke-width="2"/>',b:'<circle cx="280" cy="112" r="11" fill="#e74c3c"/><ellipse cx="280" cy="140" rx="64" ry="10" fill="none" stroke="#999" stroke-width="2"/>'},
  largo:{t:'Lámina 1',a:'<path d="M50 80 H190" stroke="#2c3e50" stroke-width="6" stroke-linecap="round"/>',b:'<path d="M250 130 H300" stroke="#2c3e50" stroke-width="6" stroke-linecap="round"/>'},
  pesado:{t:'Bolsas',a:`<g transform="translate(120 100) scale(1.5)">${IC.bolsa}</g>`+TX(120,170,'arena'),b:`<g transform="translate(280 100) scale(1.5)">${IC.esponja}</g>`+TX(280,170,'esponja')}
};
function par(tipo,sel){
  const P=PARES[tipo];mesaTit.textContent=P.t;
  hoja.innerHTML=svgHoja(`${marco(30,24,170,160,sel===0)}${marco(200,24,170,160,sel===1)}${P.a}${P.b}`,200);
}
function grilla(titulo,claves,activo,cols){
  mesaTit.textContent=titulo;cols=cols||4;const w=400/cols,filas=Math.ceil(claves.length/cols),h=filas*96+8;
  hoja.innerHTML=svgHoja(claves.map((k,i)=>{const x=(i%cols)*w,y=Math.floor(i/cols)*96+4;return `${marco(x+5,y,w-10,90,i===activo)}<g transform="translate(${x+w/2} ${y+46}) scale(.95)">${IC[k]||ACC[k]}</g>`;}).join(''),h);
}
function colores(activo){
  mesaTit.textContent='Papeles lustre';const c=['#2e6fd8','#f4d03f','#e03b2f'];
  hoja.innerHTML=svgHoja(c.map((f,i)=>`${marco(18+i*126,14,112,112,i===activo)}<rect x="${32+i*126}" y="28" width="84" height="84" fill="${f}" transform="rotate(${[-4,3,-2][i]} ${74+i*126} 70)"/>`).join(''),140);
}
function figuras(activo){
  mesaTit.textContent='Lámina 12';
  const f=['<circle cx="74" cy="70" r="40" fill="#5dade2"/>','<rect x="160" y="30" width="80" height="80" fill="#58d68d"/>','<path d="M326 30 L370 110 H282z" fill="#f5b041"/>'];
  hoja.innerHTML=svgHoja(f.map((s,i)=>marco(14+i*126,14,116,112,i===activo)+s).join(''),140);
}
function silla(pos){
  mesaTit.textContent='Silla y lápiz';
  const lap={detrás:'<rect x="232" y="56" width="70" height="8" rx="3" fill="#f4d03f" opacity=".55" transform="rotate(-8 267 60)"/>',sobre:'<rect x="168" y="96" width="70" height="8" rx="3" fill="#f4d03f" stroke="#b7950b"/>',bajo:'<rect x="170" y="166" width="70" height="8" rx="3" fill="#f4d03f" stroke="#b7950b"/>'};
  hoja.innerHTML=svgHoja(`<g stroke="#8a6436" stroke-width="6" stroke-linecap="round"><path d="M150 40 V180 M250 40 V180 M150 110 H250 M150 50 H250 M160 110 L160 180 M240 110 L240 180"/></g><rect x="146" y="104" width="108" height="12" fill="#c8a165"/>${pos?lap[pos]:''}`,200);
}
const ESC={
  13:`<rect x="0" y="0" width="400" height="200" fill="#d6eaf8"/><rect x="0" y="140" width="400" height="60" fill="#82e0aa"/><g transform="translate(120 130)">${nene('','M0 -12 L-12 -2 M0 -12 L14 -16 M0 6 L-8 24 M0 6 L10 20')}</g><g transform="translate(200 128)">${IC.pelota.replace('r="22"','r="12"')}</g><g transform="translate(280 140) scale(.8)">${IC.perro}</g><circle cx="350" cy="40" r="20" fill="#f9e79f"/>`,
  14:`<rect x="0" y="0" width="400" height="200" fill="#fdebd0"/><rect x="110" y="110" width="180" height="10" fill="#a0522d"/><path d="M130 120 V180 M270 120 V180" stroke="#a0522d" stroke-width="6"/><g transform="translate(90 120)">${nene()}</g><g transform="translate(310 116) scale(1.2)">${nene()}</g><ellipse cx="200" cy="106" rx="24" ry="6" fill="#fff" stroke="#999"/><g transform="translate(200 96) scale(.5)">${IC.taza}</g>`,
  15:`<rect x="0" y="0" width="400" height="200" fill="#e8f8f5"/><rect x="0" y="150" width="400" height="50" fill="#abebc6"/><g transform="translate(200 104)">${nene('<g transform="translate(-16 0) scale(.5)">'+IC.zapatos+'</g>','M0 -12 L-16 -6 M0 -12 L16 -6 M0 6 L-8 24 M0 6 L8 24')}</g><g transform="translate(300 50) rotate(180)">${IC.paraguas}</g><g transform="translate(90 120)">${IC.pez||''}</g><path d="M60 150 q14 -40 30 0" stroke="#27ae60" stroke-width="3" fill="none"/>`,
  16:'',
  17:`<rect x="10" y="10" width="180" height="160" rx="8" fill="#fdebd0"/><rect x="210" y="10" width="180" height="160" rx="8" fill="#d6eaf8"/><g transform="translate(100 110)">${nene('<circle cx="-6" cy="-10" r="4" fill="#8d6e63"/><circle cx="6" cy="2" r="5" fill="#8d6e63"/><circle cx="-4" cy="16" r="4" fill="#8d6e63"/>')}</g><g transform="translate(300 116)">${nene('<ellipse cx="0" cy="22" rx="34" ry="12" fill="#aed6f1" stroke="#5dade2"/><circle cx="-14" cy="-36" r="3" fill="#aed6f1"/><circle cx="10" cy="-40" r="3" fill="#aed6f1"/>')}</g>${TX(100,190,'1')}${TX(300,190,'2')}`
};
function escena(n,marcar){
  mesaTit.textContent=`Lámina ${n}`;
  hoja.innerHTML=svgHoja(ESC[n]+(marcar!=null?`<rect x="${marcar?212:12}" y="12" width="176" height="156" rx="8" fill="none" stroke="var(--cyan)" stroke-width="3"/>`:''),200);
}
function plural(muchos){
  mesaTit.textContent='Lámina 16';
  const uno=`<g transform="translate(100 90) scale(1.1)">${IC.zapatos.split('<path d="M-8')[0]}</g>`;
  const varios=[[250,60],[310,62],[280,112],[340,114],[230,116]].map(([x,y])=>`<g transform="translate(${x} ${y}) scale(.75)">${IC.zapatos.split('<path d="M-8')[0]}</g>`).join('');
  hoja.innerHTML=svgHoja(`${marco(20,20,170,150,!muchos)}${marco(210,20,170,150,muchos)}${uno}${varios}`,190);
}
