import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { WORLDS } from '../data/worlds';
import {
  Challenge,
  ChallengeAttemptResult,
  Difficulty,
  EquivalencePair,
  OrderFractionItem,
  WorldId,
} from '../types/game';
import {
  areFractionsEquivalent,
  compareFractions,
  computeChallengePoints,
} from '../utils/gameLogic';
import { soundEngine, speakSpanish, stopSpeaking } from '../utils/sound';
import { FractionNotation } from './FractionNotation';
import { FractionVisual, NumberLineVisual } from './FractionVisual';
import { GuideCompanion } from './GuideCompanion';

interface ChallengeArenaProps {
  worldId: WorldId;
  difficulty: Difficulty;
  challenges: Challenge[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExitToMap: () => void;
  onCompleteWorld: (results: ChallengeAttemptResult[]) => void;
}

function deterministicShuffle<T>(arr: T[], seedStr: string): T[] {
  const copy = [...arr];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 997;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 17 + 13) % 997;
    const j = seed % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  worldId,
  difficulty,
  challenges,
  soundEnabled,
  onToggleSound,
  onExitToMap,
  onCompleteWorld,
}) => {
  const world = WORLDS[worldId];
  const [currentIdx, setCurrentIdx] = useState(0);
  const challenge = challenges[currentIdx];

  // Attempt tracking for real formative evaluation
  const [sessionResults, setSessionResults] = useState<ChallengeAttemptResult[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackDetail, setFeedbackDetail] = useState('');
  const [lastPoints, setLastPoints] = useState(0);

  // Interactive states per challenge type
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [paintedIndices, setPaintedIndices] = useState<number[]>([]);
  const [slotNumerator, setSlotNumerator] = useState<number | null>(null);
  const [slotDenominator, setSlotDenominator] = useState<number | null>(null);
  const [activeSlot, setActiveSlot] = useState<'numerator' | 'denominator'>('numerator');

  // Match equivalents state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // leftId -> rightId

  // Order fractions state
  const [orderedItems, setOrderedItems] = useState<OrderFractionItem[]>([]);
  const [draggedOrderIdx, setDraggedOrderIdx] = useState<number | null>(null);

  // Number line state
  const [selectedTick, setSelectedTick] = useState<number | null>(null);

  // Shuffled right-hand column for match-equivalents
  const shuffledRightPairs = useMemo(() => {
    if (challenge?.type !== 'match-equivalents') return [];
    const shuffled = deterministicShuffle(challenge.pairs, challenge.id + '_right');
    // Ensure not identical order if possible
    if (
      shuffled.length > 1 &&
      shuffled.every((p, idx) => p.id === challenge.pairs[idx].id)
    ) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
  }, [challenge]);

  // Reset per-challenge state whenever currentIdx changes
  useEffect(() => {
    if (!challenge) return;
    setWrongAttempts(0);
    setUsedHint(false);
    setShowHint(false);
    setFeedback('idle');
    setFeedbackDetail('');
    setLastPoints(0);
    setSelectedOptionId(null);
    setPaintedIndices([]);
    setSelectedLeftId(null);
    setMatchedPairs({});
    setSelectedTick(null);

    if (challenge.type === 'complete-fraction') {
      setSlotNumerator(
        challenge.missingPart === 'denominator' ? challenge.targetFraction.numerator : null
      );
      setSlotDenominator(
        challenge.missingPart === 'numerator' ? challenge.targetFraction.denominator : null
      );
      setActiveSlot(challenge.missingPart === 'denominator' ? 'denominator' : 'numerator');
    } else {
      setSlotNumerator(null);
      setSlotDenominator(null);
    }

    if (challenge.type === 'order-fractions') {
      const shuffled = deterministicShuffle(challenge.items, challenge.id + '_ord');
      // Avoid starting already sorted
      const isAlreadySorted = shuffled.every((item, idx) => {
        if (idx === 0) return true;
        const cmp = compareFractions(shuffled[idx - 1].fraction, item.fraction);
        return challenge.direction === 'asc' ? cmp <= 0 : cmp >= 0;
      });
      if (isAlreadySorted && shuffled.length > 1) {
        [shuffled[0], shuffled[shuffled.length - 1]] = [
          shuffled[shuffled.length - 1],
          shuffled[0],
        ];
      }
      setOrderedItems(shuffled);
    } else {
      setOrderedItems([]);
    }

    return () => {
      stopSpeaking();
    };
  }, [challenge]);

  if (!challenge) {
    return null;
  }

  const progressPct = Math.round(((currentIdx + (feedback === 'correct' ? 1 : 0)) / challenges.length) * 100);
  const currentSessionPoints = sessionResults.reduce((sum, r) => sum + r.pointsEarned, 0);

  const handleToggleHint = () => {
    soundEngine.playClick();
    if (!showHint) {
      setUsedHint(true);
    }
    setShowHint((prev) => !prev);
  };

  const handleRepeatInstruction = () => {
    soundEngine.playClick();
    const fullText =
      challenge.type === 'problem-solve'
        ? `${challenge.storyContext} ${challenge.prompt}`
        : challenge.prompt;
    speakSpanish(fullText, true);
  };

  const handleTogglePaintedSlice = (index: number) => {
    if (feedback === 'correct') return;
    soundEngine.playClick();
    if (feedback === 'wrong') setFeedback('idle');

    const shape =
      challenge.type === 'interactive-paint'
        ? challenge.canvasSpec.shape
        : challenge.type === 'problem-solve'
          ? challenge.canvasSpec?.shape
          : undefined;

    if (shape === 'jug') {
      // Liquid fills from bottom (0) up to clicked level
      const currentMax = paintedIndices.length;
      if (index + 1 === currentMax) {
        setPaintedIndices(Array.from({ length: index }, (_, i) => i));
      } else {
        setPaintedIndices(Array.from({ length: index + 1 }, (_, i) => i));
      }
      return;
    }

    setPaintedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handlePlaceNumberChoice = (num: number) => {
    if (feedback === 'correct' || challenge.type !== 'complete-fraction') return;
    soundEngine.playClick();
    if (feedback === 'wrong') setFeedback('idle');

    if (challenge.missingPart === 'numerator') {
      setSlotNumerator(num);
    } else if (challenge.missingPart === 'denominator') {
      setSlotDenominator(num);
    } else {
      if (activeSlot === 'numerator') {
        setSlotNumerator(num);
        if (slotDenominator === null) {
          setActiveSlot('denominator');
        }
      } else {
        setSlotDenominator(num);
      }
    }
  };

  const handlePairRight = (rightPairId: string) => {
    if (feedback === 'correct') return;
    soundEngine.playClick();
    if (feedback === 'wrong') setFeedback('idle');

    if (!selectedLeftId) return;

    setMatchedPairs((prev) => {
      const next = { ...prev };
      // Remove any existing left mapping to this rightId
      Object.keys(next).forEach((k) => {
        if (next[k] === rightPairId) {
          delete next[k];
        }
      });
      next[selectedLeftId] = rightPairId;
      return next;
    });
    setSelectedLeftId(null);
  };

  const moveOrderItem = (fromIdx: number, toIdx: number) => {
    if (feedback === 'correct') return;
    if (toIdx < 0 || toIdx >= orderedItems.length) return;
    soundEngine.playClick();
    if (feedback === 'wrong') setFeedback('idle');
    setOrderedItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const canSubmit = (): boolean => {
    switch (challenge.type) {
      case 'select-visual':
        return selectedOptionId !== null;
      case 'interactive-paint':
        return paintedIndices.length > 0;
      case 'complete-fraction':
        return slotNumerator !== null && slotDenominator !== null;
      case 'match-equivalents':
        return Object.keys(matchedPairs).length === challenge.pairs.length;
      case 'order-fractions':
        return orderedItems.length > 0;
      case 'numberline-place':
        return selectedTick !== null;
      case 'problem-solve':
        return challenge.mode === 'select-option'
          ? selectedOptionId !== null
          : paintedIndices.length > 0;
      default:
        return false;
    }
  };

  const evaluateAnswer = () => {
    if (!canSubmit() || feedback === 'correct') return;

    let isCorrect = false;
    let customWrongHint = challenge.hint;

    if (challenge.type === 'select-visual') {
      isCorrect = selectedOptionId === challenge.correctOptionId;
    } else if (challenge.type === 'interactive-paint') {
      isCorrect = areFractionsEquivalent(
        { numerator: paintedIndices.length, denominator: challenge.canvasSpec.denominator },
        challenge.targetFraction
      );
      if (!isCorrect) {
        customWrongHint = `Has seleccionado ${paintedIndices.length} de ${challenge.canvasSpec.denominator} partes. ${challenge.hint}`;
      }
    } else if (challenge.type === 'complete-fraction') {
      isCorrect =
        slotNumerator === challenge.targetFraction.numerator &&
        slotDenominator === challenge.targetFraction.denominator;
      if (!isCorrect) {
        customWrongHint = `Revisa tu fracción (${slotNumerator ?? '?'}/${slotDenominator ?? '?'}). ${challenge.hint}`;
      }
    } else if (challenge.type === 'match-equivalents') {
      const pairMap = new Map<string, EquivalencePair>();
      challenge.pairs.forEach((p) => pairMap.set(p.id, p));
      isCorrect = challenge.pairs.every((leftPair) => {
        const chosenRightId = matchedPairs[leftPair.id];
        const rightPair = pairMap.get(chosenRightId);
        if (!rightPair) return false;
        return areFractionsEquivalent(leftPair.left.fraction, rightPair.right.fraction);
      });
    } else if (challenge.type === 'order-fractions') {
      isCorrect = orderedItems.every((item, idx) => {
        if (idx === 0) return true;
        const cmp = compareFractions(orderedItems[idx - 1].fraction, item.fraction);
        return challenge.direction === 'asc' ? cmp <= 0 : cmp >= 0;
      });
    } else if (challenge.type === 'numberline-place') {
      if (selectedTick !== null) {
        isCorrect = areFractionsEquivalent(
          { numerator: selectedTick, denominator: challenge.divisions },
          challenge.targetFraction
        );
      }
    } else if (challenge.type === 'problem-solve') {
      if (challenge.mode === 'select-option') {
        isCorrect = selectedOptionId === challenge.correctOptionId;
      } else if (challenge.canvasSpec && challenge.targetFraction) {
        isCorrect = areFractionsEquivalent(
          { numerator: paintedIndices.length, denominator: challenge.canvasSpec.denominator },
          challenge.targetFraction
        );
        if (!isCorrect) {
          customWrongHint = `Has marcado ${paintedIndices.length} de ${challenge.canvasSpec.denominator} partes. ${challenge.hint}`;
        }
      }
    }

    if (isCorrect) {
      soundEngine.playCorrect();
      const earned = computeChallengePoints(wrongAttempts, usedHint);
      setLastPoints(earned);
      setFeedback('correct');
      setFeedbackDetail(challenge.explanation);

      const attemptRecord: ChallengeAttemptResult = {
        challengeId: challenge.id,
        worldId: challenge.worldId,
        difficulty,
        topicTag: challenge.topicTag,
        attempts: wrongAttempts + 1,
        wrongAttempts,
        correctFirstTry: wrongAttempts === 0,
        solved: true,
        pointsEarned: earned,
        usedHint,
      };
      setSessionResults((prev) => [...prev, attemptRecord]);
    } else {
      soundEngine.playWrong();
      setWrongAttempts((prev) => prev + 1);
      setFeedback('wrong');
      setFeedbackDetail(customWrongHint);
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (currentIdx + 1 < challenges.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      soundEngine.playWorldComplete();
      onCompleteWorld(sessionResults);
    }
  };

  const handleRetry = () => {
    soundEngine.playClick();
    setFeedback('idle');
  };

  const PAIR_COLORS = [
    'border-amber-500 bg-amber-50 text-amber-950',
    'border-emerald-500 bg-emerald-50 text-emerald-950',
    'border-sky-500 bg-sky-50 text-sky-950',
  ];
  const PAIR_LABELS = ['Pareja A', 'Pareja B', 'Pareja C'];

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${world.theme.bgGradient} flex flex-col`}>
      {/* Compact World HUD */}
      <header className="bg-white/95 border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitToMap}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mapa</span>
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 truncate">
              Mundo {world.id}: {world.name}
            </p>
            <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
              {challenge.title}
            </h1>
          </div>
        </div>

        {/* Progress Bar & Points */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1 w-44">
            <div className="flex items-center justify-between w-full text-xs font-bold text-slate-700 font-mono-num">
              <span>
                Desafío {currentIdx + 1}/{challenges.length}
              </span>
              <span>{currentSessionPoints} pts</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${world.theme.accentBg}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <span className="sm:hidden text-xs font-bold font-mono-num text-slate-700">
            {currentIdx + 1}/{challenges.length}
          </span>

          <button
            type="button"
            onClick={onToggleSound}
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 flex items-center justify-center transition-colors"
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Centered Playfield */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5 justify-center">
        {/* Pluma Companion Prompt & DUA Hint/Repeat */}
        <GuideCompanion
          message={
            challenge.type === 'problem-solve'
              ? `${challenge.storyContext} — ${challenge.prompt}`
              : challenge.prompt
          }
          hint={challenge.hint}
          showHint={showHint}
          onToggleHint={handleToggleHint}
          onRepeatInstruction={handleRepeatInstruction}
        />

        {/* Interactive Challenge Stage Card */}
        <section
          className={`bg-white rounded-3xl border-2 ${world.theme.border} p-5 sm:p-8 shadow-sm space-y-6 ${
            feedback === 'wrong' ? 'animate-gentle-shake' : ''
          }`}
        >
          {/* Optional prompt visual for select-visual / problem-solve */}
          {(challenge.type === 'select-visual' || challenge.type === 'problem-solve') &&
            challenge.promptVisual && (
              <div className="flex flex-col items-center justify-center bg-stone-50 border border-slate-200 rounded-2xl p-5">
                <FractionVisual spec={challenge.promptVisual} size="lg" />
              </div>
            )}

          {/* TYPE 1: SELECT VISUAL OR FRACTION OPTION */}
          {(challenge.type === 'select-visual' ||
            (challenge.type === 'problem-solve' && challenge.mode === 'select-option')) &&
            challenge.options && (
              <div
                className={`grid grid-cols-1 ${
                  challenge.options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                } gap-4`}
              >
                {challenge.options.map((opt) => {
                  const selected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={feedback === 'correct'}
                      onClick={() => {
                        soundEngine.playClick();
                        if (feedback === 'wrong') setFeedback('idle');
                        setSelectedOptionId(opt.id);
                      }}
                      aria-pressed={selected}
                      className={`p-5 rounded-2xl border-2 min-h-[112px] flex flex-col items-center justify-center gap-3 transition-all ${
                        selected
                          ? 'border-amber-500 bg-amber-50/70 shadow-md scale-[1.01]'
                          : 'border-slate-200 bg-stone-50/60 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {opt.visual && <FractionVisual spec={opt.visual} size="md" />}
                      {opt.fraction && (
                        <FractionNotation
                          numerator={opt.fraction.numerator}
                          denominator={opt.fraction.denominator}
                          size="lg"
                        />
                      )}
                      {opt.label && (
                        <span className="text-base font-bold text-slate-900 text-center">
                          {opt.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          {/* TYPE 2: INTERACTIVE PAINT (PIZZA / CAKE / BAR / GRID / JUG) */}
          {(challenge.type === 'interactive-paint' ||
            (challenge.type === 'problem-solve' && challenge.mode === 'paint-fraction')) &&
            challenge.canvasSpec &&
            challenge.targetFraction && (
              <div className="flex flex-col items-center gap-5">
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                  <div className="bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700">Objetivo:</span>
                    <FractionNotation
                      numerator={challenge.targetFraction.numerator}
                      denominator={challenge.targetFraction.denominator}
                      size="lg"
                    />
                  </div>
                  <div className="text-sm text-slate-700 font-medium text-center sm:text-left">
                    <p>Toca las partes de la figura para marcarlas.</p>
                    {difficulty !== 'avanzado' && (
                      <p className="font-mono-num font-bold text-slate-900 mt-1">
                        Marcadas: {paintedIndices.length} de {challenge.canvasSpec.denominator}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-stone-50/80 border border-slate-200 rounded-3xl flex items-center justify-center">
                  <FractionVisual
                    spec={challenge.canvasSpec}
                    size="lg"
                    interactive={feedback !== 'correct'}
                    selectedIndices={paintedIndices}
                    onToggleIndex={handleTogglePaintedSlice}
                  />
                </div>

                {feedback !== 'correct' && paintedIndices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPaintedIndices([]);
                      if (feedback === 'wrong') setFeedback('idle');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar selección</span>
                  </button>
                )}
              </div>
            )}

          {/* TYPE 3: COMPLETE FRACTION (DRAG OR CLICK NUMBER TILES) */}
          {challenge.type === 'complete-fraction' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center justify-center bg-stone-50 border border-slate-200 rounded-2xl p-6">
                <FractionVisual spec={challenge.visual} size="lg" />
              </div>

              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center">
                    {/* Numerator slot */}
                    <button
                      type="button"
                      disabled={challenge.missingPart === 'denominator' || feedback === 'correct'}
                      onClick={() => {
                        if (challenge.missingPart === 'denominator') return;
                        soundEngine.playClick();
                        if (slotNumerator !== null) setSlotNumerator(null);
                        setActiveSlot('numerator');
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const val = Number(e.dataTransfer.getData('text/plain'));
                        if (!Number.isNaN(val) && challenge.missingPart !== 'denominator') {
                          setSlotNumerator(val);
                          soundEngine.playClick();
                        }
                      }}
                      className={`w-20 h-16 rounded-2xl border-2 font-mono-num text-3xl font-bold flex items-center justify-center transition-colors ${
                        challenge.missingPart === 'denominator'
                          ? 'bg-slate-100 border-slate-300 text-slate-900 cursor-default'
                          : activeSlot === 'numerator'
                            ? 'bg-amber-50 border-amber-500 text-amber-900'
                            : 'bg-white border-slate-300 text-slate-900 hover:border-amber-400'
                      }`}
                      aria-label="Casilla del numerador"
                    >
                      {slotNumerator ?? '?'}
                    </button>

                    <div className="w-24 h-1.5 bg-slate-800 rounded-full my-2.5" />

                    {/* Denominator slot */}
                    <button
                      type="button"
                      disabled={challenge.missingPart === 'numerator' || feedback === 'correct'}
                      onClick={() => {
                        if (challenge.missingPart === 'numerator') return;
                        soundEngine.playClick();
                        if (slotDenominator !== null) setSlotDenominator(null);
                        setActiveSlot('denominator');
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const val = Number(e.dataTransfer.getData('text/plain'));
                        if (!Number.isNaN(val) && challenge.missingPart !== 'numerator') {
                          setSlotDenominator(val);
                          soundEngine.playClick();
                        }
                      }}
                      className={`w-20 h-16 rounded-2xl border-2 font-mono-num text-3xl font-bold flex items-center justify-center transition-colors ${
                        challenge.missingPart === 'numerator'
                          ? 'bg-slate-100 border-slate-300 text-slate-900 cursor-default'
                          : activeSlot === 'denominator'
                            ? 'bg-amber-50 border-amber-500 text-amber-900'
                            : 'bg-white border-slate-300 text-slate-900 hover:border-amber-400'
                      }`}
                      aria-label="Casilla del denominador"
                    >
                      {slotDenominator ?? '?'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-600 space-y-10">
                    <p className="font-semibold">Numerador (partes marcadas)</p>
                    <p className="font-semibold">Denominador (total de partes)</p>
                  </div>
                </div>

                {/* Draggable / Clickable Number Tiles */}
                <div className="space-y-2 w-full">
                  <p className="text-xs text-center text-slate-500 font-medium">
                    Toca o arrastra un número para colocarlo:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {challenge.numberChoices.map((num) => (
                      <button
                        key={num}
                        type="button"
                        draggable={feedback !== 'correct'}
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', String(num))}
                        onClick={() => handlePlaceNumberChoice(num)}
                        className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 font-mono-num text-2xl font-bold text-slate-900 shadow-sm transition-transform active:scale-95"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TYPE 4: MATCH EQUIVALENTS */}
          {challenge.type === 'match-equivalents' && (
            <div className="space-y-4">
              <p className="text-xs text-center text-slate-600 font-medium">
                Toca una ficha de la izquierda (o arrástrala) y únela con su equivalente de la derecha.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 text-center">Fracciones origen</p>
                  {challenge.pairs.map((pair, idx) => {
                    const isSelected = selectedLeftId === pair.id;
                    const pairedRightId = matchedPairs[pair.id];
                    const pairClass = pairedRightId
                      ? PAIR_COLORS[idx % PAIR_COLORS.length]
                      : isSelected
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                        : 'border-slate-200 bg-stone-50 hover:bg-white';

                    return (
                      <button
                        key={pair.id}
                        type="button"
                        draggable={feedback !== 'correct'}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', pair.id);
                          setSelectedLeftId(pair.id);
                        }}
                        onClick={() => {
                          if (feedback === 'correct') return;
                          soundEngine.playClick();
                          setSelectedLeftId(isSelected ? null : pair.id);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between gap-4 min-h-[76px] transition-all ${pairClass}`}
                      >
                        <div className="flex items-center gap-4">
                          <FractionNotation
                            numerator={pair.left.fraction.numerator}
                            denominator={pair.left.fraction.denominator}
                            size="md"
                          />
                          {pair.left.visual && <FractionVisual spec={pair.left.visual} size="sm" />}
                        </div>
                        <span className="text-xs font-bold">
                          {pairedRightId ? PAIR_LABELS[idx] : isSelected ? 'Elige pareja →' : 'Seleccionar'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 text-center">Equivalentes</p>
                  {shuffledRightPairs.map((pair) => {
                    const matchedLeftIdx = challenge.pairs.findIndex(
                      (lp) => matchedPairs[lp.id] === pair.id
                    );
                    const isMatched = matchedLeftIdx !== -1;
                    const pairClass = isMatched
                      ? PAIR_COLORS[matchedLeftIdx % PAIR_COLORS.length]
                      : selectedLeftId
                        ? 'border-amber-300 bg-white hover:border-amber-500 hover:bg-amber-50/40'
                        : 'border-slate-200 bg-stone-50';

                    return (
                      <button
                        key={pair.id}
                        type="button"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const leftId = e.dataTransfer.getData('text/plain');
                          if (leftId) {
                            setMatchedPairs((prev) => {
                              const next = { ...prev };
                              Object.keys(next).forEach((k) => {
                                if (next[k] === pair.id) delete next[k];
                              });
                              next[leftId] = pair.id;
                              return next;
                            });
                            setSelectedLeftId(null);
                            soundEngine.playClick();
                          }
                        }}
                        onClick={() => handlePairRight(pair.id)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between gap-4 min-h-[76px] transition-all ${pairClass}`}
                      >
                        <div className="flex items-center gap-4">
                          <FractionNotation
                            numerator={pair.right.fraction.numerator}
                            denominator={pair.right.fraction.denominator}
                            size="md"
                          />
                          {pair.right.visual && <FractionVisual spec={pair.right.visual} size="sm" />}
                        </div>
                        <span className="text-xs font-bold">
                          {isMatched ? PAIR_LABELS[matchedLeftIdx] : 'Unir aquí'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TYPE 5: ORDER FRACTIONS */}
          {challenge.type === 'order-fractions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-sky-900">
                <span>{challenge.direction === 'asc' ? 'Más pequeña (Menor)' : 'Más grande (Mayor)'}</span>
                <span>→</span>
                <span>{challenge.direction === 'asc' ? 'Más grande (Mayor)' : 'Más pequeña (Menor)'}</span>
              </div>

              <div
                className={`grid grid-cols-1 ${
                  orderedItems.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
                } gap-3`}
              >
                {orderedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable={feedback !== 'correct'}
                    onDragStart={() => setDraggedOrderIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedOrderIdx !== null && draggedOrderIdx !== idx) {
                        moveOrderItem(draggedOrderIdx, idx);
                      }
                      setDraggedOrderIdx(null);
                    }}
                    className="bg-stone-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500">
                      <span>Posición {idx + 1}</span>
                      <GripVertical className="w-4 h-4 text-slate-400" />
                    </div>

                    <FractionNotation
                      numerator={item.fraction.numerator}
                      denominator={item.fraction.denominator}
                      size="lg"
                    />

                    {item.visual && <FractionVisual spec={item.visual} size="sm" />}

                    <div className="flex items-center gap-2 w-full justify-center pt-1">
                      <button
                        type="button"
                        disabled={idx === 0 || feedback === 'correct'}
                        onClick={() => moveOrderItem(idx, idx - 1)}
                        className="flex-1 min-h-[40px] rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                        aria-label={`Mover ${item.fraction.numerator}/${item.fraction.denominator} a la izquierda`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedItems.length - 1 || feedback === 'correct'}
                        onClick={() => moveOrderItem(idx, idx + 1)}
                        className="flex-1 min-h-[40px] rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                        aria-label={`Mover ${item.fraction.numerator}/${item.fraction.denominator} a la derecha`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TYPE 6: NUMBER LINE PLACEMENT */}
          {challenge.type === 'numberline-place' && (
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-4 bg-sky-50 border border-sky-200 rounded-2xl px-6 py-4 max-w-xs mx-auto">
                <span className="text-sm font-bold text-sky-900">Sitúa el banderín en:</span>
                <FractionNotation
                  numerator={challenge.targetFraction.numerator}
                  denominator={challenge.targetFraction.denominator}
                  size="lg"
                />
              </div>

              <NumberLineVisual
                divisions={challenge.divisions}
                selectedTick={selectedTick}
                disabled={feedback === 'correct'}
                onSelectTick={(tick) => {
                  soundEngine.playClick();
                  if (feedback === 'wrong') setFeedback('idle');
                  setSelectedTick(tick);
                }}
              />

              <p className="text-xs text-center text-slate-600">
                {selectedTick === null
                  ? 'Toca una marca de la recta numérica para colocar tu banderín.'
                  : `Banderín colocado en la marca ${selectedTick} de ${challenge.divisions}.`}
              </p>
            </div>
          )}

          {/* Formative Feedback Banner or Action Button */}
          <div className="pt-2 border-t border-slate-100">
            {feedback === 'idle' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canSubmit()}
                  onClick={evaluateAnswer}
                  className={`px-7 py-3.5 min-h-[52px] rounded-2xl font-display text-lg font-bold text-white shadow-sm transition-all ${
                    canSubmit()
                      ? `${world.theme.accentBg} ${world.theme.accentHover}`
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Comprobar respuesta
                </button>
              </div>
            )}

            {feedback === 'wrong' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pop-in">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-950">
                      ¡Buen intento! Vamos a revisarlo juntos
                    </p>
                    <p className="text-sm text-rose-900 mt-0.5 leading-relaxed">{feedbackDetail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-5 py-3 min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm whitespace-nowrap shrink-0"
                >
                  Volver a intentarlo
                </button>
              </div>
            )}

            {feedback === 'correct' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pop-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-emerald-950">¡Excelente respuesta!</p>
                      <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />+{lastPoints} pts
                      </span>
                    </div>
                    <p className="text-sm text-emerald-900 mt-0.5 leading-relaxed">{feedbackDetail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-base whitespace-nowrap shrink-0 shadow-sm"
                >
                  <span>
                    {currentIdx + 1 < challenges.length ? 'Siguiente desafío' : 'Completar mundo'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
