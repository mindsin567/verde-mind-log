-- Drop the existing users table and create a proper profiles table
DROP TABLE IF EXISTS public.users CASCADE;

-- Create profiles table that references Supabase's auth.users
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  bio text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Update foreign key references in other tables to point to auth.users
ALTER TABLE public.moodlogs DROP CONSTRAINT IF EXISTS moodlogs_user_id_fkey;
ALTER TABLE public.moodlogs ADD CONSTRAINT moodlogs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.diaryentries DROP CONSTRAINT IF EXISTS diaryentries_user_id_fkey;
ALTER TABLE public.diaryentries ADD CONSTRAINT diaryentries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.chatmessages DROP CONSTRAINT IF EXISTS chatmessages_user_id_fkey;
ALTER TABLE public.chatmessages ADD CONSTRAINT chatmessages_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.aisummaries DROP CONSTRAINT IF EXISTS aisummaries_user_id_fkey;
ALTER TABLE public.aisummaries ADD CONSTRAINT aisummaries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.airecommendations DROP CONSTRAINT IF EXISTS airecommendations_user_id_fkey;
ALTER TABLE public.airecommendations ADD CONSTRAINT airecommendations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'name', 'User'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();