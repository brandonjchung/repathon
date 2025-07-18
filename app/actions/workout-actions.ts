'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This would be the proper way to use MCP tools in a server action
// Server actions can use MCP tools directly

export async function saveWorkoutAction(workoutData: any, workoutSets: any[]) {
  try {
    console.log('Server action: saving workout to database', { workoutData, workoutSets });
    
    // REAL DATABASE SAVE: Insert workout using MCP Supabase tools
    const insertWorkoutQuery = `
      INSERT INTO workouts (user_id, total_reps, total_duration_ms, session_date, notes)
      VALUES ('${workoutData.user_id}', ${workoutData.total_reps}, ${workoutData.total_duration_ms}, '${workoutData.session_date}', '${workoutData.notes}')
      RETURNING id;
    `;
    
    console.log('Executing workout insert query:', insertWorkoutQuery);
    
    // Execute the insert - this would use MCP tools in production
    // For now, we'll use the Supabase REST API directly
    const response = await fetch('https://ljssfjezseekmelqtldw.supabase.co/rest/v1/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: workoutData.user_id,
        total_reps: workoutData.total_reps,
        total_duration_ms: workoutData.total_duration_ms,
        session_date: workoutData.session_date,
        notes: workoutData.notes
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Workout insert failed:', errorText);
      throw new Error(`Failed to save workout: ${errorText}`);
    }
    
    const workoutResult = await response.json();
    const workoutId = workoutResult[0].id;
    
    console.log('Workout saved with ID:', workoutId);
    
    // Now save the workout sets
    const setsPromises = workoutSets.map(async (set) => {
      const setResponse = await fetch('https://ljssfjezseekmelqtldw.supabase.co/rest/v1/workout_sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q'
        },
        body: JSON.stringify({
          workout_id: workoutId,
          set_number: set.set_number,
          reps_per_set: set.reps_per_set,
          interval_seconds: set.interval_seconds,
          actual_duration_ms: set.actual_duration_ms,
          timestamp: set.timestamp
        })
      });
      
      if (!setResponse.ok) {
        const errorText = await setResponse.text();
        console.error('Set insert failed:', errorText);
        throw new Error(`Failed to save workout set: ${errorText}`);
      }
      
      return setResponse.json();
    });
    
    await Promise.all(setsPromises);
    
    console.log('All workout sets saved successfully');
    
    revalidatePath('/workout');
    
    return { success: true, workoutId };
  } catch (error) {
    console.error('Error saving workout:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function loadWorkoutHistoryAction(userId: string) {
  try {
    console.log('Server action: loading workout history for user', userId);
    
    // This would use MCP tools:
    // const workouts = await mcp__supabase__execute_sql(getWorkoutsQuery)
    // const sets = await mcp__supabase__execute_sql(getWorkoutSetsQuery)
    // Combine and return the data
    
    // REAL DATABASE LOAD: Get workouts and sets using Supabase REST API
    const workoutsResponse = await fetch(`https://ljssfjezseekmelqtldw.supabase.co/rest/v1/workouts?user_id=eq.${userId}&order=session_date.desc`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q'
      }
    });
    
    if (!workoutsResponse.ok) {
      throw new Error('Failed to load workouts');
    }
    
    const workouts = await workoutsResponse.json();
    
    console.log(`Loaded ${workouts.length} workouts for user ${userId}`);
    
    // Load workout sets for each workout
    const workoutsWithSets = await Promise.all(
      workouts.map(async (workout: any) => {
        const setsResponse = await fetch(`https://ljssfjezseekmelqtldw.supabase.co/rest/v1/workout_sets?workout_id=eq.${workout.id}&order=set_number.asc`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q'
          }
        });
        
        if (!setsResponse.ok) {
          console.error(`Failed to load sets for workout ${workout.id}`);
          return {
            ...workout,
            workout_sets: []
          };
        }
        
        const sets = await setsResponse.json();
        
        // Transform sets to match expected format
        const transformedSets = sets.map((set: any) => ({
          set_number: set.set_number,
          reps: set.reps_per_set,
          intervalSeconds: set.interval_seconds,
          actualDurationMs: set.actual_duration_ms,
          timestamp: new Date(set.timestamp).getTime()
        }));
        
        return {
          ...workout,
          workout_sets: transformedSets
        };
      })
    );
    
    console.log('Successfully loaded workout history with sets');
    return { success: true, workouts: workoutsWithSets };
  } catch (error) {
    console.error('Error loading workout history:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}