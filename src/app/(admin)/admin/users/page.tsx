'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { createClient } from '@/shared/lib/supabase/client'
import { useAdmin } from '@/shared/hooks/useAdmin'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  subscription_tier: string | null
  created_at: string
  updated_at: string | null
}

interface UserDetails extends User {
  tasks_count: number
  goals_count: number
  transactions_count: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [editForm, setEditForm] = useState({ name: '', subscription_tier: 'free' })
  const itemsPerPage = 10
  const supabase = createClient()
  const { isSuperAdmin } = useAdmin()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (tierFilter) {
      filtered = filtered.filter(user => user.subscription_tier === tierFilter)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchQuery, tierFilter, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      const [userRes, tasksRes, goalsRes, transactionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('goals').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('transactions').select('id', { count: 'exact' }).eq('user_id', userId),
      ])

      if (userRes.data) {
        setSelectedUser({
          ...userRes.data,
          tasks_count: tasksRes.count || 0,
          goals_count: goalsRes.count || 0,
          transactions_count: transactionsRes.count || 0,
        })
        setIsDetailModalOpen(true)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
      toast.error('Erro ao carregar detalhes do usuário')
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user as UserDetails)
    setEditForm({
      name: user.name || '',
      subscription_tier: user.subscription_tier || 'free',
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          subscription_tier: editForm.subscription_tier,
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      toast.success('Usuário atualizado com sucesso!')
      setIsEditModalOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      // Nota: Deletar usuário do auth.users requer funções administrativas
      // Por enquanto, apenas removemos o perfil
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id)

      if (error) throw error

      toast.success('Usuário removido com sucesso!')
      setIsDeleteModalOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error('Erro ao remover usuário')
    }
  }

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const getTierBadge = (tier: string | null) => {
    switch (tier) {
      case 'pro':
        return <Badge variant="primary">Pro</Badge>
      case 'enterprise':
        return <Badge variant="gold">Enterprise</Badge>
      default:
        return <Badge variant="secondary">Free</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
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

        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-xl bg-slate-800/50 border border-white/10">
            {['Todos', 'free', 'pro', 'enterprise'].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier === 'Todos' ? null : tier)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  (tier === 'Todos' ? tierFilter === null : tierFilter === tier)
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tier === 'Todos' ? 'Todos' : tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={fetchUsers}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    Usuário
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    Plano
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">
                    Cadastro
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={4} className="px-4 py-4">
                        <div className="h-10 bg-slate-800/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3">
                        {getTierBadge(user.subscription_tier)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-slate-400">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => fetchUserDetails(user.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setSelectedUser(user as UserDetails)
                                setIsDeleteModalOpen(true)
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Users className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                      <p className="text-slate-500">Nenhum usuário encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <p className="text-sm text-slate-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
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

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes do Usuário"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedUser.name || 'Sem nome'}
                </h3>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
                {getTierBadge(selectedUser.subscription_tier)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-400">
                  {selectedUser.tasks_count}
                </p>
                <p className="text-xs text-slate-400">Tarefas</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-400">
                  {selectedUser.goals_count}
                </p>
                <p className="text-xs text-slate-400">Metas</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-400">
                  {selectedUser.transactions_count}
                </p>
                <p className="text-xs text-slate-400">Transações</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ID</span>
                <span className="text-slate-300 font-mono text-xs">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cadastro</span>
                <span className="text-slate-300">
                  {new Date(selectedUser.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Plano de Assinatura
            </label>
            <select
              value={editForm.subscription_tier}
              onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
              className={cn(
                "w-full h-10 px-3 rounded-xl",
                "bg-slate-900/50 border border-white/10",
                "text-white text-sm",
                "focus:outline-none focus:border-blue-500/50"
              )}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Salvar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <p className="text-slate-300">
          Tem certeza que deseja excluir o usuário <strong>{selectedUser?.name || selectedUser?.email}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            Excluir
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}


