'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Camera, LogOut, Settings } from 'lucide-react';
import { cn } from '@/shared/lib';
import { useUserProfile, useSupabaseAuth, useNotifications } from '@/shared/hooks';

export const MobileHeader = () => {
  const router = useRouter();
  const { profile, isUploading, uploadAvatar } = useUserProfile();
  const { logout } = useSupabaseAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
      setShowProfileMenu(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  return (
    <header className={cn(
      'md:hidden',
      'sticky top-0 z-40',
      'bg-gradient-to-b from-[#0A101F]/98 to-[#0A101F]/90',
      'backdrop-blur-xl',
      'border-b border-white/5',
      'px-3 sm:px-4 py-2.5 sm:py-3'
    )}>
      {/* Input oculto para upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      <div className="flex items-center justify-between">
        {/* Espaço esquerdo para balancear */}
        <div className="w-16 sm:w-20" />

        {/* Logo Centralizada */}
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
              {unreadCount > 0 && (
                <span className={cn(
                  'absolute -top-0.5 -right-0.5',
                  'h-4 w-4 flex items-center justify-center',
                  'bg-red-500 text-white text-[10px] font-bold',
                  'rounded-full'
                )}>
                  {unreadCount > 9 ? '9+' : unreadCount}
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
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-3 hover:bg-white/5 transition-colors cursor-pointer",
                          !n.read && 'bg-blue-500/5'
                        )}
                        onClick={() => {
                          if (n.link) {
                            router.push(n.link);
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-white">{n.title}</span>
                          <span className={cn(
                            "text-[10px]",
                            n.priority === 'high' ? 'text-red-400' : 'text-slate-500'
                          )}>{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.description}</p>
                      </div>
                    )) : (
                      <div className="p-6 text-center">
                        <p className="text-xs text-slate-400">Nenhuma notificação 🎉</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-white/10">
                      <button 
                        className="w-full text-xs text-blue-400 hover:text-blue-300 py-1"
                        onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                      >
                        Marcar todas como lidas
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar com Menu */}
          <div className="relative" ref={profileRef}>
            <motion.div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={cn(
                'h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden cursor-pointer',
                'border-2 border-blue-400/30',
                'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
                isUploading && 'opacity-50'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-bold text-blue-400">
                  {profile?.name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>

            {/* Menu de Perfil */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full right-0 mt-2',
                    'w-56 overflow-hidden',
                    'bg-gradient-to-b from-[#1e293b]/98 to-[#111827]/98',
                    'border border-blue-500/20 rounded-2xl',
                    'shadow-xl shadow-blue-500/10',
                    'backdrop-blur-xl'
                  )}
                >
                  {/* Cabeçalho do perfil */}
                  <div className="p-3 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={cn(
                          'h-10 w-10 rounded-full overflow-hidden',
                          'border-2 border-blue-400/30'
                        )}>
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-lg font-bold text-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                              {profile?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className={cn(
                            'absolute -bottom-1 -right-1 p-1 rounded-full',
                            'bg-blue-500 hover:bg-blue-400 text-white',
                            'transition-all duration-150',
                            'shadow-lg shadow-blue-500/30'
                          )}
                        >
                          <Camera size={10} />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {profile?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {profile?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opções */}
                  <div className="py-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Camera size={16} className="text-blue-400" />
                      <span className="text-xs">{profile?.avatar_url ? 'Alterar foto' : 'Adicionar foto'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/dashboard/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings size={16} className="text-purple-400" />
                      <span className="text-xs">Configurações</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10" />

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      <span className="text-xs">Sair da conta</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
