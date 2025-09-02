import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface CreateChatMessageData {
  content: string;
  sender: 'user' | 'ai';
}

export const chatService = {
  async createChatMessage(userId: string, data: CreateChatMessageData) {
    try {
      const { data: chatMessage, error } = await supabase
        .from('chatmessages')
        .insert({
          user_id: userId,
          content: data.content,
          sender: data.sender
        })
        .select()
        .single();

      if (error) throw error;
      return { data: chatMessage, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getChatMessages(userId: string) {
    try {
      const { data: chatMessages, error } = await supabase
        .from('chatmessages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return { data: chatMessages, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
};