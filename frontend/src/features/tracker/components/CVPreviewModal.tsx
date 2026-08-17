'use client';

import React from 'react';
import { RewrittenCV } from '@/lib/types';
import { PrintableCV } from './PrintableCV';
import { downloadPdfFile } from '@/lib/pdf-export';
import { generateATSPdf } from '@/lib/pdf-generator';
import { X, Download, Copy, Check } from 'lucide-react';

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: RewrittenCV;
  companyName: string;
  jobTitle: string;
}

export const CVPreviewModal: React.FC<CVPreviewModalProps> = ({
  isOpen,
  onClose,
  cv,
  companyName,
  jobTitle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !cv) return null;

  const handleDownload = () => {
    const candidateContact = {
      name: cv.candidate_name || 'Candidato',
      title: cv.candidate_title || jobTitle,
      email: cv.candidate_email || '',
      phone: cv.candidate_phone || '',
      location: cv.candidate_location || '',
      linkedin: cv.candidate_linkedin || '',
      github: cv.candidate_github || '',
      portfolio: cv.candidate_portfolio || '',
    };
    const fileName = `CV_${(cv.candidate_name || 'Candidato').replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.pdf`;

    const pdfData = generateATSPdf({
      candidate: candidateContact,
      summary: cv.summary || '',
      skills_categories: cv.skills_categories,
      skills: cv.skills_added || [],
      experiences: cv.experiences || [],
      bullets: cv.experience_bullets || [],
      education: cv.education || [],
      certificaciones: cv.certificaciones || [],
      languages_spoken: cv.languages_spoken || [],
    });

    downloadPdfFile(pdfData.blob, fileName);
  };

  const handleCopyText = () => {
    let fullText = `${cv.candidate_name || ''}\n${cv.candidate_title || jobTitle}\n\nRESUMEN:\n${cv.summary}\n\nHABILIDADES:\n${(cv.skills_added || []).join(', ')}\n\nEXPERIENCIA:\n`;
    if (cv.experiences && cv.experiences.length > 0) {
      cv.experiences.forEach(exp => {
        fullText += `\n${exp.role} - ${exp.company} (${exp.period || ''})\n`;
        (exp.bullets || []).forEach(b => {
          fullText += `• ${b}\n`;
        });
      });
    } else {
      (cv.experience_bullets || []).forEach(b => {
        fullText += `• ${b}\n`;
      });
    }
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-200 border-[2px] border-surface-border rounded-lg shadow-revi-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-[2px] border-surface-border bg-surface-100/80">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span>CV Adaptado para</span>
              <span className="text-brand-cyan">{companyName}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{jobTitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="revi-btn h-9 px-3 text-xs bg-surface-200 hover:bg-surface-50 text-slate-200 flex items-center gap-1.5"
              title="Copiar texto plano"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="revi-btn h-9 px-3.5 text-xs bg-brand-primary hover:bg-brand-hover text-white flex items-center gap-1.5 font-bold"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-surface-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-300/40">
          <PrintableCV 
            cv={cv} 
            jobTitle={jobTitle} 
            companyName={companyName} 
          />
        </div>

      </div>
    </div>
  );
};
