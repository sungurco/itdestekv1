import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: RegisterData) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: string | null }>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
  phone?: string;
  department?: string;
  position?: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('it_helpdesk_user');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const checkSession = async () => {
    try {
      // First check local storage for demo/local mode
      const storedUser = localStorage.getItem('it_helpdesk_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data as User);
        localStorage.setItem('it_helpdesk_user', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setIsLoading(true);

      // Check demo accounts first
      const demoUser = getDemoUser(email);
      if (demoUser && password === 'demo123') {
        setUser(demoUser);
        localStorage.setItem('it_helpdesk_user', JSON.stringify(demoUser));
        return { error: null };
      }

      if (!isSupabaseConfigured) {
        return { error: 'Geçersiz e-posta veya şifre' };
      }

      // Try Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: 'Geçersiz e-posta veya şifre' };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: 'Giriş yapılırken bir hata oluştu' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ error: string | null }> => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        // Local mode - just create user locally
        const newUser: User = {
          id: uuidv4(),
          employee_id: data.employee_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          position: data.position,
          role: data.role,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem('it_helpdesk_user', JSON.stringify(newUser));
        return { error: null };
      }

      // Try Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { error: authError.message };
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            employee_id: data.employee_id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            department: data.department,
            position: data.position,
            role: data.role,
            is_active: true,
          }]);

        if (profileError) throw profileError;

        await fetchUserProfile(authData.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: 'Kayıt yapılırken bir hata oluştu' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('it_helpdesk_user');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('it_helpdesk_user');
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Kullanıcı bulunamadı' };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('user_profiles')
          .update(data)
          .eq('id', user.id);

        if (error) throw error;
      }

      setUser({ ...user, ...data });
      localStorage.setItem('it_helpdesk_user', JSON.stringify({ ...user, ...data }));

      return { error: null };
    } catch (error) {
      // Still update locally even if Supabase fails
      setUser({ ...user, ...data });
      localStorage.setItem('it_helpdesk_user', JSON.stringify({ ...user, ...data }));
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Demo users for development/testing
function getDemoUser(email: string): User | null {
  const demoUsers: Record<string, User> = {
    'admin@demo.com': {
      id: 'demo-admin-1',
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      email: 'admin@demo.com',
      role: 'Sistem Yöneticisi',
      department: 'Bilgi Teknolojileri',
      position: 'IT Müdürü',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    'teknisyen@demo.com': {
      id: 'demo-tech-1',
      first_name: 'Mehmet',
      last_name: 'Kaya',
      email: 'teknisyen@demo.com',
      role: 'IT Destek Personeli',
      department: 'Bilgi Teknolojileri',
      position: 'IT Destek Uzmanı',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    'kullanici@demo.com': {
      id: 'demo-user-1',
      first_name: 'Ayşe',
      last_name: 'Demir',
      email: 'kullanici@demo.com',
      role: 'Firma Kullanıcısı',
      department: 'Muhasebe',
      position: 'Muhasebe Uzmanı',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  };

  return demoUsers[email] || null;
}
