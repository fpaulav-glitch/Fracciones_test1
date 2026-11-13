import React from 'react';

interface FractionNotationProps {
  numerator: number | string;
  denominator: number | string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  highlightSlot?: 'numerator' | 'denominator' | null;
}

export const FractionNotation: React.FC<FractionNotationProps> = ({
  numerator,
  denominator,
  size = 'md',
  showLabels = false,
  highlightSlot = null,
}) => {
  const numClass =
    size === 'sm'
      ? 'text-lg leading-none px-1.5'
      : size === 'md'
        ? 'text-2xl leading-none px-2'
        : 'text-4xl leading-none px-3';

  const barClass =
    size === 'sm'
      ? 'h-0.5 w-7 my-1'
      : size === 'md'
        ? 'h-0.5 w-10 my-1.5'
        : 'h-1 w-16 my-2';

  return (
    <div className="inline-flex items-center gap-3">
      <div className="inline-flex flex-col items-center justify-center font-mono-num font-bold text-slate-900">
        <span
          className={`${numClass} ${
            highlightSlot === 'numerator' ? 'text-amber-700 bg-amber-100 rounded-md py-1' : ''
          }`}
        >
          {numerator}
        </span>
        <span className={`${barClass} bg-slate-800 rounded-full`} aria-hidden="true" />
        <span
          className={`${numClass} ${
            highlightSlot === 'denominator' ? 'text-amber-700 bg-amber-100 rounded-md py-1' : ''
          }`}
        >
          {denominator}
        </span>
      </div>

      {showLabels && (
        <div className="flex flex-col justify-between text-xs text-slate-600 gap-2 text-left">
          <span>Numerador (partes elegidas)</span>
          <span>Denominador (total de partes iguales)</span>
        </div>
      )}
    </div>
  );
};
