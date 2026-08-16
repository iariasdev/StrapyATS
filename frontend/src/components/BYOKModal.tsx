'use client';

import React, { useState, useMemo } from 'react';
import { 
  Key, 
  X, 
  Check, 
  Trash2, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  setSavedApiKey, 
  removeSavedApiKey, 
  getSavedProvider, 
  setSavedProvider, 
  detectProviderFromKey,
  AIProvider 
} from '@/lib/utils';

interface BYOKModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onApiKeyChange: (newKey: string) => void;
}

interface ProviderOption {
  id: AIProvider;
  name: string;
  badge: string;
  badgeColor: string;
  keyPrefix: string;
  getKeyUrl: string;
  getKeyLabel: string;
  description: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: 'auto',
    name: 'Auto-detectar',
    badge: 'Recomendado',
    badgeColor: 'bg-brand-primary/20 text-brand-cyan border-brand-primary/40',
    keyPrefix: 'Pega tu API Key aquí...',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    getKeyLabel: 'Obtener clave gratis en Google AI Studio',
    description: 'Detecta automáticamente tu proveedor según el formato de la clave.'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Gratis / Free Tier',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    keyPrefix: 'AIzaSy...',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    getKeyLabel: 'Obtener clave en Google AI Studio',
    description: 'Capa gratuita generosa y alta velocidad para análisis de currículums.'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'ChatGPT / OpenAI',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    keyPrefix: 'sk-...',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    getKeyLabel: 'Obtener clave en OpenAI Platform',
    description: 'Modelos de alta capacidad analítica y redacción ejecutiva.'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    badge: 'Claude',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    keyPrefix: 'sk-ant-...',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    getKeyLabel: 'Obtener clave en Anthropic Console',
    description: 'Excelente para redacción de cartas de presentación y análisis ATS.'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    badge: 'DeepSeek',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    keyPrefix: 'sk-...',
    getKeyUrl: 'https://platform.deepseek.com/api_keys',
    getKeyLabel: 'Obtener clave en DeepSeek Platform',
    description: 'Alta velocidad y costo ultra eficiente para análisis profundos.'
  },
  {
    id: 'groq',
    name: 'Groq',
    badge: 'Groq Cloud',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    keyPrefix: 'gsk_...',
    getKeyUrl: 'https://console.groq.com/keys',
    getKeyLabel: 'Obtener clave en Groq Console',
    description: 'Inferencia ultrarrápida para optimizaciones instantáneas.'
  },
];

export const BYOKModal: React.FC<BYOKModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onApiKeyChange,
}) => {
  const [keyValue, setKeyValue] = useState(currentApiKey);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getSavedProvider());
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Computed detected provider when in 'auto' mode
  const detectedProvider = useMemo(() => {
    if (!keyValue.trim()) return null;
    return detectProviderFromKey(keyValue);
  }, [keyValue]);

  const activeProviderMeta = useMemo(() => {
    const target = selectedProvider === 'auto' && detectedProvider 
      ? detectedProvider 
      : (selectedProvider === 'auto' ? 'gemini' : selectedProvider);
    return PROVIDERS.find(p => p.id === target) || PROVIDERS[0];
  }, [selectedProvider, detectedProvider]);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedApiKey(keyValue);
    setSavedProvider(selectedProvider);
    onApiKeyChange(keyValue.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  const handleClear = () => {
    removeSavedApiKey();
    setSavedProvider('auto');
    setKeyValue('');
    setSelectedProvider('auto');
    onApiKeyChange('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-sans animate-fade-in">
      <div 
        className="revi-card relative w-full max-w-xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto"
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
                Configuración de API Key (BYOK)
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Conecta tu propio proveedor de IA para análisis ilimitados y sin restricciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs">

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Proveedor de IA
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDERS.map((provider) => {
                const isSelected = selectedProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-3 text-left border-[2px] transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-surface-100 border-brand-primary shadow-revi-sm'
                        : 'bg-surface-300/80 border-surface-border hover:border-slate-500 hover:bg-surface-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{provider.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />}
                    </div>
                    <span className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 border ${provider.badgeColor}`}>
                      {provider.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Pega tu API Key
              </label>
              {selectedProvider === 'auto' && detectedProvider && (
                <span className="text-[11px] font-mono text-brand-cyan font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Detectado: {PROVIDERS.find(p => p.id === detectedProvider)?.name}
                </span>
              )}
            </div>
            
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="Pega tu API Key aquí..."
                className="w-full px-3.5 py-2.5 bg-surface-300 border-[2px] border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary font-mono shadow-revi-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Privacy & Security Card */}
          <div className="p-3.5 bg-surface-300 border-[2px] border-surface-border space-y-1.5 shadow-revi-sm">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacidad & Seguridad Garantizada</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium text-[11px]">
              Tu clave se almacena <strong className="text-white">exclusivamente en tu navegador</strong> (LocalStorage) y se envía de forma segura únicamente para procesar tus análisis. Nunca queda registrada en servidores externos.
            </p>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t-[2px] border-surface-border">
          {currentApiKey ? (
            <button
              onClick={handleClear}
              type="button"
              className="revi-btn h-9 px-3.5 text-xs bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Eliminar Clave</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="revi-btn h-9 px-4 text-xs bg-surface-300 hover:bg-surface-200 text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="revi-btn h-9 px-5 text-xs font-bold bg-brand-primary hover:bg-brand-hover text-white shadow-revi cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-white" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <span>Guardar Configuración</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
