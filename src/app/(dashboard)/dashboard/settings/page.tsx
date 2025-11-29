'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mic, 
  Volume2,
  Globe,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Avatar } from '@/shared/components/atoms/Avatar'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: false,
  })
  
  const [voice, setVoice] = useState({
    enabled: true,
    speed: 1,
    autoPlay: false,
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
              <div className="relative">
                <Avatar size="2xl" fallback="U" variant="blue" />
                <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  <Palette className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    defaultValue="Usuário Teste"
                    placeholder="Seu nome"
                  />
                  <Input
                    label="Email"
                    type="email"
                    defaultValue="usuario@exemplo.com"
                    placeholder="seu@email.com"
                  />
                </div>
                <Button variant="primary" size="sm">
                  Salvar Alterações
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
              onChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
            <ToggleSetting
              label="Notificações push"
              description="Receba notificações no navegador"
              checked={notifications.push}
              onChange={(checked) => setNotifications({ ...notifications, push: checked })}
            />
            <ToggleSetting
              label="Sons de notificação"
              description="Tocar som ao receber notificações"
              checked={notifications.sound}
              onChange={(checked) => setNotifications({ ...notifications, sound: checked })}
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
              onChange={(checked) => setVoice({ ...voice, enabled: checked })}
            />
            <ToggleSetting
              label="Auto-play de áudio"
              description="Reproduzir áudio automaticamente"
              checked={voice.autoPlay}
              onChange={(checked) => setVoice({ ...voice, autoPlay: checked })}
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
                  onChange={(e) => setVoice({ ...voice, speed: parseFloat(e.target.value) })}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-sm text-slate-400 w-12">{voice.speed}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader icon={<Palette className="h-5 w-5 text-emerald-400" />}>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <ThemeOption
                    icon={Moon}
                    label="Escuro"
                    selected={true}
                  />
                  <ThemeOption
                    icon={Sun}
                    label="Claro"
                    selected={false}
                  />
                  <ThemeOption
                    icon={Smartphone}
                    label="Sistema"
                    selected={false}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Cor de destaque
                </label>
                <div className="flex gap-3">
                  {['blue', 'amber', 'emerald', 'purple', 'pink'].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform hover:scale-110",
                        color === 'blue' && "bg-blue-500 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-slate-900",
                        color === 'amber' && "bg-amber-500",
                        color === 'emerald' && "bg-emerald-500",
                        color === 'purple' && "bg-purple-500",
                        color === 'pink' && "bg-pink-500",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="gold">
          <CardHeader icon={<CreditCard className="h-5 w-5 text-amber-400" />}>
            <div className="flex items-center gap-2">
              <CardTitle>Assinatura</CardTitle>
              <Badge variant="gold" size="sm">Free</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-medium">Plano Free</p>
                <p className="text-sm text-slate-400">
                  50 mensagens/mês • Recursos básicos
                </p>
              </div>
              <Button variant="gold">
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-0">
            <LinkItem
              icon={Shield}
              label="Privacidade e Segurança"
              description="Gerencie suas configurações de privacidade"
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

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Exportar dados</p>
                <p className="text-sm text-slate-400">
                  Baixe uma cópia de todos os seus dados
                </p>
              </div>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Excluir conta</p>
                <p className="text-sm text-slate-400">
                  Exclua permanentemente sua conta e dados
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
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

// Theme Option Component
interface ThemeOptionProps {
  icon: React.ElementType
  label: string
  selected: boolean
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ icon: Icon, label, selected }) => (
  <button
    className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
      selected
        ? "bg-blue-500/20 border-2 border-blue-500/50"
        : "bg-white/5 border-2 border-transparent hover:bg-white/10"
    )}
  >
    <Icon className={cn(
      "h-5 w-5",
      selected ? "text-blue-400" : "text-slate-400"
    )} />
    <span className={cn(
      "text-sm font-medium",
      selected ? "text-white" : "text-slate-400"
    )}>
      {label}
    </span>
    {selected && (
      <Check className="h-4 w-4 text-blue-400" />
    )}
  </button>
)

// Link Item Component
interface LinkItemProps {
  icon: React.ElementType
  label: string
  description: string
  isLast?: boolean
}

const LinkItem: React.FC<LinkItemProps> = ({ icon: Icon, label, description, isLast }) => (
  <button
    className={cn(
      "flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors",
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
  </button>
)

