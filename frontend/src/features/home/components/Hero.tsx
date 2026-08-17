'use client';

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';

interface HeroProps {
  onSelectMode?: (mode: 'optimize_cv' | 'apply_job') => void;
  onScrollToForm?: () => void;
  onLoadDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSelectMode,
  onScrollToForm,
  onLoadDemo,
}) => {
  const handleScroll = (mode: 'optimize_cv' | 'apply_job' = 'apply_job') => {
    if (onSelectMode) {
      onSelectMode(mode);
    } else if (onScrollToForm) {
      onScrollToForm();
    } else {
      const formEl = document.getElementById('analyzer-section');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-8 pb-12 text-center space-y-8 font-sans max-w-4xl mx-auto">
      
      {/* Main Clean Headline */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.14] font-display">
          Optimiza tu CV para superar los filtros ATS{' '}
          <span className="text-brand-cyan underline decoration-2 underline-offset-8">
            en segundos.
          </span>
        </h1>

        {/* Crisp Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
          Compara tu currículum contra los algoritmos de <strong className="text-slate-200 font-semibold">Workday, Greenhouse y Taleo</strong>. Elige cómo quieres empezar:
        </p>
      </div>

      {/* 2 Clean, Modern Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto pt-2 text-left">
        
        {/* Card 1: Optimizar CV (Sin oferta) */}
        <button
          type="button"
          onClick={() => handleScroll('optimize_cv')}
          className="group relative p-6 bg-surface-200/90 hover:bg-surface-100 border-2 border-surface-border hover:border-brand-cyan/60 rounded-xl transition-all duration-200 flex flex-col justify-between space-y-6 cursor-pointer text-left shadow-revi hover:shadow-cyan-950/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-brand-cyan px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded">
                OPCIÓN 01
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-medium">
                Sin Oferta Requerida
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors font-display">
                Optimizar mi CV
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Auditoría general de formato ATS, verbos de acción y reformulación de logros con metodología STAR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-brand-cyan group-hover:text-cyan-300 font-mono pt-3 border-t border-surface-border/60">
            <span>Auditar CV</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 2: Adaptar a Oferta Laboral (Con oferta) */}
        <button
          type="button"
          onClick={() => handleScroll('apply_job')}
          className="group relative p-6 bg-brand-primary/10 hover:bg-brand-primary/15 border-2 border-brand-primary/40 hover:border-brand-primary rounded-xl transition-all duration-200 flex flex-col justify-between space-y-6 cursor-pointer text-left shadow-revi hover:shadow-indigo-950/30"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-indigo-300 px-2.5 py-1 bg-brand-primary/20 border border-brand-primary/40 rounded">
                OPCIÓN 02
              </span>
              <span className="text-[11px] font-mono text-indigo-300/80 font-medium">
                Vacante Específica
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors font-display">
                Adaptar a Oferta Laboral
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Compara contra una vacante de LinkedIn o Indeed, calcula tu Match %, detecta brechas y genera carta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 group-hover:text-white font-mono pt-3 border-t border-brand-primary/20">
            <span>Adaptar para Postulación</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      {/* 3 Minimalist Trust Points */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
          <span>Formato Estándar Workday & Greenhouse</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
          <span>Reescritura STAR con Métricas</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-cyan shrink-0" />
          <span>100% Privado (In-Memory)</span>
        </div>
      </div>

    </section>
  );
};



