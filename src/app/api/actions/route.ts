import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role para operações do servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ActionRequest {
  action: 'create_task' | 'create_event' | 'create_expense' | 'create_goal';
  userId: string;
  data: any;
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, data }: ActionRequest = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'create_task':
        result = await createTask(userId, data);
        break;
      case 'create_event':
        result = await createEvent(userId, data);
        break;
      case 'create_expense':
        result = await createExpense(userId, data);
        break;
      case 'create_goal':
        result = await createGoal(userId, data);
        break;
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na API de ações:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function createTask(userId: string, data: any) {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      due_time: data.due_time || null,
      priority: data.priority || 'medium',
      category: data.category || 'Pessoal',
      status: 'todo',
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, type: 'task', data: task };
}

async function createEvent(userId: string, data: any) {
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      start_time: data.start_time,
      end_time: data.end_time || null,
      location: data.location || null,
      all_day: data.all_day || false,
      reminder_minutes: data.reminder_minutes || 30,
      reminder_sent: false,
      category: data.category || null,
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, type: 'event', data: event };
}

async function createExpense(userId: string, data: any) {
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      title: data.title,
      amount: -Math.abs(data.amount), // Gastos são negativos
      category: data.category || 'Outros',
      type: 'expense',
      date: data.date || new Date().toISOString().split('T')[0],
      payment_method: data.payment_method || null,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, type: 'expense', data: transaction };
}

async function createGoal(userId: string, data: any) {
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      area: data.area || 'Geral',
      timeframe: data.timeframe || 'short',
      target_value: data.target_value || null,
      current_value: 0,
      progress_percentage: 0,
      deadline: data.deadline || null,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, type: 'goal', data: goal };
}

