'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HistoryModal } from '@/components/HistoryModal';
import { ChromeExtensionModal } from '@/components/ChromeExtensionModal';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfileDB, SavedAnalysis } from '@/lib/types';
import { getSavedAnalyses, deleteSavedAnalysis, clearSavedAnalyses } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Briefcase, 
  Globe, 
  DollarSign, 
  FileText, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, plan, loading, refreshProfile, getAccessToken, signInWithGoogle } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [yearsExp, setYearsExp] = useState<number>(0);
  const [englishLevel, setEnglishLevel] = useState('intermedio');
  const [expectedSalary, setExpectedSalary] = useState<number>(0);
  const [salaryCurrency, setSalaryCurrency] = useState('CLP');
  const [baseCvText, setBaseCvText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    setSavedAnalyses(getSavedAnalyses());
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
      setNationalId(profile.national_id || '');
      setYearsExp(profile.years_experience || 0);
      setEnglishLevel(profile.english_level || 'intermedio');
      setExpectedSalary(profile.expected_salary_amount || 0);
      setSalaryCurrency(profile.expected_salary_currency || 'CLP');
      setBaseCvText(profile.base_cv_text || '');
    } else if (user) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const updatedData: Partial<UserProfileDB> = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      national_id: nationalId.trim(),
      years_experience: Number(yearsExp) || 0,
      english_level: englishLevel,
      expected_salary_amount: Number(expectedSalary) || 0,
      expected_salary_currency: salaryCurrency,
      base_cv_text: baseCvText.trim() || null,
    };

    try {
      const token = await getAccessToken();

      if (token && token !== 'demo-token-local') {
        try {
          await updateUserProfile(updatedData, token);
          await refreshProfile();
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          return;
        } catch {
          if (isSupabaseConfigured() && user) {
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                ...updatedData,
                updated_at: new Date().toISOString(),
              });
            if (error) throw error;
            await refreshProfile();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            return;
          }
        }
      }

      // Local fallback
      localStorage.setItem('strapy_ats_user_profile_v2', JSON.stringify({
        id: user?.id || 'demo-user',
        plan: plan,
        ...updatedData
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err?.message || 'Error al guardar los datos de perfil.');
    } finally {
      setIsSaving(false);
    }
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
    <div className="min-h-screen flex flex-col justify-between font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : !user ? (
          <div className="bg-surface-200 border-[2px] border-surface-border rounded-xl p-8 text-center space-y-6 shadow-revi-lg">
            <div className="w-16 h-16 bg-brand-primary/10 border border-brand-primary/40 rounded-full flex items-center justify-center mx-auto text-brand-cyan">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">
              Perfil de Candidato StrapyATS
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Inicia sesión con tu cuenta de Google para guardar tus datos personales, preferencias de renta y CV base.
            </p>
            <button
              onClick={() => signInWithGoogle()}
              className="revi-btn h-12 px-6 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold flex items-center justify-center gap-2 mx-auto shadow-revi-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              <span>Iniciar sesión con Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Header with Plan Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-200 border-[2px] border-surface-border rounded-lg p-5 shadow-revi-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                    <User className="w-5 h-5" />
                  </span>
                  <h1 className="text-xl font-extrabold text-white tracking-tight font-display">
                    Mi Perfil de Candidato
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Estos datos se usarán automáticamente para rellenar tus CVs adaptados y en la extensión de Chrome.
                </p>
              </div>

              {/* Plan Badge Card */}
              <div className="flex items-center gap-3 bg-surface-100 border border-surface-border p-2.5 rounded-md text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Plan Activo</span>
                  <span className={`font-bold font-mono ${plan === 'pro' ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {plan === 'pro' ? '⭐ StrapyATS Pro' : '✅ Free (10 análisis/día)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-700 text-emerald-300 text-xs rounded-md flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>¡Perfil actualizado y guardado correctamente!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-md flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Profile Fields */}
            <div className="bg-surface-200 border-[2px] border-surface-border rounded-lg p-5 sm:p-6 space-y-5 shadow-revi-sm text-xs">
              
              <h3 className="text-sm font-bold text-white font-display border-b border-surface-border pb-2">
                Datos de Contacto & Identidad
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Nombre Completo *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Alex Roberto González"
                    className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Correo Electrónico *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.email@ejemplo.com"
                    className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>RUT / DNI / Cédula</span>
                  </label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="18.123.456-7"
                    className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-white font-display border-b border-surface-border pb-2 pt-2">
                Experiencia & Pretensiones
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Años de Experiencia</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nivel de Inglés</span>
                  </label>
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="básico">Básico (A1 - A2)</option>
                    <option value="intermedio">Intermedio (B1 - B2)</option>
                    <option value="avanzado">Avanzado / Fluido (C1)</option>
                    <option value="nativo">Nativo / Bilingüe (C2)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Renta Líquida Esperada</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(Number(e.target.value))}
                      placeholder="2500000"
                      className="w-full h-10 px-3 rounded-md bg-surface-100 border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                    />
                    <select
                      value={salaryCurrency}
                      onChange={(e) => setSalaryCurrency(e.target.value)}
                      className="w-24 h-10 px-2 rounded-md bg-surface-100 border border-surface-border text-white focus:outline-none focus:border-brand-primary shrink-0"
                    >
                      <option value="CLP">CLP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="MXN">MXN</option>
                      <option value="ARS">ARS</option>
                      <option value="COP">COP</option>
                    </select>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white font-display border-b border-surface-border pb-2 pt-2">
                CV Base (Texto Plano)
              </h3>

              <div>
                <label className="block font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Currículum Base predeterminado</span>
                </label>
                <p className="text-slate-400 text-[11px] mb-2">
                  Si dejas guardado tu CV base aquí, no tendrás que subir el PDF cada vez que vayas a auditar una oferta.
                </p>
                <textarea
                  rows={8}
                  placeholder="Pega aquí el contenido completo de tu CV base..."
                  value={baseCvText}
                  onChange={(e) => setBaseCvText(e.target.value)}
                  className="w-full p-3 rounded-md bg-surface-100 border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary resize-y font-mono text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="revi-btn h-11 px-6 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-2 shadow-revi-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 stroke-[2.5]" />
                      <span>Guardar Perfil</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedAnalyses={savedAnalyses}
        onSelectAnalysis={() => {}}
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
