'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

// ========================================
// TYPES
// ========================================

export interface Transaction {
  id: string
  title: string
  amount: number
  category: string
  date: string
  type: 'income' | 'expense'
  payment_method?: string | null
  notes?: string | null
  is_recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  created_at?: string | null
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date?: string | null
  spent?: number
  created_at?: string | null
}

export interface FinancialGoal {
  id: string
  title: string
  description?: string | null
  target_value: number
  current_value: number
  type: 'savings' | 'debt' | 'investment' | 'emergency'
  deadline?: string | null
  completed: boolean
  color?: string
  created_at?: string | null
  updated_at?: string | null
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  expensesByCategory: Record<string, number>
  incomeByCategory: Record<string, number>
  monthlyTrend: { month: string; income: number; expenses: number }[]
  topExpenseCategories: { category: string; amount: number; percentage: number }[]
  dailyAverage: number
  projectedMonthlyExpenses: number
}

export interface DateRange {
  start: Date
  end: Date
}

// ========================================
// CONSTANTS
// ========================================

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Assinaturas',
  'Compras',
  'Investimentos',
  'Impostos',
  'Pets',
  'Beleza',
  'Outros',
] as const;

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Aluguel',
  'Presente',
  'Reembolso',
  'Outros',
] as const;

export const PAYMENT_METHODS = [
  'Dinheiro',
  'Cartão de Débito',
  'Cartão de Crédito',
  'PIX',
  'Transferência',
  'Boleto',
  'Outros',
] as const;

export const GOAL_TYPES = [
  { value: 'savings', label: 'Poupança', icon: 'piggy-bank' },
  { value: 'debt', label: 'Quitar Dívida', icon: 'credit-card' },
  { value: 'investment', label: 'Investimento', icon: 'trending-up' },
  { value: 'emergency', label: 'Reserva de Emergência', icon: 'shield' },
] as const;

// ========================================
// HOOK
// ========================================

