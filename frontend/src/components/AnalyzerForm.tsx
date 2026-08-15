'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Play, 
  Key, 
  ArrowRight, 
  Loader2, 
  FileCheck,
  FileSearch,
  Briefcase,
  BookmarkCheck,
  Bookmark,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { PipelineStage } from '@/lib/types';
import { getSavedCV, setSavedCV, removeSavedCV, getExtractedJob, clearExtractedJob } from '@/lib/utils';

interface AnalyzerFormProps {
  onAnalyze: (payload: { cvFile?: File | null; cvText?: string; jobOfferText: string }) => Promise<void>;
  onLoadDemo: () => void;
  isLoading: boolean;
  pipelineStage: PipelineStage;
  currentApiKey: string;
  onOpenByok: () => void;
}

const SAMPLE_CV = `ALEXANDER R. SILVA
Senior Full-Stack & AI Systems Developer
Email: alex.silva@techdev.io | Tel: +1 555-019-3829 | GitHub: github.com/alexdev | LinkedIn: linkedin.com/in/alexdev

RESUMEN PROFESIONAL:
Desarrollador Full-Stack Senior con 5 años de experiencia diseñando arquitecturas web escalables, microservicios asíncronos en Python y aplicaciones con modelos de lenguaje grande (LLMs). Experiencia liderando equipos ágiles e implementando buenas prácticas de observabilidad.

EXPERIENCIA LABORAL:
Senior Software Engineer — CloudApps Studio (2022 - Presente)
• Diseñó y desplegó microservicios REST con FastAPI y Python 3.11 manejando más de 100k solicitudes diarias.
• Desarrolló interfaces frontend en Next.js 14 y TypeScript con tiempos de carga optimizados.
• Implementó integraciones con modelos de OpenAI y Gemini para asistentes conversacionales.
• Gestionó bases de datos relacionales PostgreSQL y caching con Redis.

Full-Stack Developer — Innovatech Corp (2019 - 2022)
• Construyó paneles de administración con React, Node.js y Docker.
• Redujo el tiempo de respuesta de consultas SQL complejas en un 35%.
• Participó en migraciones a arquitecturas cloud serverless.

HABILIDADES TÉCNICAS:
Python, FastAPI, Next.js, React, TypeScript, Docker, Git, CI/CD, SQL, PostgreSQL, LLMs, Prompt Engineering.

EDUCACIÓN:
Licenciatura en Ciencias de la Computación — Universidad Central (2015 - 2019)`;

