'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { format, isToday, isTomorrow, addDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'event' | 'task' | 'expense' | 'goal' | 'system';
  title: string;
  description: string;
  time: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

/**
 * Hook para gerenciar notificações baseadas em dados reais
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Carregar notificações reais
  const loadNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const todayStart = startOfDay(now);
      const tomorrowEnd = endOfDay(addDays(now, 1));
      const weekEnd = endOfDay(addDays(now, 7));

      const allNotifications: Notification[] = [];

      // 1. Buscar eventos de hoje e amanhã
      const { data: events } = await supabase
        .from('events')
        .select('id, title, start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', tomorrowEnd.toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (events) {
        events.forEach(event => {
          const eventDate = new Date(event.start_time);
          const isEventToday = isToday(eventDate);
          const isEventTomorrow = isTomorrow(eventDate);
          
          let timeLabel = format(eventDate, 'HH:mm', { locale: ptBR });
          if (isEventToday) {
            timeLabel = `Hoje às ${timeLabel}`;
          } else if (isEventTomorrow) {
            timeLabel = `Amanhã às ${timeLabel}`;
          }

          allNotifications.push({
            id: `event-${event.id}`,
            type: 'event',
            title: '📅 Evento próximo',
            description: event.title,
            time: timeLabel,
            link: '/dashboard/schedule',
            priority: isEventToday ? 'high' : 'medium',
            read: false,
          });
        });
      }

      // 2. Buscar tarefas pendentes para hoje
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, due_time, priority')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('due_date', format(todayStart, 'yyyy-MM-dd'))
        .lte('due_date', format(tomorrowEnd, 'yyyy-MM-dd'))
        .order('due_date', { ascending: true })
        .limit(5);

      if (tasks) {
        tasks.forEach(task => {
          const taskDate = new Date(task.due_date);
          const isTaskToday = isToday(taskDate);
          
          let timeLabel = task.due_time 
            ? `${isTaskToday ? 'Hoje' : 'Amanhã'} às ${task.due_time.slice(0, 5)}`
            : isTaskToday ? 'Hoje' : 'Amanhã';

          allNotifications.push({
            id: `task-${task.id}`,
            type: 'task',
            title: '📋 Tarefa pendente',
            description: task.title,
            time: timeLabel,
            link: '/dashboard/routine',
            priority: task.priority === 'high' ? 'high' : 'medium',
            read: false,
          });
        });
      }

      // 3. Buscar contas a pagar (despesas recorrentes ou próximas)
      const { data: expenses } = await supabase
        .from('transactions')
        .select('id, description, amount, date, category')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', format(todayStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .limit(5);

      if (expenses) {
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          const isExpenseToday = isToday(expenseDate);
          const isExpenseTomorrow = isTomorrow(expenseDate);
          
          let timeLabel = format(expenseDate, "dd 'de' MMM", { locale: ptBR });
          if (isExpenseToday) {
            timeLabel = 'Hoje';
          } else if (isExpenseTomorrow) {
            timeLabel = 'Amanhã';
          }

          // Formatar valor
          const formattedAmount = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(Math.abs(expense.amount));

          allNotifications.push({
            id: `expense-${expense.id}`,
            type: 'expense',
            title: '💰 Conta a pagar',
            description: `${expense.description || expense.category}: ${formattedAmount}`,
            time: timeLabel,
            link: '/dashboard/finances',
            priority: isExpenseToday || isExpenseTomorrow ? 'high' : 'medium',
            read: false,
          });
        });
      }

      // 4. Buscar metas próximas do prazo
      const { data: goals } = await supabase
        .from('goals')
        .select('id, title, target_date, current_value, target_value')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .lte('target_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('target_date', { ascending: true })
        .limit(3);

      if (goals) {
        goals.forEach(goal => {
          const goalDate = new Date(goal.target_date);
          const isGoalToday = isToday(goalDate);
          const progress = goal.target_value > 0 
            ? Math.round((goal.current_value / goal.target_value) * 100)
            : 0;
          
          let timeLabel = format(goalDate, "dd 'de' MMM", { locale: ptBR });
          if (isGoalToday) {
            timeLabel = 'Vence hoje!';
          }

          allNotifications.push({
            id: `goal-${goal.id}`,
            type: 'goal',
            title: '🎯 Meta próxima',
            description: `${goal.title} (${progress}% concluído)`,
            time: timeLabel,
            link: '/dashboard',
            priority: isGoalToday ? 'high' : 'low',
            read: false,
          });
        });
      }

      // Ordenar por prioridade
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      allNotifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadNotifications();

    // Recarregar a cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Marcar uma como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    markAsRead,
    refresh: loadNotifications,
  };
};

