import { useState, useEffect, useRef } from 'react';
import { AudioManager } from '../utils/audio';

export interface WorkoutSet {
  reps: number;
  intervalSeconds: number;
  actualDurationMs: number;
  timestamp: number;
}

export interface UseWorkoutReturn {
  // State
  repsPerSet: number;
  intervalSeconds: number;
  timeRemainingMs: number;
  isRunning: boolean;
  currentSet: number;
  totalReps: number;
  totalElapsedMs: number;
  workoutSets: WorkoutSet[];
  isAudioMuted: boolean;
  
  // Actions
  setRepsPerSet: (value: number) => void;
  setIntervalSeconds: (value: number) => void;
  setIsAudioMuted: (value: boolean) => void;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resetWorkout: () => void;
}

export const useWorkout = (): UseWorkoutReturn => {
  // Cadence settings
  const [repsPerSet, setRepsPerSet] = useState(5);
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  
  // Timer and session state
  const [timeRemainingMs, setTimeRemainingMs] = useState(60000);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalReps, setTotalReps] = useState(0);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [setStartTime, setSetStartTime] = useState<number | null>(null);
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Refs for stable references
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  const repsPerSetRef = useRef(repsPerSet);
  const intervalSecondsRef = useRef(intervalSeconds);
  const currentSetIntervalRef = useRef(intervalSeconds);
  const hasTriggeredRef = useRef(false);
  const countdownTriggeredRef = useRef<Set<number>>(new Set());
  const audioManagerRef = useRef<AudioManager>(new AudioManager());

  // Keep refs in sync
  useEffect(() => {
    repsPerSetRef.current = repsPerSet;
  }, [repsPerSet]);
  
  useEffect(() => {
    intervalSecondsRef.current = intervalSeconds;
    if (!isRunning && !workoutStartTime) {
      setTimeRemainingMs(intervalSeconds * 1000);
    }
    // Note: When running, interval changes only affect the next set
    // Current set continues with its original interval duration
  }, [intervalSeconds, isRunning, workoutStartTime]);

  // Update audio muted state
  useEffect(() => {
    audioManagerRef.current.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  // Main workout timer
  useEffect(() => {
    if (isRunning) {
      if (!setStartTime) {
        setSetStartTime(Date.now());
        hasTriggeredRef.current = false;
      }
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - (setStartTime || now);
        const remaining = (currentSetIntervalRef.current * 1000) - elapsed;
        const secondsRemaining = Math.ceil(remaining / 1000);
        
        // Show full seconds countdown (3, 2, 1) then loop
        if (secondsRemaining > 0) {
          setTimeRemainingMs(secondsRemaining * 1000);
          
          // Trigger countdown beeps at 3, 2, 1 seconds remaining
          if (secondsRemaining <= 3 && secondsRemaining >= 1) {
            if (!countdownTriggeredRef.current.has(secondsRemaining)) {
              countdownTriggeredRef.current.add(secondsRemaining);
              audioManagerRef.current.playCountdownBeep(secondsRemaining);
            }
          }
        } else if (!hasTriggeredRef.current) {
          // Time's up - complete the set (only once)
          hasTriggeredRef.current = true;
          const actualDuration = now - (setStartTime || now);
          
          // Play "Go!" sound
          audioManagerRef.current.playGoSound();
          
          // Record the completed set
          setWorkoutSets(prev => [...prev, {
            reps: repsPerSetRef.current,
            intervalSeconds: currentSetIntervalRef.current,
            actualDurationMs: actualDuration,
            timestamp: now
          }]);
          
          setTotalReps(current => current + repsPerSetRef.current);
          setCurrentSet(current => current + 1);
          setSetStartTime(now);
          // Use the new interval value for the next set
          currentSetIntervalRef.current = intervalSecondsRef.current;
          setTimeRemainingMs(intervalSecondsRef.current * 1000);
          hasTriggeredRef.current = false;
          countdownTriggeredRef.current.clear();
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, setStartTime]);

  // Track total elapsed time
  useEffect(() => {
    if (workoutStartTime) {
      elapsedRef.current = setInterval(() => {
        setTotalElapsedMs(Date.now() - workoutStartTime);
      }, 1000);
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
      setWorkoutStartTime(Date.now());
      // Lock in the current interval for the first set
      currentSetIntervalRef.current = intervalSecondsRef.current;
    }
    if (!setStartTime) {
      setSetStartTime(Date.now());
    }
  };

  const pauseWorkout = () => {
    setIsRunning(false);
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

  return {
    // State
    repsPerSet,
    intervalSeconds,
    timeRemainingMs,
    isRunning,
    currentSet,
    totalReps,
    totalElapsedMs,
    workoutSets,
    isAudioMuted,
    
    // Actions
    setRepsPerSet,
    setIntervalSeconds,
    setIsAudioMuted,
    startWorkout,
    pauseWorkout,
    resetWorkout,
  };
};