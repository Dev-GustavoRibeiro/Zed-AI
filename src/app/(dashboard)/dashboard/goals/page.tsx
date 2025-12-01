'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Sparkles,
  Zap,
  Heart,
  GraduationCap,
  Briefcase,
  Users,
  Lightbulb,
  Loader2,
  Trophy,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  Flag,
  Rocket,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { useGoals, Goal as GoalType } from '@/shared/hooks/useGoals'

interface Goal {
  id: string
  title: string
  description?: string | null
  area: 'Saúde' | 'Estudos' | 'Trabalho' | 'Pessoal' | 'Relacionamentos' | 'Geral'
  timeframe: 'short' | 'medium' | 'long'
  targetValue?: number | null
  currentValue?: number | null
  progressPercentage: number
  deadline?: string | null
  completed: boolean
  milestones: Array<{ id: string; title: string; completed: boolean }>
  suggestedActions: string[]
}

// Áreas disponíveis (sem Financeiro - metas financeiras ficam na página de Finanças)
const areas = ['Todos', 'Saúde', 'Estudos', 'Trabalho', 'Pessoal', 'Relacionamentos', 'Geral']

// Configuração detalhada das áreas
const areaConfig: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  description: string;
  examples: string[];
}> = {
  Saúde: { 
    icon: Heart, 
    color: 'text-red-400', 
    bgColor: 'from-red-500/20 to-red-600/10',
    borderColor: 'border-red-500/30',
    description: 'Exercícios, alimentação, sono',
    examples: ['Treinar 3x por semana', 'Dormir 8h por noite', 'Beber 2L de água']
  },
  Estudos: { 
    icon: GraduationCap, 
    color: 'text-blue-400', 
    bgColor: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    description: 'Aprendizado e desenvolvimento',
    examples: ['Aprender inglês', 'Ler 12 livros', 'Fazer um curso']
  },
  Trabalho: { 
    icon: Briefcase, 
    color: 'text-purple-400', 
    bgColor: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
    description: 'Carreira e produtividade',
    examples: ['Conseguir promoção', 'Aprender nova skill', 'Networking']
  },
  Pessoal: { 
    icon: Target, 
    color: 'text-amber-400', 
    bgColor: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    description: 'Hobbies e autodesenvolvimento',
    examples: ['Meditar diariamente', 'Aprender instrumento', 'Viajar mais']
  },
  Relacionamentos: { 
    icon: Users, 
    color: 'text-pink-400', 
    bgColor: 'from-pink-500/20 to-pink-600/10',
    borderColor: 'border-pink-500/30',
    description: 'Família e amizades',
    examples: ['Tempo com família', 'Fazer novos amigos', 'Reconectar amizades']
  },
  Geral: { 
    icon: Sparkles, 
    color: 'text-cyan-400', 
    bgColor: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-500/30',
    description: 'Metas diversas',
    examples: ['Organizar a casa', 'Criar hábitos', 'Projeto pessoal']
  },
}

// Configuração dos prazos
const timeframeConfig = [
  { 
    value: 'short', 
    label: 'Curto Prazo', 
    subtitle: 'Até 1 mês',
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'from-emerald-500/20 to-emerald-600/10',
    borderColor: 'border-emerald-500/30',
  },
  { 
    value: 'medium', 
    label: 'Médio Prazo', 
    subtitle: '1 a 6 meses',
    icon: Clock,
    color: 'text-amber-400',
    bgColor: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
  },
  { 
    value: 'long', 
    label: 'Longo Prazo', 
    subtitle: '6 meses a 1 ano+',
    icon: Flag,
    color: 'text-blue-400',
    bgColor: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
  },
]

// Legado para compatibilidade
const timeframes = timeframeConfig.map(t => ({ value: t.value, label: `${t.label} (${t.subtitle})`, icon: t.icon }))

const areaIcons: Record<string, React.ElementType> = Object.fromEntries(
  Object.entries(areaConfig).map(([key, val]) => [key, val.icon])
)

