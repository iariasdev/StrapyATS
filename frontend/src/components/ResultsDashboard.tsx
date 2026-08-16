'use client';

import React, { useState } from 'react';
import { AnalyzeResponse, ATSGap } from '@/lib/types';
import { ScoreGauge } from './ScoreGauge';
import { PrintableCV } from './PrintableCV';
import { copyToClipboard, downloadPdfFile } from '@/lib/pdf-export';
import { generateATSPdf } from '@/lib/pdf-generator';
import { getUserProfile } from '@/lib/utils';
import { 
  FileText, 
  Target, 
  Mail, 
  HelpCircle, 
  Activity, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Sparkles,
  RotateCcw,
  Zap
} from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalyzeResponse;
  onReset: () => void;
}

type TabType = 'cv' | 'gaps' | 'cover_letter' | 'interview' | 'observability';

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('cv');
  const [gapFilter, setGapFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedGapIndex, setCopiedGapIndex] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({
    0: true,
  });

  const handleAutoApply = () => {
    if (!result.job_url) return;
    setIsApplying(true);

    const profile = getUserProfile();
    const rc = result.rewritten_cv || ({} as any);
    const candidateName = profile.name || rc.candidate_name || 'Candidato';
    const candidateContact = {
      name: candidateName,
      title: rc.candidate_title || result.seniority_match || 'Software Engineer',
      email: profile.email || rc.candidate_email || '',
      phone: profile.phone || rc.candidate_phone || '',
      location: profile.location || rc.candidate_location || '',
      linkedin: profile.linkedin || rc.candidate_linkedin || '',
      github: rc.candidate_github || '',
      portfolio: rc.candidate_portfolio || '',
    };
    const fileName = `CV_${candidateName.replace(/\s+/g, '_')}_ATS.pdf`;

    // 1. Generate ATS PDF binary with all projects, education & certifications
    const pdfData = generateATSPdf({
      candidate: candidateContact,
      summary: rc.summary || '',
      skills_categories: rc.skills_categories,
      skills: rc.skills_added || [],
      experiences: rc.experiences || [],
      bullets: rc.experience_bullets || [],
      education: rc.education || [],
      certificaciones: rc.certificaciones || [],
      languages_spoken: rc.languages_spoken || [],
    });

    // 2. Trigger automatic local PDF download
    downloadPdfFile(pdfData.blob, fileName);

    // 3. Post event to Chrome Extension web_bridge for automatic LinkedIn DOM fill
    window.postMessage({
      type: 'STRAPYATS_TRIGGER_AUTO_APPLY',
      payload: {
        targetUrl: result.job_url,
        candidate: candidateContact,
        fileName: fileName,
        pdfBase64: pdfData.base64
      }
    }, '*');

    // 4. Open the job listing tab only as fallback if extension is not present
    const isExtensionActive = typeof window !== 'undefined' && Boolean((window as any).__STRAPYATS_EXTENSION_ACTIVE__);
    if (!isExtensionActive) {
      setTimeout(() => {
        window.open(result.job_url || '', '_blank');
        setIsApplying(false);
      }, 400);
    } else {
      setTimeout(() => setIsApplying(false), 1500);
    }
  };

  const handleCopyCoverLetter = () => {
    copyToClipboard(result.cover_letter);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2000);
  };

  const handleCopyGap = (gap: ATSGap, index: number) => {
    copyToClipboard(`${gap.keyword}: ${gap.recommendation}`);
    setCopiedGapIndex(index);
    setTimeout(() => setCopiedGapIndex(null), 2000);
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const filteredGaps = (result.ats_gaps || []).filter(gap => {
    if (gapFilter === 'all') return true;
    return gap.importance.toLowerCase() === gapFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1 border-b-[2px] border-surface-border no-print">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan text-xs font-mono font-black uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Reporte de Compatibilidad
          </span>
          {result.company_name && (
            <span className="text-xs font-mono text-slate-300">
              Oferta: <strong className="text-white">{result.company_name}</strong>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="revi-btn h-9 px-4 text-xs bg-surface-200 hover:bg-surface-100 text-white border-[2px] border-surface-border flex items-center gap-2 shadow-revi-sm transition-all shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Nueva Auditoría</span>
        </button>
      </div>

      {/* Score Gauge & Verdict (Integrated) */}
      <ScoreGauge 
        score={result.match_score} 
        seniorityMatch={result.seniority_match}
        summaryVerdict={result.summary_verdict}
      />

      {/* Tabs Navigation Bar - Single Line (Revi Celeste Style) */}
      <div className="flex items-center gap-2 overflow-x-auto no-print scrollbar-none pb-1 w-full">
        <button
          onClick={() => setActiveTab('cv')}
          className={`revi-btn h-10 px-4 text-xs whitespace-nowrap shrink-0 ${
            activeTab === 'cv'
              ? 'bg-brand-primary text-white shadow-revi'
              : 'bg-surface-100 hover:bg-surface-50 text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          <span>1. CV Reescrito</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`revi-btn h-10 px-4 text-xs whitespace-nowrap shrink-0 ${
            activeTab === 'gaps'
              ? 'bg-brand-primary text-white shadow-revi'
              : 'bg-surface-100 hover:bg-surface-50 text-slate-300'
          }`}
        >
          <Target className="w-4 h-4 mr-1.5" />
          <span>2. Brechas ATS ({result.ats_gaps?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('cover_letter')}
          className={`revi-btn h-10 px-4 text-xs whitespace-nowrap shrink-0 ${
            activeTab === 'cover_letter'
              ? 'bg-brand-primary text-white shadow-revi'
              : 'bg-surface-100 hover:bg-surface-50 text-slate-300'
          }`}
        >
          <Mail className="w-4 h-4 mr-1.5" />
          <span>3. Carta Presentación</span>
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          className={`revi-btn h-10 px-4 text-xs whitespace-nowrap shrink-0 ${
            activeTab === 'interview'
              ? 'bg-brand-primary text-white shadow-revi'
              : 'bg-surface-100 hover:bg-surface-50 text-slate-300'
          }`}
        >
          <HelpCircle className="w-4 h-4 mr-1.5" />
          <span>4. Preguntas Técnicas</span>
        </button>

        <button
          onClick={() => setActiveTab('observability')}
          className={`revi-btn h-10 px-4 text-xs whitespace-nowrap shrink-0 ${
            activeTab === 'observability'
              ? 'bg-brand-primary text-white shadow-revi'
              : 'bg-surface-100 hover:bg-surface-50 text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4 mr-1.5" />
          <span>5. Traza</span>
        </button>
      </div>

      {/* Tab 1: CV Optimizado */}
      {activeTab === 'cv' && (
        <div className="space-y-6">
          {/* Postulation Workflow Assistant */}
          {result.job_url && (
            <div className="revi-card p-4 sm:p-5 bg-surface-200 border-[2px] border-brand-cyan/40 shadow-revi-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-brand-cyan text-slate-950 border-[2px] border-surface-border shrink-0 shadow-revi-sm">
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-white font-mono tracking-wide">
                    Postulación Inteligente en 1 Clic
                  </h4>
                  <p className="text-xs text-slate-300">
                    Al hacer clic en <strong>&quot;Postular en {result.company_name || 'LinkedIn'}&quot;</strong>, StrapyATS descargará tu CV en PDF, abrirá la oferta en LinkedIn e inyectará automáticamente tu teléfono y tu nuevo CV en el formulario.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAutoApply}
                disabled={isApplying}
                className="revi-btn h-10 px-5 text-xs bg-brand-cyan text-slate-950 font-black shadow-revi hover:bg-cyan-300 whitespace-nowrap shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 fill-slate-950 ${isApplying ? 'animate-bounce' : ''}`} />
                <span>{isApplying ? 'Iniciando...' : '⚡ Postular Automáticamente'}</span>
              </button>
            </div>
          )}

          <PrintableCV 
            rewrittenCv={result.rewritten_cv} 
            seniorityMatch={result.seniority_match}
          />
        </div>
      )}

      {/* Tab 2: ATS Gaps */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="revi-card p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">
                Auditoría de Brechas y Requisitos Faltantes
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Términos clave solicitados en la oferta que no están explícitamente en tu CV
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {(['all', 'critical', 'high', 'medium'] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  onClick={() => setGapFilter(filterVal)}
                  className={`px-3 py-1 text-xs font-bold uppercase border-[2px] transition-all shadow-revi-sm ${
                    gapFilter === filterVal
                      ? 'bg-brand-primary text-white border-surface-border font-black'
                      : 'bg-surface-300 text-slate-400 border-surface-border hover:text-white'
                  }`}
                >
                  {filterVal === 'all' ? 'Todos' : filterVal}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGaps.map((gap, idx) => {
              const isCopied = copiedGapIndex === idx;
              const isCritical = gap.importance.toLowerCase() === 'critical';
              const isHigh = gap.importance.toLowerCase() === 'high';

              return (
                <div
                  key={idx}
                  className="revi-card p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-black text-white font-mono uppercase">
                        {gap.keyword}
                      </h5>
                      <span className={`px-2.5 py-0.5 text-[10px] font-mono font-black uppercase border-[2px] shadow-revi-sm ${
                        isCritical 
                          ? 'bg-rose-500 text-white border-surface-border'
                          : isHigh 
                          ? 'bg-amber-400 text-surface-300 border-surface-border'
                          : 'bg-brand-primary text-white border-surface-border'
                      }`}>
                        {gap.importance}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-400 block mb-1 uppercase">Contexto en Oferta:</span>
                        <p className="text-slate-300 leading-relaxed bg-surface-300 p-3 border border-surface-border font-mono text-[11px]">
                          {gap.context}
                        </p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] font-bold text-brand-cyan block mb-1 uppercase">Recomendación STAR:</span>
                        <p className="text-slate-200 font-semibold leading-relaxed bg-surface-100 p-3 border border-surface-border font-mono text-[11px]">
                          {gap.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t-[2px] border-surface-border flex justify-end">
                    <button
                      onClick={() => handleCopyGap(gap, idx)}
                      className="revi-btn h-8 px-3 text-xs bg-surface-300 hover:bg-surface-200 text-slate-200"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-brand-cyan" />
                          <span className="text-brand-cyan">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>Copiar Cambio</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Cover Letter */}
      {activeTab === 'cover_letter' && (
        <div className="space-y-6">
          <div className="revi-card p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">
                Carta de Presentación (Cover Letter)
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Generada con métricas cuantificadas para la vacante
              </p>
            </div>

            <button
              onClick={handleCopyCoverLetter}
              className="revi-btn h-10 px-5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-black shadow-revi"
            >
              {copiedCoverLetter ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>¡Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>
          </div>

          <div className="revi-card p-6">
            <textarea
              rows={15}
              defaultValue={result.cover_letter}
              className="w-full bg-surface-300 p-4 border-[2px] border-surface-border text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-brand-primary resize-y font-mono"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Interview Simulator */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <div className="revi-card p-5">
            <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">
              Preguntas Técnicas &amp; Puntos Críticos
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Validación de requisitos excluyentes y conocimientos clave
            </p>
          </div>

          <div className="space-y-3">
            {(result.interview_questions || []).map((item, idx) => {
              const isExpanded = !!expandedQuestions[idx];

              return (
                <div
                  key={idx}
                  className="revi-card p-5 space-y-3"
                >
                  <div 
                    onClick={() => toggleQuestion(idx)}
                    className="flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-brand-primary text-white border-[2px] border-surface-border font-black text-xs shrink-0 mt-0.5 shadow-revi-sm font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-white leading-snug">
                          {item.question}
                        </h5>
                        <span className="inline-block text-[10px] font-mono font-bold text-brand-cyan bg-surface-300 px-2 py-0.5 border border-surface-border mt-1.5 uppercase">
                          FOCO: {item.focus_area}
                        </span>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t-[2px] border-surface-border space-y-2 text-xs">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Estructura STAR Recomendada:</span>
                      <p className="text-slate-200 leading-relaxed bg-surface-300 p-3.5 border border-surface-border text-xs font-mono">
                        {item.suggested_answer_tip}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Observability */}
      {activeTab === 'observability' && (
        <div className="space-y-6">
          <div className="revi-card p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">
                  Trazabilidad en Langfuse Cloud
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  Métricas de latencia P95, tokens consumidos y árbol de inferencia
                </p>
              </div>

              {result.langfuse_trace_url && (
                <a
                  href={result.langfuse_trace_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="revi-btn h-10 px-4 text-xs bg-brand-primary hover:bg-brand-hover text-white font-bold shadow-revi"
                >
                  <span>Ver Traza Completa</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-surface-300 border-[2px] border-surface-border shadow-revi-sm">
                <span className="text-slate-500 font-bold block mb-1 text-[10px]">COSTO ESTIMADO</span>
                <span className="font-black text-brand-cyan text-sm">$0.00 (FREE TIER)</span>
              </div>
              <div className="p-4 bg-surface-300 border-[2px] border-surface-border shadow-revi-sm">
                <span className="text-slate-500 font-bold block mb-1 text-[10px]">MODELO INFERENCIA</span>
                <span className="font-black text-white text-sm">GEMINI FLASH</span>
              </div>
              <div className="p-4 bg-surface-300 border-[2px] border-surface-border shadow-revi-sm">
                <span className="text-slate-500 font-bold block mb-1 text-[10px]">INDEX VECTORIAL</span>
                <span className="font-black text-white text-sm">CHROMADB DISK</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
