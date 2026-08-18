'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  FileText,
  Kanban,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Briefcase,
  Globe,
  DollarSign,
  ChevronDown,
  X,
  Loader2,
  Zap,
  Target,
  Brain,
} from 'lucide-react';
import { extractPdfText } from '@/lib/api';
import { setSavedCV, setUserProfile } from '@/lib/utils';

/* ─── Types ─────────────────────────────────────────────────────── */
interface ProfileForm {
  fullName: string;
  phone: string;
  nationalId: string;
  yearsExperience: string;
  englishLevel: string;
  salaryAmount: string;
  salaryCurrency: string;
}

const STEPS = [
  { id: 1, label: 'Tu perfil', icon: User },
  { id: 2, label: 'Tu CV base', icon: FileText },
  { id: 3, label: '¡Listo!', icon: CheckCircle2 },
];

const ENGLISH_LEVELS = ['Sin inglés', 'Básico (A1-A2)', 'Intermedio (B1-B2)', 'Avanzado (C1)', 'Nativo / Bilingüe'];
const CURRENCIES = ['CLP', 'USD', 'MXN', 'COP', 'ARS', 'PEN', 'EUR'];

/* ─── Step Progress Bar ─────────────────────────────────────────── */
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : active
                    ? 'bg-brand-primary border-brand-cyan text-white shadow-revi'
                    : 'bg-surface-100 border-surface-border text-slate-500'
                }`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                  active ? 'text-brand-cyan' : done ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-[2px] mt-[-14px] rounded transition-all duration-500 ${
                  done ? 'bg-emerald-500' : 'bg-surface-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Mini Kanban Preview ────────────────────────────────────────── */
function KanbanPreview() {
  const cols = [
    {
      label: '📌 Guardadas',
      color: 'text-slate-300',
      cards: [
        { role: 'Frontend Engineer', company: 'Mercado Libre', score: 89, portal: 'LinkedIn' },
        { role: 'React Dev Senior', company: 'BipBop Labs', score: 95, portal: 'GetOnBoard' },
      ],
    },
    {
      label: '🚀 Postuladas',
      color: 'text-brand-cyan',
      cards: [{ role: 'Full Stack Dev', company: 'Falabella Tech', score: 78, portal: 'LinkedIn' }],
    },
    {
      label: '💼 Entrevista',
      color: 'text-amber-400',
      cards: [{ role: 'Senior SWE', company: 'Rappi', score: 92, portal: 'Manual' }],
    },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-3 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-1">
        <Kanban className="w-4 h-4 text-brand-cyan" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Tu Tracker de Postulaciones
        </span>
      </div>
      <div className="flex gap-2 overflow-hidden">
        {cols.map((col) => (
          <div key={col.label} className="flex-1 flex flex-col gap-2 min-w-0">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${col.color} truncate`}>
              {col.label}
            </div>
            {col.cards.map((card, i) => (
              <div
                key={i}
                className="bg-surface-100 border border-surface-border rounded-lg p-2.5 space-y-1.5 hover:border-brand-cyan/40 transition-colors"
              >
                <div className="text-[10px] font-bold text-white truncate">{card.role}</div>
                <div className="text-[10px] text-slate-400 truncate">{card.company}</div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      card.score >= 85
                        ? 'bg-brand-primary/20 text-brand-cyan'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {card.score}%
                  </span>
                  <span className="text-[9px] text-slate-500">{card.portal}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: 'Match Prom.', value: '88%', icon: Target, color: 'text-brand-cyan' },
          { label: 'Postulaciones', value: '4', icon: Briefcase, color: 'text-slate-300' },
          { label: 'Entrevistas', value: '1', icon: Sparkles, color: 'text-amber-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface-100 border border-surface-border rounded-lg p-2 text-center"
            >
              <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${stat.color}`} />
              <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-slate-500 leading-tight">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Onboarding Flow Component ───────────────────────────────────── */
export const OnboardingFlow: React.FC = () => {
  const { user, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    nationalId: profile?.national_id || '',
    yearsExperience: profile?.years_experience?.toString() || '',
    englishLevel: profile?.english_level || 'Intermedio (B1-B2)',
    salaryAmount: profile?.expected_salary_amount?.toString() || '',
    salaryCurrency: profile?.expected_salary_currency || 'CLP',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [cvMode, setCvMode] = useState<'upload' | 'paste'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [cvError, setCvError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateForm = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleStep1Next = () => {
    if (!form.fullName.trim()) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }
    setUserProfile({ name: form.fullName, phone: form.phone });
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileDrop = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setCvError('Solo se aceptan archivos PDF.');
      return;
    }
    setCvFile(file);
    setCvError(null);
    setIsParsingPdf(true);
    try {
      const text = await extractPdfText(file);
      setCvText(text);
    } catch {
      setCvError('No se pudo leer el PDF. Pega el texto manualmente.');
    } finally {
      setIsParsingPdf(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileDrop(file);
    },
    [handleFileDrop]
  );

  const handleStep2Next = async () => {
    const finalText = cvText.trim();
    if (!finalText) {
      setCvError('Por favor sube tu CV o pega el texto.');
      return;
    }
    setSaving(true);
    setSavedCV(finalText, cvFile?.name || 'Mi CV Base');
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const firstName = form.fullName.split(' ')[0] || 'candidato';

  return (
    <div className="w-full">
      <StepBar current={step} />

      <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
        {/* LEFT: Step Content */}
        <div className="flex-1 w-full max-w-xl">

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 border border-brand-cyan/30 px-2.5 py-1 rounded">
                  <Sparkles className="w-3 h-3" /> Paso 1 de 3
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
                  Cuéntanos <span className="text-brand-cyan">sobre ti</span>
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Con esta información, el agente de IA adaptará tu CV y generará respuestas de screening que realmente suenen a ti.
                </p>
              </div>

              <div className="bg-surface-200 border-[2px] border-surface-border rounded-xl p-5 sm:p-6 space-y-4 shadow-revi-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nombre completo *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateForm('fullName', e.target.value)}
                    placeholder="Ej: Ignacio Arias González"
                    className="w-full bg-surface-100 border border-surface-border text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full bg-surface-100 border border-surface-border text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">RUT / DNI</label>
                    <input
                      type="text"
                      value={form.nationalId}
                      onChange={(e) => updateForm('nationalId', e.target.value)}
                      placeholder="19.876.543-2"
                      className="w-full bg-surface-100 border border-surface-border text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Años de experiencia</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={form.yearsExperience}
                      onChange={(e) => updateForm('yearsExperience', e.target.value)}
                      placeholder="5"
                      className="w-full bg-surface-100 border border-surface-border text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" /> Nivel de inglés
                  </label>
                  <div className="relative">
                    <select
                      value={form.englishLevel}
                      onChange={(e) => updateForm('englishLevel', e.target.value)}
                      className="w-full appearance-none bg-surface-100 border border-surface-border text-white text-sm px-3.5 py-2.5 pr-8 rounded-lg focus:outline-none focus:border-brand-cyan transition-colors cursor-pointer"
                    >
                      {ENGLISH_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Pretensión de renta líquida
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.salaryAmount}
                      onChange={(e) => updateForm('salaryAmount', e.target.value)}
                      placeholder="2.800.000"
                      className="flex-1 bg-surface-100 border border-surface-border text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
                    />
                    <div className="relative">
                      <select
                        value={form.salaryCurrency}
                        onChange={(e) => updateForm('salaryCurrency', e.target.value)}
                        className="appearance-none bg-surface-100 border border-surface-border text-white text-sm px-3 py-2.5 pr-7 rounded-lg focus:outline-none focus:border-brand-cyan transition-colors cursor-pointer"
                      >
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-rose-400 font-medium bg-rose-950/30 border border-rose-800/40 rounded-md px-3 py-2">
                    {formError}
                  </p>
                )}
              </div>

              <button
                onClick={handleStep1Next}
                className="revi-btn w-full h-12 bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-revi"
              >
                <span>Continuar — Subir mi CV</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-slate-500">
                Datos guardados localmente. Nunca se envían sin tu permiso.
              </p>
            </div>
          )}

          {/* STEP 2: CV Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 border border-brand-cyan/30 px-2.5 py-1 rounded">
                  <Brain className="w-3 h-3" /> Paso 2 de 3
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
                  Sube tu <span className="text-brand-cyan">CV base</span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tu CV base es el documento completo con toda tu experiencia. El agente lo adapta a cada vacante sin modificar el original.
                </p>
              </div>

              <div className="flex gap-2 bg-surface-100 border border-surface-border rounded-lg p-1">
                {(['upload', 'paste'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setCvMode(mode); setCvError(null); }}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                      cvMode === mode ? 'bg-brand-primary text-white shadow-revi-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'upload' ? '📄 Subir PDF' : '✏️ Pegar texto'}
                  </button>
                ))}
              </div>

              {cvMode === 'upload' ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-brand-cyan bg-brand-cyan/5 scale-[1.01]'
                      : cvFile
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-surface-border hover:border-brand-cyan/50 hover:bg-surface-100/50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])}
                  />
                  {isParsingPdf ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
                      <p className="text-sm text-slate-300 font-medium">Extrayendo texto del PDF...</p>
                    </div>
                  ) : cvFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      <div>
                        <p className="text-sm font-bold text-white">{cvFile.name}</p>
                        <p className="text-xs text-emerald-400 mt-0.5">
                          {cvText.split(' ').length.toLocaleString()} palabras extraídas ✓
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCvFile(null); setCvText(''); }}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <UploadCloud className="w-10 h-10 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-white">Arrastra tu CV aquí</p>
                        <p className="text-xs text-slate-500 mt-1">o haz clic para seleccionar — Solo PDF</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={cvText}
                  onChange={(e) => { setCvText(e.target.value); setCvError(null); }}
                  placeholder="Pega aquí el texto completo de tu currículum base..."
                  rows={12}
                  className="w-full bg-surface-100 border border-surface-border text-white placeholder-slate-500 text-sm px-4 py-3 rounded-xl font-mono focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors resize-none"
                />
              )}

              {cvError && (
                <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-md px-3 py-2">
                  {cvError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="revi-btn h-12 px-5 bg-surface-100 hover:bg-surface-50 text-slate-300 font-bold text-sm flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Atrás</span>
                </button>
                <button
                  onClick={handleStep2Next}
                  disabled={saving}
                  className="revi-btn flex-1 h-12 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-revi"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    <><span>Guardar y continuar</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
              >
                Saltar por ahora — lo agrego después desde mi perfil
              </button>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center mx-auto shadow-revi">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-900/30 border border-emerald-700/40 px-2.5 py-1 rounded">
                  <Zap className="w-3 h-3" /> Perfil configurado
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                  ¡Listo, <span className="text-brand-cyan">{firstName}!</span>
                </h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Tu perfil está configurado. Ahora puedes auditar tu CV, guardar postulaciones en el Tracker Kanban y preparar entrevistas con IA.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-4">
                {[
                  {
                    icon: Target,
                    color: 'text-brand-cyan',
                    bg: 'bg-brand-primary/10 border-brand-primary/30',
                    title: 'Auditar mi CV',
                    desc: 'Analiza tu currículum contra una oferta laboral real.',
                    href: '/',
                    cta: 'Ir al Auditor →',
                  },
                  {
                    icon: Kanban,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10 border-amber-500/30',
                    title: 'Mi Tracker',
                    desc: 'Organiza tus postulaciones con el Kanban.',
                    href: '/tracker',
                    cta: 'Ver Tracker →',
                  },
                  {
                    icon: User,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10 border-emerald-500/30',
                    title: 'Mi Perfil',
                    desc: 'Edita tus datos y CV base cuando quieras.',
                    href: '/profile',
                    cta: 'Ver Perfil →',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`revi-card border ${item.bg} p-4 space-y-2 hover:scale-[1.02] transition-transform block`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <div className="text-sm font-bold text-white">{item.title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
                      <div className={`text-xs font-semibold ${item.color}`}>{item.cta}</div>
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/"
                className="revi-btn inline-flex items-center gap-2 h-12 px-8 bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm shadow-revi"
              >
                <Sparkles className="w-4 h-4" />
                <span>Empezar a optimizar mi CV</span>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT: Kanban Preview */}
        {step < 3 && (
          <div className="w-full lg:w-auto lg:sticky lg:top-28">
            <div className="flex flex-wrap gap-2 mb-4 lg:max-w-sm">
              {[
                { label: '🤖 IA Multi-Agente', color: 'bg-brand-primary/15 text-brand-cyan border-brand-primary/30' },
                { label: '🔒 100% Privado', color: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' },
                { label: '📊 Score ATS en %', color: 'bg-amber-900/30 text-amber-400 border-amber-700/40' },
                { label: '📄 PDF ATS-Ready', color: 'bg-surface-100 text-slate-300 border-surface-border' },
              ].map((pill) => (
                <span
                  key={pill.label}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${pill.color}`}
                >
                  {pill.label}
                </span>
              ))}
            </div>
            <KanbanPreview />
          </div>
        )}
      </div>
    </div>
  );
};
