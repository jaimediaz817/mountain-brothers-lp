/* ==========================================================================
   MOUNTAIN BROTHERS · data.js
   Contenido DEMOSTRATIVO de la v1.
   Regla del proyecto: no se inventan rutas reales, precios, distancias,
   desniveles, tiempos, permisos, clima, estadísticas ni testimonios.
   Todo lo que aquí vive es concepto, orientación o simulación declarada.
   Los perfiles y los porcentajes son orientativos: NO son diagnósticos
   médicos ni certificaciones de aptitud física.
   ========================================================================== */

(function (MB) {
  'use strict';

  MB.data = {};

  /* ======================================================================
     PERFILES DE AVENTURERO (orientativos)
     level: 1..4 solo para ordenar visualmente, no es una nota.
     ====================================================================== */
  MB.data.profiles = {
    explorador: {
      id: 'explorador',
      level: 1,
      name: 'Explorador',
      claim: 'Quiero empezar.',
      summary:
        'Estás en el punto exacto donde todo comienza. Aquí no se trata de resistencia ni de equipo: se trata de entender el terreno, perder el miedo y hacer una primera salida corta con criterio.',
      nextStep: 'Una caminata corta, con alguien que ya tenga experiencia y sin objetivos de distancia.',
      focus: ['Qué es el senderismo', 'Cómo leer un sendero', 'Qué llevar en una salida corta'],
      meters: { conocimiento: 18, condicion: 16, equipo: 10, experiencia: 8, altitud: 4 }
    },
    trekker: {
      id: 'trekker',
      level: 2,
      name: 'Trekker',
      claim: 'Ya camino y quiero avanzar.',
      summary:
        'Ya conoces la sensación de caminar varias horas y de volver distinto. El siguiente salto no es caminar más lejos, sino caminar mejor: ritmo, carga, alimentación y terreno.',
      nextStep: 'Subir poco a poco el desnivel y empezar a caminar sobre terreno irregular.',
      focus: ['Ritmo de marcha sostenible', 'Carga y peso de la mochila', 'Hidratación y alimentación en ruta'],
      meters: { conocimiento: 42, condicion: 46, equipo: 38, experiencia: 34, altitud: 14 }
    },
    montanista: {
      id: 'montanista',
      level: 3,
      name: 'Montañista en formación',
      claim: 'Quiero prepararme para retos mayores.',
      summary:
        'Ya tienes base y ahora el trabajo es de planificación. Aquí se aprende a evaluar terreno, clima y condiciones propias antes de salir, y a decidir cuándo girar.',
      nextStep: 'Salidas de varios días con plan escrito, plan B y entrenamiento constante entre semana.',
      focus: ['Planificación de una salida larga', 'Orientación y mapa', 'Lectura de terreno y clima'],
      meters: { conocimiento: 64, condicion: 68, equipo: 62, experiencia: 56, altitud: 34 }
    },
    cumbre: {
      id: 'cumbre',
      level: 4,
      name: 'Aspirante a cumbre',
      claim: 'Quiero convertir una meta en un proceso.',
      summary:
        'Tienes una meta grande y entiendes que no se improvisa. Lo que sigue es proceso largo, disciplina y acompañamiento: la montaña de altura no se conquista, se prepara.',
      nextStep: 'Ciclos de entrenamiento, experiencia progresiva en altura y acompañamiento externo.',
      focus: ['Progresión en altura', 'Entrenamiento por ciclos', 'Seguridad y toma de decisiones'],
      meters: { conocimiento: 78, condicion: 74, equipo: 70, experiencia: 66, altitud: 40 }
    }
  };

  /* Orden de presentación: de menor a mayor experiencia */
  MB.data.profileOrder = ['explorador', 'trekker', 'montanista', 'cumbre'];

  /* ======================================================================
     CUESTIONARIO
     Cada opción reparte puntos a los perfiles. En caso de empate se elige
     SIEMPRE el perfil más conservador: preferimos subestimar antes que
     sugerir una preparación que nadie ha verificado.
     ====================================================================== */
  MB.data.quiz = {
    questions: [
      {
        id: 'sendero',
        title: '¿Cuántas veces has caminado por un sendero de montaña?',
        options: [
          { label: 'Nunca', hint: 'Cero salidas', scores: { explorador: 3 } },
          { label: 'Una o dos veces', hint: 'Salidas puntuales', scores: { explorador: 1, trekker: 2 } },
          { label: 'Varias veces al año', hint: 'Ya es parte de tu rutina', scores: { trekker: 2, montanista: 1 } },
          { label: 'Con frecuencia', hint: 'Casi todo el tiempo', scores: { montanista: 2, cumbre: 1 } }
        ]
      },
      {
        id: 'ritmo',
        title: '¿Cómo describes tu actividad física hoy?',
        options: [
          { label: 'Muy poca', hint: 'Casi nada de movimiento', scores: { explorador: 3 } },
          { label: 'Camino algo', hint: 'Caminatas cortas', scores: { explorador: 1, trekker: 2 } },
          { label: 'Dos o tres veces por semana', hint: 'Con regularidad', scores: { trekker: 2, montanista: 1 } },
          { label: 'Entrenamiento constante', hint: 'Plan en curso', scores: { montanista: 2, cumbre: 1 } }
        ]
      },
      {
        id: 'altitud',
        title: '¿Has caminado alguna vez por encima del bosque, en páramo?',
        options: [
          { label: 'Nunca', hint: 'No conozco esa altura', scores: { explorador: 3 } },
          { label: 'No estoy seguro', hint: 'Tal vez sin saberlo', scores: { explorador: 1, trekker: 2 } },
          { label: 'Sí, algunas veces', hint: 'Reconozco el terreno', scores: { trekker: 1, montanista: 2 } },
          { label: 'Sí, con frecuencia', hint: 'Me siento cómodo allí', scores: { montanista: 1, cumbre: 2 } }
        ]
      },
      {
        id: 'equipo',
        title: '¿Qué equipo de montaña tienes hoy?',
        options: [
          { label: 'Nada todavía', hint: 'Ropa de ciudad', scores: { explorador: 3 } },
          { label: 'Lo básico', hint: 'Botas y algo de abrigo', scores: { trekker: 3 } },
          { label: 'Bastante', hint: 'Puedo armar una salida larga', scores: { montanista: 3 } },
          { label: 'Completo', hint: 'Preparado para altura', scores: { cumbre: 3 } }
        ]
      },
      {
        id: 'busqueda',
        title: '¿Qué buscas en este momento?',
        options: [
          { label: 'Entender de qué se trata', hint: 'Empezar por el principio', scores: { explorador: 2, trekker: 1 } },
          { label: 'Volver a salir a caminar', hint: 'Retomar el hábito', scores: { trekker: 2 } },
          { label: 'Prepararme mejor', hint: 'Subir de nivel', scores: { montanista: 2 } },
          { label: 'Un objetivo grande', hint: 'Algo que cambie el año', scores: { cumbre: 3 } }
        ]
      },
      {
        id: 'horizonte',
        title: '¿En qué horizonte te imaginas dando ese paso?',
        options: [
          { label: 'Todavía no lo sé', hint: 'Sin fecha', scores: { explorador: 3 } },
          { label: 'En unos meses', hint: 'Corto plazo', scores: { trekker: 3 } },
          { label: 'Durante el próximo año', hint: 'Mediano plazo', scores: { montanista: 2, cumbre: 1 } },
          { label: 'Es un proyecto a largo plazo', hint: 'Proceso largo', scores: { cumbre: 3 } }
        ]
      }
    ]
  };

  /* ======================================================================
     MOUNTAIN AI GUIDE · guion de demostración
     No hay modelo conectado en esta versión: hay escenarios preparados con
     detección de intención por palabras clave. La interfaz se comporta como
     el producto final, pero el contenido está etiquetado como demostración.
     ====================================================================== */
  MB.data.guide = {
    greeting:
      'Hola. Soy tu guía de Mountain Brothers. Cuéntame en qué punto estás y armamos el siguiente paso juntos. Todo lo que te diga es orientativo.',
    fallback:
      'Todavía estoy aprendiendo sobre eso. En esta versión reconozco algunos temas y respondo con escenarios preparados. Prueba con una de las sugerencias y verás cómo funcionará el guía cuando esté conectado a MOUNTAIN KNOWLEDGE.',
    prompts: [
      { id: 'empezar', label: 'Quiero empezar a hacer senderismo' },
      { id: 'altitud', label: '¿Cómo me preparo para la altura?' },
      { id: 'equipo', label: '¿Qué equipo necesito de verdad?' },
      { id: 'meta', label: 'Tengo una meta grande' }
    ],
    threads: [
      {
        id: 'empezar',
        keywords: ['empezar', 'inicio', 'principiante', 'senderismo', 'nunca', 'caminar', 'comenzar'],
        user: 'Quiero empezar a hacer senderismo, pero nunca he hecho una caminata exigente.',
        ai: 'Empecemos por algo sencillo. Antes de pensar en grandes cumbres, construyamos experiencia: una salida corta, con poca carga y sin exigencia de distancia. Lo importante de la primera vez no es el destino, es que vuelvas sabiendo algo nuevo sobre cómo caminas.',
        findings: [
          { label: 'Nivel actual', text: 'Punto de partida real: cero salidas registradas.' },
          { label: 'Próximo reto', text: 'Una caminata corta de media jornada, sin desnivel fuerte.' },
          { label: 'Preparación', text: 'Caminar dos o tres veces por semana, sin plan complicado.' },
          { label: 'Equipo', text: 'Calzado con buen agarre y una capa de abrigo impermeable.' },
          { label: 'Seguridad', text: 'Salir acompañado, avisar por dónde vas y volver con luz natural.' }
        ],
        meters: { conocimiento: 30, condicion: 24, equipo: 20, experiencia: 14, altitud: 6 }
      },
      {
        id: 'altitud',
        keywords: ['altura', 'altitud', 'páramo', 'paramo', 'frío', 'frio', 'subir', 'cero', 'mal de altura'],
        user: '¿Cómo me preparo para caminar en altura sin arriesgarme de más?',
        ai: 'La altura no se entrena el día anterior. Se sube por etapas y se aprende a leer el propio cuerpo. Antes de buscar cifras altas, acostúmbrate a terreno abierto, viento y cambios de temperatura. Si algo se siente mal, la decisión correcta siempre es bajar.',
        findings: [
          { label: 'Nivel actual', text: 'Experiencia en altura todavía incipiente.' },
          { label: 'Próximo reto', text: 'Subir el techo de altura de forma escalonada, nunca de golpe.' },
          { label: 'Preparación', text: 'Trabajo cardiovascular sostenido y salidas progresivas.' },
          { label: 'Equipo', text: 'Sistema de capas, abrigo real y protección contra viento y lluvia.' },
          { label: 'Seguridad', text: 'Reconocer las señales de alerta y detenerse a tiempo.' }
        ],
        meters: { conocimiento: 46, condicion: 40, equipo: 44, experiencia: 26, altitud: 32 }
      },
      {
        id: 'equipo',
        keywords: ['equipo', 'mochila', 'botas', 'ropa', 'comprar', 'peso', 'bastones', 'llevar'],
        user: '¿Qué equipo necesito de verdad para empezar?',
        ai: 'Menos del que crees. El equipo se elige después de entender el terreno que vas a caminar, no antes de la primera salida. Lo que casi nunca falla: calzado probado, tres capas de ropa, agua y una luz frontal. Todo lo demás se decide con experiencia.',
        findings: [
          { label: 'Nivel actual', text: 'Equipo mínimo: calzado y abrigo.' },
          { label: 'Próximo reto', text: 'Probar el equipo en salidas cortas antes de una salida larga.' },
          { label: 'Preparación', text: 'Aprender a cargar la mochila y a dosificar el peso.' },
          { label: 'Equipo', text: 'Tres capas, agua, abrigo y luz frontal.' },
          { label: 'Seguridad', text: 'Botiquín básico y un plan que alguien más conozca.' }
        ],
        meters: { conocimiento: 38, condicion: 30, equipo: 52, experiencia: 18, altitud: 8 }
      },
      {
        id: 'meta',
        keywords: ['meta', 'cumbre', 'tolima', 'objetivo', 'nevado', 'grande', 'sueño', 'largo plazo'],
        user: 'Quiero poner una meta grande: una cumbre nevada.',
        ai: 'Esa meta se convierte en proceso. La dividimos en fases y construimos experiencia en orden: terreno, distancia, desnivel y altura. Nadie te puede garantizar una cumbre; lo que sí se puede garantizar es el proceso que te acerca a intentarla con criterio.',
        findings: [
          { label: 'Nivel actual', text: 'Meta declarada, todavía sin fases definidas.' },
          { label: 'Próximo reto', text: 'Definir una ruta de progresión con hitos concretos.' },
          { label: 'Preparación', text: 'Entrenamiento por ciclos y salidas de varios días.' },
          { label: 'Equipo', text: 'Se define según la ruta y las condiciones, no antes.' },
          { label: 'Seguridad', text: 'Acompañamiento profesional y decisiones compartidas.' }
        ],
        meters: { conocimiento: 62, condicion: 56, equipo: 58, experiencia: 48, altitud: 30 }
      }
    ]
  };

  /* ======================================================================
     MOUNTAIN KNOWLEDGE · biblioteca demostrativa
     Son TEMAS, no datos: no incluyen cifras de rutas reales, precios ni
     condiciones actuales. En la versión final esta capa consultará la
     Knowledge Base del proyecto (documentos + asistente).
     ====================================================================== */
  MB.data.knowledge = {
    placeholder: '¿Qué quieres aprender?',
    categories: [
      'Senderismo',
      'Equipo',
      'Seguridad',
      'Altitud',
      'Orientación',
      'Preparación',
      'Naturaleza',
      'Colombia'
    ],
    topics: [
      {
        title: 'Senderismo y trekking: la diferencia que importa',
        cat: 'Senderismo',
        keywords: 'diferencia caminar caminata excursion basico',
        summary: 'No es lo mismo una salida de un día que una travesía de varios. Entender la diferencia cambia la preparación, la carga y la expectativa.'
      },
      {
        title: 'Cómo leer un sendero antes de caminarlo',
        cat: 'Senderismo',
        keywords: 'terreno huella marca camino señal',
        summary: 'Huellas, pendiente, vegetación y marcas: señales simples que permiten decidir si el terreno está dentro de lo que ya sabes caminar.'
      },
      {
        title: 'El sistema de tres capas explicado sin tecnicismos',
        cat: 'Equipo',
        keywords: 'ropa capas abrigo termica impermeable lluvia frio',
        summary: 'Primera capa para el sudor, segunda para el calor, tercera para el viento y la lluvia. Se ajusta durante la marcha, no antes de salir.'
      },
      {
        title: 'Cómo elegir y probar el calzado de montaña',
        cat: 'Equipo',
        keywords: 'botas zapatos agarre pie ampollas',
        summary: 'El mejor calzado es el que ya probaste en salidas cortas. Suela con agarre, talla con espacio y cero estrenos el día de una ruta larga.'
      },
      {
        title: 'Peso de mochila: qué pesa y por qué',
        cat: 'Equipo',
        keywords: 'mochila carga peso empacar llevar',
        summary: 'Cada gramo se siente al final del día. Aprender a repartir la carga y a dejar cosas en casa es parte del entrenamiento.'
      },
      {
        title: 'Antes de salir: la revisión que nunca se salta',
        cat: 'Seguridad',
        keywords: 'checklist plan avisar ruta regreso plan b',
        summary: 'Plan escrito, alguien que sepa dónde vas y cuándo regresas, y una alternativa si las condiciones cambian. Tres minutos que valen todo.'
      },
      {
        title: 'Señales de alerta en altura: cuándo dar la vuelta',
        cat: 'Altitud',
        keywords: 'mal de altura mareo dolor cabeza sintomas apunamiento',
        summary: 'La montaña no se negocia con el cuerpo. Reconocer las señales y decidir bajar es una decisión de criterio, no una derrota.'
      },
      {
        title: 'Aclimatarse: por qué se sube por etapas',
        cat: 'Altitud',
        keywords: 'aclimatar altura progresion etapas subida',
        summary: 'El cuerpo necesita tiempo para responder a menos oxígeno. Subir por etapas es la forma más simple y más segura de avanzar.'
      },
      {
        title: 'Mapa, brújula y GPS: lo esencial para no perderse',
        cat: 'Orientación',
        keywords: 'orientacion mapa brujula gps rumbo norte',
        summary: 'La tecnología ayuda, pero la lectura del terreno es la que decide. Lo esencial: saber dónde estás, hacia dónde vas y cómo volver.'
      },
      {
        title: 'Entrenar la subida y, sobre todo, la bajada',
        cat: 'Preparación',
        keywords: 'entrenar fuerza piernas bajada rodillas cuestas',
        summary: 'La subida es esfuerzo; la bajada es técnica y castigo articular. Casi nadie entrena la bajada y es donde más se falla.'
      },
      {
        title: 'El páramo: por qué es un ecosistema frágil',
        cat: 'Naturaleza',
        keywords: 'paramo frailejon agua ecosistema cuidado ambiente',
        summary: 'El páramo produce buena parte del agua que consumimos y crece muy despacio. Caminarlo implica no dejar rastro.'
      },
      {
        title: 'Palmas de cera: identidad del paisaje del Quindío',
        cat: 'Colombia',
        keywords: 'cocora palma cera quindio salento valle paisaje',
        summary: 'La palma de cera es símbolo nacional y territorio narrativo de Mountain Brothers. Conocerla es parte de caminarla con respeto.'
      }
    ]
  };

  /* ======================================================================
     COMUNIDAD
     El contenido de esa seccion vive directamente en index.html: es
     estatico a proposito, para que la pagina siga comunicando aunque el
     JavaScript no cargue. Sin testimonios reales: solo ejemplos de
     formato, declarados como demostracion en la interfaz.
     ====================================================================== */

})(window.MB = window.MB || {});
