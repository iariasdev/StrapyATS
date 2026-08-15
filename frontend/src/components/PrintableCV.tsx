'use client';

import React, { useState } from 'react';
import { RewrittenCV } from '@/lib/types';
import { printResumeDocument, copyToClipboard } from '@/lib/pdf-export';
import { 
  Printer, 
  Copy, 
  Check, 
  Edit3, 
  Sparkles, 
  FileText, 
  Plus, 
  Trash2 
} from 'lucide-react';

interface PrintableCVProps {
  rewrittenCv: RewrittenCV;
  seniorityMatch?: string;
}

export const PrintableCV: React.FC<PrintableCVProps> = ({
  rewrittenCv,
  seniorityMatch,
}) => {
  const [candidateName, setCandidateName] = useState('Alex R. Dev');
  const [candidateTitle, setCandidateTitle] = useState(seniorityMatch || 'Senior Software & AI Engineer');
  const [candidateEmail, setCandidateEmail] = useState('alex.dev@example.com');
  const [candidatePhone, setCandidatePhone] = useState('+1 (555) 019-2834');
  const [candidateLocation, setCandidateLocation] = useState('Remoto / Híbrido');
  const [candidateLinkedin, setCandidateLinkedin] = useState('linkedin.com/in/alexdev');
  
  const [summary, setSummary] = useState(rewrittenCv.summary);
  const [bullets, setBullets] = useState<string[]>(rewrittenCv.experience_bullets || []);
  const [skills, setSkills] = useState<string[]>(rewrittenCv.skills_added || []);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Synchronize when rewrittenCv changes
  React.useEffect(() => {
    setSummary(rewrittenCv.summary);
    setBullets(rewrittenCv.experience_bullets || []);
    setSkills(rewrittenCv.skills_added || []);
    if (seniorityMatch) {
      setCandidateTitle(seniorityMatch);
    }
  }, [rewrittenCv, seniorityMatch]);

  const handleCopyFullText = () => {
    const fullText = `
${candidateName.toUpperCase()}
${candidateTitle}
Contacto: ${candidateEmail} | ${candidatePhone} | ${candidateLocation} | ${candidateLinkedin}

RESUMEN PROFESIONAL (ATS-OPTIMIZED)
${summary}

HABILIDADES TÉCNICAS CLAVE
${skills.join(', ')}

EXPERIENCIA RECIENTE & IMPACTO
${bullets.map((b) => `• ${b}`).join('\n')}

Powered by StrapyATS
    `.trim();

    copyToClipboard(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUpdateBullet = (index: number, val: string) => {
    const next = [...bullets];
    next[index] = val;
    setBullets(next);
  };

  const handleDeleteBullet = (index: number) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  const handleAddBullet = () => {
    setBullets([...bullets, 'Nueva viñeta de impacto cuantificado...']);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Action Bar */}
      <div className="revi-card p-5 flex flex-wrap items-center justify-between gap-4 no-print font-sans">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-primary text-white border-[2px] border-surface-border shadow-revi-sm">
            <FileText className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wide font-display">
              Plantilla ATS Zero-Error
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Formato compatible para Workday, Greenhouse, Taleo y Ashby
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`revi-btn h-10 px-4 text-xs ${
              isEditing 
                ? 'bg-brand-primary text-white shadow-revi' 
                : 'bg-surface-200 hover:bg-surface-100 text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            <span>{isEditing ? 'Vista Previa' : 'Editar Datos'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFullText}
            className="revi-btn h-10 px-4 text-xs bg-surface-200 hover:bg-surface-100 text-slate-200"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-brand-cyan" />
                <span className="text-brand-cyan">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          {/* 1-Click Browser PDF Print Trigger */}
          <button
            type="button"
            onClick={printResumeDocument}
            className="revi-btn h-10 px-5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-black shadow-revi"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Descargar / Imprimir PDF</span>
          </button>

        </div>
      </div>

      {/* Formatting Tips Banner */}
      {rewrittenCv.formatting_tips && rewrittenCv.formatting_tips.length > 0 && (
        <div className="revi-card p-5 text-xs text-slate-300 no-print space-y-1.5 font-sans">
          <div className="flex items-center gap-1.5 text-brand-cyan font-black uppercase text-xs font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Recomendaciones ATS Aplicadas:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 font-medium">
            {rewrittenCv.formatting_tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ATS Printable Paper Sheet */}
      <div className="ats-printable-container bg-white text-slate-900 p-8 sm:p-12 border-[2px] border-[#1f2937] shadow-[6px_6px_0px_#000000] font-sans max-w-4xl mx-auto transition-all">

        {/* CV Header */}
        <div className="border-b-[2px] border-slate-900 pb-5 mb-6 text-center">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Nombre Completo</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Título Profesional</label>
                <input
                  type="text"
                  value={candidateTitle}
                  onChange={(e) => setCandidateTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Email</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Teléfono / Ubicación</label>
                <input
                  type="text"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-900"
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 font-display">
                {candidateName}
              </h1>
              <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mt-1">
                {candidateTitle}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                <span>{candidateEmail}</span>
                <span>•</span>
                <span>{candidatePhone}</span>
                <span>•</span>
                <span>{candidateLocation}</span>
                <span>•</span>
                <span>{candidateLinkedin}</span>
              </div>
            </>
          )}
        </div>

        {/* Section: Professional Summary */}
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
            Resumen Profesional
          </h2>
          {isEditing ? (
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 text-xs text-slate-800 border border-slate-300 leading-relaxed"
            />
          ) : (
            <p className="text-xs leading-relaxed text-slate-800 text-justify">
              {summary}
            </p>
          )}
        </section>

        {/* Section: Core Technical Skills (ATS Keywords) */}
        {skills && skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
              Habilidades Técnicas &amp; Competencias Clave
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 print:bg-transparent print:border-slate-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Section: Professional Experience & High-Impact Bullets */}
        <section className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
              Experiencia Profesional Relevante (Optimización ATS)
            </h2>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddBullet}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Viñeta</span>
              </button>
            )}
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xs font-bold text-slate-950 uppercase">
                {candidateTitle} — Proyectos de Alto Impacto
              </h3>
              <span className="text-[11px] font-semibold text-slate-600">
                2022 — Presente
              </span>
            </div>
            <p className="text-[11px] italic text-slate-600 mb-2">
              Ingeniería de Sistemas, Arquitecturas Distribuidas &amp; Ecosistemas de IA
            </p>

            <ul className="space-y-2 text-xs text-slate-800 leading-relaxed list-disc list-outside pl-4">
              {bullets.map((bullet, idx) => (
                <li key={idx} className="group">
                  {isEditing ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                        className="flex-1 p-2 text-xs text-slate-800 border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBullet(idx)}
                        className="p-1 text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span>{bullet}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Education */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
            Educación &amp; Certificaciones
          </h2>
          <div className="flex justify-between items-baseline text-xs text-slate-800">
            <div>
              <span className="font-bold text-slate-950">Ingeniería de Software / Computación</span>
              <span className="text-slate-600"> — Universidad Tecnológica</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">Graduado</span>
          </div>
        </section>

      </div>

    </div>
  );
};
