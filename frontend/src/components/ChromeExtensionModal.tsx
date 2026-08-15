'use client';

import React from 'react';
import { 
  Chrome, 
  X, 
  Copy, 
  Check, 
  Terminal
} from 'lucide-react';
import { copyToClipboard } from '@/lib/pdf-export';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    copyToClipboard('chrome-extension');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans">
      <div 
        className="revi-card relative w-full max-w-lg p-6 sm:p-7 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-surface-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary text-white border-[2px] border-surface-border shadow-revi-sm">
              <Chrome className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide font-display">
                Extensión de Chrome (Manifest v3)
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Captura de ofertas laborales en LinkedIn y Get on Board
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

        {/* Body */}
        <div className="space-y-4 text-xs overflow-y-auto pr-1">
          
          <div className="p-4 bg-surface-300 border-[2px] border-surface-border space-y-3 shadow-revi-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
                <Terminal className="w-4 h-4 text-brand-cyan" />
                <span>Instalación de la Extensión</span>
              </div>
              <a
                href="/strapyats-extension.zip"
                download="strapyats-extension.zip"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan text-slate-900 font-extrabold text-[11px] hover:bg-white transition-colors"
              >
                <span>Descargar .ZIP</span>
              </a>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Descarga el archivo ZIP, descomprímelo en tu computador y cárgalo en Chrome con estos 3 pasos:
            </p>
          </div>

          <div className="space-y-2">
            <ol className="space-y-2.5 text-xs font-medium">
              <li className="flex items-start gap-2.5 p-3.5 bg-surface-300 border-[2px] border-surface-border shadow-revi-sm">
                <span className="font-bold text-white bg-brand-primary w-5 h-5 flex items-center justify-center shrink-0 font-mono text-[11px] border border-surface-border">1</span>
                <span className="text-slate-300">Abre <code className="bg-surface-200 px-2 py-0.5 border border-surface-border font-mono text-brand-cyan font-bold">chrome://extensions</code> en tu navegador.</span>
              </li>
              
              <li className="flex items-start gap-2.5 p-3.5 bg-surface-300 border-[2px] border-surface-border shadow-revi-sm">
                <span className="font-bold text-white bg-brand-primary w-5 h-5 flex items-center justify-center shrink-0 font-mono text-[11px] border border-surface-border">2</span>
                <span className="text-slate-300">Activa el interruptor <strong className="text-white font-bold">"Modo de desarrollador"</strong> (esquina superior derecha).</span>
              </li>

              <li className="flex items-start gap-2.5 p-3.5 bg-surface-300 border-[2px] border-surface-border shadow-revi-sm">
                <span className="font-bold text-white bg-brand-primary w-5 h-5 flex items-center justify-center shrink-0 font-mono text-[11px] border border-surface-border">3</span>
                <div className="space-y-2 flex-1">
                  <span className="text-slate-300">Haz clic en <strong className="text-white font-bold">"Cargar descomprimida"</strong> y selecciona la carpeta:</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-surface-200 border-[2px] border-surface-border text-xs font-mono font-medium text-slate-200">
                    <span>StrapyATS/chrome-extension</span>
                    <button
                      onClick={handleCopyPath}
                      type="button"
                      className="p-1 text-slate-400 hover:text-white hover:bg-surface-100 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-brand-cyan" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t-[2px] border-surface-border">
          <button
            onClick={onClose}
            type="button"
            className="revi-btn h-9 px-5 text-xs font-bold bg-brand-primary hover:bg-brand-hover text-white shadow-revi"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
