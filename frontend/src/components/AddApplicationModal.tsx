'use client';

import React, { useState } from 'react';
import { JobApplication, JobApplicationStatus } from '@/lib/types';
import { X, Plus, Building2, Briefcase, Globe, FileText, Percent, Loader2 } from 'lucide-react';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (app: Partial<JobApplication>) => Promise<void>;
}

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobPortal, setJobPortal] = useState('linkedin');
  const [jobUrl, setJobUrl] = useState('');
  const [atsScore, setAtsScore] = useState<number>(85);
  const [status, setStatus] = useState<JobApplicationStatus>('saved');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      setError('Por favor ingresa el nombre de la empresa y el cargo.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        job_portal: jobPortal,
        job_url: jobUrl.trim() || null,
        ats_match_score: Number(atsScore) || 0,
        status: status,
        notes: notes.trim() || null,
        applied_at: status === 'applied' ? new Date().toISOString() : null,
      });
      onClose();
      // Reset form
      setCompanyName('');
      setJobTitle('');
      setJobUrl('');
      setNotes('');
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la postulación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-200 border-[2px] border-surface-border rounded-lg shadow-revi-lg w-full max-w-lg overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-[2px] border-surface-border bg-surface-100/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-cyan">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">
              Rastrear Nueva Postulación
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-200 rounded font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Empresa *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Mercado Libre, NotCo, BCI, Google..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Cargo / Título del puesto *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Senior AI Engineer, Full-Stack Developer..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Portal / Origen</span>
              </label>
              <select
                value={jobPortal}
                onChange={(e) => setJobPortal(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="getonboard">Get on Board</option>
                <option value="computrabajo">CompuTrabajo</option>
                <option value="workday">Workday Portal</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="lever">Lever</option>
                <option value="manual">Otro / Directo</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>Estado Inicial</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
                className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="saved">📌 Guardada</option>
                <option value="applied">🚀 Postulada</option>
                <option value="interview">💼 En Entrevista</option>
                <option value="offer">🎉 Oferta Recibida</option>
                <option value="rejected">❌ Descartada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-white mb-1.5">
              URL de la vacante (opcional)
            </label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas o seguimiento personal</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Contacté a la recruiter María por LinkedIn. Entrevista técnica el jueves..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="revi-btn h-9 px-4 bg-surface-100 hover:bg-surface-50 text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="revi-btn h-9 px-5 bg-brand-primary hover:bg-brand-hover text-white font-bold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Agregar al Tablero</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
