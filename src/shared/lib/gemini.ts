'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar o cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modelo Gemini gratuito (atualizado para 2.0)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Configuração do ZED como assistente pessoal
const ZED_SYSTEM_PROMPT = `Você é o ZED, um assistente virtual pessoal inteligente e amigável. Suas características principais são:

🎯 PERSONALIDADE:
- Você é prestativo, inteligente e tem um tom amigável mas profissional
- Você usa emojis ocasionalmente para tornar a conversa mais agradável
- Você é direto e objetivo, mas também empático
- Você sempre tenta ajudar o usuário da melhor forma possível

📋 SUAS CAPACIDADES:
- Ajudar a organizar tarefas e rotinas diárias
- Dar sugestões de produtividade e gestão de tempo
- Auxiliar no controle financeiro pessoal
- Ajudar a planejar metas e objetivos
- Responder perguntas gerais e dar conselhos
- Criar listas e checklists
- Sugerir hábitos saudáveis

⚠️ REGRAS IMPORTANTES:
- Sempre responda em português brasileiro
- Seja conciso, mas completo nas respostas
- Se não souber algo, admita honestamente
- Nunca invente informações falsas
- Mantenha o foco em ajudar o usuário a ser mais produtivo e organizado
- Quando o usuário mencionar tarefas, gastos, ou eventos, sugira como ele pode usar o dashboard do ZED para registrar essas informações

🚀 CONTEXTO:
- Você está integrado ao aplicativo ZED, um dashboard de vida pessoal
- O usuário pode gerenciar tarefas, finanças, agenda, metas e mais através do app
- Você pode sugerir que o usuário acesse seções específicas do app quando relevante`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Enviar mensagem para o Gemini e obter resposta
 */
export async function sendMessageToGemini(
  message: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Construir o histórico de conversa para o Gemini
    const formattedHistory = chatHistory.map((msg) => ({
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

    return text;
  } catch (error: any) {
    console.error('Erro ao comunicar com Gemini:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('Erro de configuração: Chave da API do Gemini inválida');
    }
    
    if (error.message?.includes('quota')) {
      throw new Error('Limite de uso atingido. Tente novamente mais tarde.');
    }
    
    throw new Error('Erro ao processar sua mensagem. Tente novamente.');
  }
}

/**
 * Função para processar comandos especiais do ZED
 */
export function parseZedCommand(message: string): { type: string; data?: any } | null {
  const lowerMessage = message.toLowerCase();
  
  // Detectar intenção de criar tarefa
  if (
    lowerMessage.includes('lembrar') ||
    lowerMessage.includes('criar tarefa') ||
    lowerMessage.includes('adicionar tarefa') ||
    lowerMessage.includes('preciso fazer')
  ) {
    return { type: 'CREATE_TASK', data: message };
  }
  
  // Detectar intenção de registrar gasto
  if (
    lowerMessage.includes('gastei') ||
    lowerMessage.includes('comprei') ||
    lowerMessage.includes('paguei') ||
    lowerMessage.includes('registrar gasto')
  ) {
    return { type: 'CREATE_EXPENSE', data: message };
  }
  
  // Detectar intenção de agendar evento
  if (
    lowerMessage.includes('agendar') ||
    lowerMessage.includes('marcar') ||
    lowerMessage.includes('compromisso') ||
    lowerMessage.includes('reunião')
  ) {
    return { type: 'CREATE_EVENT', data: message };
  }
  
  return null;
}

