'use client';

import React, { useState } from 'react';
import { 
  Key, 
  X, 
  ExternalLink, 
  Check, 
  Trash2, 
  Lock
} from 'lucide-react';
import { setSavedApiKey, removeSavedApiKey } from '@/lib/utils';

interface BYOKModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onApiKeyChange: (newKey: string) => void;
}

export const BYOKModal: React.FC<BYOKModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onApiKeyChange,
}) => {
  const [keyValue, setKeyValue] = useState(currentApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedApiKey(keyValue);
    onApiKeyChange(keyValue.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    removeSavedApiKey();
    setKeyValue('');
    onApiKeyChange('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans">
      <div 
        className="revi-card relative w-full max-w-lg p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-surface-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary border-[2px] border-surface-border text-white shadow-revi-sm">
              <Key className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide font-display">
                Configuración BYOK (API Key)
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Usa tu clave de Google Gemini para auditorías ilimitadas
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

        {/* Modal Body */}
        <div className="space-y-4 text-xs">
          
          <div className="p-4 bg-surface-300 border-[2px] border-surface-border space-y-2 shadow-revi-sm">
            <div className="font-bold text-white text-xs uppercase">
              ¿Por qué usar tu propia clave?
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">
              El servidor gratuito limita las solicitudes por IP. Con tu propia clave de Google AI Studio obtienes <strong className="text-brand-cyan font-bold">análisis ilimitados y gratuitos</strong>.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
              <Lock className="w-3.5 h-3.5 text-brand-cyan" />
              <span>La clave se guarda únicamente en tu navegador local (LocalStorage).</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase">
              Google AI Studio API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-surface-300 border-[2px] border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary font-mono shadow-revi-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">¿No tienes clave?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-cyan hover:underline font-bold"
            >
              <span>Obtener en Google AI Studio (Gratis)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t-[2px] border-surface-border">
          {currentApiKey ? (
            <button
              onClick={handleClear}
              type="button"
              className="revi-btn h-9 px-3.5 text-xs bg-rose-950/60 text-rose-300 border-rose-800"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Eliminar</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="revi-btn h-9 px-4 text-xs bg-surface-300 hover:bg-surface-200 text-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="revi-btn h-9 px-5 text-xs font-bold bg-brand-primary hover:bg-brand-hover text-white shadow-revi"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-white" />
                  <span>¡Guardada!</span>
                </>
              ) : (
                <span>Guardar Clave</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
