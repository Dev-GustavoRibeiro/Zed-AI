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
  Wallet,
  Briefcase,
  Home,
  Users,
  ArrowRight,
  Lightbulb,
  Loader2,
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
  area: 'Saúde' | 'Financeiro' | 'Estudos' | 'Trabalho' | 'Pessoal' | 'Relacionamentos' | 'Geral'
  timeframe: 'short' | 'medium' | 'long'
  targetValue?: number | null
  currentValue?: number | null
  progressPercentage: number
  deadline?: string | null
  completed: boolean
  milestones: Array<{ id: string; title: string; completed: boolean }>
  suggestedActions: string[]
}

const areas = ['Todos', 'Saúde', 'Financeiro', 'Estudos', 'Trabalho', 'Pessoal', 'Relacionamentos', 'Geral']
const timeframes = [
  { value: 'short', label: 'Curto Prazo (1 mês)', icon: Zap },
  { value: 'medium', label: 'Médio Prazo (3-6 meses)', icon: Calendar },
  { value: 'long', label: 'Longo Prazo (1 ano+)', icon: Target },
]

const areaIcons = {
  Saúde: Heart,
  Financeiro: Wallet,
  Estudos: GraduationCap,
  Trabalho: Briefcase,
  Pessoal: Target,
  Relacionamentos: Users,
  Geral: Circle,
}

const areaColors = {
  Saúde: { bg: 'from-red-500/20 to-red-600/10', icon: 'text-red-400', border: 'border-red-500/30' },
  Financeiro: { bg: 'from-emerald-500/20 to-emerald-600/10', icon: 'text-emerald-400', border: 'border-emerald-500/30' },
  Estudos: { bg: 'from-blue-500/20 to-blue-600/10', icon: 'text-blue-400', border: 'border-blue-500/30' },
  Trabalho: { bg: 'from-purple-500/20 to-purple-600/10', icon: 'text-purple-400', border: 'border-purple-500/30' },
  Pessoal: { bg: 'from-amber-500/20 to-amber-600/10', icon: 'text-amber-400', border: 'border-amber-500/30' },
  Relacionamentos: { bg: 'from-pink-500/20 to-pink-600/10', icon: 'text-pink-400', border: 'border-pink-500/30' },
  Geral: { bg: 'from-slate-500/20 to-slate-600/10', icon: 'text-slate-400', border: 'border-slate-500/30' },
}

export default function GoalsPage() {
  const { goals: dbGoals, isLoading, addGoal, updateGoal, deleteGoal, toggleGoal } = useGoals()
  
  // Converter metas do banco para o formato local
  const goals: Goal[] = dbGoals.map(g => ({
    id: g.id,
    title: g.title,
    description: g.description,
    area: g.area,
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
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    area: 'Geral',
    timeframe: 'short',
    targetValue: 0,
    currentValue: 0,
    progressPercentage: 0,
    completed: false,
    milestones: [],
    suggestedActions: [],
  })

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
    if (!newGoal.title) return

    const progress = newGoal.targetValue && newGoal.currentValue
      ? Math.round((newGoal.currentValue / newGoal.targetValue) * 100)
      : 0

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        title: newGoal.title,
        description: newGoal.description || null,
        area: (newGoal.area || 'Geral') as GoalType['area'],
        timeframe: (newGoal.timeframe || 'short') as GoalType['timeframe'],
        target_value: newGoal.targetValue || null,
        current_value: newGoal.currentValue || null,
        progress_percentage: progress,
        deadline: newGoal.deadline || null,
      })
    } else {
      await addGoal({
        title: newGoal.title,
        description: newGoal.description || null,
        area: (newGoal.area || 'Geral') as GoalType['area'],
        timeframe: (newGoal.timeframe || 'short') as GoalType['timeframe'],
        target_value: newGoal.targetValue || null,
        current_value: newGoal.currentValue || 0,
        progress_percentage: progress,
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
      targetValue: 0,
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
    } else if (goal.area === 'Financeiro') {
      actions.push('Configure transferência automática')
      actions.push('Revise seus gastos mensais')
    } else if (goal.area === 'Estudos') {
      actions.push('Estude 1h por dia')
      actions.push('Pratique com projetos pessoais')
    }
    
    return actions
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal(goal)
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
          <h1 className="text-xl sm:text-2xl font-black text-white">Metas</h1>
          <p className="text-sm sm:text-base text-slate-400">Defina e acompanhe seus objetivos</p>
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

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingGoal(null)
          setNewGoal({
            title: '',
            description: '',
            area: 'Geral',
            timeframe: 'short',
            targetValue: 0,
            currentValue: 0,
            progressPercentage: 0,
            completed: false,
            milestones: [],
            suggestedActions: [],
          })
        }}
        title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
      >
        <div className="space-y-4">
          <Input
            label="Título"
            placeholder="Qual é sua meta?"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
          />
          
          <Input
            label="Descrição (opcional)"
            placeholder="Adicione mais detalhes..."
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Área
              </label>
              <select
                value={newGoal.area}
                onChange={(e) => setNewGoal({ ...newGoal, area: e.target.value as Goal['area'] })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              >
                {areas.filter(a => a !== 'Todos').map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Prazo
              </label>
              <select
                value={newGoal.timeframe}
                onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value as Goal['timeframe'] })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              >
                {timeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Valor Atual
              </label>
              <input
                type="number"
                value={newGoal.currentValue || 0}
                onChange={(e) => setNewGoal({ ...newGoal, currentValue: Number(e.target.value) })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Valor Alvo
              </label>
              <input
                type="number"
                value={newGoal.targetValue || 0}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Data Limite (opcional)
            </label>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className={cn(
                "w-full h-10 px-3 rounded-xl",
                "bg-slate-900/50 border border-white/10",
                "text-white text-sm",
                "focus:outline-none focus:border-blue-500/50"
              )}
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={handleSaveGoal}>
            {editingGoal ? 'Salvar' : 'Criar Meta'}
          </Button>
        </ModalFooter>
      </Modal>
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
            <span className="text-xs font-semibold text-white">
              {goal.currentValue || 0} / {goal.targetValue || 0} ({goal.progressPercentage}%)
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                "h-full bg-linear-to-r rounded-full",
                colors.bg.includes('red') ? "from-red-500 to-red-600" :
                colors.bg.includes('emerald') ? "from-emerald-500 to-emerald-600" :
                colors.bg.includes('blue') ? "from-blue-500 to-blue-600" :
                colors.bg.includes('purple') ? "from-purple-500 to-purple-600" :
                colors.bg.includes('amber') ? "from-amber-500 to-amber-600" :
                colors.bg.includes('pink') ? "from-pink-500 to-pink-600" :
                "from-slate-500 to-slate-600"
              )}
            />
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

