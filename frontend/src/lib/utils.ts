import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnalyzeResponse, SavedAnalysis } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BYOK_STORAGE_KEY = 'strapy_ats_byok_key';
const BYOK_PROVIDER_KEY = 'strapy_ats_byok_provider';
const BYOK_MODEL_KEY = 'strapy_ats_byok_model';
const HISTORY_STORAGE_KEY = 'strapy_ats_history';
const SAVED_CV_KEY = 'strapy_ats_saved_cv';
const EXTRACTED_JOB_KEY = 'strapyats_extracted_job';
const USER_PROFILE_KEY = 'strapyats_user_profile';

export type AIProvider = 'auto' | 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq';

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

export function getSavedProvider(): AIProvider {
  if (typeof window === 'undefined') return 'auto';
  return (localStorage.getItem(BYOK_PROVIDER_KEY) as AIProvider) || 'auto';
}

export function setSavedProvider(provider: string): void {
  if (typeof window === 'undefined') return;
  if (provider.trim()) {
    localStorage.setItem(BYOK_PROVIDER_KEY, provider.trim());
  } else {
    localStorage.removeItem(BYOK_PROVIDER_KEY);
  }
}

export function detectProviderFromKey(key: string): AIProvider {
  const k = key.trim();
  if (k.startsWith('AIza')) return 'gemini';
  if (k.startsWith('sk-ant-')) return 'anthropic';
  if (k.startsWith('gsk_')) return 'groq';
  if (k.startsWith('sk-')) return 'openai';
  if (k.toLowerCase().includes('deepseek')) return 'deepseek';
  return 'gemini';
}

export function getSavedModel(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(BYOK_MODEL_KEY) || '';
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
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    };
  }
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
  };
}

export function extractContactInfoFromText(text: string): Partial<UserProfileData> {
  if (!text) return {};
  const result: Partial<UserProfileData> = {};

  // Email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) result.email = emailMatch[0];

  // Phone (international or local format)
  const phoneMatches = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{1,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g);
  if (phoneMatches) {
    const validPhone = phoneMatches.find(p => p.replace(/\D/g, '').length >= 8);
    if (validPhone) {
      // Clean stray parens, symbols, and extra spaces
      let cleanPhone = validPhone.replace(/[^\d+]/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleanPhone.startsWith('+56') && cleanPhone.length > 4) {
        const digits = cleanPhone.slice(3).replace(/\D/g, '');
        if (digits.length === 9) {
          cleanPhone = `+56 ${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
        }
      }
      result.phone = cleanPhone;
    }
  }

  // Name (first valid non-empty line, omitting PDF page headers)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/^---\s*Page/i.test(line) || /^PAGE\s*\d+/i.test(line) || line.length < 3) continue;
    if (line.length < 45 && !line.includes('@') && !line.includes('http') && !line.includes(':') && !line.includes('/') && !line.includes('•')) {
      result.name = line;
      break;
    }
  }

  return result;
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
