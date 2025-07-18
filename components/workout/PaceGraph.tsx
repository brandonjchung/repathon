import { useEffect, useRef, useState } from 'react';

interface WorkoutSet {
  reps: number;
  intervalSeconds: number;
  actualDurationMs: number;
  timestamp: number;
}

interface PaceGraphProps {
  workoutSets: WorkoutSet[];
  workoutStartTime: number;
}

export default function PaceGraph({ workoutSets, workoutStartTime }: PaceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32; // Account for padding
        const containerHeight = Math.max(300, Math.min(400, containerWidth * 0.5)); // Responsive height
        setDimensions({ 
          width: Math.max(400, containerWidth), // Minimum width for readability
          height: containerHeight 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!workoutSets.length) {
    return (
      <div ref={containerRef} className="h-64 bg-gray-700 rounded flex items-center justify-center">
        <div className="text-gray-400">No workout data available</div>
      </div>
    );
  }

  const { width, height } = dimensions;
  const padding = 50;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  // Calculate graph data
  const maxReps = Math.max(...workoutSets.map(set => set.reps));
  const minReps = Math.min(...workoutSets.map(set => set.reps));
  const repsRange = maxReps - minReps || 1;
  
  const totalDuration = workoutSets[workoutSets.length - 1].timestamp - workoutStartTime;
  
  // For large datasets (100+ points), sample or aggregate data for better performance and readability
  const shouldSample = workoutSets.length > 100;
  const displaySets = shouldSample ? sampleData(workoutSets, 50) : workoutSets;
  
  const points = displaySets.map((set, index) => {
    const timeOffset = set.timestamp - workoutStartTime;
    const x = padding + (timeOffset / totalDuration) * graphWidth;
    const y = padding + graphHeight - ((set.reps - minReps) / repsRange) * graphHeight;
    return { x, y, reps: set.reps, index };
  });

  // Sample data function for large datasets
  function sampleData(data: WorkoutSet[], maxPoints: number) {
    if (data.length <= maxPoints) return data;
    
    const step = Math.floor(data.length / maxPoints);
    const sampled = [];
    
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    
    // Always include the last point
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }
    
    return sampled;
  }

  // Create path string for the line
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Y-axis labels
  const yAxisLabels = [];
  for (let i = 0; i <= 4; i++) {
    const reps = minReps + (repsRange * i / 4);
    const y = padding + graphHeight - (i / 4) * graphHeight;
    yAxisLabels.push({ reps: Math.round(reps), y });
  }

  // X-axis labels (time markers)
  const xAxisLabels = [];
  for (let i = 0; i <= 4; i++) {
    const timeOffset = (totalDuration * i / 4);
    const x = padding + (i / 4) * graphWidth;
    const minutes = Math.floor(timeOffset / 60000);
    const seconds = Math.floor((timeOffset % 60000) / 1000);
    xAxisLabels.push({ 
      time: `${minutes}:${seconds.toString().padStart(2, '0')}`, 
      x 
    });
  }

  return (
    <div ref={containerRef} className="bg-gray-700 rounded p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-300">Reps per Set Over Time</h4>
        {shouldSample && (
          <span className="text-xs text-gray-400">
            Showing {displaySets.length} of {workoutSets.length} sets
          </span>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <svg width={width} height={height} className="text-gray-300">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={graphWidth} height={graphHeight} x={padding} y={padding} fill="url(#grid)" />
        
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="#6B7280" strokeWidth="2" />
        <line x1={padding} y1={padding + graphHeight} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#6B7280" strokeWidth="2" />
        
        {/* Y-axis labels */}
        {yAxisLabels.map((label, index) => (
          <g key={index}>
            <line x1={padding - 5} y1={label.y} x2={padding} y2={label.y} stroke="#6B7280" strokeWidth="1" />
            <text x={padding - 10} y={label.y + 4} textAnchor="end" className="text-xs fill-gray-400">
              {label.reps}
            </text>
          </g>
        ))}
        
        {/* X-axis labels */}
        {xAxisLabels.map((label, index) => (
          <g key={index}>
            <line x1={label.x} y1={padding + graphHeight} x2={label.x} y2={padding + graphHeight + 5} stroke="#6B7280" strokeWidth="1" />
            <text x={label.x} y={padding + graphHeight + 18} textAnchor="middle" className="text-xs fill-gray-400">
              {label.time}
            </text>
          </g>
        ))}
        
        {/* Data line */}
        <path d={pathData} stroke="#10B981" strokeWidth="2" fill="none" />
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="4" fill="#10B981" stroke="#065F46" strokeWidth="1" />
            <text x={point.x} y={point.y - 8} textAnchor="middle" className="text-xs fill-gray-300">
              {point.reps}
            </text>
          </g>
        ))}
        
        {/* Axis labels */}
        <text x={padding + graphWidth / 2} y={height - 5} textAnchor="middle" className="text-xs fill-gray-400">
          Time
        </text>
        <text x={15} y={padding + graphHeight / 2} textAnchor="middle" className="text-xs fill-gray-400" transform={`rotate(-90 15 ${padding + graphHeight / 2})`}>
          Reps
        </text>
        </svg>
      </div>
    </div>
  );
}