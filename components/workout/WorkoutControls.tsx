import Button from '../ui/Button';
import { WorkoutSet } from '../../hooks/useWorkout';

interface WorkoutControlsProps {
  isRunning: boolean;
  totalElapsedMs: number;
  workoutSets: WorkoutSet[];
  isSaving: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSave: () => void;
}

export default function WorkoutControls({ 
  isRunning, 
  totalElapsedMs, 
  workoutSets, 
  isSaving, 
  onStart, 
  onPause, 
  onReset, 
  onSave 
}: WorkoutControlsProps) {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <Button
        variant="success"
        size="lg"
        onClick={onStart}
        disabled={isRunning}
      >
        {totalElapsedMs > 0 && !isRunning ? 'Resume' : 'Start'}
      </Button>
      
      <Button
        variant="warning"
        size="lg"
        onClick={onPause}
        disabled={!isRunning}
      >
        Pause
      </Button>
      
      <Button
        variant="secondary"
        size="lg"
        onClick={onReset}
      >
        Reset
      </Button>
      
      {workoutSets.length > 0 && (
        <Button
          variant="primary"
          size="lg"
          onClick={onSave}
          disabled={isSaving || isRunning}
        >
          {isSaving ? 'Saving...' : 'Save Workout'}
        </Button>
      )}
    </div>
  );
}