import React from 'react';
import { Award, CheckCircle2, Crown, RotateCcw, Star, Target, X } from 'lucide-react';
import { BADGES, WORLD_ORDER, WORLDS } from '../data/worlds';
import { PlayerProgress } from '../types/game';
import { buildGlobalLearningReport } from '../utils/gameLogic';
import { BadgeIcon } from './BadgeIcon';

interface FinalReportModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onResetAdventure: () => void;
}

export const FinalReportModal: React.FC<FinalReportModalProps> = ({
  progress,
  onClose,
  onResetAdventure,
}) => {
  const report = buildGlobalLearningReport(progress);
  const allCompleted = WORLD_ORDER.every((id) => progress.worldResults[id].completed);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-report-title"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-indigo-200 shadow-2xl overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="bg-indigo-700 text-white px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 id="final-report-title" className="font-display text-xl sm:text-2xl font-bold">
                {allCompleted
                  ? `¡Aventura completada, ${progress.playerName}!`
                  : `Informe de aprendizaje de ${progress.playerName}`}
              </h2>
              <p className="text-xs text-indigo-100">
                Resultados reales calculados a partir de tus respuestas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0"
            aria-label="Cerrar informe"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-slate-200 rounded-2xl p-3.5 text-center">
              <p className="text-xs text-slate-500">Desafíos resueltos</p>
              <p className="font-mono-num text-2xl font-bold text-slate-900">
                {report.totalChallengesSolved}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-center">
              <p className="text-xs text-emerald-800">Precisión global</p>
              <p className="font-mono-num text-2xl font-bold text-emerald-700">
                {report.overallAccuracyPct}%
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center">
              <p className="text-xs text-amber-900">Estrellas totales</p>
              <p className="font-mono-num text-2xl font-bold text-amber-700">
                {report.totalStars}/{report.maxStars}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 text-center">
              <p className="text-xs text-indigo-900">Puntuación</p>
              <p className="font-mono-num text-2xl font-bold text-indigo-800">
                {progress.totalPoints}
              </p>
            </div>
          </div>

          {/* World-by-World Visual Mastery Bars */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Progreso visual por mundos
            </h3>
            <div className="space-y-2.5">
              {WORLD_ORDER.map((wId) => {
                const world = WORLDS[wId];
                const wRes = progress.worldResults[wId];
                return (
                  <div
                    key={wId}
                    className="bg-stone-50 border border-slate-200 rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {wRes.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Target className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          {wId}. {world.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono-num">
                        <span className="text-slate-700 font-semibold">
                          {wRes.completed ? `${wRes.bestAccuracy}% acierto` : 'Sin completar'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= wRes.stars ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${wRes.completed ? wRes.bestAccuracy : 0}%`,
                          backgroundColor: world.theme.primaryHex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Formative Recommendation */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-amber-950 text-sm">
              Recomendación personalizada de aprendizaje
            </h3>
            <p className="text-sm text-amber-950 leading-relaxed">{report.recommendation}</p>
            {report.strongestTopics.length > 0 && (
              <p className="text-xs text-amber-900 pt-1">
                <strong>Puntos fuertes:</strong>{' '}
                {report.strongestTopics.map((t) => `${t.topic} (${t.accuracyPct}%)`).join(' · ')}
              </p>
            )}
          </div>

          {/* Badges Summary */}
          <div className="space-y-2.5">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Logros e insignias ({progress.earnedBadges.length}/{BADGES.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BADGES.map((b) => {
                const unlocked = progress.earnedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      unlocked ? 'bg-white border-amber-200' : 'bg-stone-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <BadgeIcon iconType={b.iconType} accentColor={b.accentColor} unlocked={unlocked} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{b.name}</p>
                      <p className="text-[11px] text-slate-600">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetAdventure}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar aventura</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-base"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
};
