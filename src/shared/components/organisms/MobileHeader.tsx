'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import { cn } from '@/shared/lib';

interface MobileHeaderProps {
  user?: {
    name?: string;
    avatar?: string;
  };
}

export const MobileHeader = ({ user }: MobileHeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'Nova mensagem', description: 'Zed enviou uma resposta', time: 'Agora' },
    { id: 2, title: 'Lembrete', description: 'Reunião em 30 minutos', time: '30min' },
    { id: 3, title: 'Meta atingida!', description: 'Parabéns pela conquista', time: '2h' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className={cn(
      'md:hidden', // Apenas mobile (< 768px)
      'sticky top-0 z-40',
      'bg-gradient-to-b from-[#0A101F]/98 to-[#0A101F]/90',
      'backdrop-blur-xl',
      'border-b border-white/5',
      'px-3 sm:px-4 py-2.5 sm:py-3'
    )}>
      <div className="flex items-center justify-between">
        {/* Espaço esquerdo para balancear (em mobile) */}
        <div className="flex items-center gap-2 w-20 sm:w-auto">
          {/* Ações à esquerda - escondido em mobile pequeno */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/dashboard/settings">
              <motion.div
                className={cn(
                  'p-2 rounded-full',
                  'bg-white/5 hover:bg-white/10',
                  'transition-colors duration-200'
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Settings size={18} className="text-slate-300" />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Logo Centralizada - maior e sem texto */}
        <Link href="/dashboard" className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <motion.img
            src="/logo.png"
            alt="ZED Logo"
            className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
            whileTap={{ scale: 0.95 }}
          />
        </Link>

        {/* Ações à direita */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notificações */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                'relative p-1.5 sm:p-2 rounded-full',
                'bg-white/5 hover:bg-white/10',
                'transition-colors duration-200'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={18} className="text-slate-300" />
              {notificationCount > 0 && (
                <span className={cn(
                  'absolute -top-0.5 -right-0.5',
                  'h-4 w-4 flex items-center justify-center',
                  'bg-red-500 text-white text-[10px] font-bold',
                  'rounded-full'
                )}>
                  {notificationCount}
                </span>
              )}
            </motion.button>

            {/* Dropdown de Notificações */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full right-0 mt-2',
                    'w-64 sm:w-72 max-h-80 overflow-y-auto',
                    'bg-gradient-to-b from-[#1e293b]/98 to-[#111827]/98',
                    'border border-white/10 rounded-2xl',
                    'shadow-xl shadow-black/30',
                    'backdrop-blur-xl'
                  )}
                >
                  <div className="p-3 border-b border-white/10">
                    <span className="text-sm font-semibold text-white">Notificações</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {notifications && notifications.length > 0 ? notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{n.description}</p>
                      </div>
                    )) : null}
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button className="w-full text-xs text-blue-400 hover:text-blue-300 py-1">
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Configurações - apenas em mobile pequeno */}
          <Link href="/dashboard/settings" className="sm:hidden">
            <motion.div
              className={cn(
                'p-1.5 rounded-full',
                'bg-white/5 hover:bg-white/10',
                'transition-colors duration-200'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={18} className="text-slate-300" />
            </motion.div>
          </Link>

          {/* Avatar */}
          <motion.div
            className={cn(
              'h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden',
              'border-2 border-blue-400/30',
              'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
            )}
            whileTap={{ scale: 0.95 }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-bold text-blue-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
};
