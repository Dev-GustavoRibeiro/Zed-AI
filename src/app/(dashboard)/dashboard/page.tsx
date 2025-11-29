'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  ListTodo, 
  Wallet, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Loader2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { useTasks } from '@/shared/hooks/useTasks'
import { useTransactions } from '@/shared/hooks/useTransactions'
import { useEvents } from '@/shared/hooks/useEvents'
import { useGoals } from '@/shared/hooks/useGoals'
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth'

export default function DashboardPage() {
  const { user } = useSupabaseAuth()
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { transactions, totalExpenses, isLoading: transactionsLoading } = useTransactions()
  const { events, weekEvents, isLoading: eventsLoading } = useEvents()
  const { goals, isLoading: goalsLoading } = useGoals()

  // Calcular estatísticas reais
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false
    const taskDate = new Date(t.due_date).toDateString()
    const today = new Date().toDateString()
    return taskDate === today
  })
  const completedTodayTasks = todayTasks.filter(t => t.completed)
  
  const activeGoals = goals.filter(g => !g.completed)
  const goalsNearDeadline = activeGoals.filter(g => {
    if (!g.deadline) return false
    const deadline = new Date(g.deadline)
    const today = new Date()
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7 && daysUntil >= 0
  })

  // Últimas transações (5)
  const recentTransactions = transactions.slice(0, 4)

  // Próximos eventos
  const upcomingEvents = weekEvents.slice(0, 3)

  // Tasks do dia para exibição
  const todayTasksForDisplay = tasks
    .filter(t => {
      if (!t.due_date) return true // Mostrar tarefas sem data também
      const taskDate = new Date(t.due_date).toDateString()
      const today = new Date().toDateString()
      return taskDate === today || !t.completed
    })
    .slice(0, 5)

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8",
          "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
          "border border-white/10"
        )}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <ZedLogo size="lg" className="sm:hidden" />
            <ZedLogo size="xl" className="hidden sm:block" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                Olá, <span className="text-gradient-zed">{userName}</span>!
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-400">
                Pronto para organizar seu dia? ZED está aqui para ajudar.
              </p>
            </div>
          </div>
          
          <Link href="/dashboard/chat" className="w-full sm:w-auto">
            <Button variant="gold" rightIcon={<MessageSquare className="h-4 w-4" />} className="w-full sm:w-auto">
              Falar com ZED
            </Button>
          </Link>
        </div>

        {/* Accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/40 via-amber-500/40 to-slate-500/40" />
      </motion.div>

      {/* Stats Grid - 2 colunas em mobile, 4 em desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard
          icon={ListTodo}
          label="Tarefas Hoje"
          value={tasksLoading ? '...' : String(todayTasks.length || tasks.filter(t => !t.completed).length)}
          subValue={`${completedTodayTasks.length} concluídas`}
          color="blue"
          delay={0}
        />
        <StatCard
          icon={Wallet}
          label="Gastos do Mês"
          value={transactionsLoading ? '...' : `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          subValue="Este mês"
          color="emerald"
          delay={0.1}
        />
        <StatCard
          icon={Calendar}
          label="Próximos Eventos"
          value={eventsLoading ? '...' : String(weekEvents.length)}
          subValue="Esta semana"
          color="amber"
          delay={0.2}
        />
        <StatCard
          icon={Target}
          label="Metas Ativas"
          value={goalsLoading ? '...' : String(activeGoals.length)}
          subValue={`${goalsNearDeadline.length} próximas do prazo`}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Main Grid - empilhado em mobile */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader icon={<Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />}>
              <CardTitle className="text-base sm:text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <QuickActionCard
                  icon={MessageSquare}
                  title="Chat com ZED"
                  description="Converse com seu assistente"
                  href="/dashboard/chat"
                  color="blue"
                />
                <QuickActionCard
                  icon={ListTodo}
                  title="Minha Rotina"
                  description="Gerencie suas tarefas diárias"
                  href="/dashboard/routine"
                  color="purple"
                />
                <QuickActionCard
                  icon={Wallet}
                  title="Financeiro"
                  description="Controle seus gastos"
                  href="/dashboard/finances"
                  color="emerald"
                />
                <QuickActionCard
                  icon={Calendar}
                  title="Agenda"
                  description="Organize seus compromissos"
                  href="/dashboard/schedule"
                  color="amber"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ZED Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />}>
              <CardTitle className="text-base sm:text-lg">Sugestões do ZED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <SuggestionItem
                title="Revisar orçamento"
                description="Você gastou 30% do limite em alimentação"
                icon={AlertCircle}
                priority="warning"
              />
              <SuggestionItem
                title="Agendar dentista"
                description="Última consulta há 8 meses"
                icon={Clock}
                priority="info"
              />
              <SuggestionItem
                title="Beba água"
                description="Lembrete: hidratação é importante!"
                icon={CheckCircle2}
                priority="success"
              />
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/chat" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                  Ver mais sugestões
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader 
            icon={<ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />}
            action={
              <Link href="/dashboard/routine">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />} className="text-xs sm:text-sm">
                  Ver todas
                </Button>
              </Link>
            }
          >
            <CardTitle className="text-base sm:text-lg">Tarefas de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : todayTasksForDisplay.length > 0 ? (
                todayTasksForDisplay.map(task => (
                  <TaskItem
                    key={task.id}
                    title={task.title}
                    time={task.due_time || ''}
                    completed={task.completed}
                    priority={task.priority === 'high' ? 'high' : undefined}
                  />
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">Nenhuma tarefa para hoje</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader 
              icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />}
              action={
                <Link href="/dashboard/finances">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />} className="text-xs sm:text-sm">
                    Ver mais
                  </Button>
                </Link>
              }
            >
              <CardTitle className="text-base sm:text-lg">Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      title={tx.title}
                      category={tx.category}
                      amount={tx.amount}
                      date={new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">Nenhuma transação registrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader 
              icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />}
              action={
                <Link href="/dashboard/schedule">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />} className="text-xs sm:text-sm">
                    Ver agenda
                  </Button>
                </Link>
              }
            >
              <CardTitle className="text-base sm:text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <EventItem
                      key={event.id}
                      title={event.title}
                      date={new Date(event.start_time).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                      time={new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      location={event.location || ''}
                    />
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">Nenhum evento próximo</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  subValue: string
  trend?: 'up' | 'down'
  color: 'blue' | 'emerald' | 'amber' | 'purple'
  delay: number
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500/10 to-blue-600/5',
    iconBg: 'from-blue-500/20 to-blue-600/10',
    icon: 'text-blue-400',
    accent: 'from-blue-500/40 to-blue-600/20',
  },
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-600/5',
    iconBg: 'from-emerald-500/20 to-emerald-600/10',
    icon: 'text-emerald-400',
    accent: 'from-emerald-500/40 to-emerald-600/20',
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-600/5',
    iconBg: 'from-amber-500/20 to-amber-600/10',
    icon: 'text-amber-400',
    accent: 'from-amber-500/40 to-amber-600/20',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    iconBg: 'from-purple-500/20 to-purple-600/10',
    icon: 'text-purple-400',
    accent: 'from-purple-500/40 to-purple-600/20',
  },
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend, 
  color, 
  delay 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="group"
  >
    <div className={cn(
      "relative overflow-hidden rounded-2xl h-28 sm:h-32 md:h-36",
      "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
      "border border-white/10 hover:border-white/20",
      "shadow-lg shadow-black/20",
      "transition-all duration-300"
    )}>
      {/* Background glow effect */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity",
        color === 'blue' && 'bg-blue-500',
        color === 'emerald' && 'bg-emerald-500',
        color === 'amber' && 'bg-amber-500',
        color === 'purple' && 'bg-purple-500'
      )} />
      
      <div className="relative h-full flex flex-col justify-between p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "p-2 sm:p-2.5 rounded-xl bg-gradient-to-br border",
            color === 'blue' && 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
            color === 'emerald' && 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
            color === 'amber' && 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
            color === 'purple' && 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
          )}>
            <Icon className={cn(
              "h-4 w-4 sm:h-5 sm:w-5",
              colorClasses[color].icon
            )} />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            {label}
          </span>
        </div>
        
        {/* Value */}
        <div>
          <p className={cn(
            "text-2xl sm:text-3xl md:text-4xl font-black tracking-tight",
            color === 'blue' && 'text-white',
            color === 'emerald' && 'text-white',
            color === 'amber' && 'text-white',
            color === 'purple' && 'text-white'
          )}>
            {value}
          </p>
          <p className={cn(
            "text-[11px] sm:text-xs mt-1 font-medium",
            trend === 'down' ? 'text-emerald-400' : trend === 'up' ? 'text-red-400' : 'text-slate-500'
          )}>
            {subValue}
          </p>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
        color === 'blue' && 'from-blue-500/60 via-blue-400/80 to-blue-500/60',
        color === 'emerald' && 'from-emerald-500/60 via-emerald-400/80 to-emerald-500/60',
        color === 'amber' && 'from-amber-500/60 via-amber-400/80 to-amber-500/60',
        color === 'purple' && 'from-purple-500/60 via-purple-400/80 to-purple-500/60'
      )} />
    </div>
  </motion.div>
)

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ElementType
  title: string
  description: string
  href: string
  color: 'blue' | 'purple' | 'emerald' | 'amber'
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  href,
  color 
}) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-3 sm:p-4 rounded-xl border border-white/10 cursor-pointer h-full",
        "bg-gradient-to-br",
        colorClasses[color].bg,
        "hover:border-white/20 transition-all duration-200"
      )}
    >
      <div className={cn(
        "p-1.5 sm:p-2 rounded-lg w-fit bg-gradient-to-br border border-white/10",
        colorClasses[color].iconBg
      )}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colorClasses[color].icon)} />
      </div>
      <h3 className="mt-2 sm:mt-3 font-semibold text-white text-sm sm:text-base">{title}</h3>
      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2">{description}</p>
    </motion.div>
  </Link>
)

