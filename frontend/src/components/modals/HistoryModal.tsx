'use client';

import React from 'react';
import { SavedAnalysis } from '@/lib/types';
import { 
  History, 
  X, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  Award,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAnalyses: SavedAnalysis[];
  onSelectAnalysis: (item: SavedAnalysis) => void;
  onClearHistory: () => void;
  onDeleteAnalysis?: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedAnalyses,
  onSelectAnalysis,
  onClearHistory,
  onDeleteAnalysis,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans">
      <div 
        className="revi-card relative w-full max-w-xl p-6 sm:p-7 max-h-[85vh] flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-surface-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary border-[2px] border-surface-border text-white shadow-revi-sm">
              <History className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide font-display">
                Historial de Auditorías ATS
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Últimos análisis guardados localmente en tu navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-1">
          {savedAnalyses.length === 0 ? (
            <div className="py-12 text-center space-y-3 font-sans">
              <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-xs text-white uppercase font-bold">
                Sin registros en el historial
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto font-normal">
                Sube tu CV para generar tu primera evaluación ATS.
              </p>
            </div>
          ) : (
            savedAnalyses.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectAnalysis(item);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-3.5 bg-surface-300 hover:bg-surface-100 border-[2px] border-surface-border hover:border-slate-500 cursor-pointer shadow-revi-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface-200 border-[2px] border-surface-border shadow-revi-sm font-display font-black">
                      <span className={`text-sm ${item.matchScore >= 80 ? 'text-brand-cyan' : item.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.matchScore}%
                      </span>
                      <span className="text-[9px] uppercase tracking-tighter text-slate-500">Score</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white font-mono line-clamp-1">
                        {item.roleTitle}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-brand-cyan" />
                          {item.seniorityMatch || 'Nivel evaluado'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                      </div>

                      {item.jobUrl && (
                        <div className="mt-1.5">
                          <a
                            href={item.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-cyan hover:text-cyan-300 hover:underline bg-surface-200 border border-surface-border px-2 py-0.5 shadow-revi-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{item.companyName ? `Oferta en ${item.companyName}` : 'Abrir Oferta Original'}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {onDeleteAnalysis && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnalysis(item.id);
                        }}
                        title="Eliminar este análisis"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {savedAnalyses.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t-[2px] border-surface-border text-xs font-bold text-slate-400">
            <span>
              {savedAnalyses.length} {savedAnalyses.length === 1 ? 'análisis guardado' : 'análisis guardados'}
            </span>
            <button
              onClick={onClearHistory}
              type="button"
              className="revi-btn h-8 px-3 text-xs bg-rose-950/60 text-rose-300 border-rose-800"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Limpiar Historial</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
