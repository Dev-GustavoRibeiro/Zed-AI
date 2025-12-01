import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Inicializar o cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modelo Gemini com suporte a visão
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
- CONSULTAR DADOS: Você TEM ACESSO aos dados do usuário (tarefas, eventos, gastos, metas)
- CRIAR TAREFAS: Quando o usuário pedir para lembrar algo ou criar tarefa
- CRIAR EVENTOS: Quando o usuário pedir para agendar algo
- REGISTRAR GASTOS: Quando o usuário mencionar que gastou dinheiro
- CRIAR METAS: Quando o usuário quiser definir objetivos
- EDITAR METAS: Quando o usuário quiser modificar uma meta existente (precisa do ID da meta)
- EXCLUIR METAS: Quando o usuário quiser remover uma meta (precisa do ID da meta)
- ANALISAR IMAGENS: Quando o usuário enviar fotos de recibos, notas fiscais, comprovantes
- EXTRAIR DADOS: Identificar valores, datas, estabelecimentos de documentos

⚠️ IMPORTANTE - DADOS DO USUÁRIO:
Você receberá dados atualizados do usuário no início de cada conversa com [USER_CONTEXT].
Use esses dados para responder perguntas como "quais são minhas tarefas", "quanto gastei", etc.
Se os dados mostrarem listas vazias, informe que não há registros no momento.

⚠️⚠️⚠️ REGRA CRÍTICA - CONFIRMAÇÃO OBRIGATÓRIA ⚠️⚠️⚠️
NUNCA crie ações automaticamente! Você DEVE SEMPRE:
1. PRIMEIRO: Entender o que o usuário disse/enviou
2. SEGUNDO: Resumir os dados que você identificou
3. TERCEIRO: PERGUNTAR se o usuário quer que você registre
4. QUARTO: Só incluir o bloco [ACTION] quando o usuário CONFIRMAR explicitamente

Palavras de confirmação aceitas: "sim", "pode", "confirma", "isso", "exato", "ok", "registra", "salva", "cria", "faz isso", "pode fazer", "tá certo", "correto"

🖼️ ANÁLISE DE IMAGENS/RECIBOS:
Quando o usuário enviar uma imagem de recibo, nota fiscal ou comprovante:
1. Analise a imagem cuidadosamente
2. Extraia: valor total, estabelecimento/loja, data, itens (se visíveis)
3. Categorize automaticamente (Alimentação, Transporte, Saúde, Lazer, etc.)
4. PERGUNTE: "Quer que eu registre essa despesa de R$ X,XX em [categoria]?"
5. Só crie a ação após confirmação!

⚠️ FORMATO DE RESPOSTA PARA AÇÕES:
SOMENTE após o usuário confirmar, inclua o bloco JSON:

[ACTION]{"action":"tipo_acao","data":{...dados...}}[/ACTION]

TIPOS DE AÇÃO:
1. create_task - Para tarefas/lembretes
   Dados: title, description, due_date (YYYY-MM-DD), due_time (HH:MM), priority (low/medium/high), category (Pessoal/Trabalho/Estudos/Saúde/Casa/Família)

2. create_event - Para eventos/compromissos
   Dados: title, description, start_time (ISO string), end_time (ISO string), location, all_day (boolean)

3. create_expense - Para gastos/despesas
   Dados: title, amount (número positivo), category (Alimentação/Transporte/Moradia/Lazer/Saúde/Educação/Outros), date (YYYY-MM-DD), payment_method (opcional), notes (opcional), receipt_url (URL da imagem se houver)

4. create_income - Para receitas/entradas
   Dados: title, amount (número positivo), category, date (YYYY-MM-DD)

5. create_goal - Para criar metas
   Dados: title, description, area (Saúde/Financeiro/Estudos/Trabalho/Pessoal/Relacionamentos/Geral), timeframe (short/medium/long), deadline (YYYY-MM-DD)

6. update_goal - Para editar metas existentes
   Dados: id (obrigatório - ID da meta), title, description, area, timeframe, deadline, progress_percentage, target_value, current_value

