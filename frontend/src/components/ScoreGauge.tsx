'use client';

import React from 'react';
import { getScoreDetails } from '@/lib/utils';
import { Award, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  seniorityMatch: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  seniorityMatch,
}) => {
  const scoreInfo = getScoreDetails(score);

  const getScoreColor = () => {
    if (score >= 80) return 'text-brand-cyan';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBadgeStyle = () => {
    if (score >= 80) return 'bg-brand-primary text-white border-surface-border';
    if (score >= 60) return 'bg-amber-400 text-surface-300 border-surface-border';
    return 'bg-rose-500 text-white border-surface-border';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-brand-primary';
    if (score >= 60) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  return (
    <div className="revi-card p-6 sm:p-7 space-y-6 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Score Metric Display */}
        <div className="flex flex-wrap items-baseline gap-6 sm:gap-8">
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Score de Compatibilidad ATS</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl sm:text-7xl font-black font-display tracking-tight leading-none ${getScoreColor()}`}>
                {score}
              </span>
              <span className="text-2xl font-bold font-display text-slate-600">/100</span>
            </div>
          </div>

          <div className="h-16 w-[2px] bg-surface-border hidden sm:block"></div>

          {/* Status Label & Seniority */}
          <div className="space-y-2.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase border-[2px] shadow-revi-sm ${getBadgeStyle()}`}>
                {score >= 80 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : score >= 60 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>{scoreInfo.label}</span>
              </span>

              {seniorityMatch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-200 bg-surface-200 border-[2px] border-surface-border shadow-revi-sm uppercase">
                  <Award className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>{seniorityMatch}</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {scoreInfo.description}
            </p>
          </div>

        </div>

      </div>

      {/* Progress Scale Bar */}
      <div className="space-y-2 pt-2 border-t-[2px] border-surface-border">
        <div className="w-full bg-surface-300 h-3 border-[2px] border-surface-border overflow-hidden flex p-0.5 shadow-revi-sm">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${getProgressColor()}`}
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold font-mono text-slate-400">
          <span>0% RECHAZO</span>
          <span>60% MODERADO</span>
          <span className="text-brand-cyan font-black">80%+ FILTRO SUPERADO</span>
          <span>100% PERFECTO</span>
        </div>
      </div>

    </div>
  );
};
