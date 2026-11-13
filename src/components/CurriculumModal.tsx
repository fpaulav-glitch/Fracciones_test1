import React from 'react';
import { BookOpen, CheckCircle2, X } from 'lucide-react';
import { CURRICULUM_MAPPINGS, LOMLOE_OVERVIEW } from '../data/curriculum';

interface CurriculumModalProps {
  onClose: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="curriculum-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden animate-pop-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="curriculum-modal-title" className="text-xl font-bold text-slate-900">
                Guía didáctica y currículo (LOMLOE)
              </h2>
              <p className="text-xs text-slate-600">{LOMLOE_OVERVIEW.etapaYCurso}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
            aria-label="Cerrar guía didáctica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          <section className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-emerald-950 text-base">Marco normativo y enfoque</h3>
            <p>
              <strong>Referencia:</strong> {LOMLOE_OVERVIEW.ley}
            </p>
            <p>
              <strong>Área:</strong> {LOMLOE_OVERVIEW.area} · <strong>Nivel:</strong> {LOMLOE_OVERVIEW.etapaYCurso}
            </p>
            <p className="text-xs text-emerald-900">{LOMLOE_OVERVIEW.notaRigor}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Diseño Universal para el Aprendizaje (DUA)
            </h3>
            <ul className="space-y-2">
              {LOMLOE_OVERVIEW.principiosDUA.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Relación de los mundos con el segundo ciclo (RD 157/2022)
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {CURRICULUM_MAPPINGS.map((m) => (
                <div key={m.worldId} className="border border-slate-200 rounded-2xl p-4 bg-stone-50/60 space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-base">{m.worldTitle}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Objetivos de aprendizaje</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {m.learningObjectives.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Competencias específicas vinculadas</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {m.competenciasEspecificas.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Criterios de evaluación</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {m.criteriosEvaluacion.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Saberes básicos</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {m.saberesBasicos.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
