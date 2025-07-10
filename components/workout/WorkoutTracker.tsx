import { useState } from 'react';
import { User } from '../../lib/supabase';
import { SupabaseService } from '../../lib/supabase-service';
import { useWorkout } from '../../hooks/useWorkout';
import WorkoutNavigation from './WorkoutNavigation';
import CadenceSettings from './CadenceSettings';
import { TimerOnlyDisplay, SetCountDisplay, ElapsedTimeDisplay } from './TimerDisplay';
import WorkoutControls from './WorkoutControls';
import WorkoutHistory from './WorkoutHistory';

interface WorkoutTrackerProps {
  user: User;
  onSignOut: () => void;
}

export default function WorkoutTracker({ user, onSignOut }: WorkoutTrackerProps) {
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
    <div className="min-h-screen bg-gray-900">
      <WorkoutNavigation
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onViewHistory={handleViewHistory}
        user={user}
        onSignOut={onSignOut}
      />
      
      {/* Main content area with timer centered and controls as footer */}
      <div className="flex flex-col min-h-screen pt-20 sm:pt-24">
        <div className="container mx-auto px-4 max-w-md">
          {/* Top section - Cadence Settings */}
          <div className="text-center text-white mb-8">
            <CadenceSettings
              repsPerSet={repsPerSet}
              intervalSeconds={intervalSeconds}
              isRunning={isRunning}
              onRepsChange={setRepsPerSet}
              onIntervalChange={setIntervalSeconds}
            />
          </div>
        </div>
        
        {/* Center section - Timer Display (vertically centered) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <SetCountDisplay currentSet={currentSet} />
            <TimerOnlyDisplay
              timeRemainingMs={timeRemainingMs}
              totalReps={totalReps}
            />
            <ElapsedTimeDisplay totalElapsedMs={totalElapsedMs} />
          </div>
        </div>
        
        {/* Footer section - Controls */}
        <div className="pb-8">
          <div className="container mx-auto px-4 max-w-md">
            <div className="text-center text-white">
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
      </div>
    </div>
  );
}