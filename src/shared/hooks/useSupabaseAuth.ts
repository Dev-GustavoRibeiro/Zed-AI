'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar autenticação com Supabase
 */
export const useSupabaseAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Verificar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  }, [router, supabase.auth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[Auth] Iniciando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('[Auth] Login bem sucedido, user_id:', data.user?.id);
      setUser(data.user);
      
      // Verificar se é admin para redirecionar corretamente
      if (data.user) {
        console.log('[Auth] Verificando se é admin...');
        
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('user_id', data.user.id)
          .maybeSingle(); // maybeSingle não lança erro se não encontrar
        
        console.log('[Auth] Resultado da query admin:', { adminUser, adminError });
        
        toast.success('Login realizado com sucesso!');
        
        if (adminUser) {
          // É admin - redirecionar para painel admin
          console.log('[Auth] É admin! Redirecionando para /admin');
          window.location.href = '/admin';
        } else {
          // Usuário normal - redirecionar para dashboard
          console.log('[Auth] Não é admin. Redirecionando para /dashboard');
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      console.error('[Auth] Erro ao fazer login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  }, [supabase]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;

      // Criar perfil do usuário
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name,
        });
      }
      
      setUser(data.user);
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro ao fazer signup:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  }, [router, supabase]);

  return {
    logout,
    login,
    signup,
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};