7. delete_goal - Para excluir metas
   Dados: id (obrigatório - ID da meta)

EXEMPLOS CORRETOS (com confirmação):

📌 EXEMPLO 1 - Gasto (SEM confirmação ainda):
- Usuário: "Gastei 50 reais no almoço"
- Resposta: "Entendi! 📝 Você gastou R$ 50,00 com almoço. Quer que eu registre essa despesa na categoria Alimentação?"

📌 EXEMPLO 1 - Gasto (COM confirmação):
- Usuário: "Sim, pode registrar"
- Resposta: "Pronto! ✅ Registrei R$ 50,00 em Alimentação.
  [ACTION]{"action":"create_expense","data":{"title":"Almoço","amount":50,"category":"Alimentação"}}[/ACTION]"

📌 EXEMPLO 2 - Tarefa (SEM confirmação ainda):
- Usuário: "Preciso pagar a conta de luz amanhã"
- Resposta: "Anotei! 📋 Você precisa pagar a conta de luz amanhã. Quer que eu crie um lembrete para isso?"

📌 EXEMPLO 2 - Tarefa (COM confirmação):
- Usuário: "Isso, cria"
- Resposta: "Feito! ✅ Criei o lembrete para pagar a conta de luz amanhã.
  [ACTION]{"action":"create_task","data":{"title":"Pagar conta de luz","due_date":"${new Date(Date.now() + 86400000).toISOString().split('T')[0]}","priority":"medium","category":"Casa/Família"}}[/ACTION]"

📌 EXEMPLO 3 - Recibo (SEM confirmação ainda):
- Usuário: [envia foto de recibo mostrando R$ 127,45 do Supermercado]
- Resposta: "📷 Analisei o recibo! Vi os seguintes dados:
  • Estabelecimento: Supermercado Extra
  • Valor: R$ 127,45
  • Categoria sugerida: Alimentação
  
  Quer que eu registre essa despesa?"

📌 EXEMPLO 4 - Editar Meta (COM confirmação):
- Usuário: "Atualiza a meta de emagrecer para 70kg"
- Resposta: "Perfeito! ✅ Atualizei a meta para 70kg.
  [ACTION]{"action":"update_goal","data":{"id":"abc123","target_value":70}}[/ACTION]"

📌 EXEMPLO 5 - Excluir Meta (COM confirmação):
- Usuário: "Remove a meta de aprender francês"
- Resposta: "Pronto! ✅ Removi a meta de aprender francês.
  [ACTION]{"action":"delete_goal","data":{"id":"xyz789"}}[/ACTION]"

⚠️ IMPORTANTE PARA METAS:
- Para editar ou excluir uma meta, você DEVE usar o ID da meta que está no contexto [USER_CONTEXT]
- Se o usuário mencionar uma meta pelo nome, busque o ID correspondente no contexto antes de criar a ação
- Sempre confirme antes de excluir uma meta

