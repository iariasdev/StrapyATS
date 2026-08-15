'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { AnalyzerForm } from '@/components/AnalyzerForm';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { TechProof } from '@/components/TechProof';
import { BYOKModal } from '@/components/BYOKModal';
import { HistoryModal } from '@/components/HistoryModal';
import { ChromeExtensionModal } from '@/components/ChromeExtensionModal';
import { Footer } from '@/components/Footer';
import { 
  AnalyzeResponse, 
  SavedAnalysis, 
  PipelineStage 
} from '@/lib/types';
import { 
  analyzeCV, 
  getMockDemoAnalysis 
} from '@/lib/api';
import { 
  getSavedApiKey, 
  getSavedAnalyses, 
  saveAnalysisResult, 
  clearSavedAnalyses 
} from '@/lib/utils';
import { 
  AlertTriangle, 
  X, 
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);

  // Load API key and saved history on mount
  useEffect(() => {
    setApiKey(getSavedApiKey());
    setSavedAnalyses(getSavedAnalyses());
  }, []);

  const handleAnalyze = async ({
    cvFile,
    cvText,
    jobOfferText,
  }: {
    cvFile?: File | null;
    cvText?: string;
    jobOfferText: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setPipelineStage('uploading');

    const stageTimer1 = setTimeout(() => setPipelineStage('extracting_pdf'), 600);
    const stageTimer2 = setTimeout(() => setPipelineStage('vectorizing_chroma'), 1500);
    const stageTimer3 = setTimeout(() => setPipelineStage('ats_gap_audit'), 2800);
    const stageTimer4 = setTimeout(() => setPipelineStage('langgraph_rewrite'), 4200);
    const stageTimer5 = setTimeout(() => setPipelineStage('generating_outputs'), 5800);

    try {
      const response = await analyzeCV({
        cvFile,
        cvText,
        jobOfferText,
        byokApiKey: apiKey,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      clearTimeout(stageTimer5);

      setPipelineStage('completed');
      setAnalysisResult(response);

      // Save to local storage history
      saveAnalysisResult(response, jobOfferText.split('\n')[0]);
      setSavedAnalyses(getSavedAnalyses());

      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      clearTimeout(stageTimer5);

      setPipelineStage('error');
      setErrorMessage(
        err?.message || 'Ocurrió un error al procesar la solicitud en el backend.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    const demoData = getMockDemoAnalysis();
    setAnalysisResult(demoData);
    setErrorMessage(null);
    saveAnalysisResult(demoData, 'Senior AI & Multi-Agent Systems Engineer (Demo)');
    setSavedAnalyses(getSavedAnalyses());
    setTimeout(() => {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }, 100);
  };

  const handleSelectHistoryItem = (item: SavedAnalysis) => {
    setAnalysisResult(item.result);
    setErrorMessage(null);
    setTimeout(() => {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }, 100);
  };

  const handleClearHistory = () => {
    clearSavedAnalyses();
    setSavedAnalyses([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenByok={() => setIsByokOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
        apiKey={apiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        
        {/* Hero Section */}
        <Hero 
          onLoadDemo={handleLoadDemo} 
          onScrollToForm={() => {
            const formEl = document.getElementById('analyzer-section');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto p-4 rounded-md bg-accent-crimson/10 border border-accent-crimson/30 text-xs text-rose-200 flex items-start justify-between gap-3 font-mono">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-accent-crimson shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase">Error de Análisis</h5>
                <p className="text-slate-300 leading-relaxed">{errorMessage}</p>
                <div className="pt-1">
                  <button
                    onClick={handleLoadDemo}
                    className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
                  >
                    <span>Cargar datos en modo Demo para probar el sistema</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form or Results View */}
        {analysisResult ? (
          <ResultsDashboard
            result={analysisResult}
            onReset={() => setAnalysisResult(null)}
          />
        ) : (
          <AnalyzerForm
            onAnalyze={handleAnalyze}
            onLoadDemo={handleLoadDemo}
            isLoading={isLoading}
            pipelineStage={pipelineStage}
            currentApiKey={apiKey}
            onOpenByok={() => setIsByokOpen(true)}
          />
        )}

        {/* Technical Architecture & Specs Section */}
        <TechProof />

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <BYOKModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        currentApiKey={apiKey}
        onApiKeyChange={(newKey) => setApiKey(newKey)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedAnalyses={savedAnalyses}
        onSelectAnalysis={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <ChromeExtensionModal
        isOpen={isExtensionGuideOpen}
        onClose={() => setIsExtensionGuideOpen(false)}
      />

    </div>
  );
}

