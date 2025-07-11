import { formatElapsedTime } from '../../utils/formatters';
import Button from '../ui/Button';

interface WorkoutHistoryProps {
  workoutHistory: any[];
  loadingHistory: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onWorkoutSelect: (workout: any) => void;
}

export default function WorkoutHistory({ 
  workoutHistory, 
  loadingHistory, 
  onBack, 
  onRefresh,
  onWorkoutSelect 
}: WorkoutHistoryProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Workout History</h2>
          <Button
            variant="secondary"
            onClick={onBack}
          >
            Back to Workout
          </Button>
        </div>
        
        {workoutHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No workout history yet</p>
            <Button
              variant="primary"
              onClick={onRefresh}
              disabled={loadingHistory}
            >
              {loadingHistory ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutHistory.map((workout) => (
              <div 
                key={workout.id} 
                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onWorkoutSelect(workout)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-lg font-bold text-green-400">
                      {workout.total_reps} reps
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(workout.session_date).toLocaleDateString()} at{' '}
                      {new Date(workout.session_date).toLocaleTimeString()}
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
            <Button
              variant="primary"
              onClick={onRefresh}
              disabled={loadingHistory}
              className="w-full"
            >
              {loadingHistory ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}