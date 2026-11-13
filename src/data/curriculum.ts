export interface CurriculumWorldMapping {
  worldId: number;
  worldTitle: string;
  learningObjectives: string[];
  competenciasEspecificas: string[];
  criteriosEvaluacion: string[];
  saberesBasicos: string[];
}

export const LOMLOE_OVERVIEW = {
  ley: 'Ley Orgánica 3/2020 (LOMLOE) y Real Decreto 157/2022, de 1 de marzo, por el que se establecen la ordenación y las enseñanzas mínimas de la Educación Primaria.',
  area: 'Matemáticas',
  etapaYCurso: 'Educación Primaria · Segundo ciclo (4.º curso, 9-10 años)',
  notaRigor:
    'Esta guía describe la correspondencia pedagógica con los elementos curriculares del segundo ciclo recogidos en el Real Decreto 157/2022, evitando códigos inventados o citas literales no verificadas.',
  principiosDUA: [
    'Múltiples formas de representación: cada fracción se acompaña de modelos visuales interactivos (pizzas, tartas, barras, cuadrículas, recipientes y rectas numéricas).',
    'Múltiples formas de acción y expresión: el alumnado puede responder tocando, arrastrando fichas, seleccionando opciones, pulsando botones numéricos o usando navegación con teclado.',
    'Múltiples formas de implicación: ritmo propio sin cronómetros obligatorios, pistas guiadas por Pluma, tres niveles de dificultad (inicial, intermedio y avanzado) y refuerzo formativo ante el error.',
  ],
};

export const CURRICULUM_MAPPINGS: CurriculumWorldMapping[] = [
  {
    worldId: 1,
    worldTitle: 'Mundo 1. El bosque de las fracciones',
    learningObjectives: [
      'Comprender el significado de la fracción como relación entre partes tomadas y el todo dividido en partes iguales.',
      'Identificar correctamente el numerador y el denominador.',
    ],
    competenciasEspecificas: [
      'Interpretar situaciones de la vida cotidiana utilizando representaciones matemáticas sencillas.',
      'Comunicar con claridad el significado de los números fraccionarios mediante lenguaje gráfico y simbólico.',
    ],
    criteriosEvaluacion: [
      'Reconoce e identifica fracciones propias a partir de modelos de áreas divididas en partes iguales.',
      'Diferencia la función del numerador y del denominador en contextos guiados.',
    ],
    saberesBasicos: [
      'Sentido numérico: lectura, escritura y significado de fracciones sencillas como parte de un todo.',
    ],
  },
  {
    worldId: 2,
    worldTitle: 'Mundo 2. La isla de las pizzas',
    learningObjectives: [
      'Representar gráficamente fracciones utilizando objetos cotidianos divididos en partes iguales.',
      'Relacionar modelos circulares, rectangulares y de medida con su expresión numérica.',
    ],
    competenciasEspecificas: [
      'Explorar y construir representaciones visuales variadas para modelizar cantidades fraccionarias.',
      'Seleccionar la estrategia de representación más adecuada en cada desafío.',
    ],
    criteriosEvaluacion: [
      'Construye representaciones gráficas exactas de fracciones dadas manipulando modelos divididos en partes iguales.',
      'Comprueba la validez de sus representaciones verificando la igualdad de las partes.',
    ],
    saberesBasicos: [
      'Sentido numérico y de la medida: representación de fracciones propias en contextos continuos y discretos.',
    ],
  },
  {
    worldId: 3,
    worldTitle: 'Mundo 3. El templo de las equivalencias',
    learningObjectives: [
      'Reconocer fracciones equivalentes sencillas apoyándose en comparaciones visuales.',
      'Asociar distintas expresiones fraccionarias que representan la misma parte de la unidad.',
    ],
    competenciasEspecificas: [
      'Establecer relaciones y regularidades numéricas mediante la observación de modelos equivalentes.',
      'Razonar y justificar por qué dos fracciones representan la misma cantidad.',
    ],
    criteriosEvaluacion: [
      'Identifica y empareja fracciones equivalentes sencillas (por ejemplo, medios, cuartos, sextos y octavos) con apoyo gráfico.',
    ],
    saberesBasicos: [
      'Sentido numérico y algebraico: relaciones de equivalencia entre fracciones sencillas y búsqueda de patrones.',
    ],
  },
  {
    worldId: 4,
    worldTitle: 'Mundo 4. La montaña de las comparaciones',
    learningObjectives: [
      'Comparar y ordenar fracciones sencillas utilizando representaciones gráficas y rectas numéricas.',
      'Ubicar fracciones respecto a la unidad y la mitad.',
    ],
    competenciasEspecificas: [
      'Emplear el razonamiento matemático para comparar cantidades y verificar el orden correcto.',
      'Conectar la posición en la recta numérica con el tamaño relativo de cada fracción.',
    ],
    criteriosEvaluacion: [
      'Compara y ordena fracciones de igual denominador o igual numerador y otras fracciones de uso habitual sobre la recta numérica.',
    ],
    saberesBasicos: [
      'Sentido numérico y espacial: comparación, ordenación y localización de fracciones en la recta numérica.',
    ],
  },
  {
    worldId: 5,
    worldTitle: 'Mundo 5. El castillo del desafío final',
    learningObjectives: [
      'Resolver problemas cotidianos de reparto, medición de ingredientes y distribución de materiales mediante fracciones.',
      'Fomentar la autonomía, la perseverancia y la revisión constructiva del propio aprendizaje.',
    ],
    competenciasEspecificas: [
      'Resolver problemas de la vida real seleccionando los datos relevantes y aplicando el concepto de fracción.',
      'Desarrollar destrezas socioemocionales de confianza matemática, autonomía y gestión positiva del error.',
    ],
    criteriosEvaluacion: [
      'Resuelve situaciones problemáticas cotidianas con fracciones, explicando o comprobando la coherencia del resultado.',
    ],
    saberesBasicos: [
      'Sentido numérico, sentido de la medida y sentido socioafectivo: resolución de problemas cotidianos y autorregulación.',
    ],
  },
];