const SAMPLE_JOB = `Puesto: Senior AI & Multi-Agent Systems Engineer
Empresa: BipBop Labs / Revi Technologies
Ubicación: Remoto (Latam / USA)

Buscamos un Ingeniero de Software Sénior con sólida experiencia en arquitecturas de agentes deterministas y flujos RAG para unirse a nuestro equipo de desarrollo de IA.

Responsabilidades Principales:
• Diseñar y construir grafos multi-agente complejos utilizando LangGraph y FastAPI.
• Implementar bases de datos vectoriales optimizadas en disco con ChromaDB PersistentClient para garantizar una huella de memoria ultrabaja (<50MB) en contenedores Docker y GCP Cloud Run.
• Integrar observabilidad de extremo a extremo con Langfuse Cloud para auditoría de latencia P95, métricas de tokens y control de costos.
• Desarrollar extensiones de Chrome (Manifest v3) para extracción eficiente del DOM y dashboards en Next.js con generación de reportes en el cliente.
• Diseñar políticas de rate limiting y soporte de arquitectura BYOK (Bring Your Own Key) para modelos Google Gemini Flash.

Requisitos Excluyentes:
• +4 años de experiencia en Python moderno (FastAPI, Pydantic v2).
• Experiencia práctica con LangGraph (nodos, estados deterministas, guardas de flujo).
• Dominio de RAG con ChromaDB y embeddings semánticos.
• Conocimiento de observabilidad LLM con Langfuse o similar.
• Mentalidad FinOps para desarrollo de aplicaciones IA con costo $0 en Free Tiers.`;

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({
  onAnalyze,
  onLoadDemo,
  isLoading,
  pipelineStage,
  currentApiKey,
  onOpenByok,
}) => {
  const [cvMode, setCvMode] = useState<'upload' | 'paste'>('paste');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [hasSavedCv, setHasSavedCv] = useState(false);
  const [savedCvName, setSavedCvName] = useState('');
  
  const [jobOfferText, setJobOfferText] = useState('');
  const [jobSourceNotice, setJobSourceNotice] = useState<string | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. On Mount: Check if user has a persistent CV saved in browser
  useEffect(() => {
    const saved = getSavedCV();
    if (saved && saved.text) {
      setCvText(saved.text);
      setCvMode('paste');
      setHasSavedCv(true);
      setSavedCvName(saved.name);
    } else {
      setCvMode('upload');
    }

    // 2. Check if a job was sent from the Chrome Extension
    const imported = getExtractedJob();
    if (imported && imported.fullText) {
      setJobOfferText(imported.fullText);
      setJobSourceNotice(`Oferta importada desde ${imported.company || 'la extensión'}`);
      clearExtractedJob();
    }

    // 3. Listen for live events from Chrome Extension in active tab
    const handleJobImport = (e: any) => {
      const data = e.detail;
      if (data && data.fullText) {
        setJobOfferText(data.fullText);
        setJobSourceNotice(`Oferta importada de ${data.company || data.title || 'Extensión'}`);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setCvFile(file);
        setCvMode('upload');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSaveCvAsDefault = () => {
    if (cvText.trim()) {
      setSavedCV(cvText, 'Mi Currículum Base');
      setHasSavedCv(true);
      setSavedCvName('Mi Currículum Base');
    }
  };

  const handleClearSavedCv = () => {
    removeSavedCV();
    setHasSavedCv(false);
    setSavedCvName('');
    setCvText('');
    setCvFile(null);
  };

  const handleLoadSamples = () => {
    setCvMode('paste');
    setCvText(SAMPLE_CV);
    setJobOfferText(SAMPLE_JOB);
    setCvFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If user has entered text and wants it saved, save it
    if (cvText.trim() && !hasSavedCv) {
      setSavedCV(cvText, 'Mi Currículum');
      setHasSavedCv(true);
    }

    onAnalyze({
      cvFile: cvMode === 'upload' ? cvFile : null,
      cvText: cvMode === 'paste' ? cvText : undefined,
      jobOfferText,
    });
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

  return (
    <div id="analyzer-section" className="w-full space-y-6 pt-2 font-sans">
      
      {/* Top Header Card */}
      <div className="revi-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-white font-display uppercase tracking-wide">
            Panel de Ingesta &amp; Comparación
          </h2>
          <p className="text-xs text-slate-400 font-normal">
            {hasSavedCv 
              ? '✓ Tu CV base está guardado. Solo pega una oferta de trabajo o impórtala con la extensión.' 
              : 'Ingresa tu CV y la descripción del cargo para auditar la compatibilidad exacta.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-sans">
          <button
            type="button"
            onClick={handleLoadSamples}
            className="revi-btn h-9 px-3.5 bg-surface-200 hover:bg-surface-100 text-slate-200 text-xs font-bold"
          >
            <FileSearch className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>Datos de Ejemplo</span>
          </button>

          <button
            type="button"
            onClick={onLoadDemo}
            className="revi-btn h-9 px-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-revi"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            <span>Probar Demo</span>
          </button>
        </div>
      </div>

      {/* Main Dual Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Candidate Resume Input */}
          <div className="revi-card p-6 flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b-[2px] border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-cyan" />
                <span className="text-sm font-extrabold text-white uppercase tracking-wide">1. Tu Currículum (CV)</span>
              </div>

              <div className="flex items-center gap-2">
                {hasSavedCv && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 uppercase font-mono">
                    <BookmarkCheck className="w-3 h-3 text-emerald-400" />
                    Guardado
                  </span>
                )}

                <div className="flex items-center bg-surface-300 p-0.5 border-[2px] border-surface-border text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCvMode('upload')}
                    className={`px-3 py-1 transition-all ${
                      cvMode === 'upload'
                        ? 'bg-brand-primary text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Subir PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setCvMode('paste')}
                    className={`px-3 py-1 transition-all ${
                      cvMode === 'paste'
                        ? 'bg-brand-primary text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Texto Guardado
                  </button>
                </div>
              </div>
            </div>

            {cvMode === 'upload' ? (
              <div className="flex-1 flex flex-col justify-center min-h-[240px]">
                {cvFile ? (
                  <div className="p-6 bg-surface-300 border-[2px] border-brand-primary text-center space-y-3 shadow-revi-sm">
                    <div className="inline-flex p-3 bg-brand-primary text-white border-[2px] border-surface-border">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white line-clamp-1">
                        {cvFile.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {(cvFile.size / 1024).toFixed(1)} KB • Documento PDF cargado
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setCvFile(null)}
                        className="revi-btn h-8 px-3 text-xs bg-rose-950/60 text-rose-300 border-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
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
                    className={`flex flex-col items-center justify-center p-8 border-[2px] border-dashed cursor-pointer transition-all ${
                      dragActive
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
                    <div className="w-12 h-12 bg-surface-200 border-[2px] border-surface-border flex items-center justify-center text-brand-cyan mb-3 shadow-revi-sm">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white text-center uppercase tracking-wide">
                      Arrastra tu CV en formato PDF
                    </p>
                    <p className="text-[11px] text-slate-400 text-center mt-1 font-normal">
                      o haz clic para explorar tus archivos (máx. 10MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-2">
                <textarea
                  rows={10}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Pega el contenido completo de tu CV (resumen, experiencia, habilidades técnicas)..."
                  className="w-full flex-1 p-3.5 bg-surface-300 border-[2px] border-surface-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary leading-relaxed font-mono resize-none"
                />
                
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    {hasSavedCv ? (
                      <button
                        type="button"
                        onClick={handleClearSavedCv}
                        className="text-rose-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Borrar CV guardado</span>
                      </button>
                    ) : (
                      cvText.trim().length > 50 && (
                        <button
                          type="button"
                          onClick={handleSaveCvAsDefault}
                          className="text-brand-cyan hover:underline flex items-center gap-1 font-bold"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Guardar este CV como predeterminado</span>
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

          </div>

          {/* RIGHT: Target Job Description Input */}
          <div className="revi-card p-6 flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b-[2px] border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-cyan" />
                <span className="text-sm font-extrabold text-white uppercase tracking-wide">2. Oferta Laboral Objetivo</span>
              </div>
              
              {jobSourceNotice ? (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 uppercase">
                  {jobSourceNotice}
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  LinkedIn / Get on Board / Web
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col space-y-1">
              <textarea
                rows={10}
                value={jobOfferText}
                onChange={(e) => setJobOfferText(e.target.value)}
                placeholder="Pega la descripción de la oferta laboral (requisitos, tecnologías y responsabilidades) o usa la extensión de Chrome en LinkedIn..."
                className="w-full flex-1 p-3.5 bg-surface-300 border-[2px] border-surface-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary leading-relaxed font-mono resize-none"
              />
              <span className="text-[10px] font-mono text-slate-500 text-right">
                {jobOfferText.length} caracteres (mínimo 20)
              </span>
            </div>

          </div>

        </div>

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
        <div className="revi-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
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

          <button
            type="submit"
            disabled={isLoading || (!cvFile && !cvText.trim()) || jobOfferText.trim().length < 20}
            className="w-full sm:w-auto revi-btn h-12 px-8 bg-brand-primary hover:bg-brand-hover text-white text-xs font-extrabold shadow-revi disabled:opacity-50 disabled:cursor-not-allowed"
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

      </form>
    </div>
  );
};
