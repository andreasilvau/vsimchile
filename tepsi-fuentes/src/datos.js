/* ---------- Protocolo TEPSI (ítems del formulario) ----------
   Nombres, elementos y materiales según el formulario TEPSI.
   Consignas y criterios están resumidos para práctica: verificarlos con el manual
   (Haeussler y Marchant, Ediciones UC). */
const SUBS=[
  {id:'C',nombre:'Coordinación'},
  {id:'L',nombre:'Lenguaje'},
  {id:'M',nombre:'Motricidad'}
];
const ITEMS=[
  // Coordinación
  {id:'C1',sub:'C',nombre:'Traslada agua de un vaso a otro sin derramarla',mat:'2 vasos',consigna:'Pide que pase el agua de un vaso al otro sin derramar.',criterio:'Traslada el agua sin derramar.'},
  {id:'C2',sub:'C',nombre:'Construye un puente con tres cubos con modelo presente',mat:'6 cubos',consigna:'Construye un puente con 3 cubos frente al niño/a y pide que haga uno igual.',criterio:'Dos cubos de base separados y uno encima, igual al modelo.'},
  {id:'C3',sub:'C',nombre:'Construye una torre de 8 o más cubos',mat:'12 cubos',consigna:'Entrega los cubos y pide que haga una torre lo más alta posible.',criterio:'Torre de 8 o más cubos que se mantiene en pie.'},
  {id:'C4',sub:'C',nombre:'Desabotona',mat:'Estuche',consigna:'Entrega el estuche abotonado y pide que lo desabotone.',criterio:'Desabotona sin ayuda.'},
  {id:'C5',sub:'C',nombre:'Abotona',mat:'Estuche',consigna:'Entrega el estuche abierto y pide que lo abotone.',criterio:'Abotona sin ayuda.'},
  {id:'C6',sub:'C',nombre:'Enhebra una aguja',mat:'Aguja de lana, hilo',consigna:'Pide que pase la lana por el ojo de la aguja.',criterio:'Pasa la lana por el ojo de la aguja.'},
  {id:'C7',sub:'C',nombre:'Desata cordones',mat:'Tablero con cordón',consigna:'Pide que desate el nudo del cordón.',criterio:'Desata el nudo.'},
  {id:'C8',sub:'C',nombre:'Copia una línea recta',mat:'Lámina 1, lápiz, reverso hoja',consigna:'Muestra la lámina y pide que haga una igual.',criterio:'Traza una línea recta.'},
  {id:'C9',sub:'C',nombre:'Copia un círculo',mat:'Lámina 2, lápiz, reverso hoja',consigna:'Muestra la lámina y pide que haga uno igual.',criterio:'Figura cerrada y redondeada.'},
  {id:'C10',sub:'C',nombre:'Copia una cruz',mat:'Lámina 3, lápiz, reverso hoja',consigna:'Muestra la lámina y pide que haga una igual.',criterio:'Dos líneas que se cruzan.'},
  {id:'C11',sub:'C',nombre:'Copia un triángulo',mat:'Lámina 4, lápiz, reverso hoja',consigna:'Muestra la lámina y pide que haga uno igual.',criterio:'Figura cerrada con tres ángulos.'},
  {id:'C12',sub:'C',nombre:'Copia un cuadrado',mat:'Lámina 5, lápiz, reverso hoja',consigna:'Muestra la lámina y pide que haga uno igual.',criterio:'Figura cerrada con cuatro ángulos.'},
  {id:'C13',sub:'C',nombre:'Dibuja 9 o más partes de una figura humana',mat:'Lápiz, reverso hoja',consigna:'Pide que dibuje una persona (un solo dibujo para C13, C14 y C15).',criterio:'9 o más partes reconocibles.',dibujo:true},
  {id:'C14',sub:'C',nombre:'Dibuja 6 o más partes de una figura humana',mat:'Lápiz, reverso hoja',consigna:'Se puntúa con el mismo dibujo de la figura humana.',criterio:'6 o más partes reconocibles.',dibujo:true},
  {id:'C15',sub:'C',nombre:'Dibuja 3 o más partes de una figura humana',mat:'Lápiz, reverso hoja',consigna:'Se puntúa con el mismo dibujo de la figura humana.',criterio:'3 o más partes reconocibles.',dibujo:true},
  {id:'C16',sub:'C',nombre:'Ordena por tamaño',mat:'Tablero, barritas',consigna:'Pide que ordene las barritas de la más grande a la más chica.',criterio:'Ordena todas las barritas por tamaño.'},
  // Lenguaje
  {id:'L1',sub:'L',nombre:'Reconoce grande y chico',mat:'Lámina 6',el:['grande','chico'],consigna:'Pregunta cuál es el grande y cuál es el chico.',criterio:'Reconoce ambos.'},
  {id:'L2',sub:'L',nombre:'Reconoce más y menos',mat:'Lámina 7',el:['más','menos'],consigna:'Pregunta dónde hay más y dónde hay menos.',criterio:'Reconoce ambos.'},
  {id:'L3',sub:'L',nombre:'Nombra animales',mat:'Lámina 8',el:['gato','perro','chancho','pato','paloma','oveja','tortuga','gallina'],consigna:'Muestra cada animal y pregunta: ¿Qué es esto?',criterio:'Nombra al menos 5 de 8.'},
  {id:'L4',sub:'L',nombre:'Nombra objetos',mat:'Lámina 5',el:['paraguas','vela','escoba','tetera','zapatos','reloj','serrucho','taza'],consigna:'Muestra cada objeto y pregunta: ¿Qué es esto?',criterio:'Nombra al menos 5 de 8.'},
  {id:'L5',sub:'L',nombre:'Reconoce largo y corto',mat:'Lámina 1',el:['largo','corto'],consigna:'Pregunta cuál es la línea larga y cuál la corta.',criterio:'Reconoce ambos.'},
  {id:'L6',sub:'L',nombre:'Verbaliza acciones',mat:'Lámina 11',el:['cortando','saltando','planchando','comiendo'],consigna:'Pregunta: ¿Qué está haciendo el niño?',criterio:'Verbaliza al menos 3 de 4 acciones.'},
  {id:'L7',sub:'L',nombre:'Conoce la utilidad de objetos',mat:'—',el:['cuchara','lápiz','jabón','escoba','cama','tijera'],consigna:'Pregunta: ¿Para qué sirve…?',criterio:'Dice la utilidad de al menos 5 de 6.'},
  {id:'L8',sub:'L',nombre:'Discrimina pesado y liviano',mat:'Bolsas con arena y esponja',el:['pesado','liviano'],consigna:'Entrega las bolsas y pregunta cuál es pesada y cuál liviana.',criterio:'Discrimina ambas.'},
  {id:'L9',sub:'L',nombre:'Verbaliza su nombre y apellido',mat:'—',el:['nombre','apellido'],consigna:'Pregunta: ¿Cómo te llamas?',criterio:'Dice nombre y apellido.'},
  {id:'L10',sub:'L',nombre:'Identifica su sexo',mat:'—',consigna:'Pregunta: ¿Eres niño o niña?',criterio:'Identifica su sexo.'},
  {id:'L11',sub:'L',nombre:'Conoce el nombre de sus padres',mat:'—',el:['papá','mamá'],consigna:'Pregunta cómo se llaman su papá y su mamá.',criterio:'Dice el nombre de ambos.'},
  {id:'L12',sub:'L',nombre:'Da respuestas coherentes a situaciones planteadas',mat:'—',el:['hambre','cansado','frío'],consigna:'Pregunta qué hace cuando tiene hambre, está cansado o tiene frío.',criterio:'Responde coherentemente al menos 2 de 3.'},
  {id:'L13',sub:'L',nombre:'Comprende preposiciones',mat:'Lápiz',el:['detrás','sobre','bajo'],consigna:'Pide que ponga el lápiz detrás, sobre y bajo la silla.',criterio:'Ejecuta al menos 2 de 3.'},
  {id:'L14',sub:'L',nombre:'Razona por analogías compuestas',mat:'—',el:['hielo','ratón','mamá'],consigna:'Completa: el hielo es frío, el fuego es…; el ratón es chico, el elefante es…; mamá es mujer, papá es…',criterio:'Completa al menos 2 de 3.'},
  {id:'L15',sub:'L',nombre:'Nombra colores',mat:'Papel lustre azul, amarillo y rojo',el:['azul','amarillo','rojo'],consigna:'Pregunta: ¿De qué color es este papel?',criterio:'Nombra los 3 colores.'},
  {id:'L16',sub:'L',nombre:'Señala colores',mat:'Papel lustre azul, amarillo y rojo',el:['azul','amarillo','rojo'],consigna:'Pide: muéstrame el azul, el amarillo, el rojo.',criterio:'Señala los 3 colores.'},
  {id:'L17',sub:'L',nombre:'Nombra figuras geométricas',mat:'Lámina 12',el:['círculo','cuadrado','triángulo'],consigna:'Pregunta: ¿Qué figura es esta?',criterio:'Nombra las 3 figuras.'},
  {id:'L18',sub:'L',nombre:'Señala figuras geométricas',mat:'Lámina 12',el:['círculo','cuadrado','triángulo'],consigna:'Pide: muéstrame el círculo, el cuadrado, el triángulo.',criterio:'Señala las 3 figuras.'},
  {id:'L19',sub:'L',nombre:'Describe escenas',mat:'Láminas 13 y 14',el:['13','14'],consigna:'Pide: cuéntame qué pasa en este dibujo.',criterio:'Describe ambas escenas relacionando personajes y acciones.'},
  {id:'L20',sub:'L',nombre:'Reconoce absurdos',mat:'Lámina 15',consigna:'Pregunta: ¿Qué cosa está mal en este dibujo?',criterio:'Identifica lo absurdo.'},
  {id:'L21',sub:'L',nombre:'Usa plurales',mat:'Lámina 16',consigna:'Muestra uno y varios; pregunta qué hay.',criterio:'Usa el plural.'},
  {id:'L22',sub:'L',nombre:'Reconoce antes y después',mat:'Lámina 17',el:['antes','después'],consigna:'Pregunta qué pasó antes y qué pasó después.',criterio:'Reconoce ambos.'},
  {id:'L23',sub:'L',nombre:'Define palabras',mat:'—',el:['manzana','pelota','zapato','abrigo'],consigna:'Pregunta: ¿Qué es una manzana?…',criterio:'Define al menos 3 de 4.'},
  {id:'L24',sub:'L',nombre:'Nombra características de objetos',mat:'Pelota, globo inflado, bolsa de arena',el:['pelota','globo','bolsa'],consigna:'Pregunta: ¿Cómo es la pelota?…',criterio:'Nombra una característica de al menos 2 de 3.'},
  // Motricidad
  {id:'M1',sub:'M',nombre:'Salta con los dos pies juntos en el mismo lugar',mat:'—',consigna:'Demuestra y pide que salte con los pies juntos.',criterio:'Despega ambos pies a la vez.'},
  {id:'M2',sub:'M',nombre:'Camina diez pasos llevando un vaso lleno de agua',mat:'Vaso lleno de agua',consigna:'Pide que camine diez pasos con el vaso sin derramar.',criterio:'Camina 10 pasos sin derramar.'},
  {id:'M3',sub:'M',nombre:'Lanza una pelota en una dirección determinada',mat:'Pelota',consigna:'Pide que lance la pelota hacia ti.',criterio:'La pelota llega en la dirección indicada.'},
  {id:'M4',sub:'M',nombre:'Se para en un pie sin apoyo 10 segundos o más',mat:'—',consigna:'Pide que se pare en un pie el mayor tiempo posible (un intento para M4, M5 y M6).',criterio:'10 s o más.',pie:10},
  {id:'M5',sub:'M',nombre:'Se para en un pie sin apoyo 5 segundos o más',mat:'—',consigna:'Se puntúa con el mismo intento.',criterio:'5 s o más.',pie:5},
  {id:'M6',sub:'M',nombre:'Se para en un pie 1 segundo o más',mat:'—',consigna:'Se puntúa con el mismo intento.',criterio:'1 s o más.',pie:1},
  {id:'M7',sub:'M',nombre:'Camina en punta de pies seis o más pasos',mat:'—',consigna:'Demuestra y pide que camine en punta de pies.',criterio:'6 o más pasos en punta de pies.'},
  {id:'M8',sub:'M',nombre:'Salta 20 cm con los pies juntos',mat:'Hoja de registro',consigna:'Pide que salte por encima de la hoja con los pies juntos.',criterio:'Salta 20 cm con los pies juntos.'},
  {id:'M9',sub:'M',nombre:'Salta en un pie tres o más veces sin apoyo',mat:'—',consigna:'Pide que salte en un pie.',criterio:'3 o más saltos sin apoyo.'},
  {id:'M10',sub:'M',nombre:'Coge una pelota',mat:'Pelota',consigna:'Lanza la pelota desde 1 m y pide que la tome.',criterio:'Toma la pelota con las manos.'},
  {id:'M11',sub:'M',nombre:'Camina hacia delante topando punta y talón',mat:'—',consigna:'Demuestra y pide que camine topando punta y talón.',criterio:'Avanza topando punta y talón.'},
  {id:'M12',sub:'M',nombre:'Camina hacia atrás topando punta y talón',mat:'—',consigna:'Demuestra y pide que camine hacia atrás topando punta y talón.',criterio:'Retrocede topando punta y talón.'}
];

