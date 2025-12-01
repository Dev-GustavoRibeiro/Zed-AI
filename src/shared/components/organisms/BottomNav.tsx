'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Wallet,
  ListTodo,
  MoreHorizontal,
  Target,
  Timer,
  CheckSquare,
  BookOpen,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib';

// Itens principais da navegação (5 itens)
const mainNavItems = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard', color: 'blue' },
  { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat', color: 'purple' },
  { icon: ListTodo, label: 'Rotina', href: '/dashboard/routine', color: 'emerald' },
  { icon: Wallet, label: 'Finanças', href: '/dashboard/finances', color: 'amber' },
  { icon: MoreHorizontal, label: 'Mais', href: '#more', color: 'slate' },
];

// Itens do menu "Mais"
const moreMenuItems = [
  { icon: Calendar, label: 'Agenda', href: '/dashboard/schedule', color: 'indigo', description: 'Eventos e compromissos' },
  { icon: Target, label: 'Metas', href: '/dashboard/goals', color: 'violet', description: 'Objetivos pessoais' },
  { icon: Timer, label: 'Timer de Foco', href: '/dashboard/focus', color: 'blue', description: 'Pomodoro e concentração' },
  { icon: CheckSquare, label: 'Checklists', href: '/dashboard/checklists', color: 'orange', description: 'Listas de verificação' },
  { icon: BookOpen, label: 'Diário', href: '/dashboard/journal', color: 'pink', description: 'Registro pessoal' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings', color: 'slate', description: 'Ajustes do sistema' },
];

const colorMap: Record<string, { active: string; icon: string; indicator: string; bg: string }> = {
  blue: { active: 'bg-blue-500/20', icon: 'text-blue-400', indicator: 'bg-blue-400', bg: 'bg-blue-500/10' },
  purple: { active: 'bg-purple-500/20', icon: 'text-purple-400', indicator: 'bg-purple-400', bg: 'bg-purple-500/10' },
  emerald: { active: 'bg-emerald-500/20', icon: 'text-emerald-400', indicator: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
  amber: { active: 'bg-amber-500/20', icon: 'text-amber-400', indicator: 'bg-amber-400', bg: 'bg-amber-500/10' },
  indigo: { active: 'bg-indigo-500/20', icon: 'text-indigo-400', indicator: 'bg-indigo-400', bg: 'bg-indigo-500/10' },
  slate: { active: 'bg-slate-500/20', icon: 'text-slate-400', indicator: 'bg-slate-400', bg: 'bg-slate-500/10' },
  violet: { active: 'bg-violet-500/20', icon: 'text-violet-400', indicator: 'bg-violet-400', bg: 'bg-violet-500/10' },
  orange: { active: 'bg-orange-500/20', icon: 'text-orange-400', indicator: 'bg-orange-400', bg: 'bg-orange-500/10' },
  pink: { active: 'bg-pink-500/20', icon: 'text-pink-400', indicator: 'bg-pink-400', bg: 'bg-pink-500/10' },
};

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    if (href === '#more') {
      // Verificar se algum item do menu "Mais" está ativo
      return moreMenuItems.some(item => pathname.startsWith(item.href));
    }
    return pathname.startsWith(href);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleMenuItemClick = (href: string) => {
    setShowMoreMenu(false);
    router.push(href);
  };

  return (
    <>
      {/* Overlay escuro quando o menu está aberto */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu "Mais" expandido */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-[70px] left-2 right-2 z-50',
              'md:hidden',
              'bg-gradient-to-b from-[#1e293b]/98 to-[#111827]/98',
              'border border-white/10 rounded-2xl',
              'backdrop-blur-xl',
              'shadow-xl shadow-black/30',
              'p-3',
              'max-h-[60vh] overflow-y-auto'
            )}
          >
            {/* Header do menu */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Mais opções</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid de itens */}
            <div className="grid grid-cols-2 gap-2">
              {moreMenuItems.map((item) => {
                const active = pathname.startsWith(item.href);
                const colors = colorMap[item.color];

                return (
                  <motion.button
                    key={item.href}
                    onClick={() => handleMenuItemClick(item.href)}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-xl text-left',
                      'transition-all duration-200',
                      active ? colors.active : 'bg-white/5 hover:bg-white/10'
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      'p-2 rounded-lg mb-2',
                      colors.bg
                    )}>
                      <item.icon size={20} className={colors.icon} />
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      active ? 'text-white' : 'text-slate-300'
                    )}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {item.description}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegação inferior principal */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'md:hidden',
        'bg-gradient-to-t from-[#0A101F]/98 to-[#111827]/95',
        'border-t border-white/10',
        'backdrop-blur-xl',
        'safe-area-bottom'
      )}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around px-2 py-1.5 sm:py-2">
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              const colors = colorMap[item.color];
              const isMoreButton = item.href === '#more';

              if (isMoreButton) {
                return (
                  <button
                    key={item.href}
                    onClick={handleMoreClick}
                    className="flex-1 max-w-[80px]"
                  >
                    <motion.div
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 px-2 rounded-xl mx-0.5',
                        'transition-all duration-200',
                        showMoreMenu || active ? colors.active : 'hover:bg-white/5'
                      )}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon
                        size={20}
                        strokeWidth={showMoreMenu || active ? 2.5 : 2}
                        className={cn(
                          'transition-colors duration-200',
                          showMoreMenu || active ? colors.icon : 'text-slate-400'
                        )}
                      />
                      <span className={cn(
                        'text-[10px] sm:text-xs font-medium transition-colors duration-200',
                        showMoreMenu || active ? 'text-white' : 'text-slate-500'
                      )}>
                        {item.label}
                      </span>
                      {(showMoreMenu || active) && (
                        <motion.div
                          layoutId="bottomNavIndicator"
                          className={cn(
                            'absolute -bottom-0.5 w-6 sm:w-8 h-0.5 rounded-full',
                            colors.indicator
                          )}
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </button>
                );
              }

              return (
                <Link key={item.href} href={item.href} className="flex-1 max-w-[80px]">
                  <motion.div
                    className={cn(
                      'relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 px-2 rounded-xl mx-0.5',
                      'transition-all duration-200',
                      active ? colors.active : 'hover:bg-white/5'
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={active ? 2.5 : 2}
                      className={cn(
                        'transition-colors duration-200',
                        active ? colors.icon : 'text-slate-400'
                      )}
                    />
                    <span className={cn(
                      'text-[10px] sm:text-xs font-medium transition-colors duration-200',
                      active ? 'text-white' : 'text-slate-500'
                    )}>
                      {item.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className={cn(
                          'absolute -bottom-0.5 w-6 sm:w-8 h-0.5 rounded-full',
                          colors.indicator
                        )}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
