import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, period } = await req.json();
    
    if (!userId || !period) {
      throw new Error('UserId and period are required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case '2weeks':
        startDate.setDate(now.getDate() - 14);
        break;
      case '3weeks':
        startDate.setDate(now.getDate() - 21);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch user data from the specified period
    const [moodLogs, diaryEntries, chatMessages] = await Promise.all([
      supabase
        .from('moodlogs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString()),
      
      supabase
        .from('diaryentries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString()),
      
      supabase
        .from('chatmessages')
        .select('*')
        .eq('user_id', userId)
        .eq('sender', 'user')
        .gte('timestamp', startDate.toISOString())
    ]);

    // Prepare data for analysis
    const analysisData = {
      moodLogs: moodLogs.data || [],
      diaryEntries: diaryEntries.data || [],
      chatMessages: chatMessages.data || []
    };

    // Generate summary using Gemini
    const prompt = `Analyze this user's wellness data from the past ${period} and provide a 50-100 word summary of their mental health patterns, mood trends, and key insights. Focus on being supportive and constructive.

Data:
- Mood logs (${analysisData.moodLogs.length} entries): ${JSON.stringify(analysisData.moodLogs.slice(0, 10))}
- Diary entries (${analysisData.diaryEntries.length} entries): ${JSON.stringify(analysisData.diaryEntries.slice(0, 5))}
- Chat interactions (${analysisData.chatMessages.length} messages): ${JSON.stringify(analysisData.chatMessages.slice(0, 10))}

Provide a concise, empathetic summary highlighting patterns and progress.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "Your wellness journey is unique and valuable.";

    // Save summary to database
    const { data: savedSummary, error: saveError } = await supabase
      .from('aisummaries')
      .insert({
        user_id: userId,
        period,
        summary,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving summary:', saveError);
    }

    return new Response(JSON.stringify({ 
      summary: savedSummary?.summary || summary,
      id: savedSummary?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});