'use client';

import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from '@/lib/api';
import { HealthResponse } from '@/lib/types';
import { 
  Key, 
  History, 
  Chrome, 
  FileText
} from 'lucide-react';

interface NavbarProps {
  onOpenByok: () => void;
  onOpenHistory: () => void;
  onOpenExtensionGuide: () => void;
  apiKey: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenByok,
  onOpenHistory,
  onOpenExtensionGuide,
  apiKey,
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      try {
        const data = await checkBackendHealth();
        if (mounted) {
          setHealth(data);
          setIsOnline(true);
        }
      } catch {
        if (mounted) {
          setIsOnline(false);
        }
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b-[2px] border-surface-border bg-surface-200/95 backdrop-blur-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & CierraLab Tool Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-brand-primary border-[2px] border-surface-border flex items-center justify-center text-white shadow-revi-sm">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-display">
                  Strapy<span className="text-brand-cyan">ATS</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-300 bg-surface-100 border border-surface-border px-2 py-0.5 uppercase tracking-wider">
                  CierraLab Tool
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Revi Celeste Style) */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-sans">
          
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="revi-btn h-10 px-3.5 bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-bold"
          >
            <History className="w-4 h-4 text-slate-400 mr-1.5" />
            <span className="hidden sm:inline">Historial</span>
          </button>

          {/* Chrome Extension Button */}
          <button
            onClick={onOpenExtensionGuide}
            className="revi-btn h-10 px-3.5 bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-bold"
          >
            <Chrome className="w-4 h-4 text-slate-400 mr-1.5" />
            <span className="hidden sm:inline">Extensión</span>
          </button>

          {/* BYOK / API Key Button */}
          <button
            onClick={onOpenByok}
            className={`revi-btn h-10 px-4 text-xs font-bold ${
              apiKey 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50' 
                : 'bg-brand-primary hover:bg-brand-hover text-white'
            }`}
          >
            <Key className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            <span>{apiKey ? 'BYOK Activo' : 'Ingresar API Key'}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
