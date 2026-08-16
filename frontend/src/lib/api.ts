import { AnalyzeResponse, HealthResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
const ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${ROOT_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Short timeout to fail fast if offline
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    throw new Error(`Backend offline: ${err?.message || 'Connection refused'}`);
  }
}

export interface AnalyzePayload {
  cvFile?: File | null;
  cvText?: string;
  jobOfferText: string;
  byokApiKey?: string;
  byokProvider?: string;
  preferredModel?: string;
}

export async function analyzeCV(payload: AnalyzePayload): Promise<AnalyzeResponse> {
  const formData = new FormData();
  
  if (payload.cvFile) {
    formData.append('cv_file', payload.cvFile);
  } else if (payload.cvText && payload.cvText.trim()) {
    formData.append('cv_text', payload.cvText.trim());
  } else {
    throw new Error('Debes subir un archivo PDF de tu CV o pegar el texto de tu currículum.');
  }

  if (!payload.jobOfferText || payload.jobOfferText.trim().length < 20) {
    throw new Error('Por favor ingresa la descripción completa de la oferta laboral (mínimo 20 caracteres).');
  }

  formData.append('job_offer_text', payload.jobOfferText.trim());

  if (payload.byokApiKey && payload.byokApiKey.trim()) {
    formData.append('byok_api_key', payload.byokApiKey.trim());
  }

  if (payload.byokProvider && payload.byokProvider.trim()) {
    formData.append('byok_provider', payload.byokProvider.trim());
  }

  if (payload.preferredModel && payload.preferredModel.trim()) {
    formData.append('model_name', payload.preferredModel.trim());
  }

  const endpoint = `${API_BASE_URL}/analyze`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMessage = `Error del servidor (${res.status})`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use default message
      }
      throw new Error(errorMessage);
    }

    const data: AnalyzeResponse = await res.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'No se pudo conectar con el servidor backend FastAPI en ' + API_BASE_URL + 
        '. Asegúrate de que el backend esté corriendo en http://localhost:8000.'
      );
    }
    throw error;
  }
}

