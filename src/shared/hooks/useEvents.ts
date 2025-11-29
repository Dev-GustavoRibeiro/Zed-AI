'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  all_day: boolean;
  location?: string;
  reminder_minutes?: number;
  reminder_sent: boolean;
  category?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  all_day?: boolean;
  location?: string;
  reminder_minutes?: number;
  category?: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (input: CreateEventInput): Promise<Event | null> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...input,
          user_id: user.id,
          all_day: input.all_day || false,
          reminder_sent: false,
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      toast.success('Evento criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
      return null;
    }
  }, [user, supabase]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CreateEventInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      toast.success('Evento atualizado!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
      return false;
    }
  }, [supabase]);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Evento excluído!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
      return false;
    }
  }, [supabase]);

  // Eventos de hoje
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start_time).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  });

  // Eventos desta semana
  const weekEvents = events.filter(e => {
    const eventDate = new Date(e.start_time);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  return {
    events,
    todayEvents,
    weekEvents,
    isLoading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

