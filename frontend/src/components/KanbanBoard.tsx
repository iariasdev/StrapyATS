'use client';

import React, { useState, useEffect } from 'react';
import { JobApplication, JobApplicationStatus, RewrittenCV, InterviewQuestion } from '@/lib/types';
import { ApplicationCard } from './ApplicationCard';
import { AddApplicationModal } from './AddApplicationModal';
import { CVPreviewModal } from './CVPreviewModal';
import { InterviewQuestionsModal } from './InterviewQuestionsModal';
import { useAuth } from '@/contexts/AuthContext';
import { getJobApplications, createJobApplication, updateJobApplication, deleteJobApplication } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  XCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface ColumnDef {
  id: JobApplicationStatus;
  title: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const COLUMNS: ColumnDef[] = [
  { 
    id: 'saved', 
    title: 'Guardadas', 
    emoji: '📌', 
    color: 'text-sky-300', 
    borderColor: 'border-sky-700/40', 
    bgColor: 'bg-sky-950/20' 
  },
  { 
    id: 'applied', 
    title: 'Postuladas', 
    emoji: '🚀', 
    color: 'text-indigo-300', 
    borderColor: 'border-indigo-700/40', 
    bgColor: 'bg-indigo-950/20' 
  },
  { 
    id: 'interview', 
    title: 'Entrevista', 
    emoji: '💼', 
    color: 'text-amber-300', 
    borderColor: 'border-amber-700/40', 
    bgColor: 'bg-amber-950/20' 
  },
  { 
    id: 'offer', 
    title: 'Oferta Recibida', 
    emoji: '🎉', 
    color: 'text-emerald-300', 
    borderColor: 'border-emerald-700/40', 
    bgColor: 'bg-emerald-950/20' 
  },
  { 
    id: 'rejected', 
    title: 'Descartadas', 
    emoji: '❌', 
    color: 'text-slate-400', 
    borderColor: 'border-slate-700/40', 
    bgColor: 'bg-slate-900/30' 
  },
];

export const KanbanBoard: React.FC = () => {
  const { user, getAccessToken } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedCVApp, setSelectedCVApp] = useState<JobApplication | null>(null);
  const [selectedQuestionsApp, setSelectedQuestionsApp] = useState<JobApplication | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();

      if (token && token !== 'demo-token-local') {
        try {
          const apps = await getJobApplications(token);
          setApplications(apps);
          return;
        } catch {
          // Direct Supabase fallback
          if (isSupabaseConfigured() && user) {
            const { data, error } = await supabase
              .from('job_applications')
              .select('*, cv_versions(*)')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (data && !error) {
              setApplications(data as JobApplication[]);
              return;
            }
          }
        }
      }

      // Local storage fallback for demo
      const localStr = localStorage.getItem('strapy_ats_local_tracker_apps');
      if (localStr) {
        setApplications(JSON.parse(localStr));
      } else {
        // Initial sample demo data for new users
        const demoApps: JobApplication[] = [
          {
            id: 'demo-1',
            user_id: user?.id || 'demo-user',
            company_name: 'Mercado Libre',
            job_title: 'Senior Software Engineer — AI Systems',
            job_portal: 'linkedin',
            job_url: 'https://linkedin.com/jobs/view/sample1',
            ats_match_score: 94,
            status: 'interview',
            notes: 'Screening técnico superado con feedback positivo. Entrevista de arquitectura el martes.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            cv_versions: [{
              cv_json: {
                candidate_name: 'Alex R. Dev',
                candidate_title: 'Senior AI Engineer',
                summary: 'Senior Software Engineer con +5 años construyendo soluciones deterministas en Python y FastAPI.',
                skills_added: ['LangGraph', 'FastAPI', 'ChromaDB', 'Observabilidad'],
                experience_bullets: [
                  'Diseñó arquitectura RAG multi-agente reduciendo tiempos de respuesta en 64%.',
                  'Optimizó memoria a <50MB en Cloud Run con ChromaDB PersistentClient.',
                ],
                formatting_tips: ['Formato monocromo ATS estándar'],
              },
              interview_questions: [
                {
                  question: '¿Cómo manejas la concurrencia y los reintentos con backoff exponencial en FastAPI?',
                  focus_area: 'Arquitectura & Resiliencia',
                  suggested_answer_tip: 'Usa el método STAR mencionando middleware de timeouts y colas asíncronas.'
                }
              ]
            }]
          },
          {
            id: 'demo-2',
            user_id: user?.id || 'demo-user',
            company_name: 'NotCo',
            job_title: 'Full-Stack Developer (Next.js & Python)',
            job_portal: 'getonboard',
            job_url: 'https://getonbrd.com/jobs/sample2',
            ats_match_score: 88,
            status: 'applied',
            notes: 'CV adaptado enviado por portal. Contactado al Tech Lead por LinkedIn.',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: 'demo-3',
            user_id: user?.id || 'demo-user',
            company_name: 'Nubank',
            job_title: 'AI Product Engineer',
            job_portal: 'linkedin',
            job_url: 'https://linkedin.com/jobs/view/sample3',
            ats_match_score: 91,
            status: 'saved',
            notes: 'Vacante detectada con excelente match. Falta postular.',
            created_at: new Date().toISOString(),
          }
        ];
        setApplications(demoApps);
        localStorage.setItem('strapy_ats_local_tracker_apps', JSON.stringify(demoApps));
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: JobApplicationStatus) => {
    // Optimistic UI update
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));

    try {
      const token = await getAccessToken();
      if (token && token !== 'demo-token-local') {
        try {
          await updateJobApplication(id, { status: newStatus }, token);
          return;
        } catch {
          if (isSupabaseConfigured() && user) {
            await supabase
              .from('job_applications')
              .update({ status: newStatus })
              .eq('id', id)
              .eq('user_id', user.id);
            return;
          }
        }
      }

      // Local storage fallback
      const localApps = applications.map(app => app.id === id ? { ...app, status: newStatus } : app);
      localStorage.setItem('strapy_ats_local_tracker_apps', JSON.stringify(localApps));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));

    try {
      const token = await getAccessToken();
      if (token && token !== 'demo-token-local') {
        try {
          await deleteJobApplication(id, token);
          return;
        } catch {
          if (isSupabaseConfigured() && user) {
            await supabase
              .from('job_applications')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);
            return;
          }
        }
      }

      const localApps = applications.filter(app => app.id !== id);
      localStorage.setItem('strapy_ats_local_tracker_apps', JSON.stringify(localApps));
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const handleAddApplication = async (newApp: Partial<JobApplication>) => {
    const token = await getAccessToken();
    let created: JobApplication | null = null;

    if (token && token !== 'demo-token-local') {
      try {
        created = await createJobApplication(newApp, token);
      } catch {
        if (isSupabaseConfigured() && user) {
          const { data } = await supabase
            .from('job_applications')
            .insert({
              user_id: user.id,
              ...newApp,
            })
            .select()
            .single();
          if (data) created = data as JobApplication;
        }
      }
    }

    if (!created) {
      created = {
        id: `app-${Date.now()}`,
        user_id: user?.id || 'demo-user',
        company_name: newApp.company_name || 'Empresa',
        job_title: newApp.job_title || 'Cargo',
        job_portal: newApp.job_portal || 'manual',
        job_url: newApp.job_url,
        ats_match_score: newApp.ats_match_score || 0,
        status: newApp.status || 'saved',
        notes: newApp.notes,
        created_at: new Date().toISOString(),
      };
      const updated = [created, ...applications];
      localStorage.setItem('strapy_ats_local_tracker_apps', JSON.stringify(updated));
    }

    setApplications(prev => [created!, ...prev]);
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(q) ||
      app.job_title.toLowerCase().includes(q) ||
      (app.notes && app.notes.toLowerCase().includes(q))
    );
  });

  // Summary Metrics
  const totalApps = applications.length;
  const inProgressApps = applications.filter(a => a.status === 'applied' || a.status === 'interview').length;
  const offerApps = applications.filter(a => a.status === 'offer').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-200 border-[2px] border-surface-border rounded-lg p-4 sm:p-5 shadow-revi-sm">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              <Kanban className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight font-display">
              Tablero de Postulaciones
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Gestiona tus vacantes, accede a los CVs optimizados y revisa las preguntas de entrevista guardadas.
          </p>
        </div>

        {/* Stats Badges & Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="hidden sm:flex items-center gap-3 bg-surface-100 border border-surface-border px-3 py-1.5 rounded-md text-xs font-mono">
            <span className="text-slate-400">
              Total: <strong className="text-white">{totalApps}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-300">
              En proceso: <strong>{inProgressApps}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-300">
              Ofertas: <strong>{offerApps}</strong>
            </span>
          </div>

          <button
            onClick={() => loadApplications()}
            className="revi-btn h-10 px-3 bg-surface-100 hover:bg-surface-50 text-slate-300 border border-surface-border"
            title="Recargar postulaciones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="revi-btn h-10 px-4 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-2 shadow-revi-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Postulación</span>
          </button>
        </div>

      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa, cargo o palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface-200 border border-surface-border rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Kanban Board Grid (5 Columns) */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-surface-200 border-[2px] border-surface-border rounded-lg">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-cyan" />
            <span>Cargando tablero Kanban...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map(column => {
            const columnApps = filteredApplications.filter(app => app.status === column.id);

            return (
              <div 
                key={column.id} 
                className="bg-surface-200/90 border-[2px] border-surface-border rounded-lg flex flex-col min-h-[450px] overflow-hidden shadow-revi-sm font-sans"
              >
                {/* Column Header */}
                <div className={`p-3 border-b-[2px] border-surface-border flex items-center justify-between ${column.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{column.emoji}</span>
                    <h3 className={`text-xs font-bold tracking-tight uppercase font-mono ${column.color}`}>
                      {column.title}
                    </h3>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-surface-100 border border-surface-border text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[70vh]">
                  {columnApps.length > 0 ? (
                    columnApps.map(app => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDelete}
                        onViewCV={(targetApp) => setSelectedCVApp(targetApp)}
                        onViewQuestions={(targetApp) => setSelectedQuestionsApp(targetApp)}
                      />
                    ))
                  ) : (
                    <div className="h-32 border-2 border-dashed border-surface-border/60 rounded-md flex flex-col items-center justify-center text-slate-500 text-xs text-center p-3 font-mono">
                      <span>Sin vacantes</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddApplication}
      />

      {selectedCVApp && selectedCVApp.cv_versions && selectedCVApp.cv_versions.length > 0 && (
        <CVPreviewModal
          isOpen={!!selectedCVApp}
          onClose={() => setSelectedCVApp(null)}
          cv={selectedCVApp.cv_versions[0].cv_json}
          companyName={selectedCVApp.company_name}
          jobTitle={selectedCVApp.job_title}
        />
      )}

      {selectedQuestionsApp && selectedQuestionsApp.cv_versions && selectedQuestionsApp.cv_versions.length > 0 && (
        <InterviewQuestionsModal
          isOpen={!!selectedQuestionsApp}
          onClose={() => setSelectedQuestionsApp(null)}
          questions={selectedQuestionsApp.cv_versions[0].interview_questions || []}
          companyName={selectedQuestionsApp.company_name}
          jobTitle={selectedQuestionsApp.job_title}
        />
      )}

    </div>
  );
};