export function getMockDemoAnalysis(): AnalyzeResponse {
  return {
    match_score: 88,
    seniority_match: 'Senior AI Engineer / Full-Stack Lead',
    summary_verdict: 'El candidato demuestra una fuerte base en arquitectura asíncrona con Python (FastAPI) y ecosistemas de Inteligencia Artificial Generativa. Para maximizar el pase en filtros ATS de nivel Enterprise, se requiere explicitar métricas de reducción de latencia en LangGraph, uso de ChromaDB persistente en disco y trazabilidad con Langfuse Cloud.',
    ats_gaps: [
      {
        keyword: 'ChromaDB PersistentClient',
        importance: 'critical',
        context: 'La vacante exige vectorización RAG optimizada para bajo consumo de memoria RAM en entornos Docker serverless.',
        recommendation: 'Incorporar en la sección de experiencia técnica: "Arquitectura RAG basada en ChromaDB PersistentClient manteniendo la huella de memoria en <50MB en Google Cloud Run".',
      },
      {
        keyword: 'Langfuse Observability',
        importance: 'high',
        context: 'Monitoreo de latencia P95, conteo de tokens y evaluación de alucinaciones en cadenas multi-agente.',
        recommendation: 'Añadir viñeta: "Implementación de observabilidad de LLMs end-to-end con Langfuse Cloud para tracking de costos y auditoría de prompts".',
      },
      {
        keyword: 'Rate Limiting & FinOps',
        importance: 'medium',
        context: 'Control de costos y protección contra denegación de servicio en endpoints de IA pública.',
        recommendation: 'Mencionar: "Diseño de capa de FinOps con Rate Limiter por IP y soporte BYOK (Bring Your Own Key) para $0 costo operativo".',
      },
    ],
    rewritten_cv: {
      summary: 'Senior Full-Stack & AI Systems Engineer con +5 años de experiencia diseñando arquitecturas distribuidas, pipelines deterministas con LangGraph y sistemas RAG escalables. Especialista en optimización de inferencia con Google Gemini, persistencia vectorial en ChromaDB y observabilidad continua mediante Langfuse Cloud. Historial comprobado desplegando microservicios asíncronos en FastAPI y contenedores Docker serverless en GCP Cloud Run con coste $0 de infraestructura.',
      experience_bullets: [
        'Lideró el diseño e implementación de un motor RAG multi-agente determinista utilizando LangGraph y FastAPI, reduciendo el tiempo de procesamiento de documentos en un 64%.',
        'Optimizó el consumo de memoria RAM de 512MB a 48MB mediante la migración a ChromaDB PersistentClient sobre volúmenes persistentes en disco.',
        'Integró observabilidad integral con Langfuse Cloud, logrando trazabilidad del 100% de llamadas a LLM y monitoreo de latencia P95 en producción.',
        'Desarrolló extensiones Chrome Manifest v3 y dashboards interactivos en Next.js 14 con generación de reportes PDF vectoriales en el cliente sin carga para el servidor.',
        'Configuró políticas de FinOps y limitación de tasa por IP con soporte BYOK (Google AI Studio API), garantizando 99.9% de uptime bajo cuotas gratuitas de Cloud Run.',
      ],
      skills_added: [
        'LangGraph (Multi-Node Graphs)',
        'ChromaDB PersistentClient',
        'Langfuse Cloud Tracing',
        'Google Gemini Flash API',
        'FastAPI & Pydantic v2',
        'Next.js 14 App Router',
        'GCP Cloud Run Serverless',
        'Chrome Extensions (Manifest v3)',
      ],
      formatting_tips: [
        'Utilizar tipografía estándar ATS-friendly (Inter, Arial o Calibri) con tamaño de fuente entre 10pt y 12pt.',
        'Evitar columnas múltiples o tablas anidadas en el encabezado para garantizar el 100% de legibilidad en escáneres Workday/Taleo/Greenhouse.',
        'Mantener los encabezados estándar de sección: "EXPERIENCIA PROFESIONAL", "HABILIDADES TÉCNICAS", "PROYECTOS DESTACADOS" y "EDUCACIÓN".',
      ],
    },
    cover_letter: `Estimado Equipo de Selección,

Le escribo con gran entusiasmo para presentar mi candidatura al puesto de Senior AI Engineer en su equipo. Habiendo analizado en detalle los desafíos técnicos de la vacante, estoy convencido de que mi trayectoria construyendo sistemas deterministas con LangGraph, pipelines RAG optimizados con ChromaDB y servicios de alta concurrencia en FastAPI aportará valor inmediato a sus objetivos.

A lo largo de mi carrera me he enfocado en crear soluciones de IA no solo precisas, sino altamente eficientes y observables. En mis proyectos recientes, implementé arquitecturas multi-agente que reducen la latencia de inferencia y aseguran trazabilidad completa de costos y tokens mediante Langfuse Cloud. Asimismo, optimicé infraestructuras serverless en Google Cloud Run y diseñé experiencias de usuario fluidas con Next.js y extensiones de navegador.

Me motiva profundamente la oportunidad de aportar mi experiencia en ingeniería de software robusta, buenas prácticas de desarrollo y mentalidad FinOps para escalar los productos de su organización.

Agradezco de antemano su tiempo y consideración, y quedo a su total disposición para profundizar en una entrevista técnica.

Atentamente,
Candidato Destacado — Powered by StrapyATS`,
    interview_questions: [
      {
        question: '¿Cómo garantizas la reproducibilidad y previenes loops infinitos en un pipeline multi-nodo con LangGraph cuando un nodo LLM produce una salida inesperada?',
        focus_area: 'LangGraph & Control de Flujo Determinista',
        suggested_answer_tip: 'Estructura tu respuesta usando el método STAR: Explica el uso de tipado estricto con Pydantic en el State, definición de transiciones condicionales con guardas de fallback y límites de iteración máximos (recursion_limit) antes de escalar a un estado de error controlado.',
      },
      {
        question: '¿Por qué optar por ChromaDB PersistentClient sobre almacenamiento en disco en lugar de una base de datos vectorial administrada o memoria RAM en Cloud Run?',
        focus_area: 'Arquitectura RAG & FinOps',
        suggested_answer_tip: 'Detalla cómo el almacenamiento en disco local o volumen montado mantiene la RAM por debajo de los 50MB, evitando fugas de memoria OOM (Out Of Memory) en contenedores de 512MB de Cloud Run y eliminando costos fijos de servidores Postgres/pgvector dedicados.',
      },
      {
        question: '¿Qué métricas específicas monitoreas en Langfuse Cloud para evaluar la calidad y la salud financiera de una aplicación LLM en producción?',
        focus_area: 'Observabilidad & Monitoreo de LLMs',
        suggested_answer_tip: 'Menciona latencia P95/P99 por nodo, tasa de tokens de entrada vs salida, costos agregados diarios, y feedback scores (relevance, hallucination score) asociados a cada ID de sesión o traza de usuario.',
      },
      {
        question: '¿Cómo manejas la concurrencia y la extracción de datos en tiempo real desde una extensión de Chrome sin bloquear el hilo principal del DOM?',
        focus_area: 'Frontend & Chrome Extensions (Manifest v3)',
        suggested_answer_tip: 'Explica la comunicación asíncrona mediante chrome.runtime.sendMessage entre el content_script y el Service Worker de fondo, y cómo se delega el parsing pesado a Web Workers o directamente al backend vía streaming.',
      },
      {
        question: 'En un escenario de alta demanda donde se agotan las cuotas gratuitas de Google AI Studio, ¿qué estrategia de resiliencia aplicas?',
        focus_area: 'Resiliencia & Rate Limiting',
        suggested_answer_tip: 'Describe la arquitectura con Rate Limiter en FastAPI por IP, cola de reintentos exponenciales con jitter, y el mecanismo de conmutación a BYOK (Bring Your Own Key) para permitir que los usuarios suministren su propia credencial.',
      },
    ],
    langfuse_trace_url: 'https://cloud.langfuse.com/project/strapy-ats-demo/traces/tr-8f4b29',
    rate_limit_remaining: 2,
  };
}

export async function extractPdfText(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/extract-pdf-text`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Error al extraer texto del PDF (${res.status})`);
  }

  const data = await res.json();
  return data.text || '';
}

export interface ExtractedJobResult {
  title: string;
  company: string;
  location?: string;
  full_text: string;
  url: string;
  source: string;
}

export async function extractJobFromUrl(url: string): Promise<ExtractedJobResult> {
  const res = await fetch(`${API_BASE_URL}/extract-job-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Error al extraer la oferta (${res.status})`);
  }

  return await res.json();
}


