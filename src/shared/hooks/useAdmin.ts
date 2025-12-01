'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: {
    users?: boolean;
    analytics?: boolean;
    settings?: boolean;
  };
  created_at: string;
}

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (adminUser && !error) {
            setAdminData(adminUser as AdminUser);
            setIsAdmin(true);
          } else {
            setAdminData(null);
            setIsAdmin(false);
          }
        } else {
          setAdminData(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const hasPermission = useCallback((permission: keyof AdminUser['permissions']) => {
    if (!adminData) return false;
    if (adminData.role === 'super_admin') return true;
    return adminData.permissions[permission] === true;
  }, [adminData]);

  const isSuperAdmin = adminData?.role === 'super_admin';

  return {
    user,
    adminData,
    isLoading,
    isAdmin,
    isSuperAdmin,
    hasPermission,
  };
};


