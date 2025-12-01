'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Target,
  Wallet,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Badge } from '@/shared/components/atoms/Badge'
import { createClient } from '@/shared/lib/supabase/client'

interface AnalyticsData {
  dailyUsers: { date: string; count: number }[]
  tasksByCategory: { category: string; count: number }[]
  goalsCompletion: { completed: number; pending: number }
  topUsers: { id: string; name: string; tasks_count: number }[]
}

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      // Simulated analytics data - em produção, viria de queries agregadas
      // Buscar dados reais do banco
      const [usersRes, tasksRes, goalsRes] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('tasks').select('category'),
        supabase.from('goals').select('completed'),
      ])

      // Processar dados
      const tasksByCategory = tasksRes.data?.reduce((acc: Record<string, number>, task) => {
        const cat = task.category || 'Outros'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {}) || {}

      const goalsCompleted = goalsRes.data?.filter(g => g.completed).length || 0
      const goalsPending = goalsRes.data?.filter(g => !g.completed).length || 0

      setAnalytics({
        dailyUsers: [],
        tasksByCategory: Object.entries(tasksByCategory).map(([category, count]) => ({
          category,
          count: count as number,
        })),
        goalsCompletion: {
          completed: goalsCompleted,
          pending: goalsPending,
        },
        topUsers: [],
      })
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categoryColors: Record<string, string> = {
    Pessoal: 'bg-purple-500',
    Trabalho: 'bg-blue-500',
    Estudos: 'bg-emerald-500',
    Saúde: 'bg-red-500',
    'Casa/Família': 'bg-amber-500',
    Outros: 'bg-slate-500',
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const totalTasks = analytics?.tasksByCategory.reduce((sum, t) => sum + t.count, 0) || 0
  const totalGoals = (analytics?.goalsCompletion.completed || 0) + (analytics?.goalsCompletion.pending || 0)

  return (
    <div className="space-y-6">
      {/* Tasks by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Tarefas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.tasksByCategory && analytics.tasksByCategory.length > 0 ? (
              <div className="space-y-4">
                {analytics.tasksByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">{item.category}</span>
                      <span className="text-sm font-semibold text-white">
                        {item.count} ({totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalTasks > 0 ? (item.count / totalTasks) * 100 : 0}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn(
                          "h-full rounded-full",
                          categoryColors[item.category] || 'bg-slate-500'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma tarefa registrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals Completion */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Status das Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalGoals > 0 ? (
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="h-24 w-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-emerald-400">
                        {analytics?.goalsCompletion.completed || 0}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Concluídas</p>
                  </div>
                  <div className="text-center">
                    <div className="h-24 w-24 rounded-full bg-amber-500/20 border-4 border-amber-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-400">
                        {analytics?.goalsCompletion.pending || 0}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Pendentes</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma meta registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Resumo Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-slate-300">Total de Tarefas</span>
                  </div>
                  <span className="text-lg font-bold text-white">{totalTasks}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-slate-300">Total de Metas</span>
                  </div>
                  <span className="text-lg font-bold text-white">{totalGoals}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm text-slate-300">Taxa de Conclusão</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {totalGoals > 0
                      ? Math.round(((analytics?.goalsCompletion.completed || 0) / totalGoals) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