/* ---------- Casos ----------
   ok: 1 éxito, 0 fracaso. r: datos de la respuesta del niño/a para animar y retroalimentar. */
const CASOS={
  A:{nombre:'Tomás',edad:'3 años 5 meses',sexo:'Masculino',ctx:'Control de salud de los 3 años en el CESFAM. Viene con su madre, Carolina.',
    ident:{nombre:'Tomás Ignacio Soto Muñoz',run:'25.481.337-6',nac:'2023-05-14',examen:'2026-10-27',ficha:'4581'},
    ficha:[['Edad','3 a 5 m'],['Sexo','Masculino'],['Acompaña','Madre']],
    mama:{nombre:'Carolina',tono:'tranquila y cooperadora',
      hechos:`Hijo: Tomás Ignacio Soto Muñoz, nacido el 14 de mayo de 2023, RUN 25.481.337-6, ficha 4581. Padre: Rodrigo Soto. Madre: Carolina Muñoz, 31 años, técnico en párvulos.
Motivo: control de salud de los 3 años; no trae preocupaciones.
Embarazo controlado, sin complicaciones. Parto vaginal a las 39 semanas, peso 3.420 g, Apgar 9/10, sin hospitalizaciones neonatales.
Lactancia materna exclusiva hasta los 6 meses, luego mixta hasta el año y medio.
Desarrollo: sostuvo la cabeza a los 3 meses, se sentó a los 6, caminó solo a los 12 meses, primeras palabras al año, frases de dos palabras a los 20 meses. Hoy habla en frases y se le entiende casi todo.
Salud: resfríos ocasionales, sin otitis a repetición, sin hospitalizaciones. Vacunas al día. EEDP a los 18 meses normal.
Asiste a jardín infantil JUNJI desde los 2 años; la tía dice que juega bien con otros niños. Vive con ambos padres y una hermana de 7 años. Duerme bien, come de todo. Le gusta la pelota y dibujar.`},
    r:{
      C1:{ok:1,exp:'Trasvasija con cuidado y no derrama.'},
      C2:{ok:1,exp:'Copia el puente: dos cubos separados y uno encima.'},
      C3:{ok:1,v:8,exp:'Apila 8 cubos y la torre se mantiene.'},
      C4:{ok:1,botones:3,exp:'Desabotona los botones sin ayuda.'},
      C5:{ok:0,botones:1,exp:'Abotona solo uno y pide ayuda: no logra abotonar sin ayuda.'},
      C6:{ok:0,exp:'Intenta varias veces, pero la lana no pasa por el ojo de la aguja.'},
      C7:{ok:1,exp:'Tira de la punta del cordón y desata el nudo.'},
      C8:{ok:1,exp:'Traza una línea recta.'},
      C9:{ok:1,exp:'El círculo está cerrado y es redondeado.'},
      C10:{ok:1,exp:'Las dos líneas se cruzan.'},
      C11:{ok:0,exp:'Hace una figura redondeada sin ángulos: no es un triángulo.'},
      C12:{ok:0,exp:'Hace una figura cerrada, pero sin cuatro ángulos claros.'},
      C13:{ok:0,partes:4,exp:'Dibuja 4 partes (cabeza, ojos, boca, piernas): no llega a 9.'},
      C14:{ok:0,partes:4,exp:'4 partes: no llega a 6.'},
      C15:{ok:1,partes:4,exp:'4 partes: cumple 3 o más.'},
      C16:{ok:0,orden:[3,1,4,2,5],exp:'Ordena solo algunas barritas; el conjunto no queda ordenado.'},
      L1:{ok:1,resp:['¡Este!','Y este chiquitito.'],sel:[0,1],exp:'Reconoce grande y chico.'},
      L2:{ok:1,resp:['Aquí hay más.','Aquí menos.'],sel:[0,1],exp:'Reconoce más y menos.'},
      L3:{ok:1,resp:['Gato.','Perro.','Chancho.','Pato.','Pájaro.','Oveja.','Tortuga.','Pollo.'],bien:[1,1,1,1,0,1,1,0],exp:'Nombra 6 de 8 ("pájaro" y "pollo" no corresponden).'},
      L4:{ok:1,resp:['Paraguas.','Una vela.','Escoba.','Tetera.','Zapatos.','Reloj.','Un cuchillo.','Taza.'],bien:[1,1,1,1,1,1,0,1],exp:'Nombra 7 de 8.'},
      L5:{ok:1,resp:['Esta es larga.','Esta corta.'],sel:[0,1],exp:'Reconoce largo y corto.'},
      L6:{ok:1,resp:['Está cortando.','¡Saltando!','Mmm… haciendo ropa.','Está comiendo.'],bien:[1,1,0,1],exp:'Verbaliza 3 de 4 acciones.'},
      L7:{ok:1,resp:['Pa comer.','Pa pintar.','Pa lavarse las manos.','Pa barrer.','Pa dormir.','Pa jugar.'],bien:[1,1,1,1,1,0],exp:'Dice la utilidad de 5 de 6 ("tijera: para jugar" no corresponde).'},
      L8:{ok:1,resp:['Esta pesa harto.','Esta no pesa.'],sel:[0,1],exp:'Discrimina pesado y liviano.'},
      L9:{ok:1,resp:['Tomás Soto.'],bien:[1,1],exp:'Dice nombre y apellido.'},
      L10:{ok:1,resp:['Niño.'],exp:'Identifica su sexo.'},
      L11:{ok:1,resp:['Mi papá Rodrigo y mi mamá Carolina.'],bien:[1,1],exp:'Dice el nombre de ambos padres.'},
      L12:{ok:1,resp:['Como.','Me acuesto.','Mmm… me mojo.'],bien:[1,1,0],exp:'Responde coherentemente 2 de 3.'},
      L13:{ok:1,pos:['detrás','sobre','sobre'],bien:[1,1,0],exp:'Ejecuta 2 de 3 (falla "bajo").'},
      L14:{ok:0,resp:['Rojo.','Grande.','Mamá.'],bien:[0,1,0],exp:'Completa 1 de 3.'},
      L15:{ok:1,resp:['Azul.','Amarillo.','Rojo.'],bien:[1,1,1],exp:'Nombra los 3 colores.'},
      L16:{ok:1,sel:[0,1,2],bien:[1,1,1],exp:'Señala los 3 colores.'},
      L17:{ok:0,resp:['Una pelota.','Una ventana.','Un techo.'],bien:[0,0,0],exp:'No nombra las figuras.'},
      L18:{ok:0,sel:[0,2,1],bien:[1,0,0],exp:'Señala solo el círculo.'},
      L19:{ok:0,resp:['Un niño, una pelota, un perro.','La mamá… la mesa.'],bien:[0,0],exp:'Enumera elementos sin describir la escena.'},
      L20:{ok:0,resp:['Un niño.'],exp:'No identifica lo absurdo.'},
      L21:{ok:1,resp:['Un zapato.','¡Muchos zapatos!'],exp:'Usa el plural.'},
      L22:{ok:0,resp:['Se está bañando.','Mmm… no sé.'],bien:[0,0],exp:'No reconoce antes y después.'},
      L23:{ok:0,resp:['Pa comer.','Pa jugar.','Pa ponérselo.','No sé.'],bien:[0,0,0,0],exp:'Responde por uso; no define.'},
      L24:{ok:0,resp:['Pelota.','Un globo.','Arena.'],bien:[0,0,0],exp:'Nombra los objetos sin decir características.'},
      M1:{ok:1,saltos:3,exp:'Despega ambos pies a la vez.'},
      M2:{ok:1,pasos:10,derrama:false,exp:'Camina 10 pasos sin derramar.'},
      M3:{ok:1,d:'1,4 m',exp:'La pelota llega hacia la examinadora.'},
      M4:{ok:0,t:3.1,exp:'Se mantiene 3,1 s: no llega a 10 s.'},
      M5:{ok:0,t:3.1,exp:'3,1 s: no llega a 5 s.'},
      M6:{ok:1,t:3.1,exp:'3,1 s: cumple 1 s o más.'},
      M7:{ok:1,pasos:7,exp:'Camina 7 pasos en punta de pies.'},
      M8:{ok:1,dist:.24,exp:'Salta por encima de la hoja con los pies juntos.'},
      M9:{ok:0,saltos:1,exp:'Da un salto en un pie y apoya el otro.'},
      M10:{ok:1,exp:'Toma la pelota con las manos.'},
      M11:{ok:0,pasos:2,exp:'Separa los pies después de dos pasos.'},
      M12:{ok:0,pasos:1,exp:'No logra retroceder topando punta y talón.'}
    },
    cierre:'Perfil armónico entre subtests. Los fracasos están en ítems que se consolidan después de los 3 años y medio (copias de triángulo y cuadrado, figura humana detallada, equilibrio prolongado, marcha punta-talón). La categoría depende del puntaje T según la tabla del manual para su edad.'},
  B:{nombre:'Martina',edad:'3 años 2 meses',sexo:'Femenino',ctx:'Control de salud de los 3 años en el CESFAM. Viene con su madre, Paola, que está preocupada por el lenguaje.',
    ident:{nombre:'Martina Belén Rojas Pérez',run:'25.539.208-K',nac:'2023-08-09',examen:'2026-10-27',ficha:'4632'},
    ficha:[['Edad','3 a 2 m'],['Sexo','Femenino'],['Acompaña','Madre']],
    mama:{nombre:'Paola',tono:'preocupada, algo ansiosa, coopera',
      hechos:`Hija: Martina Belén Rojas Pérez, nacida el 9 de agosto de 2023, RUN 25.539.208-K, ficha 4632. Padre: Jorge Rojas (trabaja de noche, conductor). Madre: Paola Pérez, 27 años, trabaja en un supermercado.
Motivo: control de los 3 años; le preocupa que "habla poco y no se le entiende", "dice palabras sueltas y muchas las cambia". En el jardín le dijeron lo mismo.
Embarazo controlado; diabetes gestacional tratada con dieta. Parto por cesárea a las 38 semanas por presentación podálica, peso 3.150 g, Apgar 8/9.
Lactancia materna hasta los 4 meses, luego fórmula.
Desarrollo: caminó a los 14 meses, primeras palabras a los 18 meses (mamá, papá, agua). Hoy usa palabras sueltas y algunas combinaciones de dos palabras; entiende lo que se le dice y sigue instrucciones simples. Se frustra cuando no la entienden y señala lo que quiere.
Salud: otitis media aguda a repetición entre el año y los dos años (unos 6 episodios, varios con antibiótico); nunca le han hecho examen de audición. A veces no responde cuando la llaman desde otra pieza; sube el volumen de la tele.
Asiste a sala cuna/jardín desde los 2 años. Vive con ambos padres y la abuela materna, que la cuida en las tardes. Mucha pantalla (celular y TV, unas 3 horas al día). Juega bien con su prima. Duerme bien.
EEDP a los 18 meses: no recuerda el resultado; cree que le dijeron que "estaba un poquito atrasada en el lenguaje" pero no volvió al control porque cambió de trabajo.`},
    r:{
      C1:{ok:1,exp:'Trasvasija sin derramar.'},
      C2:{ok:1,exp:'Copia el puente igual al modelo.'},
      C3:{ok:0,v:7,cae:true,exp:'Al poner el octavo cubo la torre se cae; llega a 7.'},
      C4:{ok:1,botones:3,exp:'Desabotona sin ayuda.'},
      C5:{ok:0,botones:0,exp:'No logra abotonar.'},
      C6:{ok:0,exp:'La lana no pasa por la aguja.'},
      C7:{ok:0,exp:'Tira del cordón y aprieta más el nudo.'},
      C8:{ok:1,exp:'Traza una línea recta.'},
      C9:{ok:1,exp:'El círculo está cerrado, aunque irregular.'},
      C10:{ok:0,exp:'Dibuja dos líneas paralelas que no se cruzan.'},
      C11:{ok:0,exp:'Hace un garabato circular.'},
      C12:{ok:0,exp:'Hace un garabato circular.'},
      C13:{ok:0,partes:0,exp:'Hace un garabato sin partes reconocibles.'},
      C14:{ok:0,partes:0,exp:'Sin partes reconocibles.'},
      C15:{ok:0,partes:0,exp:'Sin partes reconocibles.'},
      C16:{ok:0,orden:[2,5,1,4,3],exp:'No ordena por tamaño.'},
      L1:{ok:1,resp:['(señala) Ete.','(señala) Ete.'],sel:[0,1],exp:'Reconoce grande y chico señalando.'},
      L2:{ok:1,resp:['(señala) Aquí.','(señala) Aquí.'],sel:[0,1],exp:'Reconoce más y menos señalando.'},
      L3:{ok:0,resp:['Miau.','Guau.','(se ríe)','Cuac.','Pío.','Mee.','Tuga.','Pío.'],bien:[0,0,0,0,0,0,1,0],exp:'Responde con sonidos de animales; solo "tuga" se acepta como nombre: 1 de 8.'},
      L4:{ok:0,resp:['Agua.','(no responde)','Ecoba.','(no responde)','Apato.','(no responde)','(no responde)','Tasa.'],bien:[0,0,1,0,1,0,0,1],exp:'Nombra 3 de 8 con mala pronunciación aceptable ("ecoba", "apato", "tasa").'},
      L5:{ok:1,resp:['(señala) Ete.','(señala) Ete.'],sel:[0,1],exp:'Reconoce largo y corto señalando.'},
      L6:{ok:0,resp:['(hace como que corta)','¡Salta!','(no responde)','Ñam.'],bien:[0,1,0,0],exp:'Verbaliza 1 de 4.'},
      L7:{ok:0,resp:['Ñam.','(hace como que pinta)','Manos.','(no responde)','Tuto.','(no responde)'],bien:[1,0,0,0,1,0],exp:'Responde 2 de 6 en forma aceptable.'},
      L8:{ok:1,resp:['(entrega la de arena) Eta.','(entrega la esponja)'],sel:[0,1],exp:'Discrimina pesado y liviano.'},
      L9:{ok:0,resp:['Tina.'],bien:[1,0],exp:'Dice su nombre abreviado, sin apellido.'},
      L10:{ok:1,resp:['Nena.'],exp:'Identifica su sexo.'},
      L11:{ok:0,resp:['Mamá… papá.'],bien:[0,0],exp:'No dice los nombres de sus padres.'},
      L12:{ok:0,resp:['Papa.','(se encoge de hombros)','(no responde)'],bien:[1,0,0],exp:'Responde 1 de 3.'},
      L13:{ok:1,pos:['detrás','sobre','sobre'],bien:[1,1,0],exp:'Ejecuta 2 de 3: la comprensión está conservada.'},
      L14:{ok:0,resp:['(no responde)','(no responde)','Papá.'],bien:[0,0,0],exp:'No completa las analogías.'},
      L15:{ok:0,resp:['Ojo.','(no responde)','Ojo.'],bien:[0,0,0],exp:'No nombra colores ("ojo" por rojo para ambos).'},
      L16:{ok:1,sel:[0,1,2],bien:[1,1,1],exp:'Señala los 3 colores: comprende el vocabulario.'},
      L17:{ok:0,resp:['(no responde)','(no responde)','(no responde)'],bien:[0,0,0],exp:'No nombra figuras.'},
      L18:{ok:0,sel:[0,1,1],bien:[1,1,0],exp:'Señala 2 de 3.'},
      L19:{ok:0,resp:['Pelota.','Mamá.'],bien:[0,0],exp:'Responde con una palabra.'},
      L20:{ok:0,resp:['(mira a la mamá)'],exp:'No identifica lo absurdo.'},
      L21:{ok:0,resp:['Apato.','Apato, apato.'],exp:'No usa el plural.'},
      L22:{ok:0,resp:['(no responde)','(no responde)'],bien:[0,0],exp:'No reconoce antes y después.'},
      L23:{ok:0,resp:['Ñam.','(no responde)','(se toca el pie)','(no responde)'],bien:[0,0,0,0],exp:'No define palabras.'},
      L24:{ok:0,resp:['(la lanza)','(no responde)','(no responde)'],bien:[0,0,0],exp:'No nombra características.'},
      M1:{ok:1,saltos:3,exp:'Salta con ambos pies juntos.'},
      M2:{ok:1,pasos:10,derrama:false,exp:'Camina 10 pasos sin derramar.'},
      M3:{ok:1,d:'1,3 m',exp:'La pelota llega hacia la examinadora.'},
      M4:{ok:0,t:6.4,exp:'6,4 s: no llega a 10 s.'},
      M5:{ok:1,t:6.4,exp:'6,4 s: cumple 5 s o más.'},
      M6:{ok:1,t:6.4,exp:'6,4 s: cumple 1 s o más.'},
      M7:{ok:1,pasos:6,exp:'Camina 6 pasos en punta de pies.'},
      M8:{ok:1,dist:.22,exp:'Salta por encima de la hoja con los pies juntos.'},
      M9:{ok:0,saltos:2,exp:'Da dos saltos y apoya el otro pie.'},
      M10:{ok:1,exp:'Toma la pelota contra el pecho con las manos.'},
      M11:{ok:0,pasos:2,exp:'Separa los pies después de dos pasos.'},
      M12:{ok:0,pasos:0,exp:'No logra retroceder topando punta y talón.'}
    },
    cierre:'Perfil disarmónico: Motricidad conservada, Coordinación algo descendida en ítems gráfico-manuales y Lenguaje claramente menor en los ítems expresivos (nombrar, verbalizar, definir), con la comprensión relativamente conservada (señala, reconoce, ejecuta órdenes). Con otitis a repetición, sin evaluación auditiva y signos de que no oye bien, es prioritario descartar hipoacusia.'}
};


