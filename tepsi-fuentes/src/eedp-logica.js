/* EEDP 0 a 2 años — Anexo 16, Normas Técnicas de Estimulación y Evaluación del Desarrollo Psicomotor 0-6 (MINSAL 2004), págs. 399-405. */
const EEDP_ITEMS=[
[1,1,'S','Fija la mirada en el rostro del animador',6,0],[2,1,'L','Reacciona al sonido de la campanilla',6,0],[3,1,'M','Aprieta el dedo índice del examinador',6,0],[4,1,'C','Sigue con la vista la argolla (ángulo de 90°)',6,0],[5,1,'M','Movimiento de cabeza en posición prona',6,0],
[6,2,'S','Mímica en respuesta al rostro del examinador',6,0],[7,2,'LS','Vocaliza en respuesta a la sonrisa y conversación del examinador',6,0],[8,2,'CS','Reacciona ante el desaparecimiento de la cara del examinador',6,0],[9,2,'M','Intenta controlar la cabeza al ser llevado a posición sentada',6,0],[10,2,'L','Vocaliza dos sonidos diferentes',6,1],
[11,3,'S','Sonríe en respuesta a la sonrisa del examinador',6,0],[12,3,'CL','Gira la cabeza al sonido de la campanilla',6,0],[13,3,'C','Sigue con la vista la argolla (ángulo de 180°)',6,0],[14,3,'M','Mantiene la cabeza erguida al ser llevado a posición sentada',6,0],[15,3,'L','Vocalización prolongada',6,1],
[16,4,'C','La cabeza sigue la cuchara que desaparece',6,0],[17,4,'CL','Gira la cabeza al sonido de la campanilla',6,0],[18,4,'M','En posición prona se levanta a sí mismo',6,0],[19,4,'M','Levanta la cabeza y hombros al ser llevado a posición sentada',6,0],[20,4,'LS','Ríe a carcajadas',6,1],
[21,5,'SL','Vuelve la cabeza hacia quien le habla',6,0],[22,5,'C','Palpa el borde de la mesa',6,0],[23,5,'C','Intenta prehensión de la argolla',6,0],[24,5,'M','Tracciona hasta lograr la posición sentada',6,0],[25,5,'M','Se mantiene sentado con leve apoyo',6,0],
[26,6,'M','Se mantiene sentado solo, 6 c/u momentáneamente',6,0],[27,6,'C','Vuelve la cabeza hacia la cuchara caída',6,0],[28,6,'C','Coge la argolla',6,0],[29,6,'C','Coge el cubo',6,0],[30,6,'LS','Vocaliza cuando se le habla',6,1],
[31,7,'M','Se mantiene sentado solo por 30 seg. o más',6,0],[32,7,'C','Intenta agarrar la pastilla',6,0],[33,7,'L','Escucha selectivamente palabras familiares',6,0],[34,7,'S','Coopera en los juegos',6,0],[35,7,'C','Coge dos cubos, uno en cada mano',6,0],
[36,8,'M','Se sienta solo y se mantiene erguido',6,0],[37,8,'M','Tracciona hasta lograr la posición de pie',6,0],[38,8,'M','Iniciación de pasos sostenido bajo los brazos',6,0],[39,8,'C','Coge la pastilla con movimiento de rastrillo',6,0],[40,8,'L','Dice da-da o equivalente',6,0],
[41,9,'M','Logra llegar a posición de pie, apoyado en un mueble',6,0],[42,9,'M','Camina sostenido bajo los brazos',6,0],[43,9,'C','Coge la pastilla con participación del pulgar',6,0],[44,9,'C','Encuentra el cubo bajo el pañal',6,0],[45,9,'LS','Reacciona a los requerimientos verbales',6,0],
[46,10,'C','Coge la pastilla con pulgar e índice',6,0],[47,10,'S','Imita gestos simples',6,0],[48,10,'C','Coge el tercer cubo dejando uno de los dos primeros',6,0],[49,10,'C','Junta cubos en la línea media',6,0],[50,10,'SL','Reacciona al “no, no”',6,0],
[51,12,'M','Camina algunos pasos de la mano',12,0],[52,12,'C','Junta las manos en la línea media',12,0],[53,12,'M','Se pone de pie solo',12,1],[54,12,'LS','Entrega como respuesta a una orden',12,0],[55,12,'L','Dice al menos dos palabras',12,1],
[56,15,'M','Camina solo',18,0],[57,15,'C','Introduce la pastilla en la botella',18,0],[58,15,'C','Espontáneamente garabatea',18,0],[59,15,'C','Coge el tercer cubo conservando los dos primeros',18,0],[60,15,'L','Dice al menos tres palabras',18,1],
[61,18,'LS','Muestra sus zapatos',18,0],[62,18,'M','Camina varios pasos hacia el lado',18,0],[63,18,'M','Camina varios pasos hacia atrás',18,0],[64,18,'C','Retira inmediatamente la pastilla de la botella',18,0],[65,18,'C','Atrae el cubo con un palo',18,0],
[66,21,'L','Nombra un objeto de los cuatro presentados',18,0],[67,21,'L','Imita tres palabras en el momento del examen',18,0],[68,21,'C','Construye una torre con tres cubos',18,0],[69,21,'L','Dice al menos seis palabras',18,1],[70,21,'LS','Usa palabras para comunicar deseos',18,1],
[71,24,'M','Se para en un pie con ayuda',18,0],[72,24,'L','Nombra dos objetos de los cuatro presentados',18,0],[73,24,'S','Ayuda en tareas simples',18,1],[74,24,'L','Apunta 4 o más partes en el cuerpo de la muñeca',18,0],[75,24,'C','Construye una torre con cinco cubos',18,0]
];
const EEDP_AREAS={C:'Coordinación',S:'Social',L:'Lenguaje',M:'Motora'};
/* Tabla de conversión EM/EC → PE, 8 meses (pág. 402). Pares [razón, PE]. */
const EEDP_PE8=[[0.76,0.60],[0.77,0.61],[0.78,0.62],[0.79,0.63],[0.80,0.64],[0.81,0.66],[0.82,0.67],[0.83,0.68],[0.84,0.69],[0.85,0.70],[0.86,0.71],[0.87,0.72],[0.88,0.74],[0.89,0.75],
[0.90,0.76],[0.91,0.77],[0.92,0.78],[0.93,0.79],[0.94,0.80],[0.95,0.82],[0.96,0.83],[0.97,0.84],[0.98,0.85],[0.99,0.86],[1.00,0.87],[1.01,0.89],[1.02,0.90],[1.03,0.91],
[1.04,0.92],[1.05,0.93],[1.06,0.94],[1.07,0.95],[1.08,0.97],[1.09,0.98],[1.10,0.99],[1.11,1.00],[1.12,1.01],[1.13,1.02],[1.14,1.03],[1.15,1.05],[1.16,1.06],[1.17,1.07],
[1.18,1.08],[1.19,1.09],[1.20,1.10],[1.21,1.12],[1.22,1.13],[1.23,1.14],[1.24,1.15],[1.25,1.16],[1.26,1.17],[1.27,1.18],[1.28,1.20],[1.29,1.21],[1.30,1.22],[1.31,1.23],
[1.32,1.24],[1.33,1.25],[1.34,1.26],[1.35,1.28],[1.36,1.29],[1.37,1.30],[1.38,1.31],[1.39,1.32],[1.40,1.33],[1.41,1.35],[1.42,1.36],[1.43,1.37],[1.44,1.38],[1.45,1.39],[1.46,1.40]];

