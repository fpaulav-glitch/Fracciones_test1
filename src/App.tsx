/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ChallengeArena } from './components/ChallengeArena';
import { CurriculumModal } from './components/CurriculumModal';
import { FinalReportModal } from './components/FinalReportModal';
import { TitleScreen } from './components/TitleScreen';
import { WorldCelebrationModal } from './components/WorldCelebrationModal';
import { WorldMapScreen } from './components/WorldMapScreen';
import { getChallengesForWorld } from './data/challenges';
import { WORLD_ORDER } from './data/worlds';
import {
  ChallengeAttemptResult,
  Difficulty,
  GameScreen,
  PlayerProgress,
  WorldId,
} from './types/game';
import {
  clearProgress,
  createInitialProgress,
  evaluateWorldSession,
  loadProgress,
  saveProgress,
  WorldSessionSummary,
} from './utils/gameLogic';
import { soundEngine } from './utils/sound';

export default function App() {
  const [savedProgress, setSavedProgress] = useState<PlayerProgress | null>(() => loadProgress());
  const [progress, setProgress] = useState<PlayerProgress>(
    () => savedProgress || createInitialProgress()
  );
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [activeWorldId, setActiveWorldId] = useState<WorldId>(1);
  const [playRunId, setPlayRunId] = useState(0);

  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [celebrationSummary, setCelebrationSummary] = useState<WorldSessionSummary | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    soundEngine.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  useEffect(() => {
    saveProgress(progress);
    setSavedProgress(progress);
  }, [progress]);

  const handleToggleSound = () => {
    setProgress((prev) => {
      const nextSound = !prev.soundEnabled;
      soundEngine.setEnabled(nextSound);
      if (nextSound) soundEngine.playClick();
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const handleStartNewGame = (playerName: string, difficulty: Difficulty) => {
    const fresh = createInitialProgress(playerName, difficulty);
    fresh.soundEnabled = progress.soundEnabled;
    soundEngine.playClick();
    setProgress(fresh);
    setCelebrationSummary(null);
    setShowFinalReport(false);
    setScreen('MAP');
  };

  const handleContinueGame = () => {
    soundEngine.playClick();
    if (savedProgress) {
      setProgress(savedProgress);
    }
    setScreen('MAP');
  };

  const handleChangeDifficulty = (difficulty: Difficulty) => {
    soundEngine.playClick();
    setProgress((prev) => ({ ...prev, difficulty }));
  };

  const handleSelectWorld = (worldId: WorldId) => {
    if (worldId > progress.unlockedWorld) return;
    soundEngine.playClick();
    setActiveWorldId(worldId);
    setPlayRunId((n) => n + 1);
    setCelebrationSummary(null);
    setScreen('PLAYING');
  };

  const handleCompleteWorld = (sessionResults: ChallengeAttemptResult[]) => {
    const summary = evaluateWorldSession(
      activeWorldId,
      sessionResults,
      progress.earnedBadges
    );

    setProgress((prev) => {
      const nextAttemptHistory = { ...prev.attemptHistory };
      sessionResults.forEach((r) => {
        nextAttemptHistory[r.challengeId] = r;
      });

      const prevWorld = prev.worldResults[activeWorldId];
      const updatedWorld = {
        completed: true,
        stars: Math.max(prevWorld.stars, summary.starsEarned),
        bestAccuracy: Math.max(prevWorld.bestAccuracy, summary.accuracyPct),
        pointsEarned: Math.max(prevWorld.pointsEarned, summary.pointsEarned),
        completedChallengeIds: Array.from(
          new Set([
            ...prevWorld.completedChallengeIds,
            ...sessionResults.map((r) => r.challengeId),
          ])
        ),
        correctFirstTryCount: summary.firstTryCorrect,
        totalAttempts: summary.totalCorrectResponses + summary.totalWrongAttempts,
        wrongAttempts: summary.totalWrongAttempts,
        weakTopics: summary.weakTopics,
      };

      const nextWorldResults = {
        ...prev.worldResults,
        [activeWorldId]: updatedWorld,
      };

      const totalPoints = WORLD_ORDER.reduce(
        (sum, id) => sum + nextWorldResults[id].pointsEarned,
        0
      );

      const allFiveDone = WORLD_ORDER.every((id) => nextWorldResults[id].completed);
      const nextBadges = new Set([...prev.earnedBadges, ...summary.newlyUnlockedBadges]);
      if (allFiveDone) {
        nextBadges.add('badge_grand_explorer');
        if (!prev.earnedBadges.includes('badge_grand_explorer')) {
          summary.newlyUnlockedBadges.push('badge_grand_explorer');
        }
      }

      return {
        ...prev,
        unlockedWorld: Math.max(prev.unlockedWorld, Math.min(5, activeWorldId + 1)),
        totalPoints,
        worldResults: nextWorldResults,
        attemptHistory: nextAttemptHistory,
        earnedBadges: Array.from(nextBadges),
        adventureCompleted: allFiveDone,
      };
    });

    setCelebrationSummary(summary);
  };

  const handleResetAdventure = () => {
    clearProgress();
    const fresh = createInitialProgress(progress.playerName, progress.difficulty);
    fresh.soundEnabled = progress.soundEnabled;
    setProgress(fresh);
    setSavedProgress(null);
    setConfirmReset(false);
    setShowFinalReport(false);
    setCelebrationSummary(null);
    setScreen('TITLE');
  };

  const activeChallenges = getChallengesForWorld(activeWorldId, progress.difficulty);

  return (
    <div className="min-h-screen w-full">
      {screen === 'TITLE' && (
        <TitleScreen
          savedProgress={savedProgress}
          soundEnabled={progress.soundEnabled}
          onToggleSound={handleToggleSound}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenCurriculum={() => setShowCurriculum(true)}
        />
      )}

      {screen === 'MAP' && (
        <WorldMapScreen
          progress={progress}
          onSelectWorld={handleSelectWorld}
          onChangeDifficulty={handleChangeDifficulty}
          onToggleSound={handleToggleSound}
          onOpenReport={() => setShowFinalReport(true)}
          onOpenCurriculum={() => setShowCurriculum(true)}
          onReturnTitle={() => setScreen('TITLE')}
        />
      )}

      {screen === 'PLAYING' && (
        <ChallengeArena
          key={`${activeWorldId}-${progress.difficulty}-${playRunId}`}
          worldId={activeWorldId}
          difficulty={progress.difficulty}
          challenges={activeChallenges}
          soundEnabled={progress.soundEnabled}
          onToggleSound={handleToggleSound}
          onExitToMap={() => setScreen('MAP')}
          onCompleteWorld={handleCompleteWorld}
        />
      )}

      {celebrationSummary && (
        <WorldCelebrationModal
          summary={celebrationSummary}
          onReturnToMap={() => {
            setCelebrationSummary(null);
            setScreen('MAP');
          }}
          onReplayWorld={() => {
            setCelebrationSummary(null);
            setPlayRunId((n) => n + 1);
            setScreen('PLAYING');
          }}
          onOpenFinalReport={
            progress.adventureCompleted || activeWorldId === 5
              ? () => {
                  setCelebrationSummary(null);
                  setScreen('MAP');
                  setShowFinalReport(true);
                }
              : undefined
          }
        />
      )}

      {showFinalReport && (
        <FinalReportModal
          progress={progress}
          onClose={() => setShowFinalReport(false)}
          onResetAdventure={() => setConfirmReset(true)}
        />
      )}

      {showCurriculum && <CurriculumModal onClose={() => setShowCurriculum(false)} />}

      {confirmReset && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-confirm-title"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-pop-in">
            <h3 id="reset-confirm-title" className="font-display text-xl font-bold text-slate-900">
              ¿Reiniciar toda la aventura?
            </h3>
            <p className="text-sm text-slate-700">
              Se borrarán las estrellas, puntos e insignias guardadas para empezar desde el Mundo 1.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetAdventure}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
