import { supabase } from "@/integrations/supabase/client";

export interface MoodLog {
  id: string;
  user_id: string;
  emoji: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface CreateMoodLogData {
  emoji: string;
  note?: string;
  date: string;
}

export const moodService = {
  async createMoodLog(userId: string, data: CreateMoodLogData) {
    try {
      const { data: moodLog, error } = await supabase
        .from('moodlogs')
        .insert({
          user_id: userId,
          emoji: data.emoji,
          note: data.note,
          date: data.date
        })
        .select()
        .single();

      if (error) throw error;
      return { data: moodLog, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getMoodLogs(userId: string) {
    try {
      const { data: moodLogs, error } = await supabase
        .from('moodlogs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: moodLogs, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getMoodLogByDate(userId: string, date: string) {
    try {
      const { data: moodLog, error } = await supabase
        .from('moodlogs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      return { data: moodLog, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
};