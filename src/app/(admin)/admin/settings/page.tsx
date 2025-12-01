'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Shield,
  Users,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Mail,
  Key,
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

interface AdminUser {
  id: string
  user_id: string
  role: string
  permissions: Record<string, boolean>
  created_at: string
  user_email?: string
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator' | 'support'>('admin')
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()
  const { isSuperAdmin, adminData } = useAdmin()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Buscar emails dos usuários
      const adminsList = data || []
      const adminsWithEmail = await Promise.all(
        adminsList.map(async (admin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', admin.user_id)
            .single()
          return { ...admin, user_email: profile?.email }
        })
      )

      setAdmins(adminsWithEmail)
    } catch (error) {
      console.error('Erro ao buscar admins:', error)
      toast.error('Erro ao carregar administradores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast.error('Digite o email do usuário')
      return
    }

    setIsSaving(true)
    try {
      // Buscar usuário pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newAdminEmail)
        .single()

      if (profileError || !profile) {
        toast.error('Usuário não encontrado')
        return
      }

      // Verificar se já é admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', profile.id)
        .single()

      if (existingAdmin) {
        toast.error('Este usuário já é um administrador')
        return
      }

      // Adicionar como admin
      const { error } = await supabase.from('admin_users').insert({
        user_id: profile.id,
        role: newAdminRole,
        permissions: {
          users: newAdminRole !== 'support',
          analytics: true,
          settings: newAdminRole === 'admin',
        },
        created_by: adminData?.user_id,
      })

      if (error) throw error

      toast.success('Administrador adicionado com sucesso!')
      setIsAddModalOpen(false)
      setNewAdminEmail('')
      setNewAdminRole('admin')
      fetchAdmins()
    } catch (error) {
      console.error('Erro ao adicionar admin:', error)
      toast.error('Erro ao adicionar administrador')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm('Tem certeza que deseja remover este administrador?')) return

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)

      if (error) throw error

      toast.success('Administrador removido')
      fetchAdmins()
    } catch (error) {
      console.error('Erro ao remover admin:', error)
      toast.error('Erro ao remover administrador')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="gold">Super Admin</Badge>
      case 'admin':
        return <Badge variant="primary">Admin</Badge>
      case 'moderator':
        return <Badge variant="secondary">Moderador</Badge>
      case 'support':
        return <Badge variant="outline">Suporte</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Users Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              Administradores do Sistema
            </CardTitle>
            {isSuperAdmin && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Adicionar Admin
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : admins.length > 0 ? (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                        {admin.user_email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {admin.user_email || 'Email desconhecido'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Desde {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(admin.role)}
                      {isSuperAdmin && admin.role !== 'super_admin' && (
                        <button
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum administrador cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Permissions Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-400" />
              Níveis de Permissão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="gold">Super Admin</Badge>
                </div>
                <p className="text-sm text-slate-300">
                  Acesso total ao sistema. Pode gerenciar todos os administradores e configurações.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary">Admin</Badge>
                </div>
                <p className="text-sm text-slate-300">
                  Pode gerenciar usuários, ver analytics e acessar configurações básicas.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Moderador</Badge>
                </div>
                <p className="text-sm text-slate-300">
                  Pode gerenciar usuários e ver analytics. Sem acesso a configurações.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Suporte</Badge>
                </div>
                <p className="text-sm text-slate-300">
                  Apenas visualização de analytics. Sem poder de edição.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Administrador"
      >
        <div className="space-y-4">
          <Input
            label="Email do usuário"
            type="email"
            placeholder="usuario@email.com"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            leftIcon={Mail}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nível de Acesso
            </label>
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'moderator' | 'support')}
              className={cn(
                "w-full h-10 px-3 rounded-xl",
                "bg-slate-900/50 border border-white/10",
                "text-white text-sm",
                "focus:outline-none focus:border-blue-500/50"
              )}
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderador</option>
              <option value="support">Suporte</option>
            </select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddAdmin}
            isLoading={isSaving}
          >
            Adicionar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}


