import {
  ChallengeAttemptResult,
  Difficulty,
  FractionValue,
  PlayerProgress,
  WorldId,
  WorldProgress,
} from '../types/game';
import { WORLD_ORDER } from '../data/worlds';

const STORAGE_KEY = 'fraccion_aventura_progress_v1';

export function createEmptyWorldProgress(): WorldProgress {
  return {
    completed: false,
    stars: 0,
    bestAccuracy: 0,
    pointsEarned: 0,
    completedChallengeIds: [],
    correctFirstTryCount: 0,
    totalAttempts: 0,
    wrongAttempts: 0,
    weakTopics: [],
  };
}

export function createInitialProgress(
  playerName = 'Explorador',
  difficulty: Difficulty = 'inicial'
): PlayerProgress {
  return {
    playerName,
    difficulty,
    soundEnabled: true,
    readAloudEnabled: false,
    unlockedWorld: 1,
    totalPoints: 0,
    worldResults: {
      1: createEmptyWorldProgress(),
      2: createEmptyWorldProgress(),
      3: createEmptyWorldProgress(),
      4: createEmptyWorldProgress(),
      5: createEmptyWorldProgress(),
    },
    attemptHistory: {},
    earnedBadges: [],
    adventureCompleted: false,
  };
}

export function loadProgress(): PlayerProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayerProgress;
    if (!parsed || typeof parsed !== 'object' || !parsed.worldResults) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function areFractionsEquivalent(a: FractionValue, b: FractionValue): boolean {
  if (a.denominator === 0 || b.denominator === 0) return false;
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

export function compareFractions(a: FractionValue, b: FractionValue): number {
  const left = a.numerator * b.denominator;
  const right = b.numerator * a.denominator;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function computeChallengePoints(wrongAttempts: number, usedHint: boolean): number {
  const base = 100;
  const retryPenalty = Math.min(wrongAttempts * 20, 60);
  const hintPenalty = usedHint ? 15 : 0;
  return Math.max(25, base - retryPenalty - hintPenalty);
}

export function computeStarsFromAccuracy(accuracyPct: number): number {
  if (accuracyPct >= 85) return 3;
  if (accuracyPct >= 60) return 2;
  return 1;
}

export interface WorldSessionSummary {
  worldId: WorldId;
  totalChallenges: number;
  completedCount: number;
  firstTryCorrect: number;
  totalWrongAttempts: number;
  totalCorrectResponses: number;
  accuracyPct: number;
  starsEarned: number;
  pointsEarned: number;
  weakTopics: string[];
  newlyUnlockedBadges: string[];
}

export function evaluateWorldSession(
  worldId: WorldId,
  sessionResults: ChallengeAttemptResult[],
  existingBadges: string[]
): WorldSessionSummary {
  const totalChallenges = sessionResults.length;
  const completedCount = sessionResults.filter((r) => r.solved).length;
  const firstTryCorrect = sessionResults.filter((r) => r.correctFirstTry).length;
  const totalWrongAttempts = sessionResults.reduce((acc, r) => acc + r.wrongAttempts, 0);
  const totalCorrectResponses = completedCount;
  const totalActions = totalCorrectResponses + totalWrongAttempts;

  const accuracyPct =
    totalActions > 0 ? Math.round((totalCorrectResponses / totalActions) * 100) : 100;
  const starsEarned = computeStarsFromAccuracy(accuracyPct);
  const pointsEarned = sessionResults.reduce((acc, r) => acc + r.pointsEarned, 0);

  const weakTopicSet = new Set<string>();
  sessionResults.forEach((r) => {
    if (r.wrongAttempts > 0) {
      weakTopicSet.add(r.topicTag);
    }
  });

  const newlyUnlockedBadges: string[] = [];
  const worldBadgeId = `badge_world_${worldId}`;
  if (!existingBadges.includes(worldBadgeId)) {
    newlyUnlockedBadges.push(worldBadgeId);
  }
  if (starsEarned === 3 && totalWrongAttempts === 0 && !existingBadges.includes('badge_first_try_streak')) {
    newlyUnlockedBadges.push('badge_first_try_streak');
  }

  return {
    worldId,
    totalChallenges,
    completedCount,
    firstTryCorrect,
    totalWrongAttempts,
    totalCorrectResponses,
    accuracyPct,
    starsEarned,
    pointsEarned,
    weakTopics: Array.from(weakTopicSet),
    newlyUnlockedBadges,
  };
}

export function getTotalStars(progress: PlayerProgress): number {
  return WORLD_ORDER.reduce((sum, wId) => sum + (progress.worldResults[wId]?.stars || 0), 0);
}

export function getCompletedWorldsCount(progress: PlayerProgress): number {
  return WORLD_ORDER.filter((wId) => progress.worldResults[wId]?.completed).length;
}

export interface GlobalLearningReport {
  totalChallengesSolved: number;
  totalFirstTry: number;
  totalWrongAttempts: number;
  overallAccuracyPct: number;
  totalStars: number;
  maxStars: number;
  weakestTopics: Array<{ topic: string; accuracyPct: number; attempts: number }>;
  strongestTopics: Array<{ topic: string; accuracyPct: number; attempts: number }>;
  recommendation: string;
}

export function buildGlobalLearningReport(progress: PlayerProgress): GlobalLearningReport {
  const attempts = Object.values(progress.attemptHistory);
  const totalChallengesSolved = attempts.filter((a) => a.solved).length;
  const totalFirstTry = attempts.filter((a) => a.correctFirstTry).length;
  const totalWrongAttempts = attempts.reduce((sum, a) => sum + a.wrongAttempts, 0);
  const totalActions = totalChallengesSolved + totalWrongAttempts;
  const overallAccuracyPct =
    totalActions > 0 ? Math.round((totalChallengesSolved / totalActions) * 100) : 0;

  const topicMap = new Map<string, { solved: number; wrong: number }>();
  attempts.forEach((a) => {
    const prev = topicMap.get(a.topicTag) || { solved: 0, wrong: 0 };
    topicMap.set(a.topicTag, {
      solved: prev.solved + (a.solved ? 1 : 0),
      wrong: prev.wrong + a.wrongAttempts,
    });
  });

  const topicStats = Array.from(topicMap.entries()).map(([topic, data]) => {
    const total = data.solved + data.wrong;
    const accuracyPct = total > 0 ? Math.round((data.solved / total) * 100) : 100;
    return { topic, accuracyPct, attempts: total };
  });

  const weakestTopics = [...topicStats]
    .filter((t) => t.accuracyPct < 90)
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 3);

  const strongestTopics = [...topicStats]
    .sort((a, b) => b.accuracyPct - a.accuracyPct)
    .slice(0, 3);

  let recommendation =
    '¡Excelente trabajo! Has demostrado una gran seguridad con las fracciones. Puedes probar un nivel de dificultad superior para seguir retándote.';
  if (totalChallengesSolved === 0) {
    recommendation = 'Completa algunos desafíos en los mundos para ver tu análisis personalizado.';
  } else if (weakestTopics.length > 0) {
    const focusList = weakestTopics.map((t) => t.topic.toLowerCase()).join(', ');
    recommendation = `Tu progreso es muy positivo. Te recomendamos repasar especialmente: ${focusList}. Apóyate en los dibujos de barras y pizzas antes de responder.`;
  } else if (overallAccuracyPct < 85) {
    recommendation =
      'Vas por muy buen camino. Antes de elegir tu respuesta, cuenta siempre primero el total de partes iguales (denominador).';
  }

  return {
    totalChallengesSolved,
    totalFirstTry,
    totalWrongAttempts,
    overallAccuracyPct,
    totalStars: getTotalStars(progress),
    maxStars: 15,
    weakestTopics,
    strongestTopics,
    recommendation,
  };
}
