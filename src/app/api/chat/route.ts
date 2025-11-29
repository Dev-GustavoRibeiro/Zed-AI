import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Inicializar o cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modelo Gemini gratuito (atualizado para 2.0)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Cliente Supabase com service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuração do ZED como assistente pessoal
const ZED_SYSTEM_PROMPT = `Você é o ZED, um assistente virtual pessoal inteligente e amigável.

🎯 PERSONALIDADE:
- Você é prestativo, inteligente e tem um tom amigável mas profissional
- Você usa emojis ocasionalmente para tornar a conversa mais agradável
- Você é direto e objetivo, mas também empático

📋 SUAS CAPACIDADES REAIS (você PODE executar essas ações):
- CRIAR TAREFAS: Quando o usuário pedir para lembrar algo ou criar tarefa
- CRIAR EVENTOS: Quando o usuário pedir para agendar algo
- REGISTRAR GASTOS: Quando o usuário mencionar que gastou dinheiro
- CRIAR METAS: Quando o usuário quiser definir objetivos

⚠️ IMPORTANTE - FORMATO DE RESPOSTA:
Quando você identificar que o usuário quer criar algo, você DEVE incluir no final da sua resposta um bloco JSON especial no formato:

[ACTION]{"action":"tipo_acao","data":{...dados...}}[/ACTION]

TIPOS DE AÇÃO:
1. create_task - Para tarefas/lembretes
   Dados: title, description, due_date (YYYY-MM-DD), due_time (HH:MM), priority (low/medium/high), category (Pessoal/Trabalho/Estudos/Saúde/Casa/Família)

2. create_event - Para eventos/compromissos
   Dados: title, description, start_time (ISO string), end_time (ISO string), location, all_day (boolean)

3. create_expense - Para gastos
   Dados: title, amount (número positivo), category (Alimentação/Transporte/Moradia/Lazer/Saúde/Educação/Outros), date (YYYY-MM-DD)

4. create_goal - Para metas
   Dados: title, description, area (Saúde/Financeiro/Estudos/Trabalho/Pessoal/Relacionamentos/Geral), timeframe (short/medium/long), deadline (YYYY-MM-DD)

EXEMPLOS:
- Usuário: "Lembre-me de pagar a conta de luz amanhã"
  Resposta: "Claro! ✅ Criei um lembrete para você pagar a conta de luz amanhã. Vou te notificar na hora certa!
  [ACTION]{"action":"create_task","data":{"title":"Pagar conta de luz","due_date":"2024-12-01","priority":"medium","category":"Casa/Família"}}[/ACTION]"

- Usuário: "Agenda uma reunião com o João na segunda às 14h"
  Resposta: "Perfeito! 📅 Agendei sua reunião com o João para segunda-feira às 14:00.
  [ACTION]{"action":"create_event","data":{"title":"Reunião com João","start_time":"2024-12-02T14:00:00","location":""}}[/ACTION]"

- Usuário: "Gastei 50 reais no almoço"
  Resposta: "Registrado! 💰 Adicionei R$ 50,00 em Alimentação no seu controle financeiro.
  [ACTION]{"action":"create_expense","data":{"title":"Almoço","amount":50,"category":"Alimentação"}}[/ACTION]"

REGRAS:
- Sempre responda em português brasileiro
- Seja natural na conversa, o bloco [ACTION] deve aparecer apenas quando realmente for criar algo
- Se o usuário não estiver pedindo para criar nada, responda normalmente sem o bloco [ACTION]
- Use a data de hoje como referência: ${new Date().toISOString().split('T')[0]}`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionData {
  action: string;
  data: any;
}

// Função para extrair e executar ação
async function extractAndExecuteAction(text: string, userId: string): Promise<{ cleanText: string; actionResult?: any }> {
  const actionMatch = text.match(/\[ACTION\](.*?)\[\/ACTION\]/s);
  
  if (!actionMatch) {
    return { cleanText: text };
  }

  const cleanText = text.replace(/\[ACTION\].*?\[\/ACTION\]/s, '').trim();
  
  try {
    const actionData: ActionData = JSON.parse(actionMatch[1]);
    console.log('[Chat] Ação detectada:', actionData);

    let result;
    
    switch (actionData.action) {
      case 'create_task':
        result = await createTask(userId, actionData.data);
        break;
      case 'create_event':
        result = await createEvent(userId, actionData.data);
        break;
      case 'create_expense':
        result = await createExpense(userId, actionData.data);
        break;
      case 'create_goal':
        result = await createGoal(userId, actionData.data);
        break;
    }

    return { cleanText, actionResult: result };
  } catch (error) {
    console.error('[Chat] Erro ao processar ação:', error);
    return { cleanText };
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

  if (error) {
    console.error('[Chat] Erro ao criar tarefa:', error);
    throw error;
  }
  console.log('[Chat] Tarefa criada:', task);
  return { type: 'task', data: task };
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
      reminder_minutes: 30,
      reminder_sent: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[Chat] Erro ao criar evento:', error);
    throw error;
  }
  console.log('[Chat] Evento criado:', event);
  return { type: 'event', data: event };
}

async function createExpense(userId: string, data: any) {
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      title: data.title,
      amount: -Math.abs(data.amount),
      category: data.category || 'Outros',
      type: 'expense',
      date: data.date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('[Chat] Erro ao criar despesa:', error);
    throw error;
  }
  console.log('[Chat] Despesa criada:', transaction);
  return { type: 'expense', data: transaction };
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
      deadline: data.deadline || null,
      completed: false,
      progress_percentage: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[Chat] Erro ao criar meta:', error);
    throw error;
  }
  console.log('[Chat] Meta criada:', goal);
  return { type: 'goal', data: goal };
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API do Gemini não configurada' }, { status: 500 });
    }

    // Construir o histórico de conversa para o Gemini
    const formattedHistory = (history || []).map((msg: ChatMessage) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Iniciar chat com histórico
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Olá, você é o ZED?' }],
        },
        {
          role: 'model',
          parts: [{ text: ZED_SYSTEM_PROMPT + '\n\nOlá! 👋 Sim, eu sou o ZED, seu assistente virtual pessoal! Estou aqui para ajudar você a organizar sua vida, gerenciar tarefas, controlar finanças e muito mais. Como posso te ajudar hoje?' }],
        },
        ...formattedHistory,
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    // Enviar mensagem e obter resposta
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    // Extrair e executar ação, se houver
    let cleanText = text;
    let actionResult = null;

    if (userId && text.includes('[ACTION]')) {
      const actionResponse = await extractAndExecuteAction(text, userId);
      cleanText = actionResponse.cleanText;
      actionResult = actionResponse.actionResult;
    }

    return NextResponse.json({ 
      response: cleanText,
      action: actionResult 
    });
  } catch (error: any) {
    console.error('Erro na API de chat:', error);

    if (error.message?.includes('API key')) {
      return NextResponse.json({ error: 'Erro de configuração: Chave da API do Gemini inválida' }, { status: 500 });
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json({ error: 'Limite de uso atingido. Tente novamente mais tarde.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'Erro ao processar sua mensagem. Tente novamente.' }, { status: 500 });
  }
}
