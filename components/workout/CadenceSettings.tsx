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

  return (
    <div className="mb-8 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Cadence Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Reps per Set</label>
          <input
            type="number"
            value={repsPerSet === 0 ? '' : repsPerSet}
            onChange={(e) => handleRepsChange(e.target.value)}
            min="0"
            max="50"
            placeholder="0"
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Interval (seconds)</label>
          <input
            type="number"
            value={intervalSeconds === 0 ? '' : intervalSeconds}
            onChange={(e) => handleIntervalChange(e.target.value)}
            min="0"
            max="600"
            placeholder="0"
            disabled={isRunning}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}