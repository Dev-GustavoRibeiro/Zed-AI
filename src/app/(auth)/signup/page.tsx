'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, User, Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { Badge } from '@/shared/components/atoms/Badge'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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

    // Simulating signup
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Conta criada com sucesso!')
    router.push('/dashboard')
    
    setIsLoading(false)
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-800/30 to-slate-900/50 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-zed-mesh opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center p-8"
        >
          <ZedLogo size="2xl" showPulse />
          <h2 className="mt-8 text-3xl font-black text-white">
            Comece sua jornada
            <br />
            <span className="text-gradient-gold">gratuitamente</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-md">
            Crie sua conta e descubra o poder de ter um assistente pessoal com IA
          </p>

          {/* Features list */}
          <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
            <FeatureItem text="50 mensagens grátis por mês" />
            <FeatureItem text="Gerenciador de rotina básico" />
            <FeatureItem text="Controle financeiro simples" />
            <FeatureItem text="Upgrade a qualquer momento" />
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center mb-8">
            <ZedLogo size="xl" />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-black text-white">Criar conta</h1>
              <Badge variant="gold" size="sm">Grátis</Badge>
            </div>
            <p className="text-slate-400">
              Preencha os dados abaixo para começar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome completo"
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
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-white"
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

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20"
              />
              <label htmlFor="terms" className="text-sm text-slate-400">
                Eu concordo com os{' '}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                  Política de Privacidade
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
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[hsl(222,47%,6%)] text-slate-500">ou cadastre-se com</span>
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

          {/* Login link */}
          <p className="mt-8 text-center text-slate-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Feature Item Component
const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="p-1 rounded-full bg-emerald-500/20">
      <Check className="h-3 w-3 text-emerald-400" />
    </div>
    <span className="text-sm text-slate-300">{text}</span>
  </div>
)

