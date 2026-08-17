'use client';

import React, { useState } from 'react';
import { JobApplication, JobApplicationStatus } from '@/lib/types';
import { 
  Building2, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  Trash2, 
  Calendar, 
  ArrowRight,
  MoreVertical,
  Globe,
  Sparkles
} from 'lucide-react';

interface ApplicationCardProps {
  application: JobApplication;
  onUpdateStatus: (id: string, newStatus: JobApplicationStatus) => void;
  onDelete: (id: string) => void;
  onViewCV: (app: JobApplication) => void;
  onViewQuestions: (app: JobApplication) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onUpdateStatus,
  onDelete,
  onViewCV,
  onViewQuestions,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const hasCV = application.cv_versions && application.cv_versions.length > 0 && application.cv_versions[0].cv_json;
  const hasQuestions = application.cv_versions && application.cv_versions.length > 0 && application.cv_versions[0].interview_questions && application.cv_versions[0].interview_questions.length > 0;

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400 bg-surface-200 border-surface-border';
    if (score >= 80) return 'text-emerald-300 bg-emerald-950/50 border-emerald-700/50';
    if (score >= 60) return 'text-amber-300 bg-amber-950/50 border-amber-700/50';
    return 'text-rose-300 bg-rose-950/50 border-rose-700/50';
  };

  const getPortalLabel = (portal?: string) => {
    switch (portal) {
      case 'linkedin': return 'LinkedIn';
      case 'getonboard': return 'Get on Board';
      case 'computrabajo': return 'CompuTrabajo';
      case 'workday': return 'Workday';
      case 'greenhouse': return 'Greenhouse';
      default: return portal || 'Manual';
    }
  };

  const statusOptions: { id: JobApplicationStatus; label: string }[] = [
    { id: 'saved', label: '📌 Guardada' },
    { id: 'applied', label: '🚀 Postulada' },
    { id: 'interview', label: '💼 Entrevista' },
    { id: 'offer', label: '🎉 Oferta' },
    { id: 'rejected', label: '❌ Rechazada' },
  ];

  return (
    <div className="bg-surface-100 border-[2px] border-surface-border hover:border-surface-border/80 rounded-md p-3.5 space-y-3 shadow-revi-sm transition-all hover:shadow-revi relative group font-sans">
      
      {/* Header: Company, Score & Portal */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 max-w-[75%]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-white text-xs tracking-tight flex items-center gap-1 truncate font-display">
              <Building2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
              {application.company_name}
            </span>
            {application.job_portal && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-surface-200 border border-surface-border px-1.5 py-0.2 rounded">
                {getPortalLabel(application.job_portal)}
              </span>
            )}
          </div>
          <h4 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">
            {application.job_title}
          </h4>
        </div>

        {/* ATS Match Score badge */}
        {application.ats_match_score !== undefined && application.ats_match_score > 0 && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 flex items-center gap-1 ${getScoreColor(application.ats_match_score)}`}>
            <Sparkles className="w-2.5 h-2.5" />
            {application.ats_match_score}%
          </span>
        )}
      </div>

      {/* Notes or Date Info */}
      {application.notes && (
        <p className="text-[11px] text-slate-400 bg-surface-200/60 p-2 rounded border border-surface-border/60 line-clamp-2 leading-relaxed italic">
          "{application.notes}"
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-surface-border/40">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          {application.created_at ? new Date(application.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'Reciente'}
        </span>

        {application.job_url && (
          <a
            href={application.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-cyan hover:underline flex items-center gap-0.5"
            title="Ver oferta original"
          >
            <span>Ver oferta</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-surface-border/60">
        <div className="flex items-center gap-1">
          {hasCV && (
            <button
              onClick={() => onViewCV(application)}
              className="px-2 py-1 bg-surface-200 hover:bg-surface-50 text-brand-cyan text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
              title="Ver CV adaptado para esta vacante"
            >
              <FileText className="w-3 h-3" />
              <span>Ver CV</span>
            </button>
          )}

          {hasQuestions && (
            <button
              onClick={() => onViewQuestions(application)}
              className="px-2 py-1 bg-surface-200 hover:bg-surface-50 text-amber-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
              title="Ver preguntas técnicas de entrevista"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Preguntas</span>
            </button>
          )}
        </div>

        {/* Move state menu & Delete */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="px-2 py-1 bg-surface-200 hover:bg-surface-50 text-slate-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
              title="Mover a otra columna"
            >
              <span>Mover</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>

            {showMoveMenu && (
              <div 
                className="absolute right-0 bottom-full mb-1 w-36 bg-surface-200 border border-surface-border rounded-md shadow-revi-lg py-1 z-30 text-[11px]"
                onMouseLeave={() => setShowMoveMenu(false)}
              >
                <div className="px-2 py-1 text-[9px] uppercase font-bold text-slate-400 border-b border-surface-border/60">
                  Mover a:
                </div>
                {statusOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onUpdateStatus(application.id, opt.id);
                      setShowMoveMenu(false);
                    }}
                    disabled={application.status === opt.id}
                    className={`w-full text-left px-2.5 py-1.5 transition-colors flex items-center justify-between ${
                      application.status === opt.id 
                        ? 'text-brand-cyan font-bold bg-surface-100' 
                        : 'text-slate-200 hover:bg-surface-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onDelete(application.id)}
            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
            title="Eliminar postulación"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
