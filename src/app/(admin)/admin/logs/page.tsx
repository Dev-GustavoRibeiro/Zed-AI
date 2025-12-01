'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  User,
  Settings,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { createClient } from '@/shared/lib/supabase/client'

interface ActivityLog {
  id: string
  admin_id: string
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
  created_at: string
  admin_user?: {
    role: string
    user_id: string
  }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin_user:admin_users(role, user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return User
    if (action.includes('setting')) return Settings
    if (action.includes('admin')) return Shield
    return Activity
  }

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'text-emerald-400 bg-emerald-500/10'
    if (action.includes('update') || action.includes('edit')) return 'text-blue-400 bg-blue-500/10'
    if (action.includes('delete') || action.includes('remove')) return 'text-red-400 bg-red-500/10'
    return 'text-slate-400 bg-slate-500/10'
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar ações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-xl",
              "bg-slate-900/50 border border-white/10",
              "text-white placeholder:text-slate-500 text-sm",
              "focus:outline-none focus:border-blue-500/50"
            )}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={fetchLogs}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Logs List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-slate-600 animate-spin" />
              <p className="text-slate-500">Carregando logs...</p>
            </div>
          ) : paginatedLogs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {paginatedLogs.map((log) => {
                const Icon = getActionIcon(log.action)
                const colorClass = getActionColor(log.action)

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white">
                            {log.action}
                          </p>
                          {log.target_type && (
                            <Badge variant="secondary" size="sm">
                              {log.target_type}
                            </Badge>
                          )}
                        </div>

                        {log.details && (
                          <p className="text-xs text-slate-500 mb-2">
                            {JSON.stringify(log.details).substring(0, 100)}...
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </span>
                          {log.ip_address && (
                            <span>IP: {log.ip_address}</span>
                          )}
                          {log.admin_user && (
                            <Badge variant="gold" size="sm" className="capitalize">
                              {log.admin_user.role.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p className="text-slate-500">Nenhum log encontrado</p>
              <p className="text-xs text-slate-600 mt-1">
                Os logs de atividade aparecerão aqui
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <p className="text-sm text-slate-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


