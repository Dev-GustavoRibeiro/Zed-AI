'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { BackgroundGradient } from '@/shared/components/organisms/BackgroundGradient'
import { createClient } from '@/shared/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor, informe seu email')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          toast.error('Aguarde alguns minutos antes de tentar novamente')
        } else {
          toast.error('Erro ao enviar email. Tente novamente.')
        }
        return
      }

      setEmailSent(true)
      toast.success('Email enviado com sucesso!')
    } catch {
      toast.error('Erro ao enviar email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('60 seconds')) {
          toast.error('Aguarde 60 segundos antes de tentar novamente')
        } else {
          toast.error('Erro ao reenviar email')
        }
      } else {
        toast.success('Email reenviado!')
      }
    } catch {
      toast.error('Erro ao reenviar email')
    } finally {
      setIsResending(false)
    }
  }

  // Tela de email enviado
  if (emailSent) {
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
                  Email enviado!
                </h1>
                <p className="text-slate-400 mb-6">
                  Enviamos um link de redefinição para
                  <br />
                  <span className="text-white font-semibold">{email}</span>
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
                      <p className="text-sm text-slate-300">Verifique sua caixa de entrada e spam</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-blue-500/20 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-300">Clique no link para criar nova senha</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-blue-500/20 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-300">O link expira em 1 hora</p>
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
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Voltar ao Login
                    </Button>
                  </Link>
                </div>

                {/* Link para outro email */}
                <p className="mt-6 text-sm text-slate-500">
                  Email errado?{' '}
                  <button
                    onClick={() => setEmailSent(false)}
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-white">Esqueceu a senha?</h1>
                <p className="mt-2 text-slate-400">
                  Informe seu email para redefinir
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  leftIcon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Enviar link de redefinição
                </Button>
              </form>

              {/* Voltar ao login */}
              <p className="mt-8 text-center text-slate-400">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Voltar ao Login
                </Link>
              </p>
            </div>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500/40 via-amber-500/40 to-slate-500/40" />
          </motion.div>
        </motion.div>
      </div>
    </BackgroundGradient>
  )
}