REGRAS:
- Sempre responda em português brasileiro
- NUNCA inclua [ACTION] sem confirmação prévia do usuário
- Se o usuário disser algo como "não", "cancela", "deixa", NÃO crie a ação
- Guarde os dados mencionados para quando o usuário confirmar
- Use a data de hoje como referência: ${new Date().toISOString().split('T')[0]}`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionData {
  action: string;
  data: any;
}

interface MediaContent {
  type: 'image' | 'video' | 'audio';
  url: string;
  mimeType?: string;
  base64?: string; // Para áudio enviado diretamente
}

// Função para baixar áudio e converter para base64
async function fetchAudioAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || 'audio/webm';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { base64, mimeType: contentType };
  } catch (error) {
    console.error('[Chat] Erro ao baixar áudio:', error);
    return null;
  }
}

// Cache para evitar execução duplicada de ações (última ação executada)
let lastExecutedAction: { hash: string; timestamp: number } | null = null;
const ACTION_CACHE_TTL = 5000; // 5 segundos

// Função para gerar hash único da ação
function generateActionHash(actionData: ActionData): string {
  return `${actionData.action}_${JSON.stringify(actionData.data)}`;
}

// Função para extrair e executar ação
async function extractAndExecuteAction(text: string, userId: string, mediaUrl?: string): Promise<{ cleanText: string; actionResult?: any }> {
  const actionMatch = text.match(/\[ACTION\]([\s\S]*?)\[\/ACTION\]/);
  
  if (!actionMatch) {
    return { cleanText: text };
  }

  const cleanText = text.replace(/\[ACTION\][\s\S]*?\[\/ACTION\]/, '').trim();
  
  try {
    const actionData: ActionData = JSON.parse(actionMatch[1]);
    console.log('[Chat] Ação detectada:', actionData);

    // Verificar se esta ação já foi executada recentemente (proteção contra duplicação)
    const actionHash = generateActionHash(actionData);
    const now = Date.now();
    
    if (lastExecutedAction && 
        lastExecutedAction.hash === actionHash && 
        (now - lastExecutedAction.timestamp) < ACTION_CACHE_TTL) {
      console.log('[Chat] Ação duplicada detectada, ignorando:', actionHash);
      return { cleanText };
    }

    // Registrar esta ação como executada
    lastExecutedAction = { hash: actionHash, timestamp: now };

    // Adicionar URL da mídia se houver
    if (mediaUrl && actionData.data) {
      actionData.data.receipt_url = mediaUrl;
    }

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
      case 'create_income':
        result = await createIncome(userId, actionData.data);
        break;
      case 'create_goal':
        result = await createGoal(userId, actionData.data);
        break;
      case 'update_goal':
        result = await updateGoal(userId, actionData.data);
        break;
      case 'delete_goal':
        result = await deleteGoal(userId, actionData.data);
        break;
      default:
        console.warn('[Chat] Ação não reconhecida:', actionData.action);
        return { cleanText };
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
      payment_method: data.payment_method || null,
      receipt_url: data.receipt_url || null,
      notes: data.notes || null,
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

async function createIncome(userId: string, data: any) {
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      title: data.title,
      amount: Math.abs(data.amount),
      category: data.category || 'Outros',
      type: 'income',
      date: data.date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('[Chat] Erro ao criar receita:', error);
    throw error;
  }
  console.log('[Chat] Receita criada:', transaction);
  return { type: 'income', data: transaction };
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
      target_value: data.target_value || null,
      current_value: data.current_value || 0,
      progress_percentage: 0,
      completed: false,
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

async function updateGoal(userId: string, data: any) {
  if (!data.id) {
    throw new Error('ID da meta é obrigatório para edição');
  }

  // Verificar se a meta pertence ao usuário
  const { data: existingGoal, error: checkError } = await supabase
    .from('goals')
    .select('id')
    .eq('id', data.id)
    .eq('user_id', userId)
    .single();

  if (checkError || !existingGoal) {
    throw new Error('Meta não encontrada ou você não tem permissão para editá-la');
  }

  // Preparar dados para atualização (remover id dos dados de atualização)
  const { id, ...updateData } = data;

  // Calcular progress_percentage se target_value e current_value foram fornecidos
  if (updateData.target_value && updateData.current_value !== undefined) {
    updateData.progress_percentage = Math.min(
      100,
      Math.max(0, Math.round((updateData.current_value / updateData.target_value) * 100))
    );
  }

  const { data: goal, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Chat] Erro ao atualizar meta:', error);
    throw error;
  }
  console.log('[Chat] Meta atualizada:', goal);
  return { type: 'goal', data: goal, action: 'updated' };
}

async function deleteGoal(userId: string, data: any) {
  if (!data.id) {
    throw new Error('ID da meta é obrigatório para exclusão');
  }

  // Verificar se a meta pertence ao usuário
  const { data: existingGoal, error: checkError } = await supabase
    .from('goals')
    .select('id, title')
    .eq('id', data.id)
    .eq('user_id', userId)
    .single();

  if (checkError || !existingGoal) {
    throw new Error('Meta não encontrada ou você não tem permissão para excluí-la');
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', data.id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Chat] Erro ao excluir meta:', error);
    throw error;
  }
  console.log('[Chat] Meta excluída:', existingGoal.title);
  return { type: 'goal', data: { id: data.id, title: existingGoal.title }, action: 'deleted' };
}

// ============================================
// FUNÇÕES DE CONSULTA DE DADOS DO USUÁRIO
// ============================================

async function getUserTasks(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(20);

  if (error) {
    console.error('[Chat] Erro ao buscar tarefas:', error);
    return [];
  }

  return tasks || [];
}

async function getUserTodayTasks(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('due_date', today)
    .order('due_time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('[Chat] Erro ao buscar tarefas de hoje:', error);
    return [];
  }

  return tasks || [];
}

async function getUserEvents(userId: string) {
  const now = new Date().toISOString();
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(10);

  if (error) {
    console.error('[Chat] Erro ao buscar eventos:', error);
    return [];
  }

  return events || [];
}

async function getUserTodayEvents(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startOfDay)
    .lt('start_time', endOfDay)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[Chat] Erro ao buscar eventos de hoje:', error);
    return [];
  }

  return events || [];
}

async function getUserTransactions(userId: string, limit = 20) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Chat] Erro ao buscar transações:', error);
    return [];
  }

  return transactions || [];
}

async function getUserMonthlyTransactions(userId: string) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: false });

  if (error) {
    console.error('[Chat] Erro ao buscar transações do mês:', error);
    return [];
  }

  return transactions || [];
}

async function getUserGoals(userId: string) {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('deadline', { ascending: true, nullsFirst: false })
    .limit(10);

  if (error) {
    console.error('[Chat] Erro ao buscar metas:', error);
    return [];
  }

  return goals || [];
}

// Função para buscar contexto do usuário
async function getUserContext(userId: string) {
  const [todayTasks, allTasks, todayEvents, allEvents, monthTransactions, goals] = await Promise.all([
    getUserTodayTasks(userId),
    getUserTasks(userId),
    getUserTodayEvents(userId),
    getUserEvents(userId),
    getUserMonthlyTransactions(userId),
    getUserGoals(userId),
  ]);

  // Calcular resumo financeiro
  const expenses = monthTransactions.filter((t: any) => t.type === 'expense');
  const incomes = monthTransactions.filter((t: any) => t.type === 'income');
  const totalExpenses = expenses.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
  const totalIncomes = incomes.reduce((sum: number, t: any) => sum + t.amount, 0);

  return {
    todayTasks,
    allTasks,
    todayEvents,
    allEvents,
    monthTransactions: {
      list: monthTransactions,
      total: monthTransactions.length,
      expenses: expenses.length,
      incomes: incomes.length,
      totalExpenses,
      totalIncomes,
      balance: totalIncomes - totalExpenses,
    },
    goals,
  };
}

// Função para formatar o contexto do usuário em texto
function formatUserContext(context: any): string {
  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let text = `📅 Data de hoje: ${today}\n\n`;

  // Tarefas de hoje
  text += `📋 TAREFAS DE HOJE (${context.todayTasks.length}):\n`;
  if (context.todayTasks.length === 0) {
    text += '  - Nenhuma tarefa para hoje\n';
  } else {
    context.todayTasks.forEach((task: any) => {
      const status = task.completed ? '✅' : '⬜';
      const time = task.due_time ? ` às ${task.due_time}` : '';
      text += `  ${status} ${task.title}${time} [${task.priority || 'medium'}]\n`;
    });
  }

  // Todas as tarefas pendentes
  const pendingTasks = context.allTasks.filter((t: any) => !t.completed);
  text += `\n📝 TODAS AS TAREFAS PENDENTES (${pendingTasks.length}):\n`;
  if (pendingTasks.length === 0) {
    text += '  - Nenhuma tarefa pendente\n';
  } else {
    pendingTasks.slice(0, 10).forEach((task: any) => {
      const dueDate = task.due_date ? ` - Vence: ${new Date(task.due_date).toLocaleDateString('pt-BR')}` : '';
      text += `  - ${task.title}${dueDate} [${task.priority || 'medium'}]\n`;
    });
    if (pendingTasks.length > 10) {
      text += `  ... e mais ${pendingTasks.length - 10} tarefas\n`;
    }
  }

  // Eventos de hoje
  text += `\n📆 EVENTOS DE HOJE (${context.todayEvents.length}):\n`;
  if (context.todayEvents.length === 0) {
    text += '  - Nenhum evento para hoje\n';
  } else {
    context.todayEvents.forEach((event: any) => {
      const time = new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      text += `  - ${time}: ${event.title}${event.location ? ` em ${event.location}` : ''}\n`;
    });
  }

  // Próximos eventos
  text += `\n🗓️ PRÓXIMOS EVENTOS (${context.allEvents.length}):\n`;
  if (context.allEvents.length === 0) {
    text += '  - Nenhum evento agendado\n';
  } else {
    context.allEvents.slice(0, 5).forEach((event: any) => {
      const date = new Date(event.start_time).toLocaleDateString('pt-BR');
      const time = new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      text += `  - ${date} ${time}: ${event.title}\n`;
    });
  }

  // Resumo financeiro do mês
  const fin = context.monthTransactions;
  text += `\n💰 FINANÇAS DO MÊS:\n`;
  text += `  - Receitas: R$ ${fin.totalIncomes.toFixed(2)} (${fin.incomes} registros)\n`;
  text += `  - Despesas: R$ ${fin.totalExpenses.toFixed(2)} (${fin.expenses} registros)\n`;
  text += `  - Saldo: R$ ${fin.balance.toFixed(2)}\n`;

  // Últimas transações
  if (fin.list && fin.list.length > 0) {
    text += `\n  📊 Últimas transações:\n`;
    fin.list.slice(0, 5).forEach((t: any) => {
      const type = t.type === 'expense' ? '🔴' : '🟢';
      const value = Math.abs(t.amount).toFixed(2);
      text += `    ${type} ${t.title}: R$ ${value} (${t.category})\n`;
    });
  }

  // Metas
  text += `\n🎯 METAS ATIVAS (${context.goals.length}):\n`;
  if (context.goals.length === 0) {
    text += '  - Nenhuma meta definida\n';
  } else {
    context.goals.forEach((goal: any) => {
      const deadline = goal.deadline ? ` - Prazo: ${new Date(goal.deadline).toLocaleDateString('pt-BR')}` : '';
      const progress = goal.progress_percentage || 0;
      // IMPORTANTE: Incluir o ID da meta para permitir edição/exclusão
      text += `  - [ID: ${goal.id}] ${goal.title} [${progress}%]${deadline}\n`;
    });
  }

  return text;
}

// Função para baixar imagem e converter para base64
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { base64, mimeType: contentType };
  } catch (error) {
    console.error('[Chat] Erro ao baixar imagem:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, userId, media } = await request.json();

    if (!message && !media) {
      return NextResponse.json({ error: 'Mensagem ou mídia é obrigatória' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API do Gemini não configurada' }, { status: 500 });
    }

    // Buscar contexto do usuário se tiver userId
    let userContext = null;
    if (userId) {
      userContext = await getUserContext(userId);
    }

    // Preparar partes do conteúdo para o Gemini
    const parts: Part[] = [];
    
    // Adicionar contexto do usuário na mensagem
    let messageWithContext = message || '';
    if (userContext && message) {
      const contextStr = formatUserContext(userContext);
      messageWithContext = `[USER_CONTEXT]\n${contextStr}\n[/USER_CONTEXT]\n\nMensagem do usuário: ${message}`;
    }
    
    // Adicionar mensagem de texto
    if (messageWithContext) {
      parts.push({ text: messageWithContext });
    }

    // Se houver mídia (imagem ou áudio), processar
    let mediaUrl = media?.url;
    
    // Processar IMAGEM
    if (media && media.type === 'image' && media.url) {
      try {
        const imageData = await fetchImageAsBase64(media.url);
        if (imageData) {
          parts.push({
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64,
            },
          });
          
          // Se não houver mensagem, adicionar contexto
          if (!message) {
            parts.unshift({ text: 'O usuário enviou esta imagem. Se for um recibo, nota fiscal ou comprovante, analise e extraia as informações relevantes (valor, estabelecimento, data, categoria). Ofereça para registrar como despesa.' });
          }
        }
      } catch (error) {
        console.error('[Chat] Erro ao processar imagem:', error);
      }
    }
    
    // Processar ÁUDIO
    if (media && media.type === 'audio') {
      try {
        let audioData: { base64: string; mimeType: string } | null = null;
        
        // Se já veio em base64 (direto do cliente)
        if (media.base64) {
          audioData = {
            base64: media.base64,
            mimeType: media.mimeType || 'audio/webm',
          };
        } 
        // Se é uma URL, baixar
        else if (media.url) {
          audioData = await fetchAudioAsBase64(media.url);
        }
        
        if (audioData) {
          parts.push({
            inlineData: {
              mimeType: audioData.mimeType,
              data: audioData.base64,
            },
          });
          
          // Contexto detalhado para melhor entendimento do áudio
          const audioContext = `