export const useFinances = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  });
  
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  // ========================================
  // FETCH DATA
  // ========================================

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []).map(t => ({
        ...t,
        type: (t.type as Transaction['type']) || 'expense',
      })));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
    }
  }, [user, supabase, dateRange]);

  const fetchAllTransactions = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        type: (t.type as Transaction['type']) || 'expense',
      }));
    } catch (error) {
      console.error('Erro ao buscar todas transações:', error);
      return [];
    }
  }, [user, supabase]);

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
    }
  }, [user, supabase]);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrar apenas metas financeiras (não hábitos puros)
      const financialGoals = (data || []).filter(g => 
        ['savings', 'debt', 'investment', 'emergency', 'milestone'].includes(g.type || 'savings')
      );
      
      setGoals(financialGoals.map(g => ({
        ...g,
        type: g.type || 'savings',
      })));
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    }
  }, [user, supabase]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchTransactions(), fetchBudgets(), fetchGoals()]);
      setIsLoading(false);
    };
    fetchAll();
  }, [fetchTransactions, fetchBudgets, fetchGoals]);

  // ========================================
  // TRANSACTION CRUD
  // ========================================

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
      
      // Check if transaction is within current date range
      const txDate = new Date(data.date);
      if (txDate >= dateRange.start && txDate <= dateRange.end) {
        setTransactions(prev => [newTransaction, ...prev]);
      }
      
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
      toast.success('Transação atualizada!');
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

  // ========================================
  // BUDGET CRUD
  // ========================================

  const addBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'start_date' | 'end_date'>) => {
    if (!user) return null;

    // Calcular start_date baseado no período
    const now = new Date();
    let startDate: string;
    let endDate: string | null = null;
    
    if (budget.period === 'weekly') {
      // Início da semana atual (domingo)
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      startDate = start.toISOString().split('T')[0];
    } else if (budget.period === 'monthly') {
      // Início do mês atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else {
      // Início do ano atual
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (error) throw error;
      
      setBudgets(prev => [...prev, data]);
      toast.success('Orçamento criado!');
      return data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast.error('Erro ao criar orçamento');
      return null;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      toast.success('Orçamento atualizado!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento');
      return false;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Orçamento removido!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      toast.error('Erro ao remover orçamento');
      return false;
    }
  };

  // ========================================
  // GOAL CRUD
  // ========================================

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>) => {
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
      
      setGoals(prev => [data, ...prev]);
      toast.success('Meta criada!');
      return data;
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta');
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      toast.success('Meta atualizada!');
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

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return false;

    const newValue = goal.current_value + amount;
    const completed = newValue >= goal.target_value;
    
    return updateGoal(id, { 
      current_value: newValue,
      completed 
    });
  };

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const summary = useMemo<FinancialSummary>(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Expenses by category
    const expensesByCategory = expenseTransactions.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Income by category
    const incomeByCategory = incomeTransactions.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Top expense categories
    const topExpenseCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Daily average
    const daysInRange = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totalExpenses / daysInRange;

    // Projected monthly expenses
    const daysInMonth = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth() + 1, 0).getDate();
    const daysPassed = Math.min(daysInRange, new Date().getDate());
    const projectedMonthlyExpenses = daysPassed > 0 ? (totalExpenses / daysPassed) * daysInMonth : 0;

    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      expensesByCategory,
      incomeByCategory,
      monthlyTrend: [], // Would need historical data
      topExpenseCategories,
      dailyAverage,
      projectedMonthlyExpenses,
    };
  }, [transactions, dateRange]);

  // Budgets with spent amounts
  const budgetsWithSpent = useMemo(() => {
    return budgets.map(budget => {
      const spent = summary.expensesByCategory[budget.category] || 0;
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
        isOverBudget: spent > budget.amount,
      };
    });
  }, [budgets, summary.expensesByCategory]);

  // Categories without budget
  const categoriesWithoutBudget = useMemo(() => {
    const budgetedCategories = new Set(budgets.map(b => b.category));
    return Object.keys(summary.expensesByCategory).filter(cat => !budgetedCategories.has(cat));
  }, [budgets, summary.expensesByCategory]);

  // Financial health score (0-100)
  const healthScore = useMemo(() => {
    let score = 50; // Base score

    // Savings rate bonus (max +25)
    if (summary.savingsRate >= 20) score += 25;
    else if (summary.savingsRate >= 10) score += 15;
    else if (summary.savingsRate >= 0) score += 5;
    else score -= 10;

    // Budget adherence bonus (max +15)
    const overBudgetCount = budgetsWithSpent.filter(b => b.isOverBudget).length;
    if (budgets.length > 0) {
      const adherenceRate = 1 - (overBudgetCount / budgets.length);
      score += Math.round(adherenceRate * 15);
    }

    // Goals progress bonus (max +10)
    const activeGoals = goals.filter(g => !g.completed);
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((sum, g) => {
        const progress = g.target_value > 0 ? (g.current_value / g.target_value) : 0;
        return sum + Math.min(progress, 1);
      }, 0) / activeGoals.length;
      score += Math.round(avgProgress * 10);
    }

    return Math.max(0, Math.min(100, score));
  }, [summary, budgetsWithSpent, budgets, goals]);

  // ========================================
  // UTILITIES
  // ========================================

  const setMonth = (monthOffset: number) => {
    const current = new Date(dateRange.start);
    const newMonth = new Date(current.getFullYear(), current.getMonth() + monthOffset, 1);
    const end = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0);
    setDateRange({ start: newMonth, end });
  };

  const setCustomRange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const exportTransactions = async (format: 'csv' | 'json' = 'csv') => {
    const allTransactions = await fetchAllTransactions();
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(allTransactions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacoes_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Método de Pagamento', 'Notas'];
      const rows = allTransactions.map(t => [
        t.date,
        t.title,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2),
        t.payment_method || '',
        t.notes || '',
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast.success('Exportação concluída!');
  };

  return {
    // Data
    transactions,
    budgets,
    goals,
    isLoading,
    dateRange,
    
    // Summary & Computed
    summary,
    budgetsWithSpent,
    categoriesWithoutBudget,
    healthScore,
    
    // Transaction actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    
    // Budget actions
    addBudget,
    updateBudget,
    deleteBudget,
    
    // Goal actions
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    
    // Utilities
    setMonth,
    setCustomRange,
    exportTransactions,
    
    // Constants
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    PAYMENT_METHODS,
    GOAL_TYPES,
  };
};

