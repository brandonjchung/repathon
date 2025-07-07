import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const teamId = "678c6ad3-76ea-43f0-9926-1a60c2eb7a69"; // Repathon team ID
    const states = await linearAPI.getWorkflowStates(teamId);
    
    return NextResponse.json({
      success: true,
      states,
      message: 'Workflow states retrieved successfully!'
    });
  } catch (error) {
    console.error('Linear API get states error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}