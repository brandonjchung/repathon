import Button from '../ui/Button';

interface WorkoutNavigationProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onViewHistory: () => void;
}

export default function WorkoutNavigation({ 
  isAudioMuted, 
  onToggleAudio, 
  onViewHistory 
}: WorkoutNavigationProps) {
  return (
    <div className="mb-6 flex gap-3 justify-center">
      <Button
        variant="primary"
        onClick={onViewHistory}
        className="bg-purple-600 hover:bg-purple-700"
      >
        View History
      </Button>
      
      <Button
        variant={isAudioMuted ? 'danger' : 'secondary'}
        onClick={onToggleAudio}
      >
        {isAudioMuted ? '🔇 Muted' : '🔊 Audio'}
      </Button>
    </div>
  );
}