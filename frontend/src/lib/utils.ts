import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnalyzeResponse, SavedAnalysis } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BYOK_STORAGE_KEY = 'strapy_ats_byok_key';
const BYOK_MODEL_KEY = 'strapy_ats_byok_model';
const HISTORY_STORAGE_KEY = 'strapy_ats_history';
const SAVED_CV_KEY = 'strapy_ats_saved_cv';
const EXTRACTED_JOB_KEY = 'strapyats_extracted_job';
const USER_PROFILE_KEY = 'strapyats_user_profile';

export interface SavedCVData {
  name: string;
  text: string;
  updatedAt: number;
}

export function getSavedApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(BYOK_STORAGE_KEY) || '';
}

export function setSavedApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(BYOK_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(BYOK_STORAGE_KEY);
  }
}

export function removeSavedApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BYOK_STORAGE_KEY);
}

export function getSavedModel(): string {
  if (typeof window === 'undefined') return 'gemini-3.5-flash-lite';
  return localStorage.getItem(BYOK_MODEL_KEY) || 'gemini-3.5-flash-lite';
}

export function setSavedModel(model: string): void {
  if (typeof window === 'undefined') return;
  if (model.trim()) {
    localStorage.setItem(BYOK_MODEL_KEY, model.trim());
  } else {
    localStorage.removeItem(BYOK_MODEL_KEY);
  }
}

/* =================================================== */
/* PERSISTENT CANDIDATE PROFILE (Name, email, etc.)   */
/* =================================================== */
export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export function getUserProfile(): UserProfileData {
  if (typeof window === 'undefined') {
    return {
      name: 'Alex R. Dev',
      email: 'alex.dev@example.com',
      phone: '+56 9 1234 5678',
      location: 'Santiago, Chile / Remoto',
      linkedin: 'linkedin.com/in/alexdev',
    };
  }
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    name: 'Alex R. Dev',
    email: 'alex.dev@example.com',
    phone: '+56 9 1234 5678',
    location: 'Santiago, Chile / Remoto',
    linkedin: 'linkedin.com/in/alexdev',
  };
}

export function setUserProfile(profile: Partial<UserProfileData>): void {
  if (typeof window === 'undefined') return;
  const current = getUserProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
}

/* =================================================== */
/* PERSISTENT USER CV (Save once, audit many times)   */
/* =================================================== */
export function getSavedCV(): SavedCVData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVED_CV_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSavedCV(cvText: string, cvName = 'Mi Currículum Base'): void {
  if (typeof window === 'undefined') return;
  if (!cvText.trim()) {
    localStorage.removeItem(SAVED_CV_KEY);
    return;
  }
  const data: SavedCVData = {
    name: cvName,
    text: cvText.trim(),
    updatedAt: Date.now(),
  };
  localStorage.setItem(SAVED_CV_KEY, JSON.stringify(data));
}

export function removeSavedCV(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVED_CV_KEY);
}

/* =================================================== */
/* EXTRACTED JOB (From Chrome Extension or URL Bridge) */
/* =================================================== */
export function getExtractedJob(): { title?: string; company?: string; fullText?: string; url?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EXTRACTED_JOB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearExtractedJob(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXTRACTED_JOB_KEY);
}

/* =================================================== */
/* AUDIT HISTORY                                       */
/* =================================================== */
export function getSavedAnalyses(): SavedAnalysis[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysisResult(
  result: AnalyzeResponse, 
  roleSnippet?: string,
  jobUrl?: string,
  companyName?: string
): SavedAnalysis {
  const history = getSavedAnalyses();
  const title = roleSnippet?.trim().slice(0, 45) || `Análisis ATS (${result.seniority_match})`;
  
  if (jobUrl && !result.job_url) result.job_url = jobUrl;
  if (companyName && !result.company_name) result.company_name = companyName;

  const newItem: SavedAnalysis = {
    id: `scan-${Date.now()}`,
    timestamp: Date.now(),
    roleTitle: title,
    companyName: companyName || result.company_name || undefined,
    jobUrl: jobUrl || result.job_url || undefined,
    matchScore: result.match_score,
    seniorityMatch: result.seniority_match,
    result,
  };

  const updated = [newItem, ...history.filter(item => item.id !== newItem.id)].slice(0, 10);
  if (typeof window !== 'undefined') {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  }
  return newItem;
}

export function deleteSavedAnalysis(id: string): SavedAnalysis[] {
  if (typeof window === 'undefined') return [];
  const history = getSavedAnalyses();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearSavedAnalyses(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

export function getScoreDetails(score: number): {
  color: string;
  textColor: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
  label: string;
  description: string;
} {
  if (score >= 80) {
    return {
      color: '#0085f4',
      textColor: 'text-brand-cyan',
      badgeBg: 'bg-brand-primary text-white border-surface-border',
      borderColor: 'border-surface-border',
      glowColor: 'shadow-revi',
      label: 'Excelente Compatibilidad ATS',
      description: 'El perfil pasa los filtros automáticos y destaca con alta probabilidad de llamada a entrevista.',
    };
  } else if (score >= 60) {
    return {
      color: '#f59e0b',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-400 text-surface-300 border-surface-border',
      borderColor: 'border-surface-border',
      glowColor: 'shadow-revi',
      label: 'Compatibilidad Media',
      description: 'Cumple con los requisitos base pero tiene vacíos de palabras clave críticas que debes incorporar.',
    };
  } else {
    return {
      color: '#ef4444',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500 text-white border-surface-border',
      borderColor: 'border-surface-border',
      glowColor: 'shadow-revi',
      label: 'Baja Compatibilidad ATS',
      description: 'Riesgo alto de ser descartado por filtros ATS automatizados antes de que un reclutador humano lo lea.',
    };
  }
}
