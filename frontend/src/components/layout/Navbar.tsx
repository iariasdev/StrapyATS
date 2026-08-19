'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { checkBackendHealth } from '@/lib/api';
import { HealthResponse } from '@/lib/types';
import { 
  History, 
  Chrome,
  Kanban,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  onOpenHistory?: () => void;
  onOpenExtensionGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenExtensionGuide,
}) => {
  const { user, profile, plan, signInWithGoogle, signOut, loading } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      try {
        const data = await checkBackendHealth();
        if (mounted) {
          setHealth(data);
          setIsOnline(true);
        }
      } catch {
        if (mounted) {
          setIsOnline(false);
        }
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Candidato';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b-[2px] border-surface-border bg-surface-200/95 backdrop-blur-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & CierraLab Tool Tag */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 ring-1 ring-white/30 dark:ring-white/20 shrink-0 shadow-revi-sm flex items-center justify-center p-0.5">
              <img 
                src="/logo1whitenobackground.png" 
                alt="CierraLab Logo" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-display">
              Strapy<span className="text-brand-cyan">ATS</span>
            </span>
          </Link>

          <a
            href="https://www.cierralab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-300 bg-surface-100 border border-surface-border px-2 py-0.5 uppercase tracking-wider hover:text-white hover:border-brand-cyan/60 hover:bg-surface-50 transition-all cursor-pointer"
            title="Visitar CierraLab (www.cierralab.com)"
          >
            CierraLab Tool
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4 text-xs font-semibold text-slate-300">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded-md transition-colors ${pathname === '/' ? 'text-white bg-surface-100 font-bold' : 'hover:text-white hover:bg-surface-100/50'}`}
            >
              Auditor ATS
            </Link>
            <Link 
              href="/tracker" 
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${pathname === '/tracker' ? 'text-white bg-surface-100 font-bold' : 'hover:text-white hover:bg-surface-100/50'}`}
            >
              <Kanban className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Tracker Kanban</span>
              {plan === 'pro' && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-bold">PRO</span>
              )}
            </Link>
          </nav>
        </div>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-sans">
          
          {/* Tracker Quick Link for Mobile */}
          <Link
            href="/tracker"
            className="md:hidden revi-btn h-10 px-3 bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-bold flex items-center"
            title="Tablero Tracker"
          >
            <Kanban className="w-4 h-4 text-brand-cyan" />
          </Link>

          {/* History Button */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="revi-btn h-10 px-3.5 bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-bold"
              title="Historial de análisis locales"
            >
              <History className="w-4 h-4 text-slate-400 mr-1.5" />
              <span className="hidden sm:inline">Historial</span>
            </button>
          )}

          {/* Chrome Extension Button */}
          {onOpenExtensionGuide && (
            <button
              onClick={onOpenExtensionGuide}
              className="revi-btn h-10 px-3.5 bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-bold"
              title="Extensión para LinkedIn y Portales"
            >
              <Chrome className="w-4 h-4 text-slate-400 mr-1.5" />
              <span className="hidden sm:inline">Extensión</span>
            </button>
          )}

          {/* User Auth Section */}
          {loading ? (
            <div className="h-10 w-28 bg-surface-100 animate-pulse rounded-md border border-surface-border"></div>
          ) : user ? (
            /* Logged in User Menu */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="revi-btn h-10 px-3 bg-surface-100 hover:bg-surface-50 text-white flex items-center gap-2 border border-surface-border"
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                    {initial}
                  </div>
                )}
                <span className="font-semibold text-xs max-w-[100px] truncate hidden sm:inline">
                  {displayName}
                </span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                  plan === 'pro' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {plan === 'pro' ? 'PRO' : 'FREE'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface-100 border border-surface-border shadow-revi-lg py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-surface-border/60">
                    <p className="font-bold text-white truncate">{displayName}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Plan actual:</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        plan === 'pro' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {plan === 'pro' ? '⭐ Pro Ilimitado' : '✅ Free (10/día)'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/tracker"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-200 hover:bg-surface-50 hover:text-white transition-colors"
                  >
                    <Kanban className="w-4 h-4 text-brand-cyan" />
                    <span>Mi Tracker Kanban</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-200 hover:bg-surface-50 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Mi Perfil de Candidato</span>
                  </Link>

                  <div className="border-t border-surface-border/60 my-1"></div>

                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-rose-300 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out Button */
            <button
              onClick={() => signInWithGoogle()}
              className="revi-btn h-10 px-4 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-2 shadow-revi-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              <span>Iniciar sesión</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
