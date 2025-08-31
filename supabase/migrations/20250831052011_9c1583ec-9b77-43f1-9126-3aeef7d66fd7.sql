-- Enable RLS on all tables and create proper policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaryentries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatmessages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aisummaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airecommendations ENABLE ROW LEVEL SECURITY;

-- Update users table to reference auth.users
ALTER TABLE public.users DROP COLUMN IF EXISTS password;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update all foreign key references to use auth.uid() instead of integer user_id
ALTER TABLE public.moodlogs DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.moodlogs ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

ALTER TABLE public.diaryentries DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.diaryentries ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

ALTER TABLE public.chatmessages DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.chatmessages ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

ALTER TABLE public.aisummaries DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.aisummaries ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

ALTER TABLE public.airecommendations DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.airecommendations ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Create RLS policies for moodlogs
CREATE POLICY "Users can view their own mood logs" ON public.moodlogs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood logs" ON public.moodlogs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs" ON public.moodlogs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs" ON public.moodlogs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for diary entries
CREATE POLICY "Users can view their own diary entries" ON public.diaryentries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries" ON public.diaryentries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" ON public.diaryentries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" ON public.diaryentries
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat messages
CREATE POLICY "Users can view their own chat messages" ON public.chatmessages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages" ON public.chatmessages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for AI summaries
CREATE POLICY "Users can view their own AI summaries" ON public.aisummaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI summaries" ON public.aisummaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for AI recommendations
CREATE POLICY "Users can view their own AI recommendations" ON public.airecommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI recommendations" ON public.airecommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();