'use client';

import React from 'react';
import { 
  Binary, 
  Sparkles, 
  FileCheck,
  Layers
} from 'lucide-react';

export const TechProof: React.FC = () => {
  return (
    <section id="pipeline-section" className="pt-8 pb-10 space-y-8 font-sans">
      
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 border-[2px] border-surface-border bg-surface-100 text-xs font-bold tracking-widest text-brand-cyan uppercase shadow-revi-sm">
          <Layers className="w-3.5 h-3.5" />
          <span>Pipeline de Análisis ATS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
          El proceso que optimiza tu postulación
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-normal">
          Un flujo determinista en 3 pasos que garantiza que tu CV sea indexado y puntuado al máximo por los algoritmos de contratación.
        </p>
      </div>

      {/* 3 Step Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1 */}
        <div className="revi-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-brand-primary text-white border-[2px] border-surface-border flex items-center justify-center shadow-revi-sm">
              <Binary className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">PASO 01</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">
              Parsing Léxico &amp; Semántico
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Extrae las palabras clave y competencias excluyentes de la oferta, comparándolas contra el contenido real de tu perfil.
            </p>
          </div>

          <div className="pt-3 border-t-[2px] border-surface-border flex items-center gap-2 text-[11px] text-brand-cyan font-bold font-mono">
            <span>[ CHROMADB VECTOR MATCH ]</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="revi-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-brand-primary text-white border-[2px] border-surface-border flex items-center justify-center shadow-revi-sm">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">PASO 02</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">
              Reingeniería STAR con Métricas
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Reformula oraciones pasivas en viñetas de alto impacto con Situación, Tarea, Acción y Resultado medible (%, $, escala).
            </p>
          </div>

          <div className="pt-3 border-t-[2px] border-surface-border flex items-center gap-2 text-[11px] text-brand-cyan font-bold font-mono">
            <span>[ LANGGRAPH AST ENGINE ]</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="revi-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-brand-primary text-white border-[2px] border-surface-border flex items-center justify-center shadow-revi-sm">
              <FileCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">PASO 03</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white font-display">
              Exportación ATS Zero-Error
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Genera una plantilla con jerarquía tipográfica estándar que los motores de Greenhouse, Taleo y Workday leen sin romper caracteres.
            </p>
          </div>

          <div className="pt-3 border-t-[2px] border-surface-border flex items-center gap-2 text-[11px] text-brand-cyan font-bold font-mono">
            <span>[ PDF PRINT READY ]</span>
          </div>
        </div>

      </div>

    </section>
  );
};
