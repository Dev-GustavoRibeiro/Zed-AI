'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { BackgroundGradient } from '@/shared/components/organisms/BackgroundGradient'
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth'

export default function LoginPage() {
  const { login } = useSupabaseAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      // O redirecionamento é feito dentro do hook login
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false)
    }
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

          {/* Card de Login */}
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-white">Bem-vindo de volta</h1>
                <p className="mt-2 text-slate-400">
                  Entre com sua conta para continuar
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  leftIcon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                    />
                    <span className="text-sm text-slate-400">Lembrar de mim</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Entrar
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A101F]/95 text-slate-500">ou continue com</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  leftIcon={<Chrome className="h-5 w-5" />}
                >
                  Google
                </Button>
              </div>

              {/* Sign up link */}
              <p className="mt-8 text-center text-slate-400">
                Não tem uma conta?{' '}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Criar conta
                </Link>
              </p>
            </div>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/40 via-amber-500/40 to-slate-500/40" />
          </motion.div>
        </motion.div>
      </div>
    </BackgroundGradient>
  )
}
