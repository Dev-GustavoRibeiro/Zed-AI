'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface Message {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'audio' | 'image' | 'video';
  attachment_url?: string | null;
  created_at: string;
}

export interface CreateMessageInput {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'audio' | 'image' | 'video';
  attachment_url?: string | null;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    let userId = user?.id;
    
    if (!userId) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      userId = currentUser?.id;
    }
    
    if (!userId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) {
      fetchMessages();
    }
  }, [fetchMessages, authLoading, user]);

  const addMessage = useCallback(async (input: CreateMessageInput): Promise<Message | null> => {
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...input,
          user_id: user.id,
          type: input.type || 'text',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      return null;
    }
  }, [user, supabase]);

  const clearHistory = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      return false;
    }
  }, [user, supabase]);

  // Obter histórico formatado para enviar à API
  const getFormattedHistory = useCallback(() => {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  return {
    messages,
    isLoading,
    fetchMessages,
    addMessage,
    clearHistory,
    getFormattedHistory,
  };
};

