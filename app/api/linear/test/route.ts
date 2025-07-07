import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [user, teams] = await Promise.all([
      linearAPI.getCurrentUser(),
      linearAPI.getTeams()
    ]);

    return NextResponse.json({
      success: true,
      user,
      teams,
      message: 'Linear API integration is working!'
    });
  } catch (error) {
    console.error('Linear API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}