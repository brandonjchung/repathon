import { formatTimeMs, formatElapsedTime } from '../../utils/formatters';

interface TimerDisplayProps {
  timeRemainingMs: number;
  currentSet: number;
  repsPerSet: number;
  totalReps: number;
  totalElapsedMs: number;
}

export default function TimerDisplay({ 
  timeRemainingMs, 
  currentSet, 
  repsPerSet, 
  totalReps, 
  totalElapsedMs 
}: TimerDisplayProps) {
  return (
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
  );
}