INSTRUÇÕES PARA PROCESSAMENTO DE ÁUDIO:
O usuário enviou uma mensagem de voz em português brasileiro. Por favor:

1. OUÇA ATENTAMENTE todo o áudio antes de responder
2. TRANSCREVA mentalmente o que o usuário disse
3. INTERPRETE a intenção do usuário considerando:
   - Sotaques e variações do português brasileiro
   - Possíveis ruídos de fundo
   - Palavras que podem soar similares
   
4. Se o usuário mencionou:
   - GASTOS/DESPESAS (ex: "gastei", "paguei", "comprei", "custou")
   - TAREFAS/LEMBRETES (ex: "lembra", "preciso", "tenho que", "não esquecer")
   - EVENTOS/COMPROMISSOS (ex: "reunião", "encontro", "agenda", "marcar")
   - METAS/OBJETIVOS (ex: "quero", "meu objetivo", "pretendo")

5. Se não entendeu algo claramente, peça para o usuário repetir

⚠️ IMPORTANTE - CONFIRMAÇÃO:
- NUNCA crie ações automaticamente
- Primeiro, diga o que você entendeu do áudio
- Depois, PERGUNTE se o usuário quer que você registre/crie
- Só inclua o bloco [ACTION] quando o usuário CONFIRMAR (ex: "sim", "pode", "isso", "confirma")
- Se o usuário disser "sim", "pode", "confirma" no MESMO áudio, aí pode criar a ação

RESPONDA em português brasileiro de forma natural e amigável.
`;
          
          // Se não houver mensagem de texto, usar o contexto
          if (!message) {
            parts.unshift({ text: audioContext });
          } else {
            parts.unshift({ text: audioContext + '\n\nO usuário também escreveu: ' + message });
          }
        }
      } catch (error) {
        console.error('[Chat] Erro ao processar áudio:', error);
      }
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
          parts: [{ text: ZED_SYSTEM_PROMPT + '\n\nOlá! 👋 Sim, eu sou o ZED, seu assistente virtual pessoal! Estou aqui para ajudar você a organizar sua vida, gerenciar tarefas, controlar finanças e muito mais. Você pode me enviar fotos de recibos que eu analiso e registro automaticamente! Como posso te ajudar hoje?' }],
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

    // Enviar mensagem (com ou sem imagem) e obter resposta
    const result = await chat.sendMessage(parts);
    const response = result.response;
    const text = response.text();

    // Extrair e executar ação, se houver
    let cleanText = text;
    let actionResult = null;

    if (userId && text.includes('[ACTION]')) {
      const actionResponse = await extractAndExecuteAction(text, userId, mediaUrl);
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
