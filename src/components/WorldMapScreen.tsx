import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  Home,
  Lock,
  Play,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { GAME_ASSETS } from '../constants/assets';
import { BADGES, WORLD_ORDER, WORLDS } from '../data/worlds';
import { Difficulty, PlayerProgress, WorldId } from '../types/game';
import { getCompletedWorldsCount, getTotalStars } from '../utils/gameLogic';
import { BadgeIcon } from './BadgeIcon';

interface WorldMapScreenProps {
  progress: PlayerProgress;
  onSelectWorld: (worldId: WorldId) => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onToggleSound: () => void;
  onOpenReport: () => void;
  onOpenCurriculum: () => void;
  onReturnTitle: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  progress,
  onSelectWorld,
  onChangeDifficulty,
  onToggleSound,
  onOpenReport,
  onOpenCurriculum,
  onReturnTitle,
}) => {
  const [focusedWorldId, setFocusedWorldId] = useState<WorldId>(
    Math.min(progress.unlockedWorld, 5) as WorldId
  );
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const totalStars = getTotalStars(progress);
  const fragmentsFound = getCompletedWorldsCount(progress);
  const selectedWorld = WORLDS[focusedWorldId];
  const selectedWorldProgress = progress.worldResults[focusedWorldId];
  const isSelectedUnlocked = focusedWorldId <= progress.unlockedWorld;

  return (
    <div className="min-h-screen w-full bg-amber-50/70 flex flex-col">
      {/* Clean Compact Game HUD */}
      <header className="bg-white border-b border-amber-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnTitle}
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 flex items-center justify-center transition-colors"
            title="Volver a la pantalla inicial"
            aria-label="Volver a la pantalla inicial"
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-300 bg-amber-50 shrink-0">
            <img
              src={GAME_ASSETS.heroExplorer}
              alt={progress.playerName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 leading-tight">
              {progress.playerName}
            </p>
            <p className="text-xs text-slate-600 font-mono-num">
              {fragmentsFound}/5 fragmentos · {totalStars}/15 estrellas · {progress.totalPoints} pts
            </p>
          </div>
        </div>

        {/* Difficulty Switcher + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center bg-stone-100 p-1 rounded-xl"
            role="group"
            aria-label="Selector de dificultad"
          >
            {(['inicial', 'intermedio', 'avanzado'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChangeDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  progress.difficulty === d
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowBadgesModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-colors whitespace-nowrap"
          >
            <Award className="w-4 h-4" />
            <span>Insignias ({progress.earnedBadges.length})</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Mi progreso</span>
          </button>

          <button
            type="button"
            onClick={onOpenCurriculum}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">LOMLOE</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 flex items-center justify-center transition-colors"
            aria-label={progress.soundEnabled ? 'Silenciar audio' : 'Activar audio'}
          >
            {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Interactive Map Stage + Briefing Deck */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Map Canvas (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border-4 border-amber-200 shadow-lg bg-amber-100">
            <img
              src={GAME_ASSETS.worldMapClean}
              alt="Mapa mágico de los cinco mundos de Fracción Aventura"
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />

            {/* Dotted Adventure Path SVG */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <path
                d="M 20 63 Q 36 78 52 74 Q 44 54 43 38 Q 55 24 67 24 Q 78 28 88 39"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                strokeLinecap="round"
              />
            </svg>

            {/* Interactive World Pins */}
            {WORLD_ORDER.map((wId) => {
              const world = WORLDS[wId];
              const wProg = progress.worldResults[wId];
              const unlocked = wId <= progress.unlockedWorld;
              const isSelected = focusedWorldId === wId;

              return (
                <button
                  key={wId}
                  type="button"
                  onClick={() => setFocusedWorldId(wId)}
                  style={{
                    left: `${world.pinPosition.x}%`,
                    top: `${world.pinPosition.y}%`,
                  }}
                  aria-label={`Mundo ${wId}: ${world.name}${unlocked ? '' : ' (bloqueado)'}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center focus:outline-none`}
                >
                  <span
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-3 shadow-md transition-transform ${
                      isSelected ? 'scale-110 ring-4 ring-amber-300' : 'hover:scale-105'
                    } ${
                      !unlocked
                        ? 'bg-slate-700/90 border-slate-400 text-slate-200'
                        : wProg.completed
                          ? 'bg-emerald-600 border-white text-white'
                          : 'bg-amber-500 border-white text-white'
                    }`}
                  >
                    {!unlocked ? (
                      <Lock className="w-5 h-5" />
                    ) : wProg.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="font-display text-xl font-bold">{wId}</span>
                    )}
                  </span>

                  <span className="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-900/85 text-white text-[11px] sm:text-xs font-bold whitespace-nowrap shadow">
                    {wId}. {world.shortName}
                  </span>

                  {unlocked && (
                    <span className="flex items-center gap-0.5 mt-0.5 bg-white/95 px-1.5 py-0.5 rounded-md shadow-sm">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= wProg.stars
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick World Strip for tablet/keyboard direct access */}
          <div className="grid grid-cols-5 gap-2">
            {WORLD_ORDER.map((wId) => {
              const world = WORLDS[wId];
              const unlocked = wId <= progress.unlockedWorld;
              const completed = progress.worldResults[wId].completed;
              const active = focusedWorldId === wId;
              return (
                <button
                  key={wId}
                  type="button"
                  onClick={() => setFocusedWorldId(wId)}
                  className={`p-2.5 rounded-2xl border text-left transition-colors min-h-[48px] ${
                    active
                      ? 'bg-white border-amber-500 shadow-sm'
                      : unlocked
                        ? 'bg-white/75 border-amber-200 hover:bg-white'
                        : 'bg-stone-100 border-stone-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">Mundo {wId}</span>
                    {completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : !unlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">{world.shortName}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Selected World Briefing Card (4 cols) */}
        <aside className="lg:col-span-4 bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-800">
                Mundo {selectedWorld.id} de 5 · {selectedWorld.fragmentName}
              </span>
              {selectedWorldProgress.completed && (
                <span className="text-xs font-bold text-emerald-700">Completado</span>
              )}
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">
                {selectedWorld.name}
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">{selectedWorld.subtitle}</p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{selectedWorld.description}</p>

            {/* Pluma Greeting */}
            <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5">
              <img
                src={GAME_ASSETS.guideOwl}
                alt="Pluma"
                className="w-11 h-11 rounded-xl object-cover border border-amber-300 shrink-0"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-slate-800 leading-relaxed">
                {isSelectedUnlocked
                  ? selectedWorld.introSpeech
                  : `Completa primero el Mundo ${selectedWorld.id - 1} para desbloquear este territorio del mapa.`}
              </p>
            </div>

            {/* Previous Record if played */}
            {selectedWorldProgress.completed && (
              <div className="grid grid-cols-3 gap-2 text-center bg-stone-50 border border-slate-200 rounded-2xl p-3">
                <div>
                  <p className="text-[11px] text-slate-500">Estrellas</p>
                  <p className="font-mono-num text-base font-bold text-amber-600">
                    {selectedWorldProgress.stars}/3
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Acierto</p>
                  <p className="font-mono-num text-base font-bold text-emerald-700">
                    {selectedWorldProgress.bestAccuracy}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Puntos</p>
                  <p className="font-mono-num text-base font-bold text-slate-900">
                    {selectedWorldProgress.pointsEarned}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {isSelectedUnlocked ? (
              <button
                type="button"
                onClick={() => onSelectWorld(focusedWorldId)}
                className={`w-full flex items-center justify-center gap-2 px-5 py-4 min-h-[54px] rounded-2xl text-white font-display text-lg font-bold shadow-sm transition-colors ${selectedWorld.theme.accentBg} ${selectedWorld.theme.accentHover}`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {selectedWorldProgress.completed
                    ? 'Volver a jugar mundo'
                    : `Explorar Mundo ${selectedWorld.id}`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 px-5 py-4 min-h-[54px] rounded-2xl bg-slate-200 text-slate-500 font-display text-lg font-bold cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                <span>Mundo bloqueado</span>
              </button>
            )}

            <p className="text-xs text-center text-slate-500">
              5 desafíos en dificultad <strong className="capitalize">{progress.difficulty}</strong>
            </p>
          </div>
        </aside>
      </main>

      {/* Badges Modal */}
      {showBadgesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="badges-modal-title"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-xl overflow-hidden animate-pop-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-amber-700" />
                <h2 id="badges-modal-title" className="font-display text-xl font-bold text-slate-900">
                  Vitrina de insignias ({progress.earnedBadges.length}/{BADGES.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBadgesModal(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Cerrar vitrina de insignias"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES.map((badge) => {
                const unlocked = progress.earnedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
                      unlocked
                        ? 'bg-white border-amber-200'
                        : 'bg-stone-50 border-slate-200 opacity-65'
                    }`}
                  >
                    <BadgeIcon
                      iconType={badge.iconType}
                      accentColor={badge.accentColor}
                      unlocked={unlocked}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{badge.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{badge.description}</p>
                      <p className="text-[11px] font-semibold mt-1 text-slate-500">
                        {unlocked ? 'Conseguida' : 'Por desbloquear'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
