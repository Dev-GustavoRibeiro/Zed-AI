'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  CheckSquare,
  Target,
  Wallet,
  MessageSquare,
  Timer,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Badge } from '@/shared/components/atoms/Badge'
import { createClient } from '@/shared/lib/supabase/client'

interface Statistics {
  total_users: number
  total_tasks: number
  total_goals: number
  total_transactions: number
  total_messages: number
  total_pomodoro_sessions: number
  total_journal_entries: number
}

interface UserStats {
  total_users: number
  free_users: number
  pro_users: number
  enterprise_users: number
  new_users_week: number
  new_users_month: number
}

interface RecentUser {
  id: string
  name: string | null
  email: string | null
  subscription_tier: string | null
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar estatísticas gerais
        const { data: generalStats } = await supabase
          .from('general_statistics')
          .select('*')
          .single()

        if (generalStats) {
          setStats(generalStats as Statistics)
        }

        // Buscar estatísticas de usuários
        const { data: usersStats } = await supabase
          .from('user_statistics')
          .select('*')
          .single()

        if (usersStats) {
          setUserStats(usersStats as UserStats)
        }

        // Buscar usuários recentes
        const { data: users } = await supabase
          .from('profiles')
          .select('id, name, email, subscription_tier, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        if (users) {
          setRecentUsers(users)
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const statCards = [
    { icon: Users, label: 'Total de Usuários', value: stats?.total_users || 0, color: 'blue', change: `+${userStats?.new_users_week || 0} esta semana` },
    { icon: CheckSquare, label: 'Tarefas Criadas', value: stats?.total_tasks || 0, color: 'emerald', change: 'Total geral' },
    { icon: Target, label: 'Metas Definidas', value: stats?.total_goals || 0, color: 'purple', change: 'Total geral' },
    { icon: Wallet, label: 'Transações', value: stats?.total_transactions || 0, color: 'amber', change: 'Total geral' },
    { icon: MessageSquare, label: 'Mensagens', value: stats?.total_messages || 0, color: 'cyan', change: 'Total geral' },
    { icon: Timer, label: 'Sessões Pomodoro', value: stats?.total_pomodoro_sessions || 0, color: 'rose', change: 'Total geral' },
  ]

  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-600/10', icon: 'text-blue-400', border: 'border-blue-500/30' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/10', icon: 'text-emerald-400', border: 'border-emerald-500/30' },
    purple: { bg: 'from-purple-500/20 to-purple-600/10', icon: 'text-purple-400', border: 'border-purple-500/30' },
    amber: { bg: 'from-amber-500/20 to-amber-600/10', icon: 'text-amber-400', border: 'border-amber-500/30' },
    cyan: { bg: 'from-cyan-500/20 to-cyan-600/10', icon: 'text-cyan-400', border: 'border-cyan-500/30' },
    rose: { bg: 'from-rose-500/20 to-rose-600/10', icon: 'text-rose-400', border: 'border-rose-500/30' },
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const colors = colorMap[stat.color]
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn("h-full", colors.border)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br border",
                      colors.bg,
                      colors.border
                    )}>
                      <stat.icon className={cn("h-5 w-5", colors.icon)} />
                    </div>
                    <Badge variant="secondary" size="sm" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">
                      {stat.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* User Distribution & Recent Users */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Distribuição de Planos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-500" />
                    <span className="text-sm text-slate-300">Free</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {userStats?.free_users || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{
                      width: `${userStats?.total_users ? (userStats.free_users / userStats.total_users) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-300">Pro</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {userStats?.pro_users || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${userStats?.total_users ? (userStats.pro_users / userStats.total_users) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-300">Enterprise</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {userStats?.enterprise_users || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${userStats?.total_users ? (userStats.enterprise_users / userStats.total_users) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-lg font-bold text-emerald-400">
                      +{userStats?.new_users_week || 0}
                    </p>
                    <p className="text-xs text-slate-400">Esta semana</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-lg font-bold text-blue-400">
                      +{userStats?.new_users_month || 0}
                    </p>
                    <p className="text-xs text-slate-400">Este mês</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Usuários Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.name || 'Sem nome'}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant={user.subscription_tier === 'pro' ? 'primary' : user.subscription_tier === 'enterprise' ? 'gold' : 'secondary'}
                        size="sm"
                      >
                        {user.subscription_tier || 'free'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum usuário cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

