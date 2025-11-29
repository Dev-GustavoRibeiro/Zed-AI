'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

export interface Task {
  id: string
  title: string
  description?: string | null
  completed: boolean
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  energy_level?: 'low' | 'medium' | 'high' | null
  due_time?: string | null
  due_date?: string | null
  category: 'Pessoal' | 'Trabalho' | 'Estudos' | 'Saúde' | 'Casa/Família'
  estimated_duration?: number | null
  created_at?: string | null
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(t => ({
        ...t,
        completed: t.completed ?? false,
        status: (t.status as Task['status']) || 'todo',
        priority: (t.priority as Task['priority']) || 'medium',
        effort: (t.effort as Task['effort']) || 'medium',
        category: (t.category as Task['category']) || 'Pessoal',
      })));
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newTask = {
        ...data,
        completed: data.completed ?? false,
        status: (data.status as Task['status']) || 'todo',
        priority: (data.priority as Task['priority']) || 'medium',
        effort: (data.effort as Task['effort']) || 'medium',
        category: (data.category as Task['category']) || 'Pessoal',
      };
      
      setTasks(prev => [newTask, ...prev]);
      toast.success('Tarefa criada!');
      return newTask;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Tarefa removida!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao remover tarefa');
      return false;
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return false;

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'done' : 'todo';
    
    return updateTask(id, { 
      completed: newCompleted, 
      status: newStatus,
      completed_at: newCompleted ? new Date().toISOString() : null,
    } as Partial<Task>);
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    const completed = status === 'done';
    return updateTask(id, { 
      status, 
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    } as Partial<Task>);
  };

  return {
    tasks,
    isLoading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateStatus,
  };
};

