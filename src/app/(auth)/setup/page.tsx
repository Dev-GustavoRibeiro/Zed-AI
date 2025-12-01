'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { BackgroundGradient } from '@/shared/components/organisms/BackgroundGradient'
import { createClient } from '@/shared/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const supabase = createClient()

  // Verificar se já existe um admin
  useEffect(() => {
    const checkExistingAdmin = async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Erro ao verificar admin:', error)
        setHasAdmin(false)
        return
      }

      setHasAdmin(data && data.length > 0)
    }

    checkExistingAdmin()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar perfil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email,
        name: formData.name,
        subscription_tier: 'enterprise',
      })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
      }

      // 3. Adicionar como super_admin
      const { error: adminError } = await supabase.from('admin_users').insert({
        user_id: authData.user.id,
        role: 'super_admin',
        permissions: {
          users: true,
          analytics: true,
          settings: true,
        },
      })

      if (adminError) {
        console.error('Erro ao criar admin:', adminError)
        throw adminError
      }

      toast.success('Admin criado com sucesso!')
      setIsComplete(true)

      // Aguardar um pouco e redirecionar
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Erro no setup:', error)
      toast.error(error.message || 'Erro ao criar admin')
    } finally {
      setIsLoading(false)
    }
  }

  // Verificando se já existe admin
  if (hasAdmin === null) {
    return (
      <BackgroundGradient themeName="dark">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <ZedLogo size="xl" showPulse />
            <p className="text-slate-400">Verificando...</p>
          </div>
        </div>
      </BackgroundGradient>
    )
  }

  // Já existe admin
  if (hasAdmin) {
    return (
      <BackgroundGradient themeName="dark">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Shield className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Setup já concluído</h1>
            <p className="text-slate-400 mb-6">
              Já existe um administrador configurado no sistema.
            </p>
            <Button variant="primary" onClick={() => router.push('/login')}>
              Ir para Login
            </Button>
          </motion.div>
        </div>
      </BackgroundGradient>
    )
  }

  // Setup concluído
  if (isComplete) {
    return (
      <BackgroundGradient themeName="dark">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle2 className="h-20 w-20 text-emerald-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Setup Concluído!</h1>
            <p className="text-slate-400 mb-2">
              Administrador criado com sucesso.
            </p>
            <p className="text-sm text-slate-500">
              Redirecionando para o login...
            </p>
          </motion.div>
        </div>
      </BackgroundGradient>
    )
  }

  return (
    <BackgroundGradient themeName="dark">
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Shield className="h-10 w-10 text-amber-400" />
              <span className="text-2xl font-bold text-white">Setup Inicial</span>
            </motion.div>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "relative overflow-hidden rounded-3xl p-8",
              "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
              "border border-amber-500/20",
              "shadow-2xl shadow-amber-500/10",
              "backdrop-blur-xl"
            )}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-black text-white">Criar Super Admin</h1>
                <p className="mt-2 text-slate-400">
                  Configure o primeiro administrador do sistema
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Nome"
                  type="text"
                  placeholder="Seu nome"
                  leftIcon={User}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@email.com"
                  leftIcon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    leftIcon={Lock}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Criar Administrador
                  </Button>
                </div>
              </form>

              {/* Info */}
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-200/80">
                  <strong>Nota:</strong> Este usuário terá acesso total ao sistema como Super Admin.
                  Guarde as credenciais em local seguro.
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-orange-500/40 to-amber-500/40" />
          </motion.div>
        </motion.div>
      </div>
    </BackgroundGradient>
  )
}


