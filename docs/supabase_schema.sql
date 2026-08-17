-- ==============================================================================
-- STRAPYATS — FASE 3: ESQUEMA DE BASE DE DATOS SUPABASE
-- Ejecutar en el SQL Editor de tu proyecto en https://supabase.com
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de perfiles de candidatos (asociada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  national_id TEXT,                     -- RUT / DNI
  years_experience INT DEFAULT 0,
  english_level TEXT DEFAULT 'intermedio', -- 'básico' | 'intermedio' | 'avanzado' | 'nativo'
  expected_salary_amount INT DEFAULT 0,
  expected_salary_currency TEXT DEFAULT 'CLP',
  base_cv_text TEXT,                    -- CV base guardado en texto plano
  plan TEXT DEFAULT 'free',             -- 'free' | 'pro'
  daily_analyses_count INT DEFAULT 0,
  last_analysis_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de postulaciones (Kanban tracker)
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_portal TEXT DEFAULT 'manual',      -- 'linkedin' | 'getonboard' | 'computrabajo' | 'manual'
  job_url TEXT,
  ats_match_score INT DEFAULT 0,         -- 0-100
  status TEXT DEFAULT 'saved',           -- 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  applied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de versiones de CV y preguntas por postulación
CREATE TABLE IF NOT EXISTS public.cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_json JSONB NOT NULL,                -- El objeto JSON completo del CV adaptado
  interview_questions JSONB,             -- Array de preguntas de entrevista
  cover_letter TEXT,                     -- Carta de presentación generada
  ats_gaps JSONB,                        -- Brechas de ATS detectadas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_cv_versions_application_id ON public.cv_versions(application_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_user_id ON public.cv_versions(user_id);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad (RLS)
DROP POLICY IF EXISTS "Users own data" ON public.profiles;
CREATE POLICY "Users own data" ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users own apps" ON public.job_applications;
CREATE POLICY "Users own apps" ON public.job_applications 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own cvs" ON public.cv_versions;
CREATE POLICY "Users own cvs" ON public.cv_versions 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 8. Trigger para crear perfil automáticamente al registrarse con Supabase Auth (OAuth Google o Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, plan)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
