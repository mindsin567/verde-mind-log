-- Drop all existing tables and start fresh
DROP TABLE IF EXISTS public.airecommendations CASCADE;
DROP TABLE IF EXISTS public.aisummaries CASCADE;
DROP TABLE IF EXISTS public.chatmessages CASCADE;
DROP TABLE IF EXISTS public.diaryentries CASCADE;
DROP TABLE IF EXISTS public.moodlogs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Create Users table
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MoodLogs table
CREATE TABLE public.moodlogs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    note TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create DiaryEntries table
CREATE TABLE public.diaryentries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    word_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ChatMessages table
CREATE TABLE public.chatmessages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AISummaries table
CREATE TABLE public.aisummaries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('7days', 'week', '2weeks', '3weeks', 'month')),
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AIRecommendations table
CREATE TABLE public.airecommendations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    context TEXT NOT NULL,
    recommendations TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (minimal)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaryentries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatmessages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aisummaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airecommendations ENABLE ROW LEVEL SECURITY;

-- Create minimal RLS policies - users can only access their own data
CREATE POLICY "Users can access their own data" ON public.users FOR ALL USING (id = auth.uid());
CREATE POLICY "Users can access their own mood logs" ON public.moodlogs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can access their own diary entries" ON public.diaryentries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can access their own chat messages" ON public.chatmessages FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can access their own AI summaries" ON public.aisummaries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can access their own AI recommendations" ON public.airecommendations FOR ALL USING (user_id = auth.uid());