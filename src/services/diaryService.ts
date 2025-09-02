import { supabase } from "@/integrations/supabase/client";

export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  word_count: number;
  created_at: string;
}

export interface CreateDiaryEntryData {
  title: string;
  content: string;
  mood?: string;
}

export const diaryService = {
  async createDiaryEntry(userId: string, data: CreateDiaryEntryData) {
    try {
      const wordCount = data.content.split(/\s+/).filter(word => word.length > 0).length;
      
      const { data: diaryEntry, error } = await supabase
        .from('diaryentries')
        .insert({
          user_id: userId,
          title: data.title,
          content: data.content,
          mood: data.mood,
          word_count: wordCount
        })
        .select()
        .single();

      if (error) throw error;
      return { data: diaryEntry, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getDiaryEntries(userId: string) {
    try {
      const { data: diaryEntries, error } = await supabase
        .from('diaryentries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: diaryEntries, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async deleteDiaryEntry(userId: string, entryId: string) {
    try {
      const { error } = await supabase
        .from('diaryentries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};