/* Caso C: Mateo (niño Meshy). Datos FICTICIOS y propuestos como borrador: la edad, la conducta y los ítems logrados
   deben ser revisados por la docente contra el manual TEPSI y la norma técnica vigente (supuesto, no verificado). */
{const R=JSON.parse(JSON.stringify(CASOS.A.r));
Object.assign(R,{
  C5:{ok:1,botones:3,exp:'Abotona los tres botones sin ayuda.'},
  C6:{ok:1,exp:'Pasa la lana por el ojo de la aguja a la primera.'},
  C11:{ok:1,exp:'Hace un triángulo con tres ángulos claros.'},
  C12:{ok:1,exp:'Hace un cuadrado con cuatro ángulos.'},
  C13:{ok:0,partes:7,exp:'Dibuja 7 partes (cabeza, ojos, nariz, boca, cuerpo, brazos, piernas): no llega a 9.'},
  C14:{ok:1,partes:7,exp:'7 partes: cumple 6 o más.'},
  C15:{ok:1,partes:7,exp:'7 partes: cumple 3 o más.'},
  C16:{ok:0,orden:[1,2,4,3,5],exp:'Ordena casi todas las barritas, pero invierte dos: el conjunto no queda ordenado.'},
  L9:{ok:1,resp:['Mateo Fuentes.'],bien:[1,1],exp:'Dice nombre y apellido.'},
  L11:{ok:1,resp:['Mi papá Cristián y mi mamá Daniela.'],bien:[1,1],exp:'Dice el nombre de ambos padres.'},
  M4:{ok:1,t:10.8,exp:'Se mantiene 10,8 s: cumple 10 s o más.'},
  M5:{ok:1,t:10.8,exp:'10,8 s: cumple 5 s o más.'},
  M6:{ok:1,t:10.8,exp:'10,8 s: cumple 1 s o más.'},
  M9:{ok:0,saltos:2,exp:'Da dos saltos en un pie y apoya el otro: no llega a 3.'},
  M11:{ok:1,pasos:6,exp:'Avanza seis pasos topando punta y talón.'},
  M12:{ok:0,pasos:2,exp:'Retrocede dos pasos y separa los pies.'}
});
CASOS.C={nombre:'Mateo',edad:'4 años 2 meses',sexo:'Masculino',ctx:'Control de salud de los 4 años en el CESFAM. Viene con su madre, Daniela, antes de entrar a pre-kínder.',
  ident:{nombre:'Mateo Andrés Fuentes Araya',run:'24.876.512-7',nac:'2022-08-27',examen:'2026-10-27',ficha:'4710'},
  ficha:[['Edad','4 a 2 m'],['Sexo','Masculino'],['Acompaña','Madre']],
  mama:{nombre:'Daniela',tono:'tranquila, conversadora y muy atenta',
    hechos:`Hijo: Mateo Andrés Fuentes Araya, nacido el 27 de agosto de 2022, RUN 24.876.512-7, ficha 4710. Padre: Cristián Fuentes. Madre: Daniela Araya, 33 años, profesora de básica.
Motivo: control de salud de los 4 años; quiere saber si está listo para entrar a pre-kínder. No trae preocupaciones.
Embarazo controlado, sin complicaciones. Parto vaginal a las 40 semanas, peso 3.540 g, Apgar 9/10, sin hospitalizaciones neonatales.
Lactancia materna exclusiva hasta los 6 meses, luego mixta hasta los 2 años.
Desarrollo: sostuvo la cabeza a los 3 meses, se sentó a los 6, caminó solo a los 12 meses, primeras palabras al año, frases de tres palabras a los 2 años. Hoy habla en frases largas, cuenta cuentos y se le entiende todo.
Salud: resfríos ocasionales, una otitis a los 2 años que se resolvió bien; escucha bien. Sin hospitalizaciones. Vacunas al día. EEDP a los 18 meses normal y TEPSI de los 3 años normal.
Asiste a jardín infantil JUNJI desde los 2 años y medio; la educadora dice que comparte y sigue las rutinas. Vive con ambos padres, sin hermanos. Duerme bien, come de todo. Poca pantalla (un capítulo de monitos al día). Le gusta armar con bloques, andar en bicicleta con rueditas y dibujar.`},
  r:R,
  cierre:'Perfil armónico y normal: los ítems no logrados (figura humana de 9 partes, ordenar las barritas y caminar hacia atrás topando punta y talón) son los de mayor dificultad y se consolidan más tarde; no hay categorías alteradas. Corresponde felicitar a la familia, entregar pautas de estimulación y mantener los controles habituales.',
  conducta:{},
  motivo:'Con un desarrollo normal en los tres subtests se refuerza a la familia, se entregan pautas anticipatorias (juego, lenguaje, motricidad) y se mantienen los controles de salud habituales.'};
}

