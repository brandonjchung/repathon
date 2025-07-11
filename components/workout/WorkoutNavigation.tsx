import Button from '../ui/Button';

// Temporary User type until MCP integration is complete
interface User {
  id: string;
  email: string;
}

interface WorkoutNavigationProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onViewHistory: () => void;
  user: User | null;
  onSignOut: () => void;
}

export default function WorkoutNavigation({ 
  isAudioMuted, 
  onToggleAudio, 
  onViewHistory,
  user,
  onSignOut
}: WorkoutNavigationProps) {
  return (
    <>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Repathon</h1>
          
          {user && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onViewHistory}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">📊</span>
              </Button>
              
              <Button
                variant={isAudioMuted ? 'danger' : 'secondary'}
                size="sm"
                onClick={onToggleAudio}
              >
                {isAudioMuted ? '🔇' : '🔊'}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onSignOut}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}