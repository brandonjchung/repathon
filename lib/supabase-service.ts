import { supabase, User, Workout, WorkoutSet, UserPreset } from './supabase';

export class SupabaseService {
  // Authentication methods
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Workout operations
  static async createWorkout(workoutData: Omit<Workout, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select()
      .single();
    return { data, error };
  }

  static async getWorkoutsByUser(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  static async getWorkoutWithSets(workoutId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_sets (*)
      `)
      .eq('id', workoutId)
      .single();
    return { data, error };
  }

  // Workout sets operations
  static async createWorkoutSet(setData: Omit<WorkoutSet, 'id'>) {
    const { data, error } = await supabase
      .from('workout_sets')
      .insert([setData])
      .select()
      .single();
    return { data, error };
  }

  static async createWorkoutSets(setsData: Omit<WorkoutSet, 'id'>[]) {
    const { data, error } = await supabase
      .from('workout_sets')
      .insert(setsData)
      .select();
    return { data, error };
  }

  // User presets operations
  static async getUserPresets(userId: string) {
    const { data, error } = await supabase
      .from('user_presets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  static async createUserPreset(presetData: Omit<UserPreset, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('user_presets')
      .insert([presetData])
      .select()
      .single();
    return { data, error };
  }

  static async updateUserPreset(presetId: string, updates: Partial<UserPreset>) {
    const { data, error } = await supabase
      .from('user_presets')
      .update(updates)
      .eq('id', presetId)
      .select()
      .single();
    return { data, error };
  }

  static async deleteUserPreset(presetId: string) {
    const { error } = await supabase
      .from('user_presets')
      .delete()
      .eq('id', presetId);
    return { error };
  }

  // Analytics methods
  static async getUserWorkoutStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('workouts')
      .select('session_date, total_reps, total_duration_ms')
      .eq('user_id', userId)
      .gte('session_date', startDate.toISOString())
      .order('session_date', { ascending: true });
    
    return { data, error };
  }

  static async getTotalRepsThisWeek(userId: string) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('workouts')
      .select('total_reps')
      .eq('user_id', userId)
      .gte('session_date', startOfWeek.toISOString());
    
    if (error) return { data: 0, error };
    
    const totalReps = data.reduce((sum, workout) => sum + workout.total_reps, 0);
    return { data: totalReps, error: null };
  }
}