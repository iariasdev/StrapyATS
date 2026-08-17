'use client';

import React from 'react';
import { InterviewQuestion } from '@/lib/types';
import { X, HelpCircle, Lightbulb, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/pdf-export';

interface InterviewQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: InterviewQuestion[];
  companyName: string;
  jobTitle: string;
}

export const InterviewQuestionsModal: React.FC<InterviewQuestionsModalProps> = ({
  isOpen,
  onClose,
  questions,
  companyName,
  jobTitle,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (q: InterviewQuestion, index: number) => {
    copyToClipboard(`Pregunta: ${q.question}\nÁrea: ${q.focus_area}\nTip STAR: ${q.suggested_answer_tip}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-200 border-[2px] border-surface-border rounded-lg shadow-revi-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-[2px] border-surface-border bg-surface-100/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Preguntas de Entrevista — <span className="text-brand-cyan">{companyName}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">{jobTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {questions && questions.length > 0 ? (
            questions.map((q, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-md bg-surface-100 border border-surface-border space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded bg-surface-200 border border-surface-border text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        {q.focus_area}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1.5 leading-snug">
                        {q.question}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(q, idx)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-surface-200 transition-colors shrink-0"
                    title="Copiar pregunta"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {q.suggested_answer_tip && (
                  <div className="p-3 bg-surface-200/80 rounded border border-surface-border text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-brand-cyan">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Cómo estructurar tu respuesta (Método STAR):</span>
                    </div>
                    <p className="leading-relaxed text-slate-300 pl-5">
                      {q.suggested_answer_tip}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No hay preguntas de entrevista guardadas para esta postulación.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
