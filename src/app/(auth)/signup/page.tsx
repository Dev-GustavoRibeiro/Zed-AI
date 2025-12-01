'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, User, CheckCircle2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { BackgroundGradient } from '@/shared/components/organisms/BackgroundGradient'
import { Badge } from '@/shared/components/atoms/Badge'
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signup, resendConfirmationEmail } = useSupabaseAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

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
      const result = await signup(formData.email, formData.password, formData.name)
      
      if (result.needsConfirmation) {
        setShowConfirmation(true)
      }
    } catch {
      // Erro já tratado pelo hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    await resendConfirmationEmail(formData.email)
    setIsResending(false)
  }

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

  // Tela de confirmação de email
  if (showConfirmation) {
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

              <div className="relative z-10 text-center">
                {/* Ícone de email */}
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
                      animate={{ 
                        y: [0, -5, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Mail className="h-8 w-8 text-emerald-400" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Título */}
                <h1 className="text-2xl font-black text-white mb-2">
                  Verifique seu email
                </h1>
                <p className="text-slate-400 mb-6">
                  Enviamos um link de confirmação para
                  <br />
                  <span className="text-white font-semibold">{formData.email}</span>
                </p>

                {/* Instruções */}
                <div className={cn(
                  "p-4 rounded-xl mb-6 text-left",
                  "bg-white/5 border border-white/10"
                )}>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-blue-500/20 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Abra seu email</p>
                        <p className="text-xs text-slate-500">Verifique a caixa de entrada e spam</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-blue-500/20 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Clique no link</p>
                        <p className="text-xs text-slate-500">Confirme sua conta</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-blue-500/20 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Faça login</p>
                        <p className="text-xs text-slate-500">Acesse sua conta</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleResendEmail}
                    isLoading={isResending}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                  >
                    Reenviar email
                  </Button>
                  
                  <Link href="/login" className="block">
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

                {/* Link para outro email */}
                <p className="mt-6 text-sm text-slate-500">
                  Email errado?{' '}
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Tentar outro email
                  </button>
                </p>
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

          {/* Card de Signup */}
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-3xl font-black text-white">Criar conta</h1>
                  <Badge variant="gold" size="sm">Grátis</Badge>
                </div>
                <p className="text-slate-400">
                  Preencha os dados para começar
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="seu@email.com"
                  leftIcon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <div className="space-y-2">
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
                        Força: <span className={cn(
                          strength.level === 1 && "text-red-400",
                          strength.level === 2 && "text-amber-400",
                          strength.level === 3 && "text-blue-400",
                          strength.level === 4 && "text-emerald-400",
                        )}>{strength.text}</span>
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirmar senha"
                  type="password"
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

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-400">
                    Eu concordo com os{' '}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                      Termos
                    </Link>{' '}
                    e{' '}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                      Privacidade
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Criar conta grátis
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A101F]/95 text-slate-500">ou</span>
                </div>
              </div>

              {/* Social Login */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                leftIcon={<Chrome className="h-5 w-5" />}
              >
                Google
              </Button>

              {/* Login link */}
              <p className="mt-6 text-center text-slate-400 text-sm">
                Já tem conta?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Entrar
                </Link>
              </p>
            </div>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-blue-500/40 to-slate-500/40" />
          </motion.div>
        </motion.div>
      </div>
    </BackgroundGradient>
  )
}
