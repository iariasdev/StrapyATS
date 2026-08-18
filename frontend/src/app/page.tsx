'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, Footer, HistoryModal, ChromeExtensionModal } from '@/components';
import { Hero, TechProof } from '@/features/home';
import { AnalyzerForm, ResultsDashboard } from '@/features/analyzer';
import { useAuth } from '@/contexts/AuthContext';
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
  getSavedProvider,
  getSavedModel,
  getSavedAnalyses, 
  saveAnalysisResult, 
  deleteSavedAnalysis,
  clearSavedAnalyses,
  setUserProfile
} from '@/lib/utils';
import { 
  AlertTriangle, 
  X, 
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const { getAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);

  // Wizard state
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [wizardMode, setWizardMode] = useState<'optimize_cv' | 'apply_job'>('apply_job');

  useEffect(() => {
    setSavedAnalyses(getSavedAnalyses());

    // Check if user came from Chrome extension
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isFromExt = params.get('fromExtension') === '1';
      
      if (isFromExt) {
        const storedJob = localStorage.getItem('strapyats_extracted_job');
        if (storedJob) {
          setIsWizardActive(true);
        }
      } else {
        localStorage.removeItem('strapyats_extracted_job');
      }
    }

    const handleJobImport = () => {
      setIsWizardActive(true);
    };

    window.addEventListener('strapyats_job_imported', handleJobImport);
    return () => {
      window.removeEventListener('strapyats_job_imported', handleJobImport);
    };
  }, []);

  const handleAnalyze = async ({
    cvFile,
    cvText,
    jobOfferText,
    jobUrl,
    companyName,
  }: {
    cvFile?: File | null;
    cvText?: string;
    jobOfferText: string;
    jobUrl?: string | null;
    companyName?: string | null;
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
      const token = await getAccessToken();

      const response = await analyzeCV({
        cvFile,
        cvText,
        jobOfferText,
        authToken: token,
        byokProvider: getSavedProvider(),
        preferredModel: getSavedModel(),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      clearTimeout(stageTimer5);

      if (jobUrl) response.job_url = jobUrl;
      if (companyName) response.company_name = companyName;

      // Automatically sync detected candidate details to profile
      if (response.rewritten_cv) {
        const rc = response.rewritten_cv;
        if (rc.candidate_name || rc.candidate_email || rc.candidate_phone || rc.candidate_location || rc.candidate_linkedin) {
          setUserProfile({
            name: rc.candidate_name || undefined,
            email: rc.candidate_email || undefined,
            phone: rc.candidate_phone || undefined,
            location: rc.candidate_location || undefined,
            linkedin: rc.candidate_linkedin || undefined,
          });
        }
      }

      setPipelineStage('completed');
      setAnalysisResult(response);

      // Save to local storage history
      saveAnalysisResult(
        response, 
        jobOfferText.split('\n')[0],
        jobUrl || undefined,
        companyName || undefined
      );
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
    demoData.job_url = 'https://www.linkedin.com/jobs/view/4448318522';
    demoData.company_name = 'BipBop Labs / Revi Technologies';
    
    setUserProfile({
      name: 'Alex R. Dev',
      email: 'alex.dev@example.com',
      phone: '+56 9 1234 5678',
      location: 'Santiago, Chile / Remoto',
      linkedin: 'linkedin.com/in/alexdev',
    });

    setAnalysisResult(demoData);
    setErrorMessage(null);
    saveAnalysisResult(
      demoData, 
      'Senior AI & Multi-Agent Systems Engineer (Demo)',
      demoData.job_url,
      demoData.company_name
    );
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

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteSavedAnalysis(id);
    setSavedAnalyses(updated);
  };

  const handleClearHistory = () => {
    clearSavedAnalyses();
    setSavedAnalyses([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        
        {/* Hero Section */}
        {!isWizardActive && !analysisResult && (
          <Hero 
            onLoadDemo={handleLoadDemo} 
            onSelectMode={(mode) => {
              setWizardMode(mode);
              setIsWizardActive(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onScrollToForm={() => {
              setWizardMode('apply_job');
              setIsWizardActive(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

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
            onReset={() => {
              setAnalysisResult(null);
              setIsWizardActive(false);
            }}
          />
        ) : isWizardActive ? (
          <AnalyzerForm
            initialMode={wizardMode}
            onAnalyze={handleAnalyze}
            onLoadDemo={handleLoadDemo}
            isLoading={isLoading}
            pipelineStage={pipelineStage}
            onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
            onCancel={() => setIsWizardActive(false)}
          />
        ) : null}

        {/* Technical Architecture & Specs Section */}
        {!isWizardActive && !analysisResult && <TechProof />}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedAnalyses={savedAnalyses}
        onSelectAnalysis={handleSelectHistoryItem}
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
