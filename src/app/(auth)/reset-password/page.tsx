'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { BackgroundGradient } from '@/shared/components/organisms/BackgroundGradient'
import { createClient } from '@/shared/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const supabase = createClient()

  // Verificar se o usuário tem uma sessão de recovery
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Se não houver sessão, talvez o token tenha expirado
      if (!session) {
        // Verificar se há um token na URL (hash fragment)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        if (accessToken && type === 'recovery') {
          // Definir a sessão com o token
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          })
        }
      }
    }
    
    checkSession()
  }, [supabase.auth])

  const passwordStrength = () => {
    const password = formData.password
    if (password.length === 0) return { level: 0, text: '', color: '' }
    if (password.length < 6) return { level: 1, text: 'Fraca', color: 'bg-red-500' }
    if (password.length < 8) return { level: 2, text: 'Média', color: 'bg-amber-500' }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, text: 'Forte', color: 'bg-emerald-500' }
    }
    return { level: 3, text: 'Boa', color: 'bg-blue-500' }
  }

  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('same as')) {
          toast.error('A nova senha deve ser diferente da anterior')
        } else {
          toast.error('Erro ao redefinir senha. O link pode ter expirado.')
        }
        return
      }

      setIsSuccess(true)
      toast.success('Senha redefinida com sucesso!')

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      toast.error('Erro ao redefinir senha')
    } finally {
      setIsLoading(false)
    }
  }

  // Tela de sucesso
  if (isSuccess) {
    return (
      <BackgroundGradient themeName="dark">
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo Centralizada */}
            <div className="flex justify-center mb-8">
              <ZedLogo size="2xl" showPulse />
            </div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={cn(
                "relative overflow-hidden rounded-3xl p-8",
                "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
                "border border-white/10",
                "shadow-2xl shadow-black/50",
                "backdrop-blur-xl"
              )}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

              <div className="relative z-10 text-center">
                {/* Ícone de sucesso */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div className={cn(
                    "mx-auto w-20 h-20 rounded-full",
                    "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
                    "border border-emerald-500/30",
                    "flex items-center justify-center",
                    "shadow-lg shadow-emerald-500/20"
                  )}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    </motion.div>
                  </div>
                </motion.div>

                <h1 className="text-2xl font-black text-white mb-2">
                  Senha redefinida!
                </h1>
                <p className="text-slate-400 mb-6">
                  Sua senha foi alterada com sucesso.
                  <br />
                  Redirecionando para o login...
                </p>

                <Link href="/login">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Ir para Login
                  </Button>
                </Link>
              </div>

              {/* Accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-blue-500/40 to-slate-500/40" />
            </motion.div>
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
          {/* Logo Centralizada */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ZedLogo size="2xl" showPulse />
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
              "border border-white/10",
              "shadow-2xl shadow-black/50",
              "backdrop-blur-xl"
            )}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
                    "border border-purple-500/30"
                  )}>
                    <ShieldCheck className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <h1 className="text-3xl font-black text-white">Nova senha</h1>
                <p className="mt-2 text-slate-400">
                  Crie uma senha forte e segura
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      label="Nova senha"
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

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              level <= strength.level ? strength.color : "bg-slate-700"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Força da senha: <span className={cn(
                          strength.level === 1 && "text-red-400",
                          strength.level === 2 && "text-amber-400",
                          strength.level === 3 && "text-blue-400",
                          strength.level === 4 && "text-emerald-400",
                        )}>{strength.text}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar nova senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    leftIcon={Lock}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "As senhas não coincidem"
                        : undefined
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Dicas de segurança */}
                <div className={cn(
                  "p-4 rounded-xl",
                  "bg-white/5 border border-white/10"
                )}>
                  <p className="text-xs text-slate-500 mb-2">Dicas para uma senha segura:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <span className={formData.password.length >= 8 ? 'text-emerald-400' : ''}>
                      ✓ 8+ caracteres
                    </span>
                    <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-400' : ''}>
                      ✓ Letra maiúscula
                    </span>
                    <span className={/[0-9]/.test(formData.password) ? 'text-emerald-400' : ''}>
                      ✓ Número
                    </span>
                    <span className={/[!@#$%^&*]/.test(formData.password) ? 'text-emerald-400' : ''}>
                      ✓ Caractere especial
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  disabled={!formData.password || formData.password !== formData.confirmPassword}
                >
                  Redefinir senha
                </Button>
              </form>

              {/* Link para login */}
              <p className="mt-8 text-center text-slate-400">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Voltar ao Login
                </Link>
              </p>
            </div>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-slate-500/40" />
          </motion.div>
        </motion.div>
      </div>
    </BackgroundGradient>
  )
}

