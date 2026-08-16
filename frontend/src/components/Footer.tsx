'use client';

import React from 'react';
import { ExternalLink, Github, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-[2px] border-surface-border bg-surface-300 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & CierraLab Attribution */}
          <div className="md:col-span-2 space-y-4">
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
              <span className="text-[10px] font-bold text-slate-300 bg-surface-100 border border-surface-border px-2 py-0.5 uppercase tracking-wider font-mono">
                CierraLab Tool
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Herramienta oficial desarrollada por <strong>CierraLab</strong> para optimización de currículums y auditorías técnicas de reclutamiento para Chile y Latinoamérica.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://cierralab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="revi-btn h-9 px-3.5 bg-surface-100 hover:bg-surface-50 text-xs font-bold text-slate-200"
              >
                <span>CierraLab.com</span>
                <ExternalLink className="w-3 h-3 ml-1.5 text-brand-cyan" />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="revi-btn h-9 px-3.5 bg-surface-100 hover:bg-surface-50 text-xs font-bold text-slate-200"
              >
                <Github className="w-3.5 h-3.5 mr-1.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Ecosistema */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-mono">
              Ecosistema
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <a href="https://cierralab.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  CierraLab AI Studio
                </a>
              </li>
              <li>
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Google Gemini AI Studio
                </a>
              </li>
              <li>
                <a href="https://langfuse.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Langfuse Observability
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Zero Data Retention */}
          <div className="space-y-3">
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
            <span>Una herramienta de CierraLab</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
            <span>FASTAPI + LANGGRAPH + CHROMADB</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
