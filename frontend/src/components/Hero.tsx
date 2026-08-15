'use client';

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface HeroProps {
  onScrollToForm?: () => void;
  onLoadDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToForm,
  onLoadDemo,
}) => {
  const handleScroll = () => {
    if (onScrollToForm) {
      onScrollToForm();
    } else {
      const formEl = document.getElementById('analyzer-section');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-10 pb-12 text-center space-y-8 font-sans max-w-4xl mx-auto">
      
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
          Compara tu currículum contra los algoritmos de <strong className="text-slate-200 font-semibold">Workday, Greenhouse y Taleo</strong>. Detecta brechas de palabras clave, reformula tus logros en formato <strong className="text-brand-cyan font-semibold">STAR</strong> y descarga un PDF listo para postular.
        </p>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={handleScroll}
          className="revi-btn h-12 px-8 bg-brand-primary hover:bg-brand-hover text-white text-sm font-extrabold shadow-revi"
        >
          <span>Auditar mi CV</span>
          <ArrowRight className="w-4 h-4 ml-2 stroke-[3]" />
        </button>
      </div>

      {/* 3 Minimalist Trust Points */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
          <span>Formato Estándar Workday</span>
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
