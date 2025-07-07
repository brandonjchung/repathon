'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
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

  const resetWorkout = () => {
    setIsRunning(false);
    setTimeRemainingMs(intervalSeconds * 1000);
    setCurrentSet(1);
    setTotalReps(0);
    setTotalElapsedMs(0);
    setWorkoutStartTime(null);
    setSetStartTime(null);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        
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
        <div className="flex gap-4 justify-center">
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
        </div>
      </div>
    </div>
  );
}
