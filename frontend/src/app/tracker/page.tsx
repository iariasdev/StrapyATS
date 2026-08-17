'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Footer } from '@/components/Footer';
import { HistoryModal } from '@/components/HistoryModal';
import { ChromeExtensionModal } from '@/components/ChromeExtensionModal';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedAnalyses, deleteSavedAnalysis, clearSavedAnalyses } from '@/lib/utils';
import { SavedAnalysis } from '@/lib/types';
import { Kanban, Sparkles, ArrowRight, LogIn, Lock } from 'lucide-react';
import Link from 'next/link';

export default function TrackerPage() {
  const { user, loading, signInWithGoogle, setMockUserForDemo } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  React.useEffect(() => {
    setSavedAnalyses(getSavedAnalyses());
  }, []);

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteSavedAnalysis(id);
    setSavedAnalyses(updated);
  };

  const handleClearHistory = () => {
    clearSavedAnalyses();
    setSavedAnalyses([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : !user ? (
          /* Unauthenticated Landing / Login Prompt */
          <div className="max-w-2xl mx-auto my-12 bg-surface-200 border-[2px] border-surface-border rounded-xl p-8 text-center space-y-6 shadow-revi-lg">
            <div className="w-16 h-16 bg-brand-primary/10 border border-brand-primary/40 rounded-full flex items-center justify-center mx-auto text-brand-cyan shadow-revi-sm">
              <Kanban className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan text-xs font-mono font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Seguimiento Inteligente de Empleo
              </span>
              <h2 className="text-2xl font-extrabold text-white font-display">
                Tu Tablero Kanban de Postulaciones
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Centraliza todas tus postulaciones, accede a cada versión de CV adaptado y prepárate con las preguntas técnicas generadas por los agentes de IA.
              </p>
            </div>

            <div className="p-4 bg-surface-100/90 rounded-lg border border-surface-border text-xs text-slate-300 text-left space-y-2.5 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="text-brand-cyan">✓</span>
                <span>Guarda análisis directamente desde el auditor</span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="text-brand-cyan">✓</span>
                <span>Rastrea etapas: Guardada → Postulada → Entrevista → Oferta</span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="text-brand-cyan">✓</span>
                <span>Genera PDFs vectoriales monocromo ATS listos para enviar</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => signInWithGoogle()}
                className="revi-btn h-12 px-6 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-revi-sm w-full sm:w-auto"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                </svg>
                <span>Iniciar sesión con Google</span>
              </button>

              <Link
                href="/"
                className="revi-btn h-12 px-5 bg-surface-100 hover:bg-surface-50 text-slate-200 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Volver al Auditor</span>
              </Link>
            </div>

          </div>
        ) : (
          /* Kanban Board for Authenticated User */
          <KanbanBoard />
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedAnalyses={savedAnalyses}
        onSelectAnalysis={() => {}}
        onClearHistory={handleClearHistory}
        onDeleteAnalysis={handleDeleteHistoryItem}
      />

      <ChromeExtensionModal
        isOpen={isExtensionGuideOpen}
        onClose={() => setIsExtensionGuideOpen(false)}
      />

    </div>
  );
}
