'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
  Repeat,
  Edit2,
  Trash2,
  Video,
  Phone,
  Loader2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { useEvents, Event as EventType } from '@/shared/hooks/useEvents'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  time: string
  endTime?: string
  location?: string
  type: 'meeting' | 'personal' | 'reminder' | 'call'
  color: string
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const getColorForCategory = (category?: string | null): string => {
  const colorMap: Record<string, string> = {
    meeting: 'blue',
    personal: 'emerald',
    reminder: 'amber',
    call: 'purple',
  }
  return colorMap[category || 'personal'] || 'blue'
}

export default function SchedulePage() {
  const { events: dbEvents, isLoading, createEvent, deleteEvent } = useEvents()
  
  // Converter eventos do banco para o formato local
  const events: Event[] = dbEvents.map(e => {
    const startDate = new Date(e.start_time)
    const endDate = e.end_time ? new Date(e.end_time) : null
    return {
      id: e.id,
      title: e.title,
      description: e.description || undefined,
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().slice(0, 5),
      endTime: endDate ? endDate.toTimeString().slice(0, 5) : undefined,
      location: e.location || undefined,
      type: (e.category as Event['type']) || 'personal',
      color: getColorForCategory(e.category),
    }
  })

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [view, setView] = useState<'month' | 'week' | 'list'>('month')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    type: 'meeting' as Event['type'],
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr)
  }

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return
    
    const startTime = new Date(`${newEvent.date}T${newEvent.time}:00`).toISOString()
    const endTime = newEvent.endTime 
      ? new Date(`${newEvent.date}T${newEvent.endTime}:00`).toISOString()
      : undefined
    
    await createEvent({
      title: newEvent.title,
      description: newEvent.description || undefined,
      start_time: startTime,
      end_time: endTime,
      location: newEvent.location || undefined,
      category: newEvent.type,
    })
    
    setIsModalOpen(false)
    setNewEvent({ title: '', description: '', date: '', time: '', endTime: '', location: '', type: 'meeting' })
  }

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white">Agenda</h1>
          <p className="text-slate-400">Organize seus compromissos</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['month', 'week', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  view === v
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Lista'}
              </button>
            ))}
          </div>
          <Button 
            variant="gold" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Novo Evento
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-bold text-white">
                  {months[month]} {year}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-slate-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = formatDateStr(day)
                  const dayEvents = getEventsForDate(dateStr)
                  const isToday = dateStr === new Date().toISOString().split('T')[0]
                  const isSelected = dateStr === selectedDate

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "aspect-square p-1 rounded-xl transition-all relative",
                        "flex flex-col items-center justify-start",
                        isToday && "bg-blue-500/20 border border-blue-500/30",
                        isSelected && "bg-amber-500/20 border border-amber-500/30",
                        !isToday && !isSelected && "hover:bg-white/5"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        isToday ? "text-blue-400" : isSelected ? "text-amber-400" : "text-white"
                      )}>
                        {day}
                      </span>
                      
                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayEvents.slice(0, 3).map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                event.color === 'blue' && "bg-blue-400",
                                event.color === 'emerald' && "bg-emerald-400",
                                event.color === 'amber' && "bg-amber-400",
                                event.color === 'purple' && "bg-purple-400",
                                event.color === 'pink' && "bg-pink-400",
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Selected Date Events */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    Eventos em {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                  </h3>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map((event) => (
                        <EventItem key={event.id} event={event} compact />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Nenhum evento neste dia</p>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader icon={<CalendarIcon className="h-5 w-5 text-amber-400" />}>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <EventItem key={event.id} event={event} index={index} onDelete={handleDeleteEvent} />
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum evento próximo
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader icon={<Bell className="h-5 w-5 text-blue-400" />}>
              <CardTitle>Lembretes Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickReminder label="Reunião em 30 min" time="14:00" />
              <QuickReminder label="Dentista amanhã" time="10:00" />
              <QuickReminder label="Aniversário João" time="19:00" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Evento"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            placeholder="Título do evento"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          
          <Input
            label="Descrição (opcional)"
            placeholder="Adicione uma descrição..."
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tipo
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              >
                <option value="meeting">Reunião</option>
                <option value="personal">Pessoal</option>
                <option value="call">Chamada</option>
                <option value="reminder">Lembrete</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Início
              </label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Término
              </label>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                className={cn(
                  "w-full h-10 px-3 rounded-xl",
                  "bg-slate-900/50 border border-white/10",
                  "text-white",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>
          </div>
          
          <Input
            label="Local (opcional)"
            placeholder="Onde será o evento?"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            leftIcon={MapPin}
          />
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={handleSaveEvent}>
            Criar Evento
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

// Event Item Component
interface EventItemProps {
  event: Event
  index?: number
  compact?: boolean
  onDelete?: (id: string) => void
}

const typeIcons = {
  meeting: Users,
  personal: CalendarIcon,
  call: Phone,
  reminder: Bell,
}

const EventItem: React.FC<EventItemProps> = ({ event, index = 0, compact = false, onDelete }) => {
  const Icon = typeIcons[event.type]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-3 rounded-xl border transition-colors hover:bg-white/5 group",
        event.color === 'blue' && "border-blue-500/20 bg-blue-500/5",
        event.color === 'emerald' && "border-emerald-500/20 bg-emerald-500/5",
        event.color === 'amber' && "border-amber-500/20 bg-amber-500/5",
        event.color === 'purple' && "border-purple-500/20 bg-purple-500/5",
        event.color === 'pink' && "border-pink-500/20 bg-pink-500/5",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          event.color === 'blue' && "bg-blue-500/20 text-blue-400",
          event.color === 'emerald' && "bg-emerald-500/20 text-emerald-400",
          event.color === 'amber' && "bg-amber-500/20 text-amber-400",
          event.color === 'purple' && "bg-purple-500/20 text-purple-400",
          event.color === 'pink' && "bg-pink-500/20 text-pink-400",
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{event.title}</p>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {event.time}
              {event.endTime && ` - ${event.endTime}`}
            </span>
            
            {!compact && event.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
          </div>
          
          {!compact && (
            <p className="text-xs text-slate-400 mt-1">
              {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short' 
              })}
            </p>
          )}
        </div>
        
        {onDelete && (
          <button
            onClick={() => onDelete(event.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Quick Reminder Component
interface QuickReminderProps {
  label: string
  time: string
}

const QuickReminder: React.FC<QuickReminderProps> = ({ label, time }) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
    <span className="text-sm text-slate-300">{label}</span>
    <span className="text-xs text-slate-500">{time}</span>
  </div>
)

