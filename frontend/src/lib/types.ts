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

export interface WorkExperience {
  role: string;
  company: string;
  period?: string;
  location?: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period?: string;
  details?: string;
}

export interface CategorizedSkills {
  languages?: string[];
  frontend?: string[];
  backend_cloud?: string[];
  testing_tools?: string[];
}

export interface RewrittenCV {
  candidate_name?: string;
  candidate_title?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_location?: string;
  candidate_linkedin?: string;
  candidate_github?: string;
  candidate_portfolio?: string;
  summary: string;
  skills_categories?: CategorizedSkills;
  skills_added: string[];
  experiences?: WorkExperience[];
  experience_bullets: string[];
  education?: EducationItem[];
  certificaciones?: string[];
  languages_spoken?: string[];
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