// Suggestion Item Component
interface SuggestionItemProps {
  title: string
  description: string
  icon: React.ElementType
  priority: 'warning' | 'info' | 'success'
}

const priorityColors = {
  warning: {
    bg: 'bg-gradient-to-br from-amber-500/15 to-amber-600/5',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/20'
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-500/15 to-blue-600/5',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/20'
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-500/15 to-emerald-600/5',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20'
  },
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  priority 
}) => (
  <motion.div 
    whileHover={{ scale: 1.02, x: 4 }}
    className={cn(
      "p-3 sm:p-3.5 rounded-xl border cursor-pointer",
      "transition-all duration-200",
      priorityColors[priority].bg,
      priorityColors[priority].border,
      "hover:shadow-lg hover:shadow-black/20"
    )}
  >
    <div className="flex items-start gap-3">
      <div className={cn(
        "p-1.5 rounded-lg shrink-0",
        priorityColors[priority].iconBg
      )}>
        <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", priorityColors[priority].icon)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-white truncate">{title}</p>
        <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1 mt-0.5">{description}</p>
      </div>
    </div>
  </motion.div>
)

// Task Item Component
interface TaskItemProps {
  title: string
  time: string
  completed: boolean
  priority?: 'high' | 'medium' | 'low'
}

const TaskItem: React.FC<TaskItemProps> = ({ title, time, completed, priority }) => (
  <div className={cn(
    "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl",
    "bg-white/5 border border-white/5",
    "hover:bg-white/8 transition-colors"
  )}>
    <div className={cn(
      "h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center shrink-0",
      completed 
        ? "bg-emerald-500 border-emerald-500" 
        : "border-slate-600"
    )}>
      {completed && <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn(
        "text-xs sm:text-sm font-medium truncate",
        completed ? "text-slate-400 line-through" : "text-white"
      )}>
        {title}
      </p>
    </div>
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {priority === 'high' && (
        <Badge variant="destructive" size="sm" className="text-[10px] sm:text-xs px-1.5 sm:px-2">Urgente</Badge>
      )}
      <span className="text-[10px] sm:text-xs text-slate-500">{time}</span>
    </div>
  </div>
)

// Transaction Item Component
interface TransactionItemProps {
  title: string
  category: string
  amount: number
  date: string
}

const TransactionItem: React.FC<TransactionItemProps> = ({ title, category, amount, date }) => (
  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-white truncate">{title}</p>
      <p className="text-[10px] sm:text-xs text-slate-500">{category}</p>
    </div>
    <div className="text-right shrink-0 ml-2">
      <p className={cn(
        "text-xs sm:text-sm font-semibold",
        amount > 0 ? "text-emerald-400" : "text-red-400"
      )}>
        {amount > 0 ? '+' : ''}{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
      <p className="text-[10px] sm:text-xs text-slate-500">{date}</p>
    </div>
  </div>
)

// Event Item Component
interface EventItemProps {
  title: string
  date: string
  time: string
  location: string
}

const EventItem: React.FC<EventItemProps> = ({ title, date, time, location }) => (
  <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
    <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-white truncate">{title}</p>
      <p className="text-[10px] sm:text-xs text-slate-500 truncate">{location}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-[10px] sm:text-xs font-medium text-slate-300">{date}</p>
      <p className="text-[10px] sm:text-xs text-slate-500">{time}</p>
    </div>
  </div>
)
