/* ---------- Vida en reposo ---------- */
let ocupado=false;
(function parpadear(){setTimeout(async()=>{if(!reduce){try{const id=animId;const pb=(dur)=>new Promise(r=>{const t0=performance.now();tweens.push(n=>{const k=Math.min(1,(n-t0)/dur);inf.parpadeo=k<.45?k/.45:1-(k-.45)/.55;sucio=true;if(k>=1){inf.parpadeo=0;r();return false;}return true;});});await pb(200);if(Math.random()<.2){await new Promise(r=>setTimeout(r,120));await pb(190);}}catch(e){}}parpadear();},2200+Math.random()*3800);})();