const areaColors: Record<string, { bg: string; icon: string; border: string }> = Object.fromEntries(
  Object.entries(areaConfig).map(([key, val]) => [key, { bg: val.bgColor, icon: val.color, border: val.borderColor }])
)

export default function GoalsPage() {
  const { goals: dbGoals, isLoading, addGoal, updateGoal, deleteGoal, toggleGoal } = useGoals()
  
  // Converter metas do banco para o formato local (excluindo metas financeiras - vão para a página de Finanças)
  const goals: Goal[] = dbGoals
    .filter(g => g.area !== 'Financeiro') // Metas financeiras ficam na página de Finanças
    .map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      area: g.area as Goal['area'],
      timeframe: g.timeframe,
      targetValue: g.target_value,
      currentValue: g.current_value,
      progressPercentage: g.progress_percentage,
      deadline: g.deadline,
      completed: g.completed,
      milestones: [], // Milestones seriam buscados separadamente se necessário
      suggestedActions: [], // Sugestões seriam geradas pelo AI se necessário
    }))

  const [filter, setFilter] = useState('Todos')
  const [timeframeFilter, setTimeframeFilter] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [modalStep, setModalStep] = useState(1) // 1: Área, 2: Detalhes, 3: Prazo
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    area: 'Geral',
    timeframe: 'short',
    targetValue: 100,
    currentValue: 0,
    progressPercentage: 0,
    deadline: '',
    completed: false,
    milestones: [],
    suggestedActions: [],
  })
  
  // Resetar modal
  const resetModal = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
    setModalStep(1)
    setNewGoal({
      title: '',
      description: '',
      area: 'Geral',
      timeframe: 'short',
      targetValue: 100,
      currentValue: 0,
      progressPercentage: 0,
      deadline: '',
      completed: false,
      milestones: [],
      suggestedActions: [],
    })
  }

  const filteredGoals = goals.filter(goal => {
    const matchesArea = filter === 'Todos' || goal.area === filter
    const matchesTimeframe = !timeframeFilter || goal.timeframe === timeframeFilter
    return matchesArea && matchesTimeframe
  })

  const completedGoals = goals.filter(g => g.completed).length
  const totalGoals = goals.length
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length)
    : 0

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    // TODO: Implementar toggle de milestones no banco de dados
    console.log('Toggle milestone:', goalId, milestoneId)
  }

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id)
  }

  const handleToggleGoal = async (id: string) => {
    await toggleGoal(id)
  }

  const handleSaveGoal = async () => {
    if (!newGoal.title?.trim()) return

    // Para metas pessoais, o progresso é definido diretamente pelo slider
    const progress = newGoal.progressPercentage || 0

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        title: newGoal.title,
        description: newGoal.description || null,
        area: (newGoal.area || 'Geral') as GoalType['area'],
        timeframe: (newGoal.timeframe || 'short') as GoalType['timeframe'],
        target_value: 100, // Meta pessoal sempre tem 100 como alvo (percentual)
        current_value: progress,
        progress_percentage: progress,
        deadline: newGoal.deadline || null,
      })
    } else {
      await addGoal({
        title: newGoal.title,
        description: newGoal.description || null,
        area: (newGoal.area || 'Geral') as GoalType['area'],
        timeframe: (newGoal.timeframe || 'short') as GoalType['timeframe'],
        target_value: 100,
        current_value: 0,
        progress_percentage: 0,
        deadline: newGoal.deadline || null,
        completed: false,
      })
    }

    setIsModalOpen(false)
    setEditingGoal(null)
    setNewGoal({
      title: '',
      description: '',
      area: 'Geral',
      timeframe: 'short',
      targetValue: 100,
      currentValue: 0,
      progressPercentage: 0,
      completed: false,
      milestones: [],
      suggestedActions: [],
    })
  }

  const generateSuggestedActions = (goal: Partial<Goal>): string[] => {
    const actions: string[] = []
    
    if (goal.area === 'Saúde') {
      actions.push('Agende seus treinos na agenda')
      actions.push('Prepare tudo na noite anterior')
      actions.push('Defina horários fixos para exercícios')
    } else if (goal.area === 'Estudos') {
      actions.push('Estude pelo menos 1h por dia')
      actions.push('Pratique com projetos pessoais')
      actions.push('Faça revisões semanais do conteúdo')
    } else if (goal.area === 'Trabalho') {
      actions.push('Defina prioridades diárias')
      actions.push('Faça pausas regulares')
      actions.push('Atualize seu currículo/portfólio')
    } else if (goal.area === 'Relacionamentos') {
      actions.push('Reserve tempo para pessoas importantes')
      actions.push('Pratique a escuta ativa')
      actions.push('Organize encontros regulares')
    } else if (goal.area === 'Pessoal') {
      actions.push('Dedique tempo para hobbies')
      actions.push('Pratique autocuidado diário')
      actions.push('Mantenha um diário de gratidão')
    }
    
    return actions
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal({
      ...goal,
      deadline: goal.deadline || '',
    })
    setModalStep(2) // Vai direto para detalhes na edição
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Metas Pessoais</h1>
          <p className="text-sm sm:text-base text-slate-400">Defina e acompanhe seus objetivos de vida</p>
        </div>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nova Meta
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={Target}
          label="Total de Metas"
          value={totalGoals.toString()}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Concluídas"
          value={completedGoals.toString()}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Progresso Médio"
          value={`${averageProgress}%`}
          color="amber"
        />
        <StatCard
          icon={Sparkles}
          label="Em Andamento"
          value={(totalGoals - completedGoals).toString()}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setFilter(area)}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap",
                "transition-all duration-200",
                filter === area
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
              )}
            >
              {area}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {timeframes.map((tf) => {
            const Icon = tf.icon
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframeFilter(timeframeFilter === tf.value ? null : tf.value)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap",
                  "transition-all duration-200 flex items-center gap-2",
                  timeframeFilter === tf.value
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                )}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                {tf.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const AreaIcon = areaIcons[goal.area]
            const colors = areaColors[goal.area]
            
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                colors={colors}
                AreaIcon={AreaIcon}
                onToggle={handleToggleGoal}
                onDelete={handleDeleteGoal}
                onEdit={openEditModal}
                onToggleMilestone={toggleMilestone}
              />
            )
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Nenhuma meta encontrada</p>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              Criar primeira meta
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Goal Modal - Wizard Style */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={resetModal}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-lg",
                "bg-gradient-to-br from-slate-900 to-slate-950",
                "border border-white/10 rounded-2xl",
                "shadow-2xl overflow-hidden"
              )}
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-white/10">
                <button
                  onClick={resetModal}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    editingGoal 
                      ? "bg-blue-500/20 border border-blue-500/30" 
                      : "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                  )}>
                    {editingGoal ? (
                      <Edit2 className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Rocket className="h-5 w-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {editingGoal 
                        ? 'Atualize os detalhes da sua meta'
                        : modalStep === 1 ? 'Escolha a área da sua vida' 
                        : modalStep === 2 ? 'Descreva sua meta' 
                        : 'Defina o prazo'}
                    </p>
                  </div>
                </div>
                
                {/* Progress Steps - só para criação */}
                {!editingGoal && (
                  <div className="flex items-center gap-2 mt-4">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          modalStep >= step 
                            ? "bg-amber-500 text-slate-900" 
                            : "bg-slate-800 text-slate-500"
                        )}>
                          {modalStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                        </div>
                        {step < 3 && (
                          <div className={cn(
                            "flex-1 h-1 mx-2 rounded-full transition-all",
                            modalStep > step ? "bg-amber-500" : "bg-slate-800"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-zed">
                <AnimatePresence mode="wait">
                  {/* Step 1: Escolher Área */}
                  {modalStep === 1 && !editingGoal && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-slate-300 mb-4">
                        Em qual área da sua vida você quer evoluir?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(areaConfig).map(([area, config]) => {
                          const Icon = config.icon
                          const isSelected = newGoal.area === area
                          return (
                            <motion.button
                              key={area}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setNewGoal({ ...newGoal, area: area as Goal['area'] })}
                              className={cn(
                                "relative p-4 rounded-xl text-left transition-all",
                                "border-2",
                                isSelected 
                                  ? `bg-gradient-to-br ${config.bgColor} ${config.borderColor}` 
                                  : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                              )}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle2 className={cn("h-5 w-5", config.color)} />
                                </div>
                              )}
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                                `bg-gradient-to-br ${config.bgColor}`
                              )}>
                                <Icon className={cn("h-5 w-5", config.color)} />
                              </div>
                              <h3 className="font-semibold text-white text-sm">{area}</h3>
                              <p className="text-xs text-slate-400 mt-1">{config.description}</p>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Detalhes da Meta */}
                  {modalStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Área selecionada (badge) */}
                      {newGoal.area && (
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const config = areaConfig[newGoal.area]
                            const Icon = config?.icon || Sparkles
                            return (
                              <Badge variant="outline" className={cn("gap-1.5", config?.borderColor)}>
                                <Icon className={cn("h-3 w-3", config?.color)} />
                                {newGoal.area}
                              </Badge>
                            )
                          })()}
                          {!editingGoal && (
                            <button 
                              onClick={() => setModalStep(1)}
                              className="text-xs text-slate-500 hover:text-slate-300"
                            >
                              Alterar
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Título */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          O que você quer alcançar? *
                        </label>
                        <input
                          type="text"
                          placeholder={areaConfig[newGoal.area || 'Geral']?.examples[0] || "Descreva sua meta..."}
                          value={newGoal.title || ''}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          className={cn(
                            "w-full h-12 px-4 rounded-xl text-base",
                            "bg-slate-800/50 border border-white/10",
                            "text-white placeholder:text-slate-500",
                            "focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                          )}
                          autoFocus
                        />
                        {/* Sugestões de exemplos */}
                        {newGoal.area && !newGoal.title && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {areaConfig[newGoal.area]?.examples.map((example, i) => (
                              <button
                                key={i}
                                onClick={() => setNewGoal({ ...newGoal, title: example })}
                                className="px-2.5 py-1 text-xs rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 transition-colors"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Motivação */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Por que essa meta é importante? (opcional)
                        </label>
                        <textarea
                          placeholder="Sua motivação vai te ajudar a manter o foco..."
                          value={newGoal.description || ''}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          rows={3}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl resize-none",
                            "bg-slate-800/50 border border-white/10",
                            "text-white text-sm placeholder:text-slate-500",
                            "focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                          )}
                        />
                      </div>
                      
                      {/* Progresso - só na edição */}
                      {editingGoal && (
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-slate-300">
                              Progresso atual
                            </label>
                            <span className={cn(
                              "text-lg font-bold",
                              (newGoal.progressPercentage || 0) >= 100 ? "text-emerald-400" :
                              (newGoal.progressPercentage || 0) >= 50 ? "text-amber-400" :
                              "text-slate-300"
                            )}>
                              {newGoal.progressPercentage || 0}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={newGoal.progressPercentage || 0}
                            onChange={(e) => setNewGoal({ 
                              ...newGoal, 
                              progressPercentage: Number(e.target.value),
                              currentValue: Number(e.target.value),
                              targetValue: 100
                            })}
                            className={cn(
                              "w-full h-3 rounded-full appearance-none cursor-pointer",
                              "[&::-webkit-slider-thumb]:appearance-none",
                              "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
                              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500",
                              "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer",
                              "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                            )}
                            style={{
                              background: `linear-gradient(to right, rgb(245, 158, 11) 0%, rgb(245, 158, 11) ${newGoal.progressPercentage || 0}%, rgb(51, 65, 85) ${newGoal.progressPercentage || 0}%, rgb(51, 65, 85) 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>Começando</span>
                            <span>50%</span>
                            <span>Concluído</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Step 3: Prazo */}
                  {modalStep === 3 && !editingGoal && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-slate-300 mb-4">
                        Qual é o prazo para alcançar sua meta?
                      </p>
                      
                      {/* Seleção de Timeframe */}
                      <div className="space-y-3">
                        {timeframeConfig.map((tf) => {
                          const Icon = tf.icon
                          const isSelected = newGoal.timeframe === tf.value
                          return (
                            <motion.button
                              key={tf.value}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setNewGoal({ ...newGoal, timeframe: tf.value as Goal['timeframe'] })}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all",
                                "border-2",
                                isSelected 
                                  ? `bg-gradient-to-br ${tf.bgColor} ${tf.borderColor}` 
                                  : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                              )}
                            >
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                `bg-gradient-to-br ${tf.bgColor}`
                              )}>
                                <Icon className={cn("h-6 w-6", tf.color)} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{tf.label}</h3>
                                <p className="text-sm text-slate-400">{tf.subtitle}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className={cn("h-6 w-6", tf.color)} />
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                      
                      {/* Data específica */}
                      <div className="pt-4 border-t border-white/10">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Data limite específica (opcional)
                        </label>
                        <input
                          type="date"
                          value={newGoal.deadline || ''}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className={cn(
                            "w-full h-12 px-4 rounded-xl",
                            "bg-slate-800/50 border border-white/10",
                            "text-white text-sm",
                            "focus:outline-none focus:border-amber-500/50"
                          )}
                        />
                      </div>
                      
                      {/* Preview da meta */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-amber-400" />
                          <span className="text-xs font-medium text-amber-400">Preview da sua meta</span>
                        </div>
                        <p className="text-sm text-white font-medium">{newGoal.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          {newGoal.area && (
                            <span className="flex items-center gap-1">
                              {(() => {
                                const Icon = areaConfig[newGoal.area]?.icon || Sparkles
                                return <Icon className="h-3 w-3" />
                              })()}
                              {newGoal.area}
                            </span>
                          )}
                          <span>•</span>
                          <span>{timeframeConfig.find(t => t.value === newGoal.timeframe)?.label}</span>
                          {newGoal.deadline && (
                            <>
                              <span>•</span>
                              <span>até {new Date(newGoal.deadline).toLocaleDateString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Footer */}
              <div className="p-6 pt-4 border-t border-white/10 flex items-center justify-between">
                {/* Botão Voltar */}
                {modalStep > 1 && !editingGoal ? (
                  <Button
                    variant="ghost"
                    onClick={() => setModalStep(modalStep - 1)}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Voltar
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={resetModal}>
                    Cancelar
                  </Button>
                )}
                
                {/* Botão Próximo/Criar */}
                {editingGoal ? (
                  <Button 
                    variant="gold" 
                    onClick={handleSaveGoal}
                    disabled={!newGoal.title?.trim()}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Salvar Alterações
                  </Button>
                ) : modalStep < 3 ? (
                  <Button
                    variant="gold"
                    onClick={() => setModalStep(modalStep + 1)}
                    disabled={modalStep === 2 && !newGoal.title?.trim()}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    onClick={handleSaveGoal}
                    disabled={!newGoal.title?.trim()}
                    leftIcon={<Rocket className="h-4 w-4" />}
                  >
                    Criar Meta
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/10 text-amber-400',
  purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Card className="h-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-linear-to-br border border-white/10",
            colorMap[color].split(' ').slice(0, 2).join(' ')
          )}>
            <Icon className={cn("h-3 w-3 sm:h-4 sm:w-4", colorMap[color].split(' ')[2])} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">{label}</p>
            <p className="text-sm sm:text-lg font-bold text-white truncate">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

// Goal Card Component
interface GoalCardProps {
  goal: Goal
  colors: { bg: string; icon: string; border: string }
  AreaIcon: React.ElementType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (goal: Goal) => void
  onToggleMilestone: (goalId: string, milestoneId: string) => void
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  colors,
  AreaIcon,
  onToggle,
  onDelete,
  onEdit,
  onToggleMilestone,
}) => {
  const completedMilestones = goal.milestones.filter(m => m.completed).length
  const totalMilestones = goal.milestones.length

  return (
    <Card className={cn("relative overflow-hidden", goal.completed && "opacity-75")}>
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-linear-to-r",
        colors.bg.includes('red') ? "from-red-500 to-red-600" :
        colors.bg.includes('emerald') ? "from-emerald-500 to-emerald-600" :
        colors.bg.includes('blue') ? "from-blue-500 to-blue-600" :
        colors.bg.includes('purple') ? "from-purple-500 to-purple-600" :
        colors.bg.includes('amber') ? "from-amber-500 to-amber-600" :
        colors.bg.includes('pink') ? "from-pink-500 to-pink-600" :
        "from-slate-500 to-slate-600"
      )} style={{ width: `${goal.progressPercentage}%` }} />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "p-2 rounded-xl bg-linear-to-br border",
              colors.bg,
              colors.border
            )}>
              <AreaIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggle(goal.id)}
                  className="shrink-0"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
                <CardTitle className={cn(
                  "text-sm sm:text-base truncate",
                  goal.completed && "line-through text-slate-500"
                )}>
                  {goal.title}
                </CardTitle>
              </div>
              {goal.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{goal.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Progresso</span>
            <span className={cn(
              "text-xs font-semibold",
              goal.progressPercentage >= 100 ? "text-emerald-400" :
              goal.progressPercentage >= 75 ? "text-amber-400" :
              goal.progressPercentage >= 50 ? "text-blue-400" :
              "text-slate-300"
            )}>
              {goal.progressPercentage}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                "h-full rounded-full",
                goal.progressPercentage >= 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                colors.bg.includes('red') ? "bg-gradient-to-r from-red-500 to-red-400" :
                colors.bg.includes('blue') ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                colors.bg.includes('purple') ? "bg-gradient-to-r from-purple-500 to-purple-400" :
                colors.bg.includes('amber') ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                colors.bg.includes('pink') ? "bg-gradient-to-r from-pink-500 to-pink-400" :
                colors.bg.includes('cyan') ? "bg-gradient-to-r from-cyan-500 to-cyan-400" :
                "bg-gradient-to-r from-slate-500 to-slate-400"
              )}
            />
          </div>
          {/* Status do progresso */}
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-500">
              {goal.progressPercentage === 0 ? "Ainda não iniciado" :
               goal.progressPercentage < 25 ? "Começando" :
               goal.progressPercentage < 50 ? "Em andamento" :
               goal.progressPercentage < 75 ? "Na metade" :
               goal.progressPercentage < 100 ? "Quase lá!" :
               "Concluído! 🎉"}
            </span>
            {goal.deadline && (
              <span className="text-[10px] text-slate-500">
                {(() => {
                  const days = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  if (days < 0) return "Prazo expirado"
                  if (days === 0) return "Vence hoje"
                  if (days === 1) return "Vence amanhã"
                  if (days <= 7) return `${days} dias restantes`
                  return `${Math.ceil(days / 7)} semanas`
                })()}
              </span>
            )}
          </div>
        </div>

        {/* Milestones */}
        {goal.milestones.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Marcos</span>
              <span className="text-xs text-slate-500">
                {completedMilestones}/{totalMilestones}
              </span>
            </div>
            <div className="space-y-1.5">
              {goal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => onToggleMilestone(goal.id, milestone.id)}
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                  <span className={cn(
                    "text-xs flex-1",
                    milestone.completed ? "text-slate-500 line-through" : "text-slate-300"
                  )}>
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {goal.suggestedActions.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3 w-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Sugestões do ZED</span>
            </div>
            <div className="space-y-1">
              {goal.suggestedActions.map((action, i) => (
                <div
                  key={i}
                  className="text-xs text-slate-400 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10"
                >
                  • {action}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deadline */}
        {goal.deadline && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

