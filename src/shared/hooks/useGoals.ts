'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

export interface Goal {
  id: string
  title: string
  description?: string | null
  area: 'Saúde' | 'Financeiro' | 'Estudos' | 'Trabalho' | 'Pessoal' | 'Relacionamentos' | 'Geral'
  timeframe: 'short' | 'medium' | 'long'
  target_value?: number | null
  current_value?: number | null
  progress_percentage: number
  deadline?: string | null
  completed: boolean
  created_at?: string | null
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  completed: boolean
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []).map(g => ({
        ...g,
        completed: g.completed ?? false,
        progress_percentage: g.progress_percentage ?? 0,
        area: (g.area as Goal['area']) || 'Geral',
        timeframe: (g.timeframe as Goal['timeframe']) || 'short',
      })));
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newGoal = {
        ...data,
        completed: data.completed ?? false,
        progress_percentage: data.progress_percentage ?? 0,
        area: (data.area as Goal['area']) || 'Geral',
        timeframe: (data.timeframe as Goal['timeframe']) || 'short',
      };
      
      setGoals(prev => [newGoal, ...prev]);
      toast.success('Meta criada!');
      return newGoal;
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta');
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Meta removida!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      toast.error('Erro ao remover meta');
      return false;
    }
  };

  const toggleGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return false;

    const newCompleted = !goal.completed;
    return updateGoal(id, { 
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    } as Partial<Goal>);
  };

  return {
    goals,
    isLoading,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoal,
  };
};

