export type GapImportance = 'critical' | 'high' | 'medium';

export interface ATSGap {
  keyword: string;
  importance: GapImportance;
  context: string;
  recommendation: string;
}

export interface InterviewQuestion {
  question: string;
  focus_area: string;
  suggested_answer_tip: string;
}

export interface RewrittenCV {
  summary: string;
  experience_bullets: string[];
  skills_added: string[];
  formatting_tips: string[];
}

export interface AnalyzeResponse {
  match_score: number;
  seniority_match: string;
  summary_verdict: string;
  ats_gaps: ATSGap[];
  rewritten_cv: RewrittenCV;
  cover_letter: string;
  interview_questions: InterviewQuestion[];
  langfuse_trace_url?: string | null;
  rate_limit_remaining?: number | null;
  job_url?: string | null;
  company_name?: string | null;
}

export interface AnalyzeRequest {
  job_offer_text: string;
  cv_text?: string;
  byok_api_key?: string;
  model_name?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  chroma_db_status: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  roleTitle: string;
  companyName?: string;
  jobUrl?: string;
  matchScore: number;
  seniorityMatch: string;
  result: AnalyzeResponse;
}

export type PipelineStage = 
  | 'idle'
  | 'uploading'
  | 'extracting_pdf'
  | 'vectorizing_chroma'
  | 'ats_gap_audit'
  | 'langgraph_rewrite'
  | 'generating_outputs'
  | 'completed'
  | 'error';
