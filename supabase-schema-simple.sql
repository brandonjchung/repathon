-- Supabase Schema for Workout History & Backend
-- Run this in your Supabase SQL Editor

-- Create tables
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_reps INTEGER NOT NULL DEFAULT 0,
    total_duration_ms BIGINT NOT NULL DEFAULT 0,
    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps_per_set INTEGER NOT NULL,
    interval_seconds INTEGER NOT NULL,
    actual_duration_ms BIGINT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_presets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    reps_per_set INTEGER NOT NULL,
    interval_seconds INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_session_date ON public.workouts(session_date);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_user_presets_user_id ON public.user_presets(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Workouts: Users can only see their own workouts
CREATE POLICY "Users can view their own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON public.workouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON public.workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Workout Sets: Users can manage sets for their own workouts
CREATE POLICY "Users can view workout sets for their workouts" ON public.workout_sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE workouts.id = workout_sets.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert workout sets for their workouts" ON public.workout_sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE workouts.id = workout_sets.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update workout sets for their workouts" ON public.workout_sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE workouts.id = workout_sets.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete workout sets for their workouts" ON public.workout_sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE workouts.id = workout_sets.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

-- User Presets: Users can only manage their own presets
CREATE POLICY "Users can view their own presets" ON public.user_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presets" ON public.user_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets" ON public.user_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets" ON public.user_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presets_updated_at BEFORE UPDATE ON public.user_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();