'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen,
  Heart,
  TrendingUp,
  Lightbulb,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Target,
  Loader2,
  Flame,
  Trash2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { useJournal, JournalEntry } from '@/shared/hooks/useJournal'

const MOOD_OPTIONS = [
  { value: 'excellent', label: 'Excelente', emoji: '😄', color: 'emerald' },
  { value: 'good', label: 'Bom', emoji: '🙂', color: 'blue' },
  { value: 'neutral', label: 'Neutro', emoji: '😐', color: 'slate' },
  { value: 'bad', label: 'Ruim', emoji: '😔', color: 'amber' },
  { value: 'terrible', label: 'Péssimo', emoji: '😢', color: 'red' },
]

const DAILY_QUESTIONS = [
  'O que você quer focar hoje?',
  'Qual foi a melhor parte do seu dia?',
  'O que você aprendeu hoje?',
  'Como você se sente em relação ao seu progresso?',
  'O que te motivou hoje?',
]

interface CurrentEntryState {
  date: string
  mood: JournalEntry['mood']
  what_went_well: string
  what_can_improve: string
  focus_tomorrow: string
  notes: string
}

export default function JournalPage() {
  const { 
    entries, 
    isLoading, 
    createEntry, 
    updateEntry, 
    deleteEntry,
    todayEntry,
    weekEntries,
    moodStats,
    streak,
  } = useJournal()

  const [isWriting, setIsWriting] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [currentEntry, setCurrentEntry] = useState<CurrentEntryState>({
    date: new Date().toISOString().split('T')[0],
    mood: 'neutral',
    what_went_well: '',
    what_can_improve: '',
    focus_tomorrow: '',
    notes: '',
  })

  const handleSaveEntry = async () => {
    if (!currentEntry.what_went_well) return

    if (editingEntryId) {
      await updateEntry(editingEntryId, {
        mood: currentEntry.mood,
        what_went_well: currentEntry.what_went_well,
        what_can_improve: currentEntry.what_can_improve,
        focus_tomorrow: currentEntry.focus_tomorrow,
        notes: currentEntry.notes,
      })
    } else {
      await createEntry({
        date: currentEntry.date,
        mood: currentEntry.mood,
        what_went_well: currentEntry.what_went_well,
        what_can_improve: currentEntry.what_can_improve,
        focus_tomorrow: currentEntry.focus_tomorrow,
        notes: currentEntry.notes,
      })
    }

    setIsWriting(false)
    setEditingEntryId(null)
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      mood: 'neutral',
      what_went_well: '',
      what_can_improve: '',
      focus_tomorrow: '',
      notes: '',
    })
  }

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id)
  }

  const startNewEntry = () => {
    if (todayEntry) {
      setEditingEntryId(todayEntry.id)
      setCurrentEntry({
        date: todayEntry.date,
        mood: todayEntry.mood,
        what_went_well: todayEntry.what_went_well || '',
        what_can_improve: todayEntry.what_can_improve || '',
        focus_tomorrow: todayEntry.focus_tomorrow || '',
        notes: todayEntry.notes || '',
      })
    } else {
      setEditingEntryId(null)
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0],
        mood: 'neutral',
        what_went_well: '',
        what_can_improve: '',
        focus_tomorrow: '',
        notes: '',
      })
    }
    setIsWriting(true)
  }

  const editEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id)
    setCurrentEntry({
      date: entry.date,
      mood: entry.mood,
      what_went_well: entry.what_went_well || '',
      what_can_improve: entry.what_can_improve || '',
      focus_tomorrow: entry.focus_tomorrow || '',
      notes: entry.notes || '',
    })
    setIsWriting(true)
  }

  const getMoodEmoji = (mood: string) => {
    return MOOD_OPTIONS.find(m => m.value === mood)?.emoji || '😐'
  }

  const getMoodColor = (mood: string) => {
    return MOOD_OPTIONS.find(m => m.value === mood)?.color || 'slate'
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
          <h1 className="text-xl sm:text-2xl font-black text-white">Diário & Coach</h1>
          <p className="text-sm sm:text-base text-slate-400">Reflita sobre seu dia e receba insights</p>
        </div>
        {!isWriting && (
          <Button
            variant="gold"
            size="sm"
            leftIcon={<BookOpen className="h-4 w-4" />}
            onClick={startNewEntry}
          >
            {todayEntry ? 'Editar Entrada de Hoje' : 'Nova Entrada'}
          </Button>
        )}
      </motion.div>

      {/* Writing Mode */}
      {isWriting ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Como foi seu dia?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Como você está se sentindo?
              </label>
              <div className="flex gap-2 flex-wrap">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCurrentEntry({ ...currentEntry, mood: mood.value as JournalEntry['mood'] })}
                    className={cn(
                      "flex-1 min-w-[80px] px-3 py-3 rounded-xl border transition-all",
                      currentEntry.mood === mood.value
                        ? "bg-blue-500/20 border-blue-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-slate-400">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* What went well */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                O que foi bem hoje? *
              </label>
              <textarea
                placeholder="Descreva o que funcionou bem..."
                value={currentEntry.what_went_well}
                onChange={(e) => setCurrentEntry({ ...currentEntry, what_went_well: e.target.value })}
                className={cn(
                  "w-full h-24 px-4 py-3 rounded-xl text-sm resize-none",
                  "bg-slate-900/50 border border-white/10",
                  "text-white placeholder:text-slate-500",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>

            {/* What can improve */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                O que pode melhorar?
              </label>
              <textarea
                placeholder="Áreas que você quer desenvolver..."
                value={currentEntry.what_can_improve}
                onChange={(e) => setCurrentEntry({ ...currentEntry, what_can_improve: e.target.value })}
                className={cn(
                  "w-full h-20 px-4 py-3 rounded-xl text-sm resize-none",
                  "bg-slate-900/50 border border-white/10",
                  "text-white placeholder:text-slate-500",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>

            {/* Focus for tomorrow */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Foco para amanhã
              </label>
              <textarea
                placeholder="No que você quer focar amanhã..."
                value={currentEntry.focus_tomorrow}
                onChange={(e) => setCurrentEntry({ ...currentEntry, focus_tomorrow: e.target.value })}
                className={cn(
                  "w-full h-20 px-4 py-3 rounded-xl text-sm resize-none",
                  "bg-slate-900/50 border border-white/10",
                  "text-white placeholder:text-slate-500",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notas adicionais
              </label>
              <textarea
                placeholder="Qualquer coisa que você queira registrar..."
                value={currentEntry.notes}
                onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                className={cn(
                  "w-full h-20 px-4 py-3 rounded-xl text-sm resize-none",
                  "bg-slate-900/50 border border-white/10",
                  "text-white placeholder:text-slate-500",
                  "focus:outline-none focus:border-blue-500/50"
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsWriting(false)
                  setEditingEntryId(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="gold"
                onClick={handleSaveEntry}
                disabled={!currentEntry.what_went_well}
              >
                Salvar Entrada
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{streak}</p>
                  <p className="text-xs text-slate-400">dias seguidos</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{entries.length}</p>
                  <p className="text-xs text-slate-400">entradas</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{weekEntries.length}</p>
                  <p className="text-xs text-slate-400">esta semana</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Heart className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {getMoodEmoji(Object.entries(moodStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral')}
                  </p>
                  <p className="text-xs text-slate-400">humor comum</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Entries List */}
          <Card>
            <CardHeader icon={<Calendar className="h-5 w-5 text-amber-400" />}>
              <CardTitle>Entradas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : entries.length > 0 ? (
                <div className="space-y-3">
                  {entries.slice(0, 10).map((entry) => {
                    const moodOption = MOOD_OPTIONS.find(m => m.value === entry.mood)
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all group",
                          "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                        onClick={() => editEntry(entry)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{moodOption?.emoji || '😐'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-white">
                                {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                })}
                              </p>
                              {entry.date === new Date().toISOString().split('T')[0] && (
                                <Badge variant="gold" size="sm">Hoje</Badge>
                              )}
                            </div>
                            {entry.what_went_well && (
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {entry.what_went_well}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEntry(entry.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Nenhuma entrada no diário</p>
                  <Button variant="outline" onClick={startNewEntry}>
                    Criar primeira entrada
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Insights */}
          {weekEntries.length > 0 && (
            <Card variant="gold">
              <CardHeader icon={<Sparkles className="h-5 w-5 text-amber-400" />}>
                <CardTitle>Insights da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weekEntries.filter(e => e.what_went_well).length > 3 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-300">
                        Você está mantendo uma boa consistência no diário! Continue assim!
                      </p>
                    </div>
                  )}
                  {Object.values(moodStats).some(v => v >= 3) && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Lightbulb className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-300">
                        Parabéns por refletir regularmente sobre seus dias!
                      </p>
                    </div>
                  )}
                  {streak >= 3 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Flame className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-300">
                        Sequência de {streak} dias! Mantenha o ritmo!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
