/* ---------- Consulta con la madre: preguntas guiadas ---------- */
const PREGUNTAS=[
  {g:'Motivo',q:'¿Qué la trae hoy al control?',A:'Vengo al control de los 3 años no más. Lo encuentro bien, la verdad.',B:'Al control de los 3 años… y quería preguntarle porque la Martina habla muy poco y no se le entiende. En el jardín me dijeron lo mismo.',C:'Vengo al control de los 4 años no más, y para saber si está listo para el pre-kínder.'},
  {g:'Motivo',q:'¿Hay algo que le preocupe de su desarrollo?',A:'No, nada. Es inquieto, pero como todos los niños.',B:'Lo del habla. Dice palabras sueltas, cambia las letras y se enoja cuando no le entendemos. Señala las cosas no más.',C:'No, nada. Es inquieto y preguntón, pero muy sociable.'},
  {g:'Identificación',q:'¿Cuál es el nombre completo de su hijo/a?',A:'Tomás Ignacio Soto Muñoz.',B:'Martina Belén Rojas Pérez.',C:'Mateo Andrés Fuentes Araya.'},
  {g:'Identificación',q:'¿Cuál es su fecha de nacimiento?',A:'El 14 de mayo de 2023.',B:'El 9 de agosto de 2023.',C:'El 27 de agosto de 2022.'},
  {g:'Identificación',q:'¿Me puede dar su RUN?',A:'Sí, es 25.481.337-6.',B:'Es el 25.539.208-K.',C:'Sí, es 24.876.512-9.'},
  {g:'Identificación',q:'¿Cómo se llaman el papá y la mamá?',A:'El papá es Rodrigo Soto y yo soy Carolina Muñoz.',B:'El papá es Jorge Rojas y yo, Paola Pérez.',C:'El papá es Cristián Fuentes y yo soy Daniela Araya.'},
  {g:'Embarazo y parto',q:'¿Cómo fue el embarazo?',A:'Bien, controlado, sin problemas.',B:'Me dio diabetes gestacional, pero la controlé con dieta.',C:'Bien, controlado, sin ningún problema.'},
  {g:'Embarazo y parto',q:'¿Cómo fue el parto? ¿Con cuántas semanas y cuánto pesó?',A:'Normal, a las 39 semanas. Pesó 3.420 gramos y salió bien, con Apgar 9 y 10.',B:'Cesárea a las 38 semanas porque venía de potito. Pesó 3.150 gramos, Apgar 8 y 9.',C:'Normal, a las 40 semanas. Pesó 3.540 gramos y salió bien, con Apgar 9 y 10.'},
  {g:'Desarrollo',q:'¿A qué edad caminó?',A:'Al año justo.',B:'Como al año y dos meses.',C:'Al año justo.'},
  {g:'Desarrollo',q:'¿Cuándo dijo sus primeras palabras? ¿Cómo habla ahora?',A:'Al año más o menos, y a los veinte meses ya juntaba dos palabras. Ahora habla harto, se le entiende casi todo.',B:'Como al año y medio: mamá, papá, agua. Ahora dice palabras sueltas y a veces junta dos, pero cuesta entenderle.',C:'Primeras palabras al año, y a los dos ya hacía frases de tres palabras. Ahora habla en frases largas, hasta cuenta cuentos.'},
  {g:'Desarrollo',q:'¿Entiende lo que se le dice? ¿Sigue instrucciones?',A:'Sí, perfecto. Le pido cosas y las hace.',B:'Sí, entiende todo. Si le digo "trae los zapatos", los trae.',C:'Sí, perfecto. Le pido cosas con varios pasos y las hace.'},
  {g:'Salud',q:'¿Ha tenido enfermedades u hospitalizaciones?',A:'Resfríos no más. Nunca ha estado hospitalizado.',B:'Muchas otitis cuando era más chica, como seis entre el año y los dos años. Varias con antibiótico.',C:'Un par de resfríos y una otitis a los dos años que se pasó sola. Nunca ha estado hospitalizado.'},
  {g:'Salud',q:'¿Cómo escucha? ¿Le han hecho examen de audición?',A:'Escucha bien. No le han hecho examen, pero nunca ha sido necesario.',B:'Nunca le han hecho. A veces la llamo desde la otra pieza y no viene… y le sube el volumen a la tele.',C:'Escucha bien. No le han hecho examen, pero responde a todo.'},
  {g:'Salud',q:'¿Tiene sus controles y vacunas al día? ¿Recuerda la evaluación de los 18 meses?',A:'Todo al día. A los 18 meses le salió normal.',B:'Las vacunas sí. A los 18 meses creo que me dijeron que estaba un poquito atrasada en el lenguaje, pero no volví porque me cambié de trabajo.',C:'Todo al día. A los 18 meses y a los 3 años le salió normal.'},
  {g:'Familia y rutina',q:'¿Con quién vive y quién la/lo cuida?',A:'Con el papá, conmigo y su hermana de 7 años. Va al jardín en la mañana.',B:'Con el papá, conmigo y mi mamá, que la cuida en las tardes. El papá trabaja de noche.',C:'Con el papá y conmigo. Es hijo único y va al jardín en la mañana.'},
  {g:'Familia y rutina',q:'¿Va al jardín? ¿Qué le dicen allá?',A:'Va a un jardín JUNJI desde los 2 años. La tía dice que juega bien con los otros niños.',B:'Va desde los 2 años. Me dijeron que habla poco comparado con los otros.',C:'Va a un jardín JUNJI desde los dos años y medio. La tía dice que comparte y sigue las rutinas.'},
  {g:'Familia y rutina',q:'¿Cuánto tiempo pasa frente a pantallas?',A:'Poco, un rato de monitos en la tarde.',B:'Harto… unas tres horas entre el celular y la tele. La abuela le pasa el celular para que esté tranquila.',C:'Poca, un capítulo de monitos en la tarde.'},
  {g:'Familia y rutina',q:'¿A qué le gusta jugar?',A:'A la pelota y a dibujar con la hermana.',B:'A las muñecas y a jugar con su prima.',C:'A armar con bloques, a andar en bicicleta con rueditas y a dibujar.'}
];
let iaSample=null,iaListo=false;
// Conversación libre: en el artefacto usa Claude del visitante; en Vercel puede usar /api/mama.
const API_MAMA=window.TEPSI_API_MAMA||null;
async function prepararIA(){
  if(API_MAMA){iaListo=true;pintarEstadoIA();return;}
  try{iaSample=window.claude?await window.claude.use('sample'):null;}catch(e){iaSample=null;}
  iaListo=!!iaSample;pintarEstadoIA();
}
function promptMama(historial){
  const C=CASOS[caso],M=C.mama;
  const guia=`Eres ${M.nombre}, madre de ${C.nombre} (${C.edad}), en un control de salud en un CESFAM de Chile. Una estudiante de salud te entrevista antes de aplicar el TEPSI.
Responde SOLO como la madre, en español de Chile, en 1 a 3 frases, con tono ${M.tono}. Usa únicamente estos hechos; si te preguntan algo que no está, responde con naturalidad sin inventar datos clínicos importantes ("no sé", "no me acuerdo", "no que yo sepa").
No des diagnósticos ni uses lenguaje técnico. No reveles que eres una simulación.
HECHOS:
${M.hechos}`;
  const turnos=historial.map(m=>`${m.quien==='est'?'Estudiante':M.nombre}: ${m.txt}`).join('\n');
  return `${guia}\n\nCONVERSACIÓN HASTA AHORA:\n${turnos}\n\nResponde ahora como ${M.nombre} a la última pregunta de la estudiante. Solo el texto de la respuesta.`;
}
async function preguntarIA(historial){
  if(API_MAMA){const r=await fetch(API_MAMA,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({caso,variante:(window.VSIM&&VSIM.variante('tepsi'))||null,historial})});if(!r.ok)throw {code:'http'};const j=await r.json();return j.texto;}
  const {text}=await iaSample(promptMama(historial),{modelTier:'quick',cache:false});return text.trim().replace(/^["“]|["”]$/g,'');
}
