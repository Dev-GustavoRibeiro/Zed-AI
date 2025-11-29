'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  mood: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  what_went_well?: string | null;
  what_can_improve?: string | null;
  focus_tomorrow?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JournalInsight {
  id: string;
  journal_entry_id: string;
  insight_text: string;
  insight_type: 'weekly_summary' | 'improvement' | 'pattern' | 'achievement';
  created_at?: string;
}

export interface CreateJournalEntryInput {
  date?: string;
  mood: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  what_went_well?: string;
  what_can_improve?: string;
  focus_tomorrow?: string;
  notes?: string;
}

export const useJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries((data || []).map(e => ({
        ...e,
        mood: e.mood as JournalEntry['mood'],
      })));
    } catch (error) {
      console.error('Erro ao buscar entradas do diário:', error);
      toast.error('Erro ao carregar diário');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(async (input: CreateJournalEntryInput): Promise<JournalEntry | null> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          date: input.date || new Date().toISOString().split('T')[0],
          mood: input.mood,
          what_went_well: input.what_went_well || null,
          what_can_improve: input.what_can_improve || null,
          focus_tomorrow: input.focus_tomorrow || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry = { ...data, mood: data.mood as JournalEntry['mood'] };
      setEntries(prev => [newEntry, ...prev]);
      toast.success('Entrada salva no diário!');
      return newEntry;
    } catch (error) {
      console.error('Erro ao criar entrada:', error);
      toast.error('Erro ao salvar no diário');
      return null;
    }
  }, [user, supabase]);

  const updateEntry = useCallback(async (id: string, updates: Partial<CreateJournalEntryInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, ...updates } as JournalEntry : e
      ));
      toast.success('Entrada atualizada!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar entrada:', error);
      toast.error('Erro ao atualizar entrada');
      return false;
    }
  }, [supabase]);

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entrada excluída!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      toast.error('Erro ao excluir entrada');
      return false;
    }
  }, [supabase]);

  // Entrada de hoje
  const todayEntry = entries.find(e => e.date === new Date().toISOString().split('T')[0]);

  // Entradas da semana
  const weekEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  // Estatísticas de humor
  const moodStats = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sequência de dias (streak)
  const calculateStreak = (): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    entries,
    isLoading,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    todayEntry,
    weekEntries,
    moodStats,
    streak: calculateStreak(),
  };
};

