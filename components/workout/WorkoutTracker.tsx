import { useState } from 'react';
import { User } from '../../lib/supabase';
import { SupabaseService } from '../../lib/supabase-service';
import { useWorkout } from '../../hooks/useWorkout';
import WorkoutNavigation from './WorkoutNavigation';
import CadenceSettings from './CadenceSettings';
import TimerDisplay from './TimerDisplay';
import WorkoutControls from './WorkoutControls';
import WorkoutHistory from './WorkoutHistory';

interface WorkoutTrackerProps {
  user: User;
}

export default function WorkoutTracker({ user }: WorkoutTrackerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    repsPerSet,
    intervalSeconds,
    timeRemainingMs,
    isRunning,
    currentSet,
    totalReps,
    totalElapsedMs,
    workoutSets,
    showGoFlash,
    showCountdownFlash,
    isAudioMuted,
    setRepsPerSet,
    setIntervalSeconds,
    setIsAudioMuted,
    startWorkout,
    pauseWorkout,
    resetWorkout,
  } = useWorkout();

  const saveWorkout = async () => {
    if (!workoutSets.length) return;
    
    setIsSaving(true);
    try {
      const workoutData = {
        user_id: user.id,
        total_reps: totalReps,
        total_duration_ms: totalElapsedMs,
        session_date: new Date().toISOString(),
        notes: `${workoutSets.length} sets completed`
      };
      
      const { data: workout, error: workoutError } = await SupabaseService.createWorkout(workoutData);
      
      if (workoutError || !workout) {
        throw new Error(workoutError?.message || 'Failed to create workout');
      }
      
      const setsData = workoutSets.map((set, index) => ({
        workout_id: workout.id,
        set_number: index + 1,
        reps_per_set: set.reps,
        interval_seconds: set.intervalSeconds,
        actual_duration_ms: set.actualDurationMs,
        timestamp: new Date(set.timestamp).toISOString()
      }));
      
      const { error: setsError } = await SupabaseService.createWorkoutSets(setsData);
      
      if (setsError) {
        throw new Error(setsError.message);
      }
      
      alert('Workout saved successfully!');
      resetWorkout();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert(`Failed to save workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const loadWorkoutHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await SupabaseService.getWorkoutsByUser(user.id, 20);
      if (error) throw error;
      setWorkoutHistory(data || []);
    } catch (error) {
      console.error('Error loading workout history:', error);
      alert('Failed to load workout history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewHistory = () => {
    setShowHistory(true);
    loadWorkoutHistory();
  };

  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  if (showHistory) {
    return (
      <WorkoutHistory
        workoutHistory={workoutHistory}
        loadingHistory={loadingHistory}
        onBack={() => setShowHistory(false)}
        onRefresh={loadWorkoutHistory}
      />
    );
  }

  return (
    <div className={`relative min-h-screen transition-all duration-300 ${
      showGoFlash ? 'bg-green-600' : 
      showCountdownFlash ? 'bg-red-600' : 
      'bg-gray-900'
    }`}>
      <div className="flex items-center justify-center p-4 pt-16 min-h-screen">
        <div className="text-center max-w-md w-full text-white">
          <WorkoutNavigation
            isAudioMuted={isAudioMuted}
            onToggleAudio={handleToggleAudio}
            onViewHistory={handleViewHistory}
          />
          
          <CadenceSettings
            repsPerSet={repsPerSet}
            intervalSeconds={intervalSeconds}
            isRunning={isRunning}
            onRepsChange={setRepsPerSet}
            onIntervalChange={setIntervalSeconds}
          />

          <TimerDisplay
            timeRemainingMs={timeRemainingMs}
            currentSet={currentSet}
            repsPerSet={repsPerSet}
            totalReps={totalReps}
            totalElapsedMs={totalElapsedMs}
          />

          <WorkoutControls
            isRunning={isRunning}
            totalElapsedMs={totalElapsedMs}
            workoutSets={workoutSets}
            isSaving={isSaving}
            onStart={startWorkout}
            onPause={pauseWorkout}
            onReset={resetWorkout}
            onSave={saveWorkout}
          />
        </div>
      </div>
    </div>
  );
}