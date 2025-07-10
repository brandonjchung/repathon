import Button from '../ui/Button';
import { WorkoutSet } from '../../hooks/useWorkout';
import { motion } from 'framer-motion';

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
    <div className="flex gap-2 justify-center items-center">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant={isRunning ? "warning" : "success"}
          size="lg"
          onClick={isRunning ? onPause : onStart}
          className="w-16 flex justify-center items-center"
        >
          <span className="text-2xl">
            {isRunning ? '⏸' : '▶'}
          </span>
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant="secondary"
          size="lg"
          onClick={onReset}
        >
          <span className="text-2xl">⟲</span>
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={onSave}
          disabled={isSaving || isRunning || workoutSets.length === 0}
        >
          <span className="text-2xl">
            {isSaving ? '⋯' : '✓'}
          </span>
        </Button>
      </motion.div>
    </div>
  );
}