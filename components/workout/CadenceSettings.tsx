import { parseNumericInput } from '../../utils/formatters';

interface CadenceSettingsProps {
  repsPerSet: number;
  intervalSeconds: number;
  isRunning: boolean;
  onRepsChange: (value: number) => void;
  onIntervalChange: (value: number) => void;
}

export default function CadenceSettings({ 
  repsPerSet, 
  intervalSeconds, 
  isRunning, 
  onRepsChange, 
  onIntervalChange 
}: CadenceSettingsProps) {
  const handleRepsChange = (value: string) => {
    const parsed = parseNumericInput(value);
    if (parsed >= 0) {
      onRepsChange(parsed);
    }
  };

  const handleIntervalChange = (value: string) => {
    const parsed = parseNumericInput(value);
    if (parsed >= 0) {
      onIntervalChange(parsed);
    }
  };

  const incrementReps = () => {
    if (repsPerSet < 50) {
      onRepsChange(repsPerSet + 1);
    }
  };

  const decrementReps = () => {
    if (repsPerSet > 0) {
      onRepsChange(repsPerSet - 1);
    }
  };

  const incrementInterval = () => {
    if (intervalSeconds < 600 && !isRunning) {
      onIntervalChange(intervalSeconds + 1);
    }
  };

  const decrementInterval = () => {
    if (intervalSeconds > 0 && !isRunning) {
      onIntervalChange(intervalSeconds - 1);
    }
  };

  return (
    <div className="mb-6 md:mb-8 p-3 md:p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Cadence Settings</h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-xs md:text-sm font-medium mb-2">Reps per Set</label>
          <input
            type="number"
            value={repsPerSet === 0 ? '' : repsPerSet}
            onChange={(e) => handleRepsChange(e.target.value)}
            min="0"
            max="50"
            placeholder="0"
            className="w-full bg-gray-700 text-white px-2 md:px-3 py-1.5 md:py-2 rounded text-center text-sm md:text-base"
          />
          <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2">
            <button
              onClick={decrementReps}
              disabled={repsPerSet <= 0}
              className="flex-1 h-8 md:h-10 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded flex items-center justify-center font-bold text-base md:text-lg"
              aria-label="Decrease reps per set"
            >
              −
            </button>
            <button
              onClick={incrementReps}
              disabled={repsPerSet >= 50}
              className="flex-1 h-8 md:h-10 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded flex items-center justify-center font-bold text-base md:text-lg"
              aria-label="Increase reps per set"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium mb-2">Interval (seconds)</label>
          <input
            type="number"
            value={intervalSeconds === 0 ? '' : intervalSeconds}
            onChange={(e) => handleIntervalChange(e.target.value)}
            min="0"
            max="600"
            placeholder="0"
            disabled={isRunning}
            className="w-full bg-gray-700 text-white px-2 md:px-3 py-1.5 md:py-2 rounded disabled:opacity-50 text-center text-sm md:text-base"
          />
          <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2">
            <button
              onClick={decrementInterval}
              disabled={intervalSeconds <= 0 || isRunning}
              className="flex-1 h-8 md:h-10 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded flex items-center justify-center font-bold text-base md:text-lg"
              aria-label="Decrease interval seconds"
            >
              −
            </button>
            <button
              onClick={incrementInterval}
              disabled={intervalSeconds >= 600 || isRunning}
              className="flex-1 h-8 md:h-10 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded flex items-center justify-center font-bold text-base md:text-lg"
              aria-label="Increase interval seconds"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}