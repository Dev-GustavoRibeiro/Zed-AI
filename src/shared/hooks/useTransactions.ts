'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

export interface Transaction {
  id: string
  title: string
  amount: number
  category: string
  date: string
  type: 'income' | 'expense'
  payment_method?: string | null
  notes?: string | null
  created_at?: string | null
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []).map(t => ({
        ...t,
        type: (t.type as Transaction['type']) || 'expense',
      })));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newTransaction = {
        ...data,
        type: (data.type as Transaction['type']) || 'expense',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transação registrada!');
      return newTransaction;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao registrar transação');
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transação removida!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      toast.error('Erro ao remover transação');
      return false;
    }
  };

  // Calculadores
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  return {
    transactions,
    isLoading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
  };
};

