import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, description, teamId } = await request.json();
    
    const issue = await linearAPI.createIssue(title, description, teamId);
    
    return NextResponse.json({
      success: true,
      issue,
      message: 'Issue created successfully!'
    });
  } catch (error) {
    console.error('Linear API create issue error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}