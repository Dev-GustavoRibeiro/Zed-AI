'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Brain,
  Zap,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
type TimerState = 'idle' | 'running' | 'paused' | 'completed'

interface PomodoroSession {
  id: string
  taskId?: string
  taskTitle?: string
  duration: number
  completed: boolean
  startTime: Date
  endTime?: Date
  notes?: string
}

const FOCUS_DURATIONS = [25, 30, 45, 50] // minutos
const SHORT_BREAK = 5 // minutos
const LONG_BREAK = 15 // minutos

export default function FocusPage() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [state, setState] = useState<TimerState>('idle')
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // em segundos
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [currentTask, setCurrentTask] = useState<string>('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Estatísticas
  const todaySessions = sessions.filter(s => {
    const today = new Date()
    const sessionDate = new Date(s.startTime)
    return sessionDate.toDateString() === today.toDateString()
  })
  const completedToday = todaySessions.filter(s => s.completed).length
  const totalMinutesToday = todaySessions
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.duration, 0)

  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, timeLeft])

  const handleStart = () => {
    setState('running')
  }

  const handlePause = () => {
    setState('paused')
  }

  const handleReset = () => {
    setState('idle')
    if (mode === 'focus') {
      setTimeLeft(selectedDuration * 60)
    } else if (mode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK * 60)
    } else {
      setTimeLeft(LONG_BREAK * 60)
    }
  }

  const handleComplete = () => {
    setState('completed')
    
    if (mode === 'focus') {
      // Salvar sessão
      const session: PomodoroSession = {
        id: Date.now().toString(),
        taskTitle: currentTask || 'Foco geral',
        duration: selectedDuration,
        completed: true,
        startTime: new Date(),
        endTime: new Date(),
      }
      setSessions([session, ...sessions])
    }

    // Auto-avançar para pausa ou próximo foco
    setTimeout(() => {
      if (mode === 'focus') {
        setMode('shortBreak')
        setTimeLeft(SHORT_BREAK * 60)
      } else {
        setMode('focus')
        setTimeLeft(selectedDuration * 60)
      }
      setState('idle')
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = mode === 'focus' 
    ? ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100
    : mode === 'shortBreak'
    ? ((SHORT_BREAK * 60 - timeLeft) / (SHORT_BREAK * 60)) * 100
    : ((LONG_BREAK * 60 - timeLeft) / (LONG_BREAK * 60)) * 100

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Timer de Foco</h1>
          <p className="text-sm sm:text-base text-slate-400">Pomodoro e produtividade</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Sessões Hoje"
          value={completedToday.toString()}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Minutos Focados"
          value={totalMinutesToday.toString()}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Sequência"
          value="3 dias"
          color="purple"
        />
        <StatCard
          icon={Zap}
          label="Média Diária"
          value={`${Math.round(totalMinutesToday / Math.max(completedToday, 1))} min`}
          color="amber"
        />
      </div>

      {/* Main Timer */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {/* Mode Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setMode('focus')
                    setTimeLeft(selectedDuration * 60)
                    setState('idle')
                  }}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    mode === 'focus'
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                  )}
                >
                  Foco
                </button>
                <button
                  onClick={() => {
                    setMode('shortBreak')
                    setTimeLeft(SHORT_BREAK * 60)
                    setState('idle')
                  }}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    mode === 'shortBreak'
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                  )}
                >
                  Pausa Curta
                </button>
                <button
                  onClick={() => {
                    setMode('longBreak')
                    setTimeLeft(LONG_BREAK * 60)
                    setState('idle')
                  }}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    mode === 'longBreak'
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                  )}
                >
                  Pausa Longa
                </button>
              </div>

              {/* Duration Selector (apenas para foco) */}
              {mode === 'focus' && state === 'idle' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duração do Foco
                  </label>
                  <div className="flex gap-2">
                    {FOCUS_DURATIONS.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          setSelectedDuration(dur)
                          setTimeLeft(dur * 60)
                        }}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          selectedDuration === dur
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                        )}
                      >
                        {dur} min
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Input */}
              {mode === 'focus' && (
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="No que você vai focar?"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    className={cn(
                      "w-full h-12 px-4 rounded-xl",
                      "bg-slate-900/50 border border-white/10",
                      "text-white placeholder:text-slate-500 text-sm",
                      "focus:outline-none focus:border-blue-500/50"
                    )}
                  />
                </div>
              )}

              {/* Timer Display */}
              <div className="relative mb-8">
                <div className="relative w-full aspect-square max-w-xs mx-auto">
                  {/* Progress Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke={mode === 'focus' ? '#3b82f6' : mode === 'shortBreak' ? '#10b981' : '#a855f7'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}%`}
                      initial={{ strokeDashoffset: `${2 * Math.PI * 45}%` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                  
                  {/* Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={cn(
                      "text-5xl sm:text-6xl font-black",
                      mode === 'focus' ? "text-blue-400" : mode === 'shortBreak' ? "text-emerald-400" : "text-purple-400"
                    )}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      {mode === 'focus' ? 'Foco' : mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {state === 'running' ? (
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Pause className="h-5 w-5" />}
                    onClick={handlePause}
                  >
                    Pausar
                  </Button>
                ) : state === 'paused' ? (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<RotateCcw className="h-5 w-5" />}
                      onClick={handleReset}
                    >
                      Resetar
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      leftIcon={<Play className="h-5 w-5" />}
                      onClick={handleStart}
                    >
                      Continuar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<RotateCcw className="h-5 w-5" />}
                      onClick={handleReset}
                    >
                      Resetar
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      leftIcon={<Play className="h-5 w-5" />}
                      onClick={handleStart}
                    >
                      Iniciar
                    </Button>
                  </>
                )}
              </div>

              {state === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 text-center"
                >
                  <div className="text-2xl font-bold text-emerald-400 mb-2">
                    🎉 Sessão Concluída!
                  </div>
                  <p className="text-slate-400">
                    {mode === 'focus' ? 'Hora de uma pausa!' : 'Pronto para focar novamente!'}
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Sessões Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {session.taskTitle}
                      </p>
                      <Badge size="sm" variant="secondary">
                        {session.duration}min
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(session.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    Nenhuma sessão ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
            "p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br border border-white/10",
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

