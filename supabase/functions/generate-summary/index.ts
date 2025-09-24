import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeRange = '7d' } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authorization token required');
    }

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error('Invalid authorization token');
    }

    console.log('Generating summary for user:', user.id, 'timeRange:', timeRange);

    // Calculate date range - for weekly analysis, get Monday to Sunday
    const now = new Date();
    let startDate: Date;
    
    if (timeRange === '7d') {
      // Get the Monday of current week
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so need to go back 6 days
      startDate = new Date(now.getTime() - (daysToMonday * 24 * 60 * 60 * 1000));
      startDate.setHours(0, 0, 0, 0); // Start of Monday
    } else {
      let daysBack = 7;
      switch (timeRange) {
        case '30d': daysBack = 30; break;
        case '90d': daysBack = 90; break;
        case '1y': daysBack = 365; break;
      }
      startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    }

    // Fetch user's mood logs
    const { data: moodLogs } = await supabase
      .from('moodlogs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Fetch user's diary entries
    const { data: diaryEntries } = await supabase
      .from('diaryentries')
      .select('title, content, mood, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Prepare weekly analysis data for AI
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let weeklyAnalysis = '';
    
    if (timeRange === '7d' && moodLogs && moodLogs.length > 0) {
      // Create day-by-day analysis for the week
      const weeklyMoods: { [key: string]: any } = {};
      moodLogs.forEach(log => {
        const logDate = new Date(log.date);
        const dayName = weekDays[logDate.getDay() === 0 ? 6 : logDate.getDay() - 1]; // Adjust for Monday start
        weeklyMoods[dayName] = { emoji: log.emoji, note: log.note };
      });
      
      weeklyAnalysis = weekDays.map(day => {
        const dayMood = weeklyMoods[day];
        return `${day}: ${dayMood ? `${dayMood.emoji} ${dayMood.note ? `(${dayMood.note})` : ''}` : 'No mood logged'}`;
      }).join('\n');
    } else {
      weeklyAnalysis = moodLogs?.map(log => `${log.date}: ${log.emoji} (${log.note || 'no note'})`).join('\n') || 'No mood logs found';
    }
    
    const diarySummary = diaryEntries?.map(entry => `${entry.title}: ${entry.content.substring(0, 200)}...`).join('\n') || 'No diary entries found';

    const timeDescription = timeRange === '7d' ? 'this week (Monday to Sunday)' : `the last ${timeRange}`;
    
    const prompt = `Based on the following user's mental health data from ${timeDescription}, provide a brief analysis and recommendations:

Weekly Mood Pattern:
${weeklyAnalysis}

Recent Diary Entries:
${diarySummary}

Please provide:
1. A brief summary (60-100 words) analyzing their weekly mood patterns, emotional trends, and overall mental wellbeing
2. Exactly 3 specific, actionable recommendations to improve their mental health based on the patterns you observe

Focus on:
- Overall mood consistency throughout the week
- Any patterns or trends you notice
- Days with better/worse moods
- Practical, personalized suggestions

Format your response as:
SUMMARY: [your 60-100 word analysis of their weekly mental health patterns]
RECOMMENDATIONS:
1. [first specific recommendation]
2. [second specific recommendation] 
3. [third specific recommendation]`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('Gemini response:', aiResponse);

    // Parse the response
    const summaryMatch = aiResponse.match(/SUMMARY:\s*(.*?)(?=RECOMMENDATIONS:|$)/s);
    const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:\s*([\s\S]*)/);

    let summary = summaryMatch?.[1]?.trim() || 'Unable to generate summary at this time.';
    let recommendations: string[] = [];

    if (recommendationsMatch) {
      recommendations = recommendationsMatch[1]
        .split(/\d+\.\s+/)
        .filter(rec => rec.trim().length > 0)
        .map(rec => rec.trim())
        .slice(0, 3);
    }

    // Fallback recommendations if parsing fails
    if (recommendations.length === 0) {
      recommendations = [
        'Practice 10 minutes of daily meditation or deep breathing exercises',
        'Maintain a regular sleep schedule of 7-8 hours per night',
        'Engage in physical activity for at least 30 minutes, 3 times per week'
      ];
    }

    // Save the summary to database
    await supabase.from('aisummaries').insert({
      user_id: user.id,
      summary,
      period: timeRange
    });

    return new Response(JSON.stringify({ 
      summary, 
      recommendations,
      moodLogsCount: moodLogs?.length || 0,
      diaryEntriesCount: diaryEntries?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});