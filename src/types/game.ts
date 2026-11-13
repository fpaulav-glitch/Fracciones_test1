export type Difficulty = 'inicial' | 'intermedio' | 'avanzado';

export type WorldId = 1 | 2 | 3 | 4 | 5;

export type GameScreen =
  | 'TITLE'
  | 'MAP'
  | 'PLAYING'
  | 'WORLD_CELEBRATION'
  | 'FINAL_REPORT';

export type VisualShape = 'pizza' | 'cake' | 'bar' | 'grid' | 'jug';

export interface VisualFractionSpec {
  shape: VisualShape;
  numerator: number;
  denominator: number;
  rows?: number;
  cols?: number;
  colorTheme?: 'emerald' | 'tomato' | 'berry' | 'chocolate' | 'amber' | 'sky' | 'royal';
}

export interface FractionValue {
  numerator: number;
  denominator: number;
}

export type ChallengeType =
  | 'select-visual'
  | 'interactive-paint'
  | 'complete-fraction'
  | 'match-equivalents'
  | 'order-fractions'
  | 'numberline-place'
  | 'problem-solve';

export interface SelectOption {
  id: string;
  label?: string;
  fraction?: FractionValue;
  visual?: VisualFractionSpec;
}

export interface EquivalencePair {
  id: string;
  left: {
    label?: string;
    fraction: FractionValue;
    visual?: VisualFractionSpec;
  };
  right: {
    label?: string;
    fraction: FractionValue;
    visual?: VisualFractionSpec;
  };
}

export interface OrderFractionItem {
  id: string;
  fraction: FractionValue;
  visual?: VisualFractionSpec;
}

export interface BaseChallenge {
  id: string;
  worldId: WorldId;
  difficulty: Difficulty;
  type: ChallengeType;
  title: string;
  prompt: string;
  topicTag: string;
  hint: string;
  explanation: string;
}

export interface SelectVisualChallenge extends BaseChallenge {
  type: 'select-visual';
  targetFraction?: FractionValue;
  promptVisual?: VisualFractionSpec;
  options: SelectOption[];
  correctOptionId: string;
}

export interface InteractivePaintChallenge extends BaseChallenge {
  type: 'interactive-paint';
  targetFraction: FractionValue;
  canvasSpec: VisualFractionSpec; // numerator here is initial (0)
}

export interface CompleteFractionChallenge extends BaseChallenge {
  type: 'complete-fraction';
  visual: VisualFractionSpec;
  targetFraction: FractionValue;
  missingPart: 'numerator' | 'denominator' | 'both';
  numberChoices: number[];
}

export interface MatchEquivalentsChallenge extends BaseChallenge {
  type: 'match-equivalents';
  pairs: EquivalencePair[];
}

export interface OrderFractionsChallenge extends BaseChallenge {
  type: 'order-fractions';
  direction: 'asc' | 'desc';
  items: OrderFractionItem[];
}

export interface NumberLinePlaceChallenge extends BaseChallenge {
  type: 'numberline-place';
  targetFraction: FractionValue;
  divisions: number;
  maxWhole?: number; // default 1
}

export interface ProblemSolveChallenge extends BaseChallenge {
  type: 'problem-solve';
  storyContext: string;
  mode: 'select-option' | 'paint-fraction';
  promptVisual?: VisualFractionSpec;
  options?: SelectOption[];
  correctOptionId?: string;
  targetFraction?: FractionValue;
  canvasSpec?: VisualFractionSpec;
}

export type Challenge =
  | SelectVisualChallenge
  | InteractivePaintChallenge
  | CompleteFractionChallenge
  | MatchEquivalentsChallenge
  | OrderFractionsChallenge
  | NumberLinePlaceChallenge
  | ProblemSolveChallenge;

export interface ChallengeAttemptResult {
  challengeId: string;
  worldId: WorldId;
  difficulty: Difficulty;
  topicTag: string;
  attempts: number;
  wrongAttempts: number;
  correctFirstTry: boolean;
  solved: boolean;
  pointsEarned: number;
  usedHint: boolean;
}

export interface WorldProgress {
  completed: boolean;
  stars: number; // 0..3
  bestAccuracy: number; // 0..100
  pointsEarned: number;
  completedChallengeIds: string[];
  correctFirstTryCount: number;
  totalAttempts: number;
  wrongAttempts: number;
  weakTopics: string[];
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconType: 'forest' | 'pizza' | 'temple' | 'mountain' | 'castle' | 'streak' | 'master' | 'explorer';
  accentColor: string;
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  shortName: string;
  subtitle: string;
  fragmentName: string;
  description: string;
  introSpeech: string;
  outroSpeech: string;
  pinPosition: { x: number; y: number };
  theme: {
    bgGradient: string;
    surfaceBg: string;
    border: string;
    accentBg: string;
    accentHover: string;
    accentText: string;
    badgeBg: string;
    primaryHex: string;
  };
}

export interface PlayerProgress {
  playerName: string;
  difficulty: Difficulty;
  soundEnabled: boolean;
  readAloudEnabled: boolean;
  unlockedWorld: number; // 1..5
  totalPoints: number;
  worldResults: Record<WorldId, WorldProgress>;
  attemptHistory: Record<string, ChallengeAttemptResult>;
  earnedBadges: string[];
  adventureCompleted: boolean;
}
