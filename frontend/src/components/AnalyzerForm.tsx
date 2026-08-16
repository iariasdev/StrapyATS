'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Play,
  Key,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileCheck,
  FileSearch,
  Briefcase,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  Download,
  MousePointerClick,
  ExternalLink,
  Globe,
  Sparkles,
  Link2,
  RotateCcw,
  Check
} from 'lucide-react';
import { PipelineStage } from '@/lib/types';
import { getSavedCV, setSavedCV, removeSavedCV, getExtractedJob, clearExtractedJob } from '@/lib/utils';
import { extractPdfText, extractJobFromUrl } from '@/lib/api';

interface AnalyzerFormProps {
  onAnalyze: (payload: { 
    cvFile?: File | null; 
    cvText?: string; 
    jobOfferText: string;
    jobUrl?: string | null;
    companyName?: string | null;
  }) => Promise<void>;
  onLoadDemo: () => void;
  isLoading: boolean;
  pipelineStage: PipelineStage;
  currentApiKey: string;
  onOpenByok: () => void;
  onOpenExtensionGuide?: () => void;
  onCancel?: () => void;
}

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({
  onAnalyze,
  onLoadDemo,
  isLoading,
  pipelineStage,
  currentApiKey,
  onOpenByok,
  onOpenExtensionGuide,
  onCancel,
}) => {
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [cvMode, setCvMode] = useState<'upload' | 'paste'>('paste');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [hasSavedCv, setHasSavedCv] = useState(false);

  const [jobOfferText, setJobOfferText] = useState('');
  const [jobSourceNotice, setJobSourceNotice] = useState<string | null>(null);
  const [jobUrl, setJobUrl] = useState<string | null>(null);
  const [jobCompany, setJobCompany] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [showManualJobInput, setShowManualJobInput] = useState(false);
  const [jobUrlInput, setJobUrlInput] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [urlScrapeError, setUrlScrapeError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSubmitRef = useRef<boolean>(false);

  const canProceedRef = useRef<boolean>(false);
  useEffect(() => {
    canProceedRef.current = cvMode === 'upload' ? cvFile !== null : cvText.trim().length > 50;
  }, [cvMode, cvFile, cvText]);

  useEffect(() => {
    const saved = getSavedCV();
    let hasCV = false;
    if (saved && saved.text) {
      setCvText(saved.text);
      setCvMode('paste');
      setHasSavedCv(true);
      hasCV = true;
    } else {
      setCvMode('upload');
    }

    const imported = getExtractedJob();
    if (imported && imported.fullText) {
      setJobOfferText(imported.fullText);
      setJobSourceNotice(`Oferta importada de ${imported.company || imported.title || 'LinkedIn'}`);
      if (imported.url) setJobUrl(imported.url);
      if (imported.company) setJobCompany(imported.company);
      if (imported.title) setJobTitle(imported.title);
      setShowManualJobInput(true);
      
      if (hasCV) {
        setWizardStep(2);
      } else {
        setWizardStep(1);
      }
    }

    const handleJobImport = (e: any) => {
      const data = e.detail;
      if (data && data.fullText) {
        setJobOfferText(data.fullText);
        setJobSourceNotice(`Oferta importada de ${data.company || data.title || 'LinkedIn'}`);
        if (data.url) setJobUrl(data.url);
        if (data.company) setJobCompany(data.company);
        if (data.title) setJobTitle(data.title);
        setShowManualJobInput(true);
        
        if (canProceedRef.current) {
          setWizardStep(2);
        }
      }
    };

    window.addEventListener('strapyats_job_imported', handleJobImport);
    return () => {
      window.removeEventListener('strapyats_job_imported', handleJobImport);
    };
  }, []);


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const processPdfFile = async (file: File) => {
    setIsProcessingPdf(true);
    try {
      const text = await extractPdfText(file);
      if (text && text.trim()) {
        setCvText(text.trim());
        setCvMode('paste');
        setSavedCV(text.trim(), file.name);
        setHasSavedCv(true);
        setCvFile(null);
      } else {
        throw new Error('No se pudo extraer texto del PDF.');
      }
    } catch (error) {
      console.error('Error al procesar PDF:', error);
      // Fallback: lo dejamos como archivo subido
      setCvMode('upload');
      setCvFile(file);
      setCvText('');
      setHasSavedCv(false);
      removeSavedCV();
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        processPdfFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processPdfFile(file);
    }
  };

  const handleSaveCvAsDefault = () => {
    if (cvText.trim()) {
      setSavedCV(cvText, 'Mi Currículum Base');
      setHasSavedCv(true);
    }
  };

  const handleClearSavedCv = () => {
    removeSavedCV();
    setHasSavedCv(false);
    setCvText('');
    setCvFile(null);
  };

  const handleExtractFromUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobUrlInput.trim()) return;

    setIsScrapingUrl(true);
    setUrlScrapeError(null);

    try {
      const result = await extractJobFromUrl(jobUrlInput.trim());
      if (result && result.full_text) {
        setJobOfferText(result.full_text);
        setJobUrl(result.url || jobUrlInput.trim());
        setJobCompany(result.company || null);
        setJobTitle(result.title || null);
        setJobSourceNotice(`Oferta importada de ${result.company || result.title || 'LinkedIn'}`);
        setShowManualJobInput(true);
        setJobUrlInput('');
      } else {
        throw new Error('No se pudo extraer el texto de la oferta.');
      }
    } catch (err: any) {
      console.error('Error scraping job URL:', err);
      setUrlScrapeError(err?.message || 'No se pudo leer la oferta desde la URL. Prueba pegando el texto directamente o usando la extensión de Chrome.');
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const executeAnalysis = () => {
    if (cvMode === 'paste' && cvText.trim() && !hasSavedCv) {
      setSavedCV(cvText, 'Mi Currículum');
      setHasSavedCv(true);
    }

    onAnalyze({
      cvFile: cvMode === 'upload' ? cvFile : null,
      cvText: cvMode === 'paste' ? cvText : undefined,
      jobOfferText,
      jobUrl,
      companyName: jobCompany,
    });
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep === 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
        setWizardStep(2);
      }, 600);
    } else {
      executeAnalysis();
    }
  };

  const getStageMessage = (stage: PipelineStage): string => {
    switch (stage) {
      case 'uploading':
        return 'Iniciando ingesta en LangGraph Engine...';
      case 'extracting_pdf':
        return 'Extrayendo texto y estructura del documento PDF...';
      case 'vectorizing_chroma':
        return 'Calculando embeddings semánticos en ChromaDB...';
      case 'ats_gap_audit':
        return 'Auditando requisitos excluyentes del puesto...';
      case 'langgraph_rewrite':
        return 'Optimizando viñetas y métricas de impacto STAR...';
      case 'generating_outputs':
        return 'Sintetizando reporte final de compatibilidad...';
      default:
        return 'Ejecutando auditoría ATS...';
    }
  };

  const canProceedToStep2 = () => {
    return cvMode === 'upload' ? cvFile !== null : cvText.trim().length > 50;
  };

  return (
    <div id="analyzer-section" className="w-full max-w-4xl mx-auto space-y-6 pt-2 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Wizard Header */}
      <div className="revi-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-surface-300 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white font-display uppercase tracking-wide">
              {wizardStep === 1 ? 'Paso 1: Sube tu Currículum' : 'Paso 2: Captura la Oferta'}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-1.5 w-12 rounded-full ${wizardStep >= 1 ? 'bg-brand-cyan' : 'bg-surface-border'}`} />
              <div className={`h-1.5 w-12 rounded-full ${wizardStep >= 2 ? 'bg-brand-cyan' : 'bg-surface-border'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Wizard Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {wizardStep === 1 && (
          <div className="revi-card p-6 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">

            <div className="flex items-center justify-between border-b-[2px] border-surface-border pb-4">
              <p className="text-sm text-slate-300">
                Necesitamos tu currículum base para compararlo contra los requisitos del puesto. Se analizará de forma segura.
              </p>

              <div className="flex items-center gap-2">
                {hasSavedCv && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 uppercase font-mono">
                    <BookmarkCheck className="w-3 h-3 text-emerald-400" />
                    Guardado
                  </span>
                )}
                <div className="flex items-center bg-surface-300 p-0.5 border-[2px] border-surface-border text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setCvMode('upload')}
                    className={`px-3 py-1 transition-all ${cvMode === 'upload'
                      ? 'bg-brand-primary text-white font-black'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    Subir PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setCvMode('paste')}
                    className={`px-3 py-1 transition-all ${cvMode === 'paste'
                      ? 'bg-brand-primary text-white font-black'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    Pegar Texto
                  </button>
                </div>
              </div>
            </div>

            {cvMode === 'upload' ? (
              <div className="flex-1 flex flex-col justify-center min-h-[280px]">
                {isProcessingPdf ? (
                  <div className="p-8 bg-surface-300 border-[2px] border-brand-cyan text-center space-y-4 shadow-revi-sm max-w-md mx-auto w-full animate-pulse">
                    <div className="inline-flex p-4 bg-brand-cyan/20 text-brand-cyan border-[2px] border-brand-cyan rounded-full">
                      <div className="w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-sm font-mono font-bold text-white">
                        Procesando y vinculando documento PDF...
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Verificando compatibilidad con parser ATS
                      </p>
                    </div>
                  </div>
                ) : cvFile ? (
                  <div className="p-8 bg-surface-300 border-[2px] border-brand-primary text-center space-y-4 shadow-revi-sm max-w-md mx-auto w-full">
                    <div className="inline-flex p-4 bg-brand-primary text-white border-[2px] border-surface-border rounded-full">
                      <FileCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-mono font-bold text-white line-clamp-1">
                        {cvFile.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {(cvFile.size / 1024).toFixed(1)} KB • Listo para auditar
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setCvFile(null)}
                        className="revi-btn h-9 px-4 text-xs bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/80"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        <span>Quitar archivo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-10 border-[2px] border-dashed cursor-pointer transition-all max-w-xl mx-auto w-full ${dragActive
                      ? 'border-brand-primary bg-surface-100'
                      : 'border-surface-border bg-surface-300 hover:border-slate-500 hover:bg-surface-200'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-surface-200 border-[2px] border-surface-border flex items-center justify-center text-brand-cyan mb-4 shadow-revi-sm rounded-full">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-white text-center uppercase tracking-wide">
                      Arrastra tu CV en formato PDF
                    </p>
                    <p className="text-xs text-slate-400 text-center mt-2 font-normal">
                      o haz clic para explorar tus archivos (máx. 10MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-3 min-h-[280px]">
                <textarea
                  rows={12}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Pega el contenido completo de tu CV (resumen, experiencia, habilidades técnicas)..."
                  className="w-full flex-1 p-4 bg-surface-300 border-[2px] border-surface-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary leading-relaxed font-mono resize-none"
                />

                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {hasSavedCv ? (
                      <button
                        type="button"
                        onClick={handleClearSavedCv}
                        className="text-rose-400 hover:underline flex items-center gap-1.5 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Borrar CV guardado</span>
                      </button>
                    ) : (
                      cvText.trim().length > 50 && (
                        <button
                          type="button"
                          onClick={handleSaveCvAsDefault}
                          className="text-brand-cyan hover:underline flex items-center gap-1.5 font-bold"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Recordar mi CV en este navegador</span>
                        </button>
                      )
                    )}
                  </div>
                  <span className="text-slate-500">
                    {cvText.length} caracteres
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t-[2px] border-surface-border">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceedToStep2() || isTransitioning}
                className="revi-btn h-12 px-8 bg-brand-primary hover:bg-brand-hover text-white text-sm font-extrabold shadow-revi disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex justify-center items-center"
              >
                {isTransitioning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin"></span>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Siguiente Paso
                    <ArrowRight className="w-4 h-4 ml-2 stroke-[3]" />
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="revi-card p-6 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">

            {/* Active CV indicator banner */}
            <div className="flex items-center justify-between p-3.5 bg-surface-300 border-[2px] border-surface-border text-xs rounded-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-none">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 border border-emerald-800/60">
                      CV Base Vinculado
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {cvMode === 'upload' && cvFile ? cvFile.name : 'CV en formato de texto'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {cvMode === 'upload' && cvFile 
                      ? `${(cvFile.size / 1024).toFixed(1)} KB • Documento PDF listo para procesar`
                      : `${cvText.length} caracteres guardados`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="text-xs font-mono font-bold text-brand-cyan hover:text-cyan-300 hover:underline px-2 py-1"
              >
                Cambiar CV
              </button>
            </div>

            {!showManualJobInput ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-8">

                <div className="space-y-3 max-w-2xl">
                  <h3 className="text-2xl font-black text-white uppercase font-display tracking-wide">
                    Captura la Oferta Laboral
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Para adaptar tu CV exactamente a lo que busca la empresa, usa nuestra extensión de Chrome. Es la forma más rápida de importar ofertas directamente desde <strong>LinkedIn, Get on Board o cualquier portal</strong> sin problemas de formato.
                  </p>
                </div>

                {/* Instructions steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
                  <div className="bg-surface-300 p-5 border-[2px] border-surface-border flex flex-col items-center text-center space-y-3 relative hover:border-brand-cyan/50 transition-colors">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand-cyan text-slate-900 font-black rounded-full flex items-center justify-center border-2 border-surface-300">1</div>
                    <Download className="w-8 h-8 text-brand-cyan" />
                    <h4 className="text-xs font-bold text-white uppercase">Instala la Extensión</h4>
                    <p className="text-[11px] text-slate-400">Descarga el archivo ZIP y cárgalo en Chrome con 3 clics.</p>

                    <div className="flex flex-col gap-1.5 w-full pt-1">
                      <a
                        href="/strapyats-extension.zip"
                        download="strapyats-extension.zip"
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-brand-primary hover:bg-brand-hover text-white text-[11px] font-bold rounded shadow-revi-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar ZIP</span>
                      </a>

                      {onOpenExtensionGuide && (
                        <button
                          type="button"
                          onClick={onOpenExtensionGuide}
                          className="text-[10px] text-brand-cyan hover:underline font-semibold"
                        >
                          ¿Cómo instalarla? (Guía)
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-surface-300 p-5 border-[2px] border-surface-border flex flex-col items-center text-center space-y-3 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand-cyan text-slate-900 font-black rounded-full flex items-center justify-center border-2 border-surface-300">2</div>
                    <Briefcase className="w-8 h-8 text-slate-400" />
                    <h4 className="text-xs font-bold text-white uppercase">Abre una Oferta</h4>
                    <p className="text-[11px] text-slate-400">Ve a LinkedIn o tu portal favorito y abre la oferta que deseas.</p>
                  </div>
                  <div className="bg-surface-300 p-5 border-[2px] border-brand-primary/50 flex flex-col items-center text-center space-y-3 relative shadow-revi-sm">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand-cyan text-slate-900 font-black rounded-full flex items-center justify-center border-2 border-surface-300">3</div>
                    <MousePointerClick className="w-8 h-8 text-brand-cyan" />
                    <h4 className="text-xs font-bold text-white uppercase">Captura y Audita</h4>
                    <p className="text-[11px] text-slate-400">Haz clic en la extensión y presiona <strong>Auditar CV</strong>.</p>
                  </div>
                </div>

                {/* Direct Job URL Extractor Card */}
                <div className="w-full max-w-2xl bg-surface-300 border-[2px] border-brand-cyan/40 p-5 flex flex-col space-y-3 text-left relative shadow-revi-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-cyan" />
                      ¿Prefieres pegar el link de la oferta?
                    </span>
                    <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 border border-brand-cyan/30">
                      Auto-extracción
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Pega cualquier enlace público de <strong>LinkedIn, Get on Board, Computrabajo, etc.</strong> y extraeremos los requisitos automáticamente.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      autoComplete="off"
                      spellCheck="false"
                      value={jobUrlInput}
                      onChange={(e) => setJobUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExtractFromUrl();
                        }
                      }}
                      placeholder="https://www.linkedin.com/jobs/view/4448318522..."
                      className="flex-1 bg-[#111318] border-[2px] border-surface-border px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleExtractFromUrl()}
                      disabled={!jobUrlInput.trim() || isScrapingUrl}
                      className="revi-btn px-5 py-2.5 bg-brand-cyan hover:bg-cyan-400 text-slate-900 text-xs font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-revi-sm shrink-0"
                    >
                      {isScrapingUrl ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Extrayendo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Extraer Oferta</span>
                        </>
                      )}
                    </button>
                  </div>

                  {urlScrapeError && (
                    <p className="text-[11px] text-rose-400 font-mono bg-rose-950/40 p-2.5 border border-rose-800/50">
                      {urlScrapeError}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-4 pt-2">
                  <div className="relative">
                    {/* Pulsing indicator */}
                    <div className="absolute inset-0 bg-brand-cyan/20 rounded-full" />
                    <div className="relative bg-surface-200 border border-brand-cyan/30 px-6 py-3 rounded-full flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                      <span className="text-xs font-mono font-bold text-brand-cyan uppercase">
                        Esperando datos de la extensión o enlace...
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowManualJobInput(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-300 underline font-medium"
                  >
                    Prefiero pegar el texto manualmente
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b-[2px] border-surface-border pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-cyan" />
                    <span className="text-sm font-extrabold text-white uppercase tracking-wide">Contenido de la Oferta Laboral</span>
                  </div>

                  {jobSourceNotice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {jobSourceNotice}
                      </span>
                      {jobUrl && (
                        <a
                          href={jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono font-bold text-brand-cyan hover:underline bg-surface-200 border border-surface-border px-2 py-0.5 uppercase flex items-center gap-1"
                        >
                          <span>Ver Empleo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Ingreso Manual
                    </span>
                  )}
                </div>

                {/* Quick URL Import Bar inside manual view */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface-300 p-2.5 border-[2px] border-surface-border">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Globe className="w-4 h-4 text-brand-cyan shrink-0 ml-1" />
                    <input
                      type="url"
                      value={jobUrlInput}
                      onChange={(e) => setJobUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExtractFromUrl();
                        }
                      }}
                      placeholder={
                        jobTitle 
                          ? `${jobCompany ? `${jobCompany} • ` : ''}${jobTitle}` 
                          : "Pega otro link de oferta para actualizar el texto..."
                      }
                      className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-400 font-mono focus:outline-none truncate"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!jobUrlInput.trim() && (jobTitle || jobOfferText.trim().length > 50) ? (
                      <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Oferta Extraída</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExtractFromUrl()}
                        disabled={!jobUrlInput.trim() || isScrapingUrl}
                        className="revi-btn px-4 py-1.5 bg-brand-cyan hover:bg-cyan-400 text-slate-900 text-[11px] font-black uppercase flex items-center gap-1.5 disabled:opacity-40 shadow-revi-sm transition-all"
                      >
                        {isScrapingUrl ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Extrayendo...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Extraer Link</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {urlScrapeError && (
                  <p className="text-[11px] text-rose-400 font-mono bg-rose-950/40 p-2 border border-rose-800/50">
                    {urlScrapeError}
                  </p>
                )}

                <div className="flex-1 flex flex-col space-y-2">
                  <textarea
                    rows={12}
                    value={jobOfferText}
                    onChange={(e) => setJobOfferText(e.target.value)}
                    placeholder="Pega la descripción de la oferta laboral (requisitos, tecnologías y responsabilidades)..."
                    className="w-full flex-1 p-4 bg-surface-300 border-[2px] border-surface-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary leading-relaxed font-mono resize-none"
                  />
                  <span className="text-[11px] font-mono text-slate-500 text-right">
                    {jobOfferText.length} caracteres (mínimo 20)
                  </span>
                </div>
              </div>
            )}

            {/* Loading Progress Banner */}
            {isLoading && (
              <div className="revi-card p-5 border-brand-primary space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Ejecutando Motor de Análisis ATS
                    </h4>
                    <p className="text-xs text-brand-cyan font-bold font-mono">
                      {getStageMessage(pipelineStage)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-surface-300 h-2 overflow-hidden border border-surface-border">
                  <div className="bg-brand-primary h-full w-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Action Submit Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-[2px] border-surface-border">

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Key className="w-4 h-4 text-slate-400" />
                <span>
                  Modo Clave:{' '}
                  <strong className={currentApiKey ? 'text-brand-cyan font-mono' : 'text-slate-200 font-mono'}>
                    {currentApiKey ? 'BYOK Activo' : 'Free Tier (2/día)'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={onOpenByok}
                  className="text-brand-cyan hover:underline font-bold ml-1"
                >
                  {currentApiKey ? 'Configurar' : 'Ingresar clave'}
                </button>
              </div>

              {showManualJobInput && (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualJobInput(false);
                      setJobOfferText('');
                      setJobSourceNotice(null);
                      setJobUrl(null);
                      setJobCompany(null);
                      setJobTitle(null);
                      setJobUrlInput('');
                      clearExtractedJob();
                    }}
                    className="w-full sm:w-auto revi-btn h-12 px-5 bg-surface-300 hover:bg-surface-200 text-slate-300 hover:text-white border-[2px] border-surface-border text-xs font-extrabold uppercase transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Importar otra oferta</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || jobOfferText.trim().length < 20}
                    className="w-full sm:w-auto revi-btn h-12 px-8 bg-brand-primary hover:bg-brand-hover text-white text-xs font-extrabold shadow-revi disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>AUDITANDO CV...</span>
                      </>
                    ) : (
                      <>
                        <span>EJECUTAR AUDITORÍA ATS</span>
                        <ArrowRight className="w-4 h-4 ml-2 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </form>
    </div>
  );
};
