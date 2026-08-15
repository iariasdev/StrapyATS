import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STRAPY ATS | Optimización de CV & Auditoría de Filtros ATS',
  description: 'Audita y optimiza tu currículum contra filtros Workday, Taleo y Greenhouse en segundos con inteligencia determinista. Powered by CierraLab.',
  keywords: [
    'ATS Resume',
    'CV Optimizer',
    'LangGraph',
    'FastAPI',
    'ChromaDB',
    'Langfuse',
    'Next.js 14',
    'CierraLab',
    'AI Recruiter',
  ],
  authors: [{ name: '@realstrapy — CierraLab' }],
};

export const viewport: Viewport = {
  themeColor: '#0c0d12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-brand-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
