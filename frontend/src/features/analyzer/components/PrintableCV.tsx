'use client';

import React, { useState, useEffect } from 'react';
import { RewrittenCV, WorkExperience, EducationItem, CategorizedSkills } from '@/lib/types';
import { printResumeDocument, copyToClipboard, downloadPdfFile } from '@/lib/pdf-export';
import { generateATSPdf } from '@/lib/pdf-generator';
import { getUserProfile, setUserProfile } from '@/lib/utils';
import { 
  Printer, 
  Copy, 
  Check, 
  Edit3, 
  Sparkles, 
  FileText, 
  Plus, 
  Trash2,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Code
} from 'lucide-react';

interface PrintableCVProps {
  rewrittenCv: RewrittenCV;
  seniorityMatch?: string;
}

export const PrintableCV: React.FC<PrintableCVProps> = ({
  rewrittenCv,
  seniorityMatch,
}) => {
  const [candidateName, setCandidateName] = useState(rewrittenCv.candidate_name || '');
  const [candidateTitle, setCandidateTitle] = useState(rewrittenCv.candidate_title || seniorityMatch || 'Software Engineer');
  const [candidateEmail, setCandidateEmail] = useState(rewrittenCv.candidate_email || '');
  const [candidatePhone, setCandidatePhone] = useState(rewrittenCv.candidate_phone || '');
  const [candidateLocation, setCandidateLocation] = useState(rewrittenCv.candidate_location || '');
  const [candidateLinkedin, setCandidateLinkedin] = useState(rewrittenCv.candidate_linkedin || '');
  const [candidateGithub, setCandidateGithub] = useState(rewrittenCv.candidate_github || '');
  const [candidatePortfolio, setCandidatePortfolio] = useState(rewrittenCv.candidate_portfolio || '');
  
  const [summary, setSummary] = useState(rewrittenCv.summary || '');
  const [skillsCategories, setSkillsCategories] = useState<CategorizedSkills>(rewrittenCv.skills_categories || {});
  const [skills, setSkills] = useState<string[]>(rewrittenCv.skills_added || []);
  const [experiences, setExperiences] = useState<WorkExperience[]>(rewrittenCv.experiences || []);
  const [education, setEducation] = useState<EducationItem[]>(rewrittenCv.education || []);
  const [certifications, setCertifications] = useState<string[]>(rewrittenCv.certificaciones || []);
  const [languages, setLanguages] = useState<string[]>(rewrittenCv.languages_spoken || []);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved profile or rewrittenCv on mount
  useEffect(() => {
    const profile = getUserProfile();
    if (rewrittenCv.candidate_name) {
      setCandidateName(rewrittenCv.candidate_name);
    } else if (profile.name) {
      setCandidateName(profile.name);
    }
    
    if (rewrittenCv.candidate_title) {
      setCandidateTitle(rewrittenCv.candidate_title);
    } else if (seniorityMatch) {
      setCandidateTitle(seniorityMatch);
    }

    if (rewrittenCv.candidate_email) {
      setCandidateEmail(rewrittenCv.candidate_email);
    } else if (profile.email) {
      setCandidateEmail(profile.email);
    }

    if (rewrittenCv.candidate_phone) {
      setCandidatePhone(rewrittenCv.candidate_phone);
    } else if (profile.phone) {
      setCandidatePhone(profile.phone);
    }

    if (rewrittenCv.candidate_location) {
      setCandidateLocation(rewrittenCv.candidate_location);
    } else if (profile.location) {
      setCandidateLocation(profile.location);
    }

    if (rewrittenCv.candidate_linkedin) {
      setCandidateLinkedin(rewrittenCv.candidate_linkedin);
    } else if (profile.linkedin) {
      setCandidateLinkedin(profile.linkedin);
    }

    if (rewrittenCv.candidate_github) {
      setCandidateGithub(rewrittenCv.candidate_github);
    }

    if (rewrittenCv.candidate_portfolio) {
      setCandidatePortfolio(rewrittenCv.candidate_portfolio);
    }

    setSummary(rewrittenCv.summary || '');
    setSkillsCategories(rewrittenCv.skills_categories || {});
    setSkills(rewrittenCv.skills_added || []);
    setExperiences(rewrittenCv.experiences || []);
    setEducation(rewrittenCv.education || []);
    setCertifications(rewrittenCv.certificaciones || []);
    setLanguages(rewrittenCv.languages_spoken || []);
  }, [rewrittenCv, seniorityMatch]);

  const handleToggleEdit = () => {
    if (isEditing) {
      setUserProfile({
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        location: candidateLocation,
        linkedin: candidateLinkedin,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCopyFullText = () => {
    let fullText = `${candidateName.toUpperCase()}\n${candidateTitle}\n`;
    const contactLine = [candidateEmail, candidatePhone, candidateLocation, candidateLinkedin, candidateGithub, candidatePortfolio].filter(Boolean).join(' | ');
    fullText += `${contactLine}\n\n`;

    if (summary) {
      fullText += `RESUMEN PROFESIONAL\n${summary}\n\n`;
    }

    if (experiences.length > 0) {
      fullText += `EXPERIENCIA LABORAL & PROYECTOS\n`;
      for (const exp of experiences) {
        fullText += `${exp.role} | ${exp.company} (${exp.period || ''}) ${exp.location ? '- ' + exp.location : ''}\n`;
        for (const b of exp.bullets) {
          fullText += `• ${b}\n`;
        }
        fullText += `\n`;
      }
    }

    if (education.length > 0) {
      fullText += `EDUCACIÓN\n`;
      for (const edu of education) {
        fullText += `${edu.degree} - ${edu.institution} (${edu.period || ''})\n`;
        if (edu.details) fullText += `${edu.details}\n`;
      }
      fullText += `\n`;
    }

    if (certifications.length > 0) {
      fullText += `CERTIFICACIONES & ADICIONALES\n`;
      for (const cert of certifications) {
        fullText += `• ${cert}\n`;
      }
      fullText += `\n`;
    }

    copyToClipboard(fullText.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadDirectPdf = () => {
    const fileName = `CV_${(candidateName || 'Candidato').replace(/\s+/g, '_')}_ATS.pdf`;
    const pdfData = generateATSPdf({
      candidate: {
        name: candidateName,
        title: candidateTitle,
        email: candidateEmail,
        phone: candidatePhone,
        location: candidateLocation,
        linkedin: candidateLinkedin,
        github: candidateGithub,
        portfolio: candidatePortfolio
      },
      summary: summary,
      skills_categories: skillsCategories,
      skills: skills,
      experiences: experiences,
      bullets: rewrittenCv.experience_bullets || [],
      education: education,
      certificaciones: certifications,
      languages_spoken: languages
    });
    downloadPdfFile(pdfData.blob, fileName);
  };

  // Helper experience edits
  const handleUpdateExpBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const next = [...experiences];
    next[expIndex].bullets[bulletIndex] = text;
    setExperiences(next);
  };

  const handleDeleteExpBullet = (expIndex: number, bulletIndex: number) => {
    const next = [...experiences];
    next[expIndex].bullets = next[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setExperiences(next);
  };

  const handleAddExpBullet = (expIndex: number) => {
    const next = [...experiences];
    next[expIndex].bullets.push('Nueva viñeta de impacto cuantificado...');
    setExperiences(next);
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        role: 'Nuevo Cargo / Rol',
        company: 'Nombre de Empresa o Proyecto',
        period: '2025 — Presente',
        location: 'Remoto / Santiago, Chile',
        bullets: ['Logro técnico con métrica medible...']
      }
    ]);
  };

  const handleDeleteExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
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
              CV Completo Optimizado ATS
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Estructura multi-puesto y multi-sección preservando todos tus proyectos, educación y certificaciones
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`revi-btn h-10 px-4 text-xs ${
              isEditing 
                ? 'bg-brand-primary text-white shadow-revi' 
                : 'bg-surface-200 hover:bg-surface-100 text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            <span>{isEditing ? 'Guardar Datos' : 'Editar Datos'}</span>
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

          {/* Direct ATS PDF File Download */}
          <button
            type="button"
            onClick={handleDownloadDirectPdf}
            className="revi-btn h-10 px-4 bg-brand-primary hover:bg-brand-hover text-white text-xs font-black shadow-revi flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Descargar PDF</span>
          </button>

          {/* Browser Print / Preview */}
          <button
            type="button"
            onClick={printResumeDocument}
            className="revi-btn h-10 px-4 bg-surface-200 hover:bg-surface-100 text-slate-200 text-xs font-medium flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
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
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Teléfono</label>
                <input
                  type="text"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Ubicación / Ciudad</label>
                <input
                  type="text"
                  value={candidateLocation}
                  onChange={(e) => setCandidateLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">LinkedIn</label>
                <input
                  type="text"
                  value={candidateLinkedin}
                  onChange={(e) => setCandidateLinkedin(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">GitHub</label>
                <input
                  type="text"
                  value={candidateGithub}
                  onChange={(e) => setCandidateGithub(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Portafolio / Web</label>
                <input
                  type="text"
                  value={candidatePortfolio}
                  onChange={(e) => setCandidatePortfolio(e.target.value)}
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
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600 mt-2 font-medium">
                {candidateLocation && <span>{candidateLocation}</span>}
                {candidatePhone && <><span>•</span><span>{candidatePhone}</span></>}
                {candidateEmail && <><span>•</span><span>{candidateEmail}</span></>}
                {candidateLinkedin && <><span>•</span><span className="text-blue-700">{candidateLinkedin}</span></>}
                {candidateGithub && <><span>•</span><span className="text-slate-800">{candidateGithub}</span></>}
                {candidatePortfolio && <><span>•</span><span className="text-slate-800">{candidatePortfolio}</span></>}
              </div>
            </>
          )}
        </div>

        {/* Section: Professional Summary */}
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans flex items-center gap-1.5">
            <span>RESUMEN PROFESIONAL</span>
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

        {/* Section: Categorized Technical Skills */}
        {((skillsCategories && Object.keys(skillsCategories).length > 0) || (skills && skills.length > 0)) && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2.5 font-sans">
              HABILIDADES TÉCNICAS &amp; COMPETENCIAS
            </h2>
            <div className="space-y-1.5 text-xs text-slate-800">
              {skillsCategories.languages && skillsCategories.languages.length > 0 && (
                <p>
                  <strong className="text-slate-950 font-bold">Lenguajes / Idiomas: </strong>
                  <span>{skillsCategories.languages.join(', ')}</span>
                </p>
              )}
              {skillsCategories.frontend && skillsCategories.frontend.length > 0 && (
                <p>
                  <strong className="text-slate-950 font-bold">Competencias Principales / Especialidad: </strong>
                  <span>{skillsCategories.frontend.join(', ')}</span>
                </p>
              )}
              {skillsCategories.backend_cloud && skillsCategories.backend_cloud.length > 0 && (
                <p>
                  <strong className="text-slate-950 font-bold">Herramientas &amp; Tecnologías: </strong>
                  <span>{skillsCategories.backend_cloud.join(', ')}</span>
                </p>
              )}
              {skillsCategories.testing_tools && skillsCategories.testing_tools.length > 0 && (
                <p>
                  <strong className="text-slate-950 font-bold">Metodologías &amp; Gestión: </strong>
                  <span>{skillsCategories.testing_tools.join(', ')}</span>
                </p>
              )}
              {(!skillsCategories.languages && !skillsCategories.frontend && skills && skills.length > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section: Structured Work Experience & Projects */}
        <section className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans flex items-center gap-1.5">
              <span>EXPERIENCIA LABORAL &amp; PROYECTOS DESTACADOS</span>
            </h2>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Experiencia</span>
              </button>
            )}
          </div>

          {experiences && experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp, expIdx) => (
                <div key={expIdx} className="border-l-2 border-slate-300 pl-3.5 py-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-xs font-black text-slate-950 uppercase tracking-wide">
                      {exp.role} <span className="font-semibold text-slate-600">| {exp.company}</span>
                    </h3>
                    <div className="text-[11px] font-bold text-slate-500">
                      {exp.period} {exp.location ? `• ${exp.location}` : ''}
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-800 leading-relaxed list-disc list-outside pl-4">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="group">
                        {isEditing ? (
                          <div className="flex items-start gap-2 mb-1">
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => handleUpdateExpBullet(expIdx, bIdx, e.target.value)}
                              className="flex-1 p-2 text-xs text-slate-800 border border-slate-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteExpBullet(expIdx, bIdx)}
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

                  {isEditing && (
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddExpBullet(expIdx)}
                        className="text-[10px] font-bold text-blue-700 hover:underline"
                      >
                        + Añadir Viñeta a {exp.company}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(expIdx)}
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        Eliminar Proyecto
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Fallback flat bullets if experiences array not populated
            <ul className="space-y-2 text-xs text-slate-800 leading-relaxed list-disc list-outside pl-4">
              {(rewrittenCv.experience_bullets || []).map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Section: Education */}
        {education && education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2.5 font-sans">
              EDUCACIÓN
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-slate-950">{edu.degree}</h3>
                    <p className="text-slate-700">{edu.institution}</p>
                    {edu.details && <p className="text-[11px] text-slate-500 italic mt-0.5">{edu.details}</p>}
                  </div>
                  {edu.period && (
                    <span className="text-[11px] font-bold text-slate-500">{edu.period}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Certifications & Additional */}
        {((certifications && certifications.length > 0) || (languages && languages.length > 0)) && (
          <section className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
              CERTIFICACIONES &amp; ADICIONALES
            </h2>
            <ul className="space-y-1 text-xs text-slate-800 list-disc list-outside pl-4">
              {certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
              {languages.map((lang, idx) => (
                <li key={`lang-${idx}`}>
                  <strong className="text-slate-950">Idiomas: </strong>{lang}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>

    </div>
  );
};
