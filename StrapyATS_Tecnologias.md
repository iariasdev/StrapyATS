## 🖥️ Frontend Web (Next.js 14 & React 18)

| Tecnología | Nivel | Uso Real en StrapyATS |
|---|---|---|
| **Next.js 14 (App Router)** | Sólido | Framework full-stack. Server Components, Client Components y Server Actions |
| **React 18** | Sólido | Composición de componentes modulares, Custom Hooks, gestión de estado reactivo |
| **TypeScript 5.5** | Sólido | Tipado estricto de extremo a extremo (interfaces de análisis, esquemas de Match, props) |
| **Tailwind CSS v3** | Sólido | Sistema de diseño moderno, Dark Mode nativo, micro-animaciones, glassmorphism |
| **Lucide React** | Sólido | Iconografía moderna, consistente y accesible |
| **PDF.js (`pdfjs-dist`)** | Sólido | Parseo y extracción de texto de currículums en PDF 100% en el navegador (Zero-Server-Cost) |
| **CSS Print Rules (`window.print`)** | Sólido | Generación y exportación de PDFs ATS estándar A4 limpios de 1 página directamente desde el cliente sin sobrecargar el servidor |
| **BYOK (Bring Your Own Key)** | Sólido | Almacenamiento local cifrado/persistente en `localStorage` con validación de modelos sin retención en backend |

### Optimizaciones de rendimiento aplicadas en Frontend
- **Zero-Server-Cost Architecture:** Todo el procesamiento pesado de PDFs y renderizado se realiza en el navegador del cliente para mantener el servidor con consumo $0.
- **Client-Side PDF Parsing:** Extracción de texto con Web Workers para no congelar el hilo principal de la UI.
- **Modular Component Isolation:** Componentes desacoplados (`ScoreGauge`, `BYOKModal`, `TechProof`, `ResultsDashboard`, `ATSResumeView`).

---

## ⚙️ Backend & AI Engineering (Python & LangGraph)

> **Lo que uso en el código del servidor y la arquitectura de Inteligencia Artificial:**

| Tecnología / Librería | Nivel | Uso Real en el Código Backend |
|---|---|---|
| **Python 3.11+** | Sólido | Runtime asíncrono tipado para APIs de alto rendimiento |
| **FastAPI** | Sólido | Framework web asíncrono (`async/await`) con endpoints de streaming, análisis y CORS seguro |
| **LangGraph (`StateGraph`)** | Sólido | Orquestación de sistemas multi-agente basados en grafos dirigidos con estado compartido (`AgentState`) |
| **ChromaDB** | Sólido | Base de datos vectorial persistida en disco para RAG, indexación semántica del CV y detección de brechas (Gap Analysis) |
| **Pydantic v2** | Sólido | Validación estricta de esquemas, serialización y parseo de respuestas JSON estructuradas con regex fallback |
| **Multi-Provider Fallback (LangChain)** | Sólido | Conectores dinámicos para Google Gemini, OpenAI, Claude, DeepSeek y Groq con redundancia automática |
| **pdfplumber** | Sólido | Motor de extracción y saneamiento de PDFs en backend para fallback |
| **BeautifulSoup4 + lxml + httpx** | Sólido | Ingesta y normalización asíncrona de ofertas laborales desde URLs de LinkedIn y Get on Board |
| **Langfuse** | Intermedio | Observabilidad, trazabilidad de llamadas a LLMs, latencias y auditoría de tokens |

### Arquitectura del Grafo Multi-Agente (LangGraph Workflow)
1. **`IngestNode`:** Limpieza, normalización y extracción de keywords y requisitos de la oferta laboral.
2. **`AuditNode` / RAG (ChromaDB):** Comparación semántica vectorial del CV contra la oferta para encontrar coincidencias y faltantes.
3. **`MatchScoreNode`:** Cálculo determinístico y ponderado del puntaje de compatibilidad ATS (0 a 100).
4. **`RewriteSTARNode`:** Reescritura de viñetas de experiencia laboral aplicando la metodología STAR (Situación, Tarea, Acción, Resultado).
5. **`TechQuestionsNode`:** Generación de preguntas técnicas de entrevista simuladas con respuestas sugeridas.

---

## 🧩 Extensión de Google Chrome (Web Extension Manifest V3)

> **Lo que uso para la integración directa con portales de empleo:**

| Componente | Tipo | Uso Real |
|---|---|---|
| **Manifest V3** | Arquitectura | Estándar moderno y seguro de extensiones de Google Chrome |
| **Content Scripts (`content_script.js`)** | DOM Manipulation | Inyección en el DOM de portales como LinkedIn, Get on Board, Computrabajo e Indeed para scrapear ofertas y autocompletar formularios |
| **Web Bridge (`web_bridge.js`)** | Comunicación | Puente bidireccional mediante `window.postMessage` entre la aplicación web de StrapyATS y la extensión de Chrome |
| **Background Service Worker (`background.js`)** | Eventos | Manejo de ciclo de vida, eventos en segundo plano y almacenamiento local sincronizado (`chrome.storage.local`) |