/* Días de edad cronológica: (meses*30)+días. Resta fecha nacimiento a fecha de evaluación (ISO yyyy-mm-dd). */
function eedpEdadCronologica(nacISO,evalISO){
  const [ny,nm,nd]=nacISO.split('-').map(Number),[ey,em,ed]=evalISO.split('-').map(Number);
  let m=(ey-ny)*12+(em-nm),d=ed-nd;
  if(d<0){m--;d+=30;}
  if(m<0||(m===0&&d<0))return null;
  return {meses:m,dias:d,total:m*30+d};
}
/* Mes base según rangos de la tabla (7: 6m16d–7m15d; 8: 7m16d–8m15d; ...). */
function eedpMesBase(ecDias){return Math.ceil((ecDias-15)/30);}
/* Mes de inicio: el mes inferior al base. Se baja si el niño fracasa en los 5 ítems. */
const EEDP_BLOQUES=[...new Set(EEDP_ITEMS.map(i=>i[1]))].sort((a,b)=>a-b);
function eedpBloqueInicio(base){
  let idx=0;
  for(let i=0;i<EEDP_BLOQUES.length;i++){if(EEDP_BLOQUES[i]<=base-1)idx=i;}
  return idx;
}
const itemsDeBloque=b=>EEDP_ITEMS.filter(i=>i[1]===b);
/* respuestas: {itemNum: true|false}. Devuelve el cálculo completo. */
function eedpCalcular(ecDias,respuestas){
  const base=eedpMesBase(ecDias);
  let idx=eedpBloqueInicio(base);
  const estadoBloque=b=>{const its=itemsDeBloque(b);const ev=its.filter(i=>respuestas[i[0]]!==undefined);
    return {total:its.length,evaluados:ev.length,exitos:ev.filter(i=>respuestas[i[0]]===true).length};};
  /* Bajar si fracasa todo el bloque de inicio (solo con bloque completo evaluado). */
  while(idx>0){const e=estadoBloque(EEDP_BLOQUES[idx]);if(e.evaluados===e.total&&e.exitos===0)idx--;else break;}
  /* Línea base: mayor bloque con los 5 ítems exitosos, desde el inicio hacia arriba hasta el primer bloque sin éxitos. */
  let lineaBase=null,parada=null;
  for(let j=idx;j<EEDP_BLOQUES.length;j++){
    const b=EEDP_BLOQUES[j];const e=estadoBloque(b);
    if(e.evaluados===0)break;
    if(e.exitos===0){parada=b;break;}
    if(e.exitos===e.total&&e.evaluados===e.total)lineaBase=b;
  }
  const incompleto=lineaBase===null;
  if(incompleto)return {ok:false,motivo:'Sin línea base: el niño debe tener los 5 ítems exitosos de algún mes. Revisa el registro o evalúa el mes anterior.',base,inicio:EEDP_BLOQUES[idx]};
  /* Puntos adicionales: ítems exitosos en bloques superiores a la línea base, hasta la parada. */
  let extra=0;const sumados=[];
  for(const b of EEDP_BLOQUES){
    if(b<=lineaBase)continue;
    if(parada!==null&&b>=parada)break;
    for(const it of itemsDeBloque(b)){if(respuestas[it[0]]===true){extra+=it[4];sumados.push(it[0]);}}
  }
  const EM=lineaBase*30+extra;
  const razon=Math.floor((EM/ecDias)*100)/100;
  const fila=EEDP_PE8.find(p=>Math.abs(p[0]-razon)<1e-9);
  let PE,pe_nota='';
  if(lineaBase!==8){PE=null;pe_nota='Esta app solo tiene la tabla de 8 meses cargada.';}
  else if(razon<EEDP_PE8[0][0]){PE=null;pe_nota='Razón por debajo de la tabla (menor a 0,76): PE menor a 0,60.';}
  else if(razon>EEDP_PE8[EEDP_PE8.length-1][0]){PE=null;pe_nota='Razón por encima de la tabla (mayor a 1,46): PE mayor a 1,40.';}
  else PE=fila?fila[1]:null;
  let cd=null;
  if(PE!==null)cd=PE>=0.85?'Normal':(PE>=0.70?'Riesgo':'Retraso');
  else if(razon<EEDP_PE8[0][0]&&lineaBase===8)cd='Retraso';
  else if(razon>EEDP_PE8[EEDP_PE8.length-1][0]&&lineaBase===8)cd='Normal';
  /* Perfil: último ítem exitoso por área; déficit si su mes está bajo los meses cumplidos. */
  const mesesCumplidos=Math.floor(ecDias/30);
  const perfil={};
  const zonas={S8:[34],S15:[54],M10:[41,42],M21:[62,63]};
  for(const a of Object.keys(EEDP_AREAS)){
    let ult=null;
    for(const it of EEDP_ITEMS){
      if(it[2].indexOf(a)<0)continue;
      if(respuestas[it[0]]===true)ult={mes:it[1],item:it[0]};
    }
    /* Zonas achuradas (Social 8 y 15; Motora 10 y 21). */
    if(a==='S'){if(zonas.S8.every(n=>respuestas[n]===true)&&(!ult||ult.mes<8))ult={mes:8,item:34,zona:'Social 8 meses (zona achurada, ítem 34)'};
      if(zonas.S15.every(n=>respuestas[n]===true)&&(!ult||ult.mes<15))ult={mes:15,item:54,zona:'Social 15 meses (zona achurada, ítem 54)'};}
    if(a==='M'){if(zonas.M10.every(n=>respuestas[n]===true)&&(!ult||ult.mes<10))ult={mes:10,item:41,zona:'Motora 10 meses (zona achurada, ítems 41 y 42)'};
      if(zonas.M21.every(n=>respuestas[n]===true)&&(!ult||ult.mes<21))ult={mes:21,item:62,zona:'Motora 21 meses (zona achurada, ítems 62 y 63)'};}
    perfil[a]={ultimo:ult,deficit:ult?ult.mes<mesesCumplidos:true};
  }
  return {ok:true,base,lineaBase,parada,EM,EC:ecDias,razon,PE,pe_nota,cd,perfil,sumados,mesesCumplidos};
}
if(typeof module!=='undefined')module.exports={EEDP_ITEMS,EEDP_AREAS,EEDP_PE8,eedpEdadCronologica,eedpMesBase,eedpCalcular};
