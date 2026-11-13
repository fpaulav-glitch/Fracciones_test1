import { BadgeDefinition, WorldDefinition, WorldId } from '../types/game';

export const WORLDS: Record<WorldId, WorldDefinition> = {
  1: {
    id: 1,
    name: 'El bosque de las fracciones',
    shortName: 'Bosque',
    subtitle: 'Numerador, denominador y partes del todo',
    fragmentName: 'Fragmento Esmeralda',
    description:
      'Explora los senderos del bosque para reconocer cómo se divide un todo en partes iguales e identificar el numerador y el denominador.',
    introSpeech:
      '¡Bienvenido al Bosque de las Fracciones! Aquí aprenderemos qué significa cada número de una fracción mirando figuras del bosque.',
    outroSpeech:
      '¡Genial! Has recuperado el Fragmento Esmeralda del mapa mágico. Ya dominas el numerador y el denominador.',
    pinPosition: { x: 20, y: 63 },
    theme: {
      bgGradient: 'from-emerald-50 via-teal-50 to-stone-50',
      surfaceBg: 'bg-white',
      border: 'border-emerald-200',
      accentBg: 'bg-emerald-600',
      accentHover: 'hover:bg-emerald-700',
      accentText: 'text-emerald-800',
      badgeBg: 'bg-emerald-100',
      primaryHex: '#059669',
    },
  },
  2: {
    id: 2,
    name: 'La isla de las pizzas',
    shortName: 'Isla Pizza',
    subtitle: 'Representación gráfica con alimentos y objetos',
    fragmentName: 'Fragmento Coral',
    description:
      'En la cocina soleada de la isla repartirás pizzas, tartas y tabletas de chocolate dividiendo cada objeto en partes exactamente iguales.',
    introSpeech:
      '¡Huele a pizza recién horneada! Toca las porciones o construye fracciones exactas para ganar el Fragmento Coral.',
    outroSpeech:
      '¡Buen provecho matemático! Con el Fragmento Coral en tu mochila, la isla entera celebra tu precisión.',
    pinPosition: { x: 52, y: 74 },
    theme: {
      bgGradient: 'from-amber-50 via-orange-50 to-sky-50',
      surfaceBg: 'bg-white',
      border: 'border-orange-200',
      accentBg: 'bg-orange-600',
      accentHover: 'hover:bg-orange-700',
      accentText: 'text-orange-800',
      badgeBg: 'bg-orange-100',
      primaryHex: '#ea580c',
    },
  },
  3: {
    id: 3,
    name: 'El templo de las equivalencias',
    shortName: 'Templo',
    subtitle: 'Fracciones equivalentes y asociación visual',
    fragmentName: 'Fragmento Solar',
    description:
      'Las puertas doradas del templo solo se abren cuando descubres qué fracciones distintas representan exactamente la misma cantidad.',
    introSpeech:
      '¡Mira estas losas doradas! A veces dos fracciones parecen diferentes, pero cubren el mismo espacio. ¡Vamos a emparejarlas!',
    outroSpeech:
      '¡Las puertas del templo se han abierto! El Fragmento Solar brilla con tu dominio de las equivalencias.',
    pinPosition: { x: 43, y: 38 },
    theme: {
      bgGradient: 'from-yellow-50 via-amber-50 to-stone-50',
      surfaceBg: 'bg-white',
      border: 'border-amber-300',
      accentBg: 'bg-amber-600',
      accentHover: 'hover:bg-amber-700',
      accentText: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      primaryHex: '#d97706',
    },
  },
  4: {
    id: 4,
    name: 'La montaña de las comparaciones',
    shortName: 'Montaña',
    subtitle: 'Comparación, orden y recta numérica',
    fragmentName: 'Fragmento Glaciar',
    description:
      'Escala senderos nevados ordenando fracciones de menor a mayor y situando banderines con exactitud en la recta numérica.',
    introSpeech:
      '¡Abrígate bien! En estas cumbres compararemos fracciones y colocaremos banderines en la recta numérica.',
    outroSpeech:
      '¡Cumbre alcanzada! Has conseguido el Fragmento Glaciar comparando y ordenando fracciones como un profesional.',
    pinPosition: { x: 67, y: 24 },
    theme: {
      bgGradient: 'from-sky-50 via-blue-50 to-slate-50',
      surfaceBg: 'bg-white',
      border: 'border-sky-200',
      accentBg: 'bg-sky-600',
      accentHover: 'hover:bg-sky-700',
      accentText: 'text-sky-900',
      badgeBg: 'bg-sky-100',
      primaryHex: '#0284c7',
    },
  },
  5: {
    id: 5,
    name: 'El castillo del desafío final',
    shortName: 'Castillo',
    subtitle: 'Resolución de problemas cotidianos',
    fragmentName: 'Fragmento Real',
    description:
      'Demuestra todo lo aprendido resolviendo situaciones reales de cocina, reparto, mediciones y organización en el gran castillo.',
    introSpeech:
      '¡El último reto te espera! Usa tus conocimientos para resolver problemas cotidianos y completar el mapa mágico.',
    outroSpeech:
      '¡Lo lograste! Los cinco fragmentos vuelven a brillar unidos. ¡Eres un auténtico explorador de las fracciones!',
    pinPosition: { x: 88, y: 39 },
    theme: {
      bgGradient: 'from-indigo-50 via-violet-50 to-amber-50',
      surfaceBg: 'bg-white',
      border: 'border-indigo-200',
      accentBg: 'bg-indigo-600',
      accentHover: 'hover:bg-indigo-700',
      accentText: 'text-indigo-900',
      badgeBg: 'bg-indigo-100',
      primaryHex: '#4f46e5',
    },
  },
};

export const WORLD_ORDER: WorldId[] = [1, 2, 3, 4, 5];

export const BADGES: BadgeDefinition[] = [
  {
    id: 'badge_world_1',
    name: 'Guardián del Bosque',
    description: 'Completa el Mundo 1 identificando numeradores y denominadores.',
    iconType: 'forest',
    accentColor: '#059669',
  },
  {
    id: 'badge_world_2',
    name: 'Maestro Pizzero',
    description: 'Completa el Mundo 2 representando fracciones en partes iguales.',
    iconType: 'pizza',
    accentColor: '#ea580c',
  },
  {
    id: 'badge_world_3',
    name: 'Sabio del Templo',
    description: 'Completa el Mundo 3 descubriendo fracciones equivalentes.',
    iconType: 'temple',
    accentColor: '#d97706',
  },
  {
    id: 'badge_world_4',
    name: 'Alpinista Numérico',
    description: 'Completa el Mundo 4 comparando y ordenando en la recta.',
    iconType: 'mountain',
    accentColor: '#0284c7',
  },
  {
    id: 'badge_world_5',
    name: 'Héroe del Castillo',
    description: 'Supera los problemas cotidianos del Mundo 5 y reúne el mapa.',
    iconType: 'castle',
    accentColor: '#4f46e5',
  },
  {
    id: 'badge_first_try_streak',
    name: 'Brújula Precisa',
    description: 'Consigue 3 estrellas en cualquier mundo sin errores previos.',
    iconType: 'streak',
    accentColor: '#ca8a04',
  },
  {
    id: 'badge_grand_explorer',
    name: 'Leyenda del Mapa Mágico',
    description: 'Completa los 5 mundos y reúne todos los fragmentos.',
    iconType: 'master',
    accentColor: '#be185d',
  },
];
