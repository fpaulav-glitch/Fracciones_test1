import React, { useState } from 'react';
import { BookOpen, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { GAME_ASSETS } from '../constants/assets';
import { Difficulty, PlayerProgress } from '../types/game';
import { getCompletedWorldsCount, getTotalStars } from '../utils/gameLogic';

interface TitleScreenProps {
  savedProgress: PlayerProgress | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartNewGame: (playerName: string, difficulty: Difficulty) => void;
  onContinueGame: () => void;
  onOpenCurriculum: () => void;
}

const DIFFICULTY_OPTIONS: Array<{
  id: Difficulty;
  label: string;
  desc: string;
}> = [
  { id: 'inicial', label: 'Inicial', desc: 'Medios, tercios y cuartos con más apoyo visual' },
  { id: 'intermedio', label: 'Intermedio', desc: 'Hasta octavos y comparaciones variadas' },
  { id: 'avanzado', label: 'Avanzado', desc: 'Equivalencias, doceavos y retos sin guía extra' },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedProgress,
  soundEnabled,
  onToggleSound,
  onStartNewGame,
  onContinueGame,
  onOpenCurriculum,
}) => {
  const [alias, setAlias] = useState(savedProgress?.playerName || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(savedProgress?.difficulty || 'inicial');

  const hasSavedAdventure =
    savedProgress !== null &&
    (getCompletedWorldsCount(savedProgress) > 0 ||
      Object.keys(savedProgress.attemptHistory).length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = alias.trim() || 'Explorador';
    if (hasSavedAdventure) {
      onContinueGame();
    } else {
      onStartNewGame(cleanName, difficulty);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between bg-slate-900">
      {/* Full-bleed atmospheric world backdrop */}
      <img
        src={GAME_ASSETS.titleBackdrop}
        alt="Paisaje mágico de Fracción Aventura con bosque, bahía, montañas y castillo"
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      {/* Measured contrast scrim */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/25"
        aria-hidden="true"
      />

      {/* Minimal Top Floating Controls */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6">
        <button
          type="button"
          onClick={onOpenCurriculum}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/95 hover:bg-white text-slate-900 text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Guía didáctica (LOMLOE)</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/95 hover:bg-white text-slate-900 text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Sonido activado</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span>Sonido silenciado</span>
            </>
          )}
        </button>
      </div>

      {/* Main Title & Start Panel */}
      <main className="relative z-10 flex-1 flex items-center px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Hero Lockup & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bespoke SVG Title Lockup */}
            <div className="space-y-3">
              <svg
                viewBox="0 0 540 124"
                className="w-full max-w-lg h-auto drop-shadow-md"
                role="img"
                aria-label="Fracción Aventura"
              >
                <defs>
                  <linearGradient id="titleGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="55%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                {/* Decorative fraction emblem */}
                <g transform="translate(8, 18)">
                  <rect x="0" y="0" width="76" height="86" rx="18" fill="#065f46" stroke="#fde68a" strokeWidth="4" />
                  <text x="38" y="37" textAnchor="middle" fill="#fef3c7" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="28">
                    3
                  </text>
                  <rect x="18" y="43" width="40" height="4" rx="2" fill="#fbbf24" />
                  <text x="38" y="73" textAnchor="middle" fill="#ffffff" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="28">
                    4
                  </text>
                </g>
                <text
                  x="104"
                  y="56"
                  fill="#ffffff"
                  fontFamily="Fredoka, sans-serif"
                  fontWeight="700"
                  fontSize="48"
                  letterSpacing="-0.5"
                >
                  Fracción
                </text>
                <text
                  x="104"
                  y="108"
                  fill="url(#titleGold)"
                  fontFamily="Fredoka, sans-serif"
                  fontWeight="700"
                  fontSize="52"
                  letterSpacing="-0.5"
                >
                  Aventura
                </text>
              </svg>

              <p className="text-slate-100 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
                Recupera los cinco fragmentos del mapa mágico junto a Pluma resolviendo desafíos visuales de fracciones, equivalencias y problemas cotidianos.
              </p>
            </div>

            {/* Interactive Setup Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 max-w-xl space-y-4"
            >
              {hasSavedAdventure && savedProgress ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      Partida guardada: {savedProgress.playerName}
                    </p>
                    <p className="text-xs text-emerald-800 font-mono-num">
                      {getCompletedWorldsCount(savedProgress)}/5 mundos · {getTotalStars(savedProgress)}/15 estrellas · {savedProgress.totalPoints} puntos
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartNewGame(alias.trim() || 'Explorador', difficulty)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nueva partida</span>
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="explorer-alias" className="block text-sm font-bold text-slate-800 mb-1.5">
                    Nombre o apodo de explorador (opcional)
                  </label>
                  <input
                    id="explorer-alias"
                    type="text"
                    maxLength={20}
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej.: Leo, Estrella, MateExplorer..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    No pedimos datos personales; tu progreso se guarda solo en este dispositivo.
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">Nivel de dificultad</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const active = difficulty === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDifficulty(opt.id)}
                        aria-pressed={active}
                        className={`text-left p-3 rounded-xl border transition-colors min-h-[44px] ${
                          active
                            ? 'bg-amber-50 border-amber-500 text-amber-950'
                            : 'bg-stone-50 border-slate-200 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-[11px] leading-tight text-slate-600 mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 min-h-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xl font-bold shadow-md transition-transform active:scale-[0.99]"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>{hasSavedAdventure ? 'Continuar aventura' : 'Comenzar aventura'}</span>
              </button>
            </form>
          </div>

          {/* Right Protagonist & Guide Companion Showcase */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center gap-4">
            <div className="relative bg-white/90 rounded-3xl p-4 shadow-xl border border-white/70 w-72 animate-float-slow">
              <div className="aspect-square rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
                <img
                  src={GAME_ASSETS.heroExplorer}
                  alt="Personaje explorador protagonista"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-50 shrink-0">
                  <img
                    src={GAME_ASSETS.guideOwl}
                    alt="Pluma, búho guía"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">¡Hola, explorador!</p>
                  <p className="text-xs text-slate-600 leading-snug">
                    Soy Pluma. Te ayudaré con pistas en cada uno de los cinco mundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Single flat control-hint line */}
      <footer className="relative z-10 px-4 py-3 text-center">
        <p className="text-xs sm:text-sm text-slate-200 font-medium">
          Toca, arrastra o navega con teclado (Tab · Enter · Espacio) · A tu ritmo, sin límite de tiempo
        </p>
      </footer>
    </div>
  );
};
