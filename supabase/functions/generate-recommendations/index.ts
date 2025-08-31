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
    const { userId, source, context } = await req.json();
    
    if (!userId || !source) {
      throw new Error('UserId and source are required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent user data for context
    const [recentMoods, recentEntries, recentChats] = await Promise.all([
      supabase
        .from('moodlogs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('diaryentries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),
      
      supabase
        .from('chatmessages')
        .select('*')
        .eq('user_id', userId)
        .eq('sender', 'user')
        .order('timestamp', { ascending: false })
        .limit(5)
    ]);

    // Create context-aware prompt
    const prompt = `Based on this user's recent wellness data, generate 3-4 specific, actionable recommendations for improving their mental wellbeing. 

Recent data:
- Mood logs: ${JSON.stringify(recentMoods.data)}
- Diary entries: ${JSON.stringify(recentEntries.data)}
- Recent concerns: ${JSON.stringify(recentChats.data)}

Source: ${source}
Context: ${context || 'General wellness recommendations'}

Provide practical, evidence-based suggestions that are:
1. Specific and actionable
2. Appropriate for their current state
3. Focused on mental health and wellbeing
4. Realistic to implement

Return as a JSON array of strings, each recommendation being 15-30 words.`;

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
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse JSON from AI response, fallback to default recommendations
    let recommendations: string[];
    try {
      recommendations = JSON.parse(aiResponse);
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }
    } catch {
      // Fallback recommendations
      recommendations = [
        "Take 5 minutes for deep breathing exercises to reduce stress and anxiety.",
        "Write in a journal for 10 minutes to process your thoughts and emotions.",
        "Go for a 15-minute walk outside to boost mood and get fresh air.",
        "Practice gratitude by listing 3 things you're thankful for today."
      ];
    }

    // Save recommendations to database
    const { data: savedRec, error: saveError } = await supabase
      .from('airecommendations')
      .insert({
        user_id: userId,
        source,
        context: context || 'AI-generated wellness recommendations',
        recommendations,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving recommendations:', saveError);
    }

    return new Response(JSON.stringify({ 
      recommendations: savedRec?.recommendations || recommendations,
      id: savedRec?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: [
        "Take a moment to breathe deeply and center yourself.",
        "Consider reaching out to a friend or loved one for support.",
        "Engage in a activity that brings you joy and relaxation.",
        "Practice self-compassion and be kind to yourself today."
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});