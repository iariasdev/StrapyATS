'use client';

import React from 'react';
import { ExternalLink, Github, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-[2px] border-surface-border bg-surface-300 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & CierraLab Attribution */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 ring-1 ring-white/30 dark:ring-white/20 shrink-0 shadow-revi-sm flex items-center justify-center p-0.5">
                <img 
                  src="/logo1whitenobackground.png" 
                  alt="CierraLab Logo" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <span className="font-extrabold text-lg text-white font-display">
                Strapy<span className="text-brand-cyan">ATS</span>
              </span>
              <a
                href="https://www.cierralab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-slate-300 bg-surface-100 border border-surface-border hover:border-brand-cyan/60 hover:text-white hover:bg-surface-50 px-2 py-0.5 uppercase tracking-wider font-mono transition-all cursor-pointer"
                title="Visitar CierraLab (www.cierralab.com)"
              >
                CierraLab Tool
              </a>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-md font-medium">
              Herramienta oficial desarrollada por <strong>CierraLab</strong> para optimización de currículums y auditorías técnicas de reclutamiento para Chile y Latinoamérica.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.cierralab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="revi-btn h-9 px-3.5 bg-surface-100 hover:bg-surface-50 text-xs font-bold text-slate-200 inline-flex items-center"
              >
                <span>CierraLab.com</span>
                <ExternalLink className="w-3 h-3 ml-1.5 text-brand-cyan" />
              </a>

              <a
                href="https://github.com/iariasdev"
                target="_blank"
                rel="noopener noreferrer"
                className="revi-btn h-9 px-3.5 bg-surface-100 hover:bg-surface-50 text-xs font-bold text-slate-200 inline-flex items-center"
              >
                <Github className="w-3.5 h-3.5 mr-1.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Legal / Zero Data Retention */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-mono">
              Privacidad &amp; Seguridad
            </h4>
            <div className="revi-card p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                <span>Zero Data Retention</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Tu currículum se procesa en memoria volátil y se destruye inmediatamente al finalizar la sesión.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t-[2px] border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>© {currentYear} StrapyATS</span>
            <span>•</span>
            <a 
              href="https://www.cierralab.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Una herramienta de CierraLab
            </a>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Todos los derechos reservados</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
