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
  showGoFlash: boolean;
  showCountdownFlash: boolean;
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
  const [showGoFlash, setShowGoFlash] = useState(false);
  const [showCountdownFlash, setShowCountdownFlash] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Refs for stable references
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  const repsPerSetRef = useRef(repsPerSet);
  const intervalSecondsRef = useRef(intervalSeconds);
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
        const remaining = (intervalSecondsRef.current * 1000) - elapsed;
        
        // Trigger countdown beeps at 2, 1, 0 seconds remaining
        const secondsRemaining = Math.ceil(remaining / 1000);
        if (secondsRemaining <= 2 && secondsRemaining >= 0 && remaining > 0) {
          if (!countdownTriggeredRef.current.has(secondsRemaining)) {
            countdownTriggeredRef.current.add(secondsRemaining);
            audioManagerRef.current.playCountdownBeep(secondsRemaining);
            // Visual feedback for countdown
            if (secondsRemaining === 2 || secondsRemaining === 1) {
              setShowCountdownFlash(true);
              setTimeout(() => setShowCountdownFlash(false), 200);
            }
          }
        }
        
        if (remaining <= 0 && !hasTriggeredRef.current) {
          // Play the "0" beep before completing the set
          if (!countdownTriggeredRef.current.has(0)) {
            countdownTriggeredRef.current.add(0);
            audioManagerRef.current.playCountdownBeep(0);
            // Trigger green flash for "Go!"
            setShowGoFlash(true);
            setTimeout(() => setShowGoFlash(false), 300);
          }
          
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
          setSetStartTime(now);
          setTimeRemainingMs(intervalSecondsRef.current * 1000);
          hasTriggeredRef.current = false;
          countdownTriggeredRef.current.clear();
        } else if (remaining > 0) {
          setTimeRemainingMs(remaining);
        }
      }, 10);
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
      }, 10);
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
    showGoFlash,
    showCountdownFlash,
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