import { useState } from 'react';
import Button from '../ui/Button';
import { WorkoutSet } from '../../hooks/useWorkout';
import { motion } from 'framer-motion';
import ConfirmationModal from '../ui/ConfirmationModal';

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
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleResetClick = () => {
    if (workoutSets.length > 0 || totalElapsedMs > 0) {
      setShowResetModal(true);
    } else {
      onReset();
    }
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    onReset();
  };

  const handleConfirmSave = () => {
    setShowSaveModal(false);
    onSave();
  };

  return (
    <>
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
            onClick={handleResetClick}
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
            onClick={handleSaveClick}
            disabled={isSaving || isRunning || workoutSets.length === 0}
          >
            <span className="text-2xl">
              {isSaving ? '⋯' : '✓'}
            </span>
          </Button>
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Workout?"
        message="Are you sure you want to reset your workout? This will clear all your progress and cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />

      <ConfirmationModal
        isOpen={showSaveModal}
        title="Save Workout?"
        message="Are you sure you want to save this workout? This will save your progress and reset the timer."
        confirmText="Save"
        cancelText="Cancel"
        variant="primary"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveModal(false)}
      />
    </>
  );
}