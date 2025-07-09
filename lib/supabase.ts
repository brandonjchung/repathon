import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export Supabase's User type for consistency
export type { User } from '@supabase/supabase-js';

export interface Workout {
  id: string;
  user_id: string;
  total_reps: number;
  total_duration_ms: number;
  session_date: string;
  created_at: string;
  notes?: string;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  set_number: number;
  reps_per_set: number;
  interval_seconds: number;
  actual_duration_ms: number;
  timestamp: string;
}

export interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  reps_per_set: number;
  interval_seconds: number;
  description?: string;
  created_at: string;
}