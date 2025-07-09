'use client';

import { useState, useEffect, useRef } from 'react';
import AuthWrapper from '../components/AuthWrapper';
import { User } from '../lib/supabase';
import { SupabaseService } from '../lib/supabase-service';

function WorkoutTracker({ user }: { user: User }) {
  // Cadence settings
  const [repsPerSet, setRepsPerSet] = useState(5);
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  
  // Timer and session state
  const [timeRemainingMs, setTimeRemainingMs] = useState(60000); // Store in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalReps, setTotalReps] = useState(0);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [setStartTime, setSetStartTime] = useState<number | null>(null);
  const [workoutSets, setWorkoutSets] = useState<Array<{ reps: number; intervalSeconds: number; actualDurationMs: number; timestamp: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to track current values to avoid stale closures
  const repsPerSetRef = useRef(repsPerSet);
  const intervalSecondsRef = useRef(intervalSeconds);
  const hasTriggeredRef = useRef(false); // Prevent double triggering
  
  // Keep refs in sync
  useEffect(() => {
    repsPerSetRef.current = repsPerSet;
  }, [repsPerSet]);
  
  useEffect(() => {
    intervalSecondsRef.current = intervalSeconds;
    if (!isRunning) {
      setTimeRemainingMs(intervalSeconds * 1000);
    }
  }, [intervalSeconds, isRunning]);

  useEffect(() => {
    if (isRunning) {
      if (!setStartTime) {
        setSetStartTime(Date.now());
        hasTriggeredRef.current = false;
      }
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - (setStartTime || now);
        const remaining = (intervalSecondsRef.current * 1000) - elapsed;
        
        if (remaining <= 0 && !hasTriggeredRef.current) {
          // Time's up - complete the set (only once)
          hasTriggeredRef.current = true;
          const actualDuration = now - (setStartTime || now);
          
          // Record the completed set
          setWorkoutSets(prev => [...prev, {
            reps: repsPerSetRef.current,
            intervalSeconds: intervalSecondsRef.current,
            actualDurationMs: actualDuration,
            timestamp: now
          }]);
          
          setTotalReps(current => current + repsPerSetRef.current);
          setCurrentSet(current => current + 1);
          setSetStartTime(now); // Start new set timer
          setTimeRemainingMs(intervalSecondsRef.current * 1000);
          hasTriggeredRef.current = false; // Reset for next set
        } else if (remaining > 0) {
          setTimeRemainingMs(remaining);
        }
      }, 10); // Update every 10ms for smooth display
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, setStartTime]);

  // Track total elapsed time with milliseconds - continues during pause
  useEffect(() => {
    if (workoutStartTime) {
      elapsedRef.current = setInterval(() => {
        setTotalElapsedMs(Date.now() - workoutStartTime);
      }, 10); // Update every 10ms for smooth millisecond display
    } else if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
    }

    return () => {
      if (elapsedRef.current) {
        clearInterval(elapsedRef.current);
      }
    };
  }, [workoutStartTime]);

  const startWorkout = () => {
    setIsRunning(true);
    if (!workoutStartTime) {
      setWorkoutStartTime(Date.now()); // Start the total elapsed timer
    }
    if (!setStartTime) {
      setSetStartTime(Date.now()); // Start the set timer
    }
  };

  const pauseWorkout = () => {
    setIsRunning(false);
    // Keep timeRemainingMs, currentSet, and totalReps as they are
  };

  const saveWorkout = async () => {
    if (!workoutSets.length || !workoutStartTime) return;
    
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
      
      // Save all sets
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

  const resetWorkout = () => {
    setIsRunning(false);
    setTimeRemainingMs(intervalSeconds * 1000);
    setCurrentSet(1);
    setTotalReps(0);
    setTotalElapsedMs(0);
    setWorkoutStartTime(null);
    setSetStartTime(null);
    setWorkoutSets([]);
  };

  const formatTimeMs = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatElapsedTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRepsChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setRepsPerSet(num);
    } else if (value === '' || value === '0') {
      setRepsPerSet(0);
    }
  };

  const handleIntervalChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setIntervalSeconds(num);
    } else if (value === '' || value === '0') {
      setIntervalSeconds(0);
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Workout History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Back to Workout
            </button>
          </div>
          
          {workoutHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No workout history yet</p>
              <button
                onClick={loadWorkoutHistory}
                disabled={loadingHistory}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
              >
                {loadingHistory ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workoutHistory.map((workout) => (
                <div key={workout.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-lg font-bold text-green-400">{workout.total_reps} reps</div>
                      <div className="text-sm text-gray-400">
                        {new Date(workout.session_date).toLocaleDateString()} at {new Date(workout.session_date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-400">
                        Duration: {formatElapsedTime(workout.total_duration_ms)}
                      </div>
                    </div>
                  </div>
                  {workout.notes && (
                    <div className="text-sm text-gray-300 mt-2">{workout.notes}</div>
                  )}
                </div>
              ))}
              <button
                onClick={loadWorkoutHistory}
                disabled={loadingHistory}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded"
              >
                {loadingHistory ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowHistory(true);
              loadWorkoutHistory();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            View History
          </button>
        </div>
        
        {/* Cadence Settings */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Cadence Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reps per Set</label>
              <input
                type="number"
                value={repsPerSet === 0 ? '' : repsPerSet}
                onChange={(e) => handleRepsChange(e.target.value)}
                min="0"
                max="50"
                placeholder="0"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Interval (seconds)</label>
              <input
                type="number"
                value={intervalSeconds === 0 ? '' : intervalSeconds}
                onChange={(e) => handleIntervalChange(e.target.value)}
                min="0"
                max="600"
                placeholder="0"
                disabled={isRunning}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-8">
          <div className="text-6xl font-mono font-bold mb-4 text-white">
            {formatTimeMs(timeRemainingMs)}
          </div>
          <div className="text-lg text-gray-300 mb-2">
            Set {currentSet} • {repsPerSet} reps
          </div>
          <div className="text-2xl font-bold text-green-400 mb-2">
            Total: {totalReps} reps
          </div>
          <div className="text-lg text-blue-400">
            Elapsed: {formatElapsedTime(totalElapsedMs)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={startWorkout}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            {totalElapsedMs > 0 && !isRunning ? 'Resume' : 'Start'}
          </button>
          <button
            onClick={pauseWorkout}
            disabled={!isRunning}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            Pause
          </button>
          <button
            onClick={resetWorkout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            Reset
          </button>
          {workoutSets.length > 0 && (
            <button
              onClick={saveWorkout}
              disabled={isSaving || isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Workout'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      {(user) => <WorkoutTracker user={user} />}
    </AuthWrapper>
  );
}