/* Conducta a seguir: opciones y retroalimentación */
// conducta esperada propia de cada caso (se suma a la que se deduce de las categorías)
CASOS.A.conducta={audicion:'no',fono:'no'};
CASOS.B.conducta={audicion:'esperada',fono:'sugerida',pantallas:'sugerida',jardin:'sugerida',medico:'sugerida'};
CASOS.B.motivo='Martina tiene otitis a repetición, nunca evaluada en audición y con signos de que no oye bien: descartar hipoacusia es prioritario antes de atribuir el retraso del lenguaje a otras causas. El tiempo de pantalla y la poca interacción verbal también se abordan en la consejería.';
const CONDUCTAS=[
  {id:'felicitar',txt:'Felicitar a la familia y reforzar lo que hacen bien',grupo:'General'},
  {id:'pautas',txt:'Entregar pautas de estimulación para el hogar (según área)',grupo:'General'},
  {id:'control',txt:'Continuar controles de salud habituales',grupo:'General'},
  {id:'madis',txt:'Derivar a una modalidad de apoyo al desarrollo infantil (MADIS), p. ej., sala de estimulación',grupo:'Intervención'},
  {id:'vdi',txt:'Visita domiciliaria integral (VDI)',grupo:'Intervención'},
  {id:'reeval',txt:'Reevaluar el desarrollo con TEPSI después de la intervención',grupo:'Intervención'},
  {id:'medico',txt:'Derivar a médico para evaluación',grupo:'Derivación'},
  {id:'audicion',txt:'Solicitar evaluación auditiva (audiometría / otorrino)',grupo:'Derivación'},
  {id:'fono',txt:'Derivar a fonoaudiología',grupo:'Derivación'},
  {id:'pantallas',txt:'Consejería sobre uso de pantallas y juego compartido',grupo:'Consejería'},
  {id:'jardin',txt:'Coordinar con el jardín infantil',grupo:'Coordinación'},
  {id:'urgencia',txt:'Derivar a urgencia',grupo:'Derivación'}
];
