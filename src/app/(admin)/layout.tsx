'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Bell,
  Search,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAdmin } from '@/shared/hooks/useAdmin'
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { Avatar } from '@/shared/components/atoms/Avatar'
import { Button } from '@/shared/components/atoms/Button'
import { BackgroundGradient } from '@/shared/components/organisms/BackgroundGradient'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', color: 'blue' },
  { icon: Users, label: 'Usuários', href: '/admin/users', color: 'emerald' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', color: 'purple' },
  { icon: Activity, label: 'Logs', href: '/admin/logs', color: 'amber' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings', color: 'slate' },
]

const colorMap: Record<string, { active: string; icon: string }> = {
  blue: { active: 'bg-blue-500/20 border-blue-500/30', icon: 'text-blue-400' },
  emerald: { active: 'bg-emerald-500/20 border-emerald-500/30', icon: 'text-emerald-400' },
  purple: { active: 'bg-purple-500/20 border-purple-500/30', icon: 'text-purple-400' },
  amber: { active: 'bg-amber-500/20 border-amber-500/30', icon: 'text-amber-400' },
  slate: { active: 'bg-slate-500/20 border-slate-500/30', icon: 'text-slate-400' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAdmin, isLoading, adminData, user } = useAdmin()
  const { logout } = useSupabaseAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isLoading, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,5%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ZedLogo size="xl" showPulse />
          <p className="text-slate-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.includes('/users')) return 'Usuários'
    if (pathname.includes('/analytics')) return 'Analytics'
    if (pathname.includes('/logs')) return 'Logs de Atividade'
    if (pathname.includes('/settings')) return 'Configurações'
    return 'Admin'
  }

  return (
    <BackgroundGradient themeName="dark">
      <div className="min-h-screen bg-transparent">
        {/* Sidebar Desktop */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 80 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-y-2 left-2 z-50 hidden md:flex flex-col",
            "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/95",
            "border border-white/10 rounded-3xl shadow-xl shadow-black/20",
            "backdrop-blur-xl"
          )}
        >
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 p-4 border-b border-white/5",
            !sidebarOpen && "justify-center"
          )}>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-400" />
              {sidebarOpen && (
                <span className="text-lg font-bold text-white">Admin</span>
              )}
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              const colors = colorMap[item.color]

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      "border border-transparent",
                      active
                        ? `${colors.active} text-white`
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                      !sidebarOpen && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", active && colors.icon)} />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 border-t border-white/5">
            <div className={cn(
              "flex items-center gap-3 px-3 py-2 mb-2",
              !sidebarOpen && "justify-center"
            )}>
              <Avatar
                src={user?.user_metadata?.avatar_url}
                fallback={user?.email?.charAt(0).toUpperCase() || 'A'}
                className="h-8 w-8"
              />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.name || user?.email}
                  </p>
                  <p className="text-xs text-amber-400 capitalize">
                    {adminData?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-xl",
                "text-red-400 hover:bg-red-500/10 transition-colors",
                !sidebarOpen && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span className="text-sm">Sair</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </motion.aside>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 inset-x-0 z-50 h-16 px-4 flex items-center justify-between bg-gradient-to-b from-[#0A101F]/95 to-[#111827]/95 border-b border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-400" />
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed inset-x-0 top-16 z-40 p-4 bg-[#0A101F]/98 border-b border-white/10 backdrop-blur-xl"
            >
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const active = pathname === item.href
                  const colors = colorMap[item.color]

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        active ? `${colors.active} text-white` : "text-slate-400"
                      )}>
                        <item.icon className={cn("h-5 w-5", active && colors.icon)} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
              <button
                onClick={logout}
                className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={cn(
            "min-h-screen transition-all duration-200",
            "pt-20 md:pt-2 pb-4 px-4",
            sidebarOpen ? "md:ml-[276px]" : "md:ml-[96px]"
          )}
        >
          {/* Header */}
          <div className="hidden md:flex items-center justify-between mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#0A101F]/80 to-[#111827]/80 border border-white/10 backdrop-blur-xl">
            <div>
              <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
              <p className="text-sm text-slate-400">Painel de Administração ZED</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {children}
        </main>
      </div>
    </BackgroundGradient>
  )
}


