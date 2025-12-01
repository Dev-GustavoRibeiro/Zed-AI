'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Mic, 
  Globe,
  HelpCircle,
  ChevronRight,
  Camera,
  Loader2,
  Save,
  Trash2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Input } from '@/shared/components/atoms/Input'
import { Avatar } from '@/shared/components/atoms/Avatar'
import { useUserProfile, useSupabaseAuth } from '@/shared/hooks'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { profile, isLoading, isUploading, uploadAvatar, updateName, refreshProfile } = useUserProfile()
  const { logout } = useSupabaseAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados locais para os formulários
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Configurações de notificação (localStorage)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: false,
  })
  
  // Configurações de voz (localStorage)
  const [voice, setVoice] = useState({
    enabled: true,
    speed: 1,
    autoPlay: true, // Ativado por padrão
  })

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
    }
  }, [profile])

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('zed_notifications')
    const savedVoice = localStorage.getItem('zed_voice_settings')
    
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error('Erro ao carregar configurações de notificação')
      }
    }
    
    if (savedVoice) {
      try {
        setVoice(JSON.parse(savedVoice))
      } catch (e) {
        console.error('Erro ao carregar configurações de voz')
      }
    }
  }, [])

  // Salvar configurações de notificação
  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value }
    setNotifications(newNotifications)
    localStorage.setItem('zed_notifications', JSON.stringify(newNotifications))
    toast.success('Configuração salva!')
  }

  // Salvar configurações de voz
  const handleVoiceChange = (key: keyof typeof voice, value: boolean | number) => {
    const newVoice = { ...voice, [key]: value }
    setVoice(newVoice)
    localStorage.setItem('zed_voice_settings', JSON.stringify(newVoice))
    if (typeof value === 'boolean') {
      toast.success('Configuração salva!')
    }
  }

  // Salvar nome do perfil
  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('O nome não pode estar vazio')
      return
    }
    
    setIsSaving(true)
    const success = await updateName(name.trim())
    setIsSaving(false)
    
    if (success) {
      refreshProfile()
    }
  }

  // Upload de foto
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadAvatar(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Logout
  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Input oculto para upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-white">Configurações</h1>
        <p className="text-slate-400">Personalize sua experiência com ZED</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader icon={<User className="h-5 w-5 text-blue-400" />}>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar com upload */}
              <div className="relative">
                <div className={cn(
                  "relative",
                  isUploading && "opacity-50"
                )}>
                  <Avatar 
                    size="2xl" 
                    src={profile?.avatar_url || undefined}
                    fallback={profile?.name?.charAt(0) || profile?.email?.charAt(0) || 'U'} 
                    variant="blue" 
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "absolute bottom-0 right-0 p-2 rounded-full transition-colors",
                    "bg-blue-500 text-white hover:bg-blue-600",
                    "shadow-lg shadow-blue-500/30",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              {/* Formulário */}
              <div className="flex-1 space-y-4 w-full">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Nome
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-slate-800/50 cursor-not-allowed opacity-60"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleSaveName}
                  disabled={isSaving || name === profile?.name}
                  leftIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader icon={<Bell className="h-5 w-5 text-amber-400" />}>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleSetting
              label="Notificações por email"
              description="Receba lembretes e atualizações por email"
              checked={notifications.email}
              onChange={(checked) => handleNotificationChange('email', checked)}
            />
            <ToggleSetting
              label="Notificações push"
              description="Receba notificações no navegador"
              checked={notifications.push}
              onChange={(checked) => handleNotificationChange('push', checked)}
            />
            <ToggleSetting
              label="Sons de notificação"
              description="Tocar som ao receber notificações"
              checked={notifications.sound}
              onChange={(checked) => handleNotificationChange('sound', checked)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ZED Voice Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader icon={<Mic className="h-5 w-5 text-purple-400" />}>
            <CardTitle>Voz do ZED</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleSetting
              label="Respostas por voz"
              description="ZED responde suas mensagens em áudio"
              checked={voice.enabled}
              onChange={(checked) => handleVoiceChange('enabled', checked)}
            />
            <ToggleSetting
              label="Auto-play de áudio"
              description="Reproduzir áudio automaticamente"
              checked={voice.autoPlay}
              onChange={(checked) => handleVoiceChange('autoPlay', checked)}
            />
            
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Velocidade da voz
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voice.speed}
                  onChange={(e) => handleVoiceChange('speed', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-sm text-slate-400 w-12 text-center">{voice.speed}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-0">
            <LinkItem
              icon={Shield}
              label="Privacidade e Segurança"
              description="Seus dados estão seguros conosco"
            />
            <LinkItem
              icon={Globe}
              label="Idioma"
              description="Português (Brasil)"
            />
            <LinkItem
              icon={HelpCircle}
              label="Central de Ajuda"
              description="Tire suas dúvidas"
              isLast
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sair da conta</p>
                <p className="text-sm text-slate-400">
                  Encerrar sua sessão atual
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sair
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-white font-medium">Excluir conta</p>
                <p className="text-sm text-slate-400">
                  Exclua permanentemente sua conta e dados
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Excluir
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      toast.error('Funcionalidade em desenvolvimento')
                      setShowDeleteConfirm(false)
                    }}
                  >
                    Confirmar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center text-slate-500 text-sm"
      >
        <p>ZED - Seu Assistente Pessoal Inteligente</p>
        <p className="text-xs mt-1">Versão 1.0.0</p>
      </motion.div>
    </div>
  )
}

// Toggle Setting Component
interface ToggleSettingProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-white font-medium">{label}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors",
        checked ? "bg-blue-500" : "bg-slate-700"
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
          checked && "translate-x-6"
        )}
      />
    </button>
  </div>
)

// Link Item Component
interface LinkItemProps {
  icon: React.ElementType
  label: string
  description: string
  isLast?: boolean
}

const LinkItem: React.FC<LinkItemProps> = ({ icon: Icon, label, description, isLast }) => (
  <div
    className={cn(
      "flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors cursor-pointer",
      !isLast && "border-b border-white/5"
    )}
  >
    <div className="p-2 rounded-xl bg-white/5">
      <Icon className="h-5 w-5 text-slate-400" />
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium text-white">{label}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-slate-600" />
  </div>
)
