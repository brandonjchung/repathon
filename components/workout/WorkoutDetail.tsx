import { formatElapsedTime } from '../../utils/formatters';
import Button from '../ui/Button';
import PaceGraph from './PaceGraph';

interface WorkoutSet {
  reps: number;
  intervalSeconds: number;
  actualDurationMs: number;
  timestamp: number;
}

interface WorkoutDetailProps {
  workout: {
    id: string;
    session_date: string;
    total_reps: number;
    total_duration_ms: number;
    notes?: string;
    workout_sets: WorkoutSet[];
  };
  onBack: () => void;
}

export default function WorkoutDetail({ workout, onBack }: WorkoutDetailProps) {
  const workoutDate = new Date(workout.session_date);
  const sets = workout.workout_sets || [];
  
  // Calculate workout start time from first set timestamp
  const workoutStartTime = sets.length > 0 ? sets[0].timestamp - sets[0].actualDurationMs : Date.now();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Workout Details</h2>
          <Button variant="secondary" onClick={onBack}>
            Back to History
          </Button>
        </div>
        
        {/* Workout Summary */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{workout.total_reps}</div>
              <div className="text-sm text-gray-400">Total Reps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{sets.length}</div>
              <div className="text-sm text-gray-400">Sets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {formatElapsedTime(workout.total_duration_ms)}
              </div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {sets.length > 0 ? Math.round(workout.total_reps / sets.length) : 0}
              </div>
              <div className="text-sm text-gray-400">Avg Reps/Set</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              {workoutDate.toLocaleDateString()} at {workoutDate.toLocaleTimeString()}
            </div>
            {workout.notes && (
              <div className="text-sm text-gray-300 mt-2">{workout.notes}</div>
            )}
          </div>
        </div>
        
        {/* Pace Graph */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Workout Pace</h3>
          <PaceGraph workoutSets={sets} workoutStartTime={workoutStartTime} />
        </div>
        
        {/* Set-by-Set Breakdown */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Set Details</h3>
          {sets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No set data available for this workout
            </div>
          ) : (
            <div className="space-y-3">
              {sets.map((set, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{set.reps} reps</div>
                      <div className="text-sm text-gray-400">
                        Target: {set.intervalSeconds}s
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatElapsedTime(set.actualDurationMs)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(set.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}