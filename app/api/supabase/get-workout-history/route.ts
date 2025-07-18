import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // For now, return mock data to demonstrate the functionality
    const mockWorkouts = [
      {
        id: 'workout-1',
        total_reps: 25,
        total_duration_ms: 300000, // 5 minutes
        session_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        notes: '5 sets completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        workout_sets: [
          {
            set_number: 1,
            reps: 5,
            intervalSeconds: 60,
            actualDurationMs: 58000,
            timestamp: Date.now() - 86400000
          },
          {
            set_number: 2,
            reps: 5,
            intervalSeconds: 60,
            actualDurationMs: 61000,
            timestamp: Date.now() - 86400000 + 60000
          },
          {
            set_number: 3,
            reps: 5,
            intervalSeconds: 60,
            actualDurationMs: 59000,
            timestamp: Date.now() - 86400000 + 120000
          },
          {
            set_number: 4,
            reps: 5,
            intervalSeconds: 60,
            actualDurationMs: 62000,
            timestamp: Date.now() - 86400000 + 180000
          },
          {
            set_number: 5,
            reps: 5,
            intervalSeconds: 60,
            actualDurationMs: 60000,
            timestamp: Date.now() - 86400000 + 240000
          }
        ]
      },
      {
        id: 'workout-2',
        total_reps: 30,
        total_duration_ms: 420000, // 7 minutes
        session_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        notes: '6 sets completed',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        workout_sets: [
          {
            set_number: 1,
            reps: 5,
            intervalSeconds: 70,
            actualDurationMs: 68000,
            timestamp: Date.now() - 172800000
          },
          {
            set_number: 2,
            reps: 5,
            intervalSeconds: 70,
            actualDurationMs: 71000,
            timestamp: Date.now() - 172800000 + 70000
          },
          {
            set_number: 3,
            reps: 5,
            intervalSeconds: 70,
            actualDurationMs: 69000,
            timestamp: Date.now() - 172800000 + 140000
          },
          {
            set_number: 4,
            reps: 5,
            intervalSeconds: 70,
            actualDurationMs: 72000,
            timestamp: Date.now() - 172800000 + 210000
          },
          {
            set_number: 5,
            reps: 5,
            intervalSeconds: 70,
            actualDurationMs: 70000,
            timestamp: Date.now() - 172800000 + 280000
          },
          {
            set_number: 6,
            reps: 5,
            intervalSeconds: 70,
            actualDurationMs: 70000,
            timestamp: Date.now() - 172800000 + 350000
          }
        ]
      }
    ];
    
    console.log('Returning mock workout history for user:', userId);
    return NextResponse.json(mockWorkouts);
    
  } catch (error) {
    console.error('Error loading workout history:', error);
    return NextResponse.json(
      { error: 'Failed to load workout history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}