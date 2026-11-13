import React from 'react';
import { Award, Map, RotateCcw, Sparkles, Star } from 'lucide-react';
import { GAME_ASSETS } from '../constants/assets';
import { BADGES, WORLDS } from '../data/worlds';
import { WorldSessionSummary } from '../utils/gameLogic';
import { BadgeIcon } from './BadgeIcon';

interface WorldCelebrationModalProps {
  summary: WorldSessionSummary;
  onReturnToMap: () => void;
  onReplayWorld: () => void;
  onOpenFinalReport?: () => void;
}

export const WorldCelebrationModal: React.FC<WorldCelebrationModalProps> = ({
  summary,
  onReturnToMap,
  onReplayWorld,
  onOpenFinalReport,
}) => {
  const world = WORLDS[summary.worldId];
  const unlockedBadges = BADGES.filter((b) => summary.newlyUnlockedBadges.includes(b.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="world-celebration-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-amber-300 shadow-2xl overflow-hidden animate-pop-in my-auto">
        {/* Header Celebration Banner */}
        <div className={`${world.theme.accentBg} text-white px-6 py-6 text-center space-y-3`}>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-100">
            <Sparkles className="w-4 h-4" />
            <span>{world.fragmentName} recuperado</span>
          </div>
          <h2 id="world-celebration-title" className="font-display text-2xl sm:text-3xl font-bold">
            ¡Has completado {world.name}!
          </h2>

          {/* Stars row */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-10 h-10 transition-transform ${
                  s <= summary.starsEarned
                    ? 'text-amber-300 fill-amber-300 scale-110'
                    : 'text-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Pluma speech */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
            <img
              src={GAME_ASSETS.guideOwl}
              alt="Pluma"
              className="w-12 h-12 rounded-xl object-cover border border-amber-300 shrink-0"
              referrerPolicy="no-referrer"
            />
            <p className="text-sm text-slate-800 font-medium leading-snug">{world.outroSpeech}</p>
          </div>

          {/* Formative Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-slate-200 rounded-2xl p-3 text-center">
              <p className="text-xs text-slate-500">Completados</p>
              <p className="font-mono-num text-xl font-bold text-slate-900">
                {summary.completedCount}/{summary.totalChallenges}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <p className="text-xs text-emerald-800">Aciertos / Errores</p>
              <p className="font-mono-num text-xl font-bold text-emerald-800">
                {summary.totalCorrectResponses} / {summary.totalWrongAttempts}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <p className="text-xs text-amber-900">% Acierto</p>
              <p className="font-mono-num text-xl font-bold text-amber-800">
                {summary.accuracyPct}%
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
              <p className="text-xs text-indigo-900">Puntos</p>
              <p className="font-mono-num text-xl font-bold text-indigo-800">
                +{summary.pointsEarned}
              </p>
            </div>
          </div>

          {/* Newly Unlocked Badges */}
          {unlockedBadges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Insignias desbloqueadas</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unlockedBadges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-3"
                  >
                    <BadgeIcon iconType={b.iconType} accentColor={b.accentColor} unlocked size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{b.name}</p>
                      <p className="text-[11px] text-slate-600">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formative Review Suggestions */}
          <div className="bg-stone-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-800 mb-1">
              Evaluación formativa · Contenidos a reforzar
            </p>
            {summary.weakTopics.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                {summary.weakTopics.map((topic) => (
                  <li key={topic}>
                    Conviene practicar un poco más: <strong>{topic}</strong>.
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-800 font-medium">
                ¡Sin errores en este mundo! Has comprendido todos los contenidos trabajados.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onReplayWorld}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-2xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repetir mundo</span>
            </button>

            <button
              type="button"
              onClick={onReturnToMap}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-base transition-colors"
            >
              <Map className="w-5 h-5" />
              <span>Volver al mapa</span>
            </button>

            {onOpenFinalReport && (
              <button
                type="button"
                onClick={onOpenFinalReport}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-base transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span>Ver informe final</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
