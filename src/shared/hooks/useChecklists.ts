'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import toast from 'react-hot-toast';

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at?: string;
  completed_at?: string | null;
}

export interface Checklist {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  template_name?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: ChecklistItem[];
}

export interface CreateChecklistInput {
  title: string;
  description?: string;
  template_name?: string;
}

export interface CreateChecklistItemInput {
  checklist_id: string;
  title: string;
  order_index?: number;
}

export const useChecklists = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const supabase = createClient();

  const fetchChecklists = useCallback(async () => {
    if (!user) {
      setChecklists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Buscar checklists com seus items
      const { data: checklistsData, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (checklistsError) throw checklistsError;

      // Buscar items de todos os checklists
      const checklistIds = (checklistsData || []).map(c => c.id);
      
      let items: ChecklistItem[] = [];
      if (checklistIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('checklist_items')
          .select('*')
          .in('checklist_id', checklistIds)
          .order('order_index', { ascending: true });

        if (itemsError) throw itemsError;
        items = itemsData || [];
      }

      // Combinar checklists com seus items
      const checklistsWithItems = (checklistsData || []).map(checklist => ({
        ...checklist,
        items: items.filter(item => item.checklist_id === checklist.id),
      }));

      setChecklists(checklistsWithItems);
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
      toast.error('Erro ao carregar checklists');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const createChecklist = useCallback(async (input: CreateChecklistInput): Promise<Checklist | null> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          template_name: input.template_name || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newChecklist = { ...data, items: [] };
      setChecklists(prev => [newChecklist, ...prev]);
      toast.success('Checklist criado!');
      return newChecklist;
    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      toast.error('Erro ao criar checklist');
      return null;
    }
  }, [user, supabase]);

  const updateChecklist = useCallback(async (id: string, updates: Partial<CreateChecklistInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setChecklists(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
      toast.error('Erro ao atualizar checklist');
      return false;
    }
  }, [supabase]);

  const deleteChecklist = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Primeiro deletar os items
      await supabase
        .from('checklist_items')
        .delete()
        .eq('checklist_id', id);

      // Depois deletar o checklist
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChecklists(prev => prev.filter(c => c.id !== id));
      toast.success('Checklist excluído!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir checklist:', error);
      toast.error('Erro ao excluir checklist');
      return false;
    }
  }, [supabase]);

  const addItem = useCallback(async (input: CreateChecklistItemInput): Promise<ChecklistItem | null> => {
    try {
      const checklist = checklists.find(c => c.id === input.checklist_id);
      const orderIndex = input.order_index ?? (checklist?.items?.length || 0);

      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          checklist_id: input.checklist_id,
          title: input.title,
          order_index: orderIndex,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      setChecklists(prev => prev.map(c => 
        c.id === input.checklist_id 
          ? { ...c, items: [...(c.items || []), data] }
          : c
      ));
      return data;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
      return null;
    }
  }, [supabase, checklists]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<{ title: string; completed: boolean; order_index: number }>): Promise<boolean> => {
    try {
      const updateData: any = { ...updates };
      if (updates.completed !== undefined) {
        updateData.completed_at = updates.completed ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      setChecklists(prev => prev.map(c => ({
        ...c,
        items: c.items?.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        ),
      })));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return false;
    }
  }, [supabase]);

  const toggleItem = useCallback(async (itemId: string): Promise<boolean> => {
    const item = checklists.flatMap(c => c.items || []).find(i => i.id === itemId);
    if (!item) return false;
    return updateItem(itemId, { completed: !item.completed });
  }, [checklists, updateItem]);

  const deleteItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setChecklists(prev => prev.map(c => ({
        ...c,
        items: c.items?.filter(item => item.id !== itemId),
      })));
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
      return false;
    }
  }, [supabase]);

  const duplicateChecklist = useCallback(async (id: string): Promise<Checklist | null> => {
    const checklist = checklists.find(c => c.id === id);
    if (!checklist || !user) return null;

    try {
      // Criar novo checklist
      const { data: newChecklist, error: checklistError } = await supabase
        .from('checklists')
        .insert({
          user_id: user.id,
          title: `${checklist.title} (cópia)`,
          description: checklist.description,
          template_name: checklist.template_name,
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // Copiar items
      if (checklist.items && checklist.items.length > 0) {
        const newItems = checklist.items.map(item => ({
          checklist_id: newChecklist.id,
          title: item.title,
          order_index: item.order_index,
          completed: false,
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from('checklist_items')
          .insert(newItems)
          .select();

        if (itemsError) throw itemsError;

        const result = { ...newChecklist, items: itemsData };
        setChecklists(prev => [result, ...prev]);
        toast.success('Checklist duplicado!');
        return result;
      }

      setChecklists(prev => [{ ...newChecklist, items: [] }, ...prev]);
      toast.success('Checklist duplicado!');
      return { ...newChecklist, items: [] };
    } catch (error) {
      console.error('Erro ao duplicar checklist:', error);
      toast.error('Erro ao duplicar checklist');
      return null;
    }
  }, [checklists, user, supabase]);

  return {
    checklists,
    isLoading,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    duplicateChecklist,
  };
};

