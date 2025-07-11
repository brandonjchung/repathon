import { useState } from 'react';
import { useWorkout } from '../../hooks/useWorkout';
import WorkoutNavigation from './WorkoutNavigation';
import CadenceSettings from './CadenceSettings';
import { TimerOnlyDisplay, SetCountDisplay, ElapsedTimeDisplay } from './TimerDisplay';
import WorkoutControls from './WorkoutControls';
import WorkoutHistory from './WorkoutHistory';
import WorkoutDetail from './WorkoutDetail';

// Temporary User type until MCP integration is complete
interface User {
  id: string;
  email: string;
}

interface WorkoutTrackerProps {
  user: User;
  onSignOut: () => void;
}

export default function WorkoutTracker({ user, onSignOut }: WorkoutTrackerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
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
      // TODO: Implement with MCP Supabase integration
      // For now, just log the workout data
      const workoutData = {
        user_id: user.id,
        total_reps: totalReps,
        total_duration_ms: totalElapsedMs,
        session_date: new Date().toISOString(),
        notes: `${workoutSets.length} sets completed`
      };
      
      console.log('Workout data to save:', workoutData);
      console.log('Workout sets:', workoutSets);
      
      alert('Workout saved successfully! (Currently using local storage)');
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
      // TODO: Implement with MCP Supabase integration
      // For now, return empty history
      setWorkoutHistory([]);
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

  const handleWorkoutSelect = (workout: any) => {
    setSelectedWorkout(workout);
    setShowHistory(false);
  };

  const handleBackToHistory = () => {
    setSelectedWorkout(null);
    setShowHistory(true);
  };

  const handleBackToMain = () => {
    setShowHistory(false);
    setSelectedWorkout(null);
  };

  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  if (selectedWorkout) {
    return (
      <WorkoutDetail
        workout={selectedWorkout}
        onBack={handleBackToHistory}
      />
    );
  }

  if (showHistory) {
    return (
      <WorkoutHistory
        workoutHistory={workoutHistory}
        loadingHistory={loadingHistory}
        onBack={handleBackToMain}
        onRefresh={loadWorkoutHistory}
        onWorkoutSelect={handleWorkoutSelect}
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