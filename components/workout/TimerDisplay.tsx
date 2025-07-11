import { formatTimeMs, formatElapsedTime } from '../../utils/formatters';

interface TimerDisplayProps {
  timeRemainingMs: number;
  currentSet: number;
  repsPerSet: number;
  totalReps: number;
  totalElapsedMs: number;
}

interface TimerOnlyDisplayProps {
  timeRemainingMs: number;
  totalReps: number;
}

interface SetCountDisplayProps {
  currentSet: number;
}

interface ElapsedTimeDisplayProps {
  totalElapsedMs: number;
}

export function TimerOnlyDisplay({ timeRemainingMs, totalReps }: TimerOnlyDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold mb-4 text-white">
        {formatTimeMs(timeRemainingMs)}
      </div>
      <div className="text-2xl font-bold text-green-400 mb-4">
        Total: {totalReps} reps
      </div>
    </div>
  );
}

export function SetCountDisplay({ currentSet }: SetCountDisplayProps) {
  return (
    <div className="text-center text-xl text-gray-300 mb-4">
      Set {currentSet}
    </div>
  );
}

export function ElapsedTimeDisplay({ totalElapsedMs }: ElapsedTimeDisplayProps) {
  return (
    <div className="text-center text-lg text-blue-400 mb-4">
      Elapsed: {formatElapsedTime(totalElapsedMs)}
    </div>
  );
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
      <div className="text-xl text-gray-300 mb-4">
        Set {currentSet}
      </div>
      <div className="text-2xl font-bold text-green-400 mb-4">
        Total: {totalReps} reps
      </div>
      <div className="text-lg text-blue-400">
        Elapsed: {formatElapsedTime(totalElapsedMs)}
      </div>
    </div>
  );
}