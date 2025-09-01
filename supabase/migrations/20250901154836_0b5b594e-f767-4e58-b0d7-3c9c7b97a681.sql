-- First, let's add auth_id to users table and modify the structure
ALTER TABLE public.users ADD COLUMN auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;

-- Create a new profiles table that properly links to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  bio TEXT,
  location VARCHAR,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Now update all user_id columns to be UUID and reference profiles
-- First, we need to handle existing data by dropping foreign key constraints if any exist

-- Update moodlogs table
ALTER TABLE public.moodlogs ADD COLUMN new_user_id UUID;
-- We'll set this to NULL for now since we can't map integer IDs to UUIDs without existing auth users
ALTER TABLE public.moodlogs DROP COLUMN user_id;
ALTER TABLE public.moodlogs RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.moodlogs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.moodlogs ADD FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update diaryentries table
ALTER TABLE public.diaryentries ADD COLUMN new_user_id UUID;
ALTER TABLE public.diaryentries DROP COLUMN user_id;
ALTER TABLE public.diaryentries RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.diaryentries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.diaryentries ADD FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update chatmessages table
ALTER TABLE public.chatmessages ADD COLUMN new_user_id UUID;
ALTER TABLE public.chatmessages DROP COLUMN user_id;
ALTER TABLE public.chatmessages RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.chatmessages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.chatmessages ADD FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update aisummaries table
ALTER TABLE public.aisummaries ADD COLUMN new_user_id UUID;
ALTER TABLE public.aisummaries DROP COLUMN user_id;
ALTER TABLE public.aisummaries RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.aisummaries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.aisummaries ADD FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update airecommendations table
ALTER TABLE public.airecommendations ADD COLUMN new_user_id UUID;
ALTER TABLE public.airecommendations DROP COLUMN user_id;
ALTER TABLE public.airecommendations RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.airecommendations ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.airecommendations ADD FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaryentries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatmessages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aisummaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airecommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for moodlogs
CREATE POLICY "Users can view their own mood logs" ON public.moodlogs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood logs" ON public.moodlogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs" ON public.moodlogs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs" ON public.moodlogs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for diaryentries
CREATE POLICY "Users can view their own diary entries" ON public.diaryentries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries" ON public.diaryentries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" ON public.diaryentries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" ON public.diaryentries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chatmessages
CREATE POLICY "Users can view their own chat messages" ON public.chatmessages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages" ON public.chatmessages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON public.chatmessages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" ON public.chatmessages
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for aisummaries
CREATE POLICY "Users can view their own AI summaries" ON public.aisummaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI summaries" ON public.aisummaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI summaries" ON public.aisummaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI summaries" ON public.aisummaries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for airecommendations
CREATE POLICY "Users can view their own AI recommendations" ON public.airecommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI recommendations" ON public.airecommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI recommendations" ON public.airecommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI recommendations" ON public.airecommendations
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for the old users table (restrict access)
CREATE POLICY "Users cannot access old users table" ON public.users
  FOR ALL USING (false);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at columns where missing and create triggers
ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.moodlogs ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.diaryentries ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.chatmessages ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.aisummaries ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.airecommendations ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moodlogs_updated_at BEFORE UPDATE ON public.moodlogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diaryentries_updated_at BEFORE UPDATE ON public.diaryentries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatmessages_updated_at BEFORE UPDATE ON public.chatmessages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aisummaries_updated_at BEFORE UPDATE ON public.aisummaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_airecommendations_updated_at BEFORE UPDATE ON public.airecommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();