---

## ☁️ Google Cloud Platform (GCP) & Despliegue Cloud

> **Lo que uso para la infraestructura y despliegue a producción:**

| Servicio de Nube | Tipo | Uso Real en la Infraestructura |
|---|---|---|
| **Google Cloud Run** | Containerized Serverless | Motor serverless en la nube que ejecuta el contenedor Docker de FastAPI escalando a 0 instancias si no hay tráfico (Costo $0) |
| **Google Cloud Build** | CI/CD Serverless | Pipeline automatizado en `cloudbuild.yaml` que compila la imagen Docker al hacer push |
| **Google Artifact Registry** | Container Registry | Repositorio privado en la nube de Google (`us-central1-docker.pkg.dev`) para almacenar versiones seguras de la imagen |
| **Vercel** | Edge Network | Alojamiento y despliegue continuo de la aplicación Frontend en Next.js 14 |
| **Docker (Multi-Stage)** | Contenedorización | Imagen ligera `python:3.11-slim` con optimización de caché de capas y sin archivos temporales |

---

## 🔧 DevOps, Testing y Buenas Prácticas

| Herramienta | Uso Real |
|---|---|
| **Docker & Dockerfile** | Empaquetado reproducible y portabilidad de entornos de ejecución |
| **Git + GitHub** | Control de versiones, ramas por feature, commits semánticos |
| **Pyright / Pydantic Typing** | Validación estricta de tipos estáticos en Python para evitar bugs en producción |
| **ESLint & TypeScript Compiler** | Tipado y linting estricto en el frontend para consistencia de código |

---

## 💬 Lo que sé responder en entrevista sin dudar (Guía Rápida)

- **Si te preguntan por Arquitectura de Inteligencia Artificial (AI Engineering):**
  > *"En StrapyATS no utilicé simples llamadas sueltas a APIs de OpenAI o Gemini. Diseñé una arquitectura de grafos de estado con **LangGraph**, donde cada paso (ingesta, auditoría RAG con **ChromaDB**, cálculo del Match Score, reescritura STAR y preguntas técnicas) es un nodo independiente con estado tipado. Además, implementé un sistema multi-proveedor con fallback automático que soporta Gemini, OpenAI, Claude, DeepSeek y Groq bajo una arquitectura BYOK."*

- **Si te preguntan por Backend y Rendimiento en Python:**
  > *"El backend está construido en **FastAPI** con **Python 3.11** asíncrono (`async/await`) y **Pydantic v2** para garantizar esquemas de datos estrictos. Toda la extracción de ofertas web se realiza de forma no bloqueante con `httpx` y `BeautifulSoup`, y el backend está completamente dockerizado para correr en **Google Cloud Run** escalando a 0 cuando no hay uso."*

- **Si te preguntan por Frontend y Rendimiento (Next.js):**
  > *"Utilicé **Next.js 14 con App Router y TypeScript**. Para optimizar los costos de servidor al 100%, diseñé una arquitectura donde el parseo de PDFs (`pdfjs-dist`) y la generación de currículums ATS se realizan directamente en el navegador del cliente utilizando reglas de impresión CSS y Web Workers, manteniendo el backend enfocado exclusivamente en inferencia de IA."*

- **Si te preguntan por Contenedores y Nube (Docker / GCP):**
  > *"Todo el backend se empaqueta en una imagen **Docker** basada en `python:3.11-slim` con optimización de capas de caché. La integración continua está configurada en `cloudbuild.yaml`, donde **Google Cloud Build** compila la imagen, la almacena en **Artifact Registry** y la despliega automáticamente en **Cloud Run** como un servicio serverless contenerizado."*

- **Si te preguntan por la Extensión de Chrome:**
  > *"Desarrollé una extensión bajo **Manifest V3** que se comunica bidireccionalmente con la web mediante un `Web Bridge` con `window.postMessage`. Inyecta scripts en portales como LinkedIn y Get on Board para extraer la información estructurada de las ofertas con un solo clic."*

---

## 💡 Cómo defender conceptos avanzados (Ej: RAG, LangChain vs LangGraph)

- **¿Por qué LangGraph en lugar de LangChain simple?**:  
  *"LangChain tradicional suele estructurarse en cadenas lineales (chains), lo cual es frágil para flujos complejos. **LangGraph** permite crear grafos de estado cíclicos con memoria compartida (`AgentState`), permitiendo bifurcaciones, bucles de reintento, nodos de validación de calidad y mayor control determinístico sobre la ejecución de los agentes."*
- **¿Por qué ChromaDB local y no Pinecone / Weaviate en la nube?**:  
  *"Para este caso de uso, ChromaDB persistido en disco o memoria local ofrece latencias ultra bajas en milisegundos sin costos recurrentes de infraestructura cloud ni dependencias externas de red para indexar el contexto del CV del usuario."*
