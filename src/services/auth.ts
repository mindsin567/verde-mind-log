import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string;
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
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: data.name,
            bio: data.bio,
            location: data.location
          }
        }
      });

      if (error) throw error;
      
      // Update profile with additional data if user was created
      if (authData.user && data.bio || data.location) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            bio: data.bio, 
            location: data.location 
          })
          .eq('id', authData.user.id);
        
        if (profileError) console.warn('Profile update failed:', profileError);
      }

      return { user: authData.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;
      return { user: authData.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  },

  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};