'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  Calendar,
  Flag,
  Filter,
  Search,
  X,
  Edit2,
  Target,
  Zap,
  TrendingUp,
  Mic,
  MicOff,
  MoveRight,
  Brain,
  Battery,
  Gauge,
  Loader2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { useTasks, Task as TaskType } from '@/shared/hooks/useTasks'

interface Task {
  id: string
  title: string
  description?: string | null
  completed: boolean
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  energy_level?: 'low' | 'medium' | 'high' | null
  dueTime?: string | null
  dueDate?: string | null
  category: 'Pessoal' | 'Trabalho' | 'Estudos' | 'Saúde' | 'Casa/Família'
  estimated_duration?: number | null
}

const categories = ['Todos', 'Pessoal', 'Trabalho', 'Estudos', 'Saúde', 'Casa/Família']
const statusOptions = [
  { value: 'todo', label: 'A Fazer', color: 'slate' },
  { value: 'doing', label: 'Fazendo', color: 'blue' },
  { value: 'done', label: 'Concluído', color: 'emerald' },
]

export default function RoutinePage() {
  const { tasks: dbTasks, isLoading, addTask, updateTask, deleteTask, toggleTask, updateStatus } = useTasks()
  
  // Converter tasks do banco para o formato local
  // Formatando o horário de forma consistente
  const tasks: Task[] = dbTasks.map(t => {
    // Formatar due_time para exibição (pode vir como "HH:MM:SS" do banco)
    let formattedDueTime = t.due_time
    if (t.due_time && t.due_time.length > 5) {
      formattedDueTime = t.due_time.slice(0, 5) // Pegar apenas HH:MM
    }
    
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      status: t.status,
      priority: t.priority,
      effort: t.effort,
      energy_level: t.energy_level,
      dueTime: formattedDueTime,
      dueDate: t.due_date,
      category: t.category,
      estimated_duration: t.estimated_duration,
    }
  })

  const [filter, setFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    effort: 'medium',
    category: 'Pessoal',
    dueTime: '',
  })

  // Tarefas organizadas por status (Kanban)
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo' && !t.completed),
    doing: tasks.filter(t => t.status === 'doing' && !t.completed),
    done: tasks.filter(t => t.status === 'done' || t.completed),
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'Todos' || task.category === filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || task.status === statusFilter
    return matchesFilter && matchesSearch && matchesStatus
  })

  const completedCount = tasks.filter(t => t.completed || t.status === 'done').length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Prioridade inteligente - reorganiza tarefas
  const getSmartPriority = (task: Task): number => {
    let score = 0
    
    // Prioridade base
    if (task.priority === 'high') score += 30
    else if (task.priority === 'medium') score += 15
    
    // Prazo próximo
    if (task.dueTime) {
      const now = new Date()
      const [hours, minutes] = task.dueTime.split(':').map(Number)
      const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
      const diff = due.getTime() - now.getTime()
      if (diff > 0 && diff < 2 * 60 * 60 * 1000) score += 20 // Próximas 2 horas
    }
    
    // Esforço baixo = mais fácil de fazer
    if (task.effort === 'low') score += 10
    
    return score
  }

  const smartSortedTasks = [...filteredTasks].sort((a, b) => getSmartPriority(b) - getSmartPriority(a))

  const handleToggleTask = async (id: string) => {
    await toggleTask(id)
  }

  const handleUpdateTaskStatus = async (id: string, newStatus: 'todo' | 'doing' | 'done') => {
    await updateStatus(id, newStatus)
  }

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id)
  }

  const handleSaveTask = async () => {
    if (!newTask.title) return

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: newTask.title,
        description: newTask.description || null,
        status: (newTask.status || 'todo') as 'todo' | 'doing' | 'done',
        priority: (newTask.priority || 'medium') as 'low' | 'medium' | 'high',
        effort: (newTask.effort || 'medium') as 'low' | 'medium' | 'high',
        energy_level: newTask.energy_level || null,
        category: (newTask.category || 'Pessoal') as 'Pessoal' | 'Trabalho' | 'Estudos' | 'Saúde' | 'Casa/Família',
        due_time: newTask.dueTime || null,
        due_date: newTask.dueDate || null,
        estimated_duration: newTask.estimated_duration || null,
      })
    } else {
      await addTask({
        title: newTask.title,
        description: newTask.description || null,
        completed: false,
        status: (newTask.status || 'todo') as 'todo' | 'doing' | 'done',
        priority: (newTask.priority || 'medium') as 'low' | 'medium' | 'high',
        effort: (newTask.effort || 'medium') as 'low' | 'medium' | 'high',
        energy_level: newTask.energy_level || null,
        category: (newTask.category || 'Pessoal') as 'Pessoal' | 'Trabalho' | 'Estudos' | 'Saúde' | 'Casa/Família',
        due_time: newTask.dueTime || null,
        due_date: newTask.dueDate || null,
        estimated_duration: newTask.estimated_duration || null,
      })
    }

    setIsModalOpen(false)
    setEditingTask(null)
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', effort: 'medium', category: 'Pessoal', dueTime: '' })
  }

  const handleVoiceInput = () => {
    setIsVoiceMode(true)
    // Simulação - em produção, integraria com API de voz
    setTimeout(() => {
      const voiceText = "Lembra de pagar o cartão na sexta"
      // Parse simples do comando de voz
      if (voiceText.toLowerCase().includes('lembra') || voiceText.toLowerCase().includes('lembre')) {
        const taskTitle = voiceText.replace(/lembra de|lembre de/gi, '').trim()
        setNewTask({
          ...newTask,
          title: taskTitle,
          priority: 'medium',
          category: 'Pessoal',
        })
        setIsModalOpen(true)
      }
      setIsVoiceMode(false)
    }, 2000)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setNewTask(task)
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
          <h1 className="text-xl sm:text-2xl font-black text-white">Minha Rotina</h1>
          <p className="text-sm sm:text-base text-slate-400">Organize suas tarefas e hábitos diários</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            leftIcon={isVoiceMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            onClick={handleVoiceInput}
            disabled={isVoiceMode}
          >
            {isVoiceMode ? 'Gravando...' : 'Voz'}
          </Button>
          <Button 
            variant="gold" 
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Tarefa
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={Target}
          label="Progresso Hoje"
          value={`${completedCount}/${totalCount}`}
          progress={progress}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Concluídas"
          value={completedCount.toString()}
          color="emerald"
        />
        <StatCard
          icon={Zap}
          label="Em Andamento"
          value={tasksByStatus.doing.length.toString()}
          color="amber"
        />
        <StatCard
          icon={Brain}
          label="Prioridade Inteligente"
          value={smartSortedTasks.length > 0 ? smartSortedTasks[0].title.substring(0, 15) + '...' : 'N/A'}
          color="purple"
        />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-slate-400">Progresso do dia</span>
            <span className="text-xs sm:text-sm font-semibold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-xl",
              "bg-slate-900/50 border border-white/10",
              "text-white placeholder:text-slate-500 text-sm",
              "focus:outline-none focus:border-blue-500/50"
            )}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap",
                  "transition-all duration-200",
                  filter === cat
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(statusFilter === status.value ? null : status.value)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap",
                  "transition-all duration-200",
                  statusFilter === status.value
                    ? `bg-${status.color}-500/20 text-${status.color}-300 border border-${status.color}-500/30`
                    : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban View - Melhorado */}
      <div className="grid md:grid-cols-3 gap-4">
        {statusOptions.map((status) => {
          const statusTasks = filteredTasks.filter(t => t.status === status.value)
          const statusColorMap: Record<'todo' | 'doing' | 'done', { bg: string; border: string; header: string; accent: string }> = {
            todo: { bg: 'from-slate-800/50 to-slate-900/30', border: 'border-slate-500/30', header: 'bg-slate-800/30', accent: 'text-slate-400' },
            doing: { bg: 'from-blue-800/50 to-blue-900/30', border: 'border-blue-500/30', header: 'bg-blue-800/30', accent: 'text-blue-400' },
            done: { bg: 'from-emerald-800/50 to-emerald-900/30', border: 'border-emerald-500/30', header: 'bg-emerald-800/30', accent: 'text-emerald-400' },
          }
          const statusColor = statusColorMap[status.value as 'todo' | 'doing' | 'done']

          return (
            <motion.div
              key={status.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: statusOptions.indexOf(status) * 0.1 }}
            >
              <Card className={cn(
                "h-full flex flex-col",
                `bg-linear-to-br ${statusColor.bg}`,
                statusColor.border
              )}>
                <CardHeader className={cn("pb-3", statusColor.header)}>
                  <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", statusColor.accent.replace('text-', 'bg-'))} />
                      <span>{status.label}</span>
                    </div>
                    <Badge 
                      size="sm" 
                      variant="secondary"
                      className={cn("font-semibold", statusColor.accent)}
                    >
                      {statusTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 min-h-[200px] overflow-y-auto scrollbar-none">
                  <Reorder.Group
                    axis="y"
                    values={statusTasks}
                    onReorder={() => {
                      // Reordenação local desabilitada - dados vêm do banco
                    }}
                    className="space-y-2"
                  >
                    <AnimatePresence mode="popLayout">
                      {statusTasks.length > 0 ? statusTasks.map((task) => (
                        <Reorder.Item
                          key={task.id}
                          value={task}
                          dragListener
                          dragConstraints={{ top: 0, bottom: 0 }}
                          whileDrag={{ 
                            scale: 1.05,
                            zIndex: 50,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TaskCard
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                            onEdit={openEditModal}
                            onStatusChange={handleUpdateTaskStatus}
                          />
                        </Reorder.Item>
                      )) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                              "p-3 rounded-full bg-linear-to-br",
                              statusColor.bg,
                              "border",
                              statusColor.border
                            )}>
                              <Circle className={cn("h-6 w-6", statusColor.accent)} />
                            </div>
                            <p className="text-sm text-slate-500">Nenhuma tarefa</p>
                            <p className="text-xs text-slate-600">Arraste tarefas aqui</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Reorder.Group>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', effort: 'medium', category: 'Pessoal', dueTime: '' })
        }}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <div className="space-y-4">
          <Input
            label="Título"
            placeholder="O que você precisa fazer?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          
          <Input
            label="Descrição (opcional)"
            placeholder="Adicione mais detalhes..."
            value={newTask.description || ''}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Horário
              </label>
              <input
                type="time"
                value={newTask.dueTime || ''}
                onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
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
                Data
              </label>
              <input
                type="date"
                value={newTask.dueDate || ''}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              >
                <option value="todo">A Fazer</option>
                <option value="doing">Fazendo</option>
                <option value="done">Concluído</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Prioridade
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Esforço
              </label>
              <select
                value={newTask.effort}
                onChange={(e) => setNewTask({ ...newTask, effort: e.target.value as Task['effort'] })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white text-sm",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              >
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Categoria
            </label>
            <div className="flex gap-2 flex-wrap">
              {categories.filter(c => c !== 'Todos').map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewTask({ ...newTask, category: cat as Task['category'] })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs sm:text-sm",
                    "transition-all duration-200",
                    newTask.category === cat
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={handleSaveTask}>
            {editingTask ? 'Salvar' : 'Criar Tarefa'}
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
  progress?: number
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/10 text-amber-400',
  purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, progress, color }) => (
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
        {progress !== undefined && (
          <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

// Task Card Component (para Kanban)
interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: 'todo' | 'doing' | 'done') => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit, onStatusChange }) => {
  const statusColors = {
    todo: { 
      border: 'border-slate-500/30', 
      bg: 'bg-slate-900/50 hover:bg-slate-800/60',
      accent: 'text-slate-400',
      glow: 'hover:shadow-slate-500/20'
    },
    doing: { 
      border: 'border-blue-500/40', 
      bg: 'bg-blue-900/20 hover:bg-blue-800/30',
      accent: 'text-blue-400',
      glow: 'hover:shadow-blue-500/30'
    },
    done: { 
      border: 'border-emerald-500/40', 
      bg: 'bg-emerald-900/20 hover:bg-emerald-800/30',
      accent: 'text-emerald-400',
      glow: 'hover:shadow-emerald-500/30'
    },
  }[task.status]

  const priorityColors = {
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const categoryColors = {
    Pessoal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Trabalho: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Estudos: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Saúde: 'bg-red-500/20 text-red-400 border-red-500/30',
    'Casa/Família': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
        "cursor-grab active:cursor-grabbing",
        statusColors.border,
        statusColors.bg,
        statusColors.glow,
        "hover:shadow-lg",
        task.completed || task.status === 'done' && "opacity-75"
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <button
          onClick={() => onToggle(task.id)}
          className="shrink-0 mt-0.5 transition-transform hover:scale-110"
        >
          {task.completed || task.status === 'done' ? (
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
          ) : (
            <Circle className={cn("h-4 w-4 sm:h-5 sm:w-5 hover:text-white transition-colors", statusColors.accent)} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm sm:text-base font-semibold truncate",
            task.completed || task.status === 'done' ? "text-slate-500 line-through" : "text-white"
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">{task.description}</p>
          )}
          {task.category && (
            <Badge 
              size="sm" 
              className={cn(
                "text-[10px] px-1.5 py-0.5 mt-1.5",
                categoryColors[task.category as keyof typeof categoryColors] || priorityColors.medium
              )}
            >
              {task.category}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {task.dueTime && (
            <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5">
              <Clock className="h-3 w-3" />
              {task.dueTime}
            </span>
          )}
          <Badge 
            size="sm" 
            className={cn(
              "text-[10px] px-2 py-0.5 font-medium",
              priorityColors[task.priority]
            )}
          >
            {task.priority === 'high' ? '🔴 Alta' : task.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Editar"
          >
            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      {/* Status Navigation - Melhorado */}
      <div className="flex items-center justify-between gap-1 mt-3 pt-3 border-t border-white/10">
        {task.status !== 'todo' && (
          <button
            onClick={() => onStatusChange(task.id, 'todo')}
            className="text-[10px] sm:text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <MoveRight className="h-3 w-3 rotate-180" />
            A Fazer
          </button>
        )}
        {task.status !== 'doing' && (
          <button
            onClick={() => onStatusChange(task.id, 'doing')}
            className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all"
          >
            {task.status === 'todo' ? (
              <>
                Fazendo
                <MoveRight className="h-3 w-3" />
              </>
            ) : (
              <>
                <MoveRight className="h-3 w-3 rotate-180" />
                Fazendo
              </>
            )}
          </button>
        )}
        {task.status !== 'done' && (
          <button
            onClick={() => onStatusChange(task.id, 'done')}
            className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-all"
          >
            Concluído
            <MoveRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
