import React from 'react';
import { HelpCircle, Volume2 } from 'lucide-react';
import { GAME_ASSETS } from '../constants/assets';

interface GuideCompanionProps {
  message: string;
  hint?: string;
  showHint?: boolean;
  onToggleHint?: () => void;
  onRepeatInstruction?: () => void;
}

export const GuideCompanion: React.FC<GuideCompanionProps> = ({
  message,
  hint,
  showHint = false,
  onToggleHint,
  onRepeatInstruction,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/95 border border-slate-200 rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-amber-200 bg-amber-50 shrink-0">
          <img
            src={GAME_ASSETS.guideOwl}
            alt="Pluma, tu búho guía"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="sm:hidden">
          <p className="text-xs font-bold text-amber-800">Pluma, tu guía</p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="hidden sm:block text-xs font-bold text-amber-800 mb-0.5">Pluma, tu guía</p>
        <p className="text-sm sm:text-base text-slate-800 font-medium leading-snug">{message}</p>
        {showHint && hint && (
          <p className="mt-2 text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 animate-pop-in">
            <strong>Pista:</strong> {hint}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onRepeatInstruction && (
          <button
            type="button"
            onClick={onRepeatInstruction}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            title="Repetir instrucciones en voz alta o resaltar"
          >
            <Volume2 className="w-4 h-4 text-slate-600" />
            <span>Repetir</span>
          </button>
        )}
        {hint && onToggleHint && (
          <button
            type="button"
            onClick={onToggleHint}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              showHint
                ? 'bg-amber-500 text-white'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showHint ? 'Ocultar pista' : 'Pedir pista'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
