import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  created_at: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    try {
      // Create user in our custom users table
      const { data: userData, error } = await supabase
        .from('users')
        .insert({
          name: data.name,
          email: data.email,
          password: data.password, // In real app, hash this on server
          bio: data.bio,
          location: data.location
        })
        .select()
        .single();

      if (error) throw error;
      return { user: userData, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async signIn(data: SignInData) {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .eq('password', data.password) // In real app, verify hashed password
        .single();

      if (error) throw error;
      return { user: userData, error: null };
    } catch (error: any) {
      return { user: null, error: 'Invalid email or password' };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // For now, return mock user or stored user
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  async signOut() {
    localStorage.removeItem('currentUser');
    return { error: null };
  }
};