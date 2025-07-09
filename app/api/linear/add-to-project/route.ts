import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { issueId, projectId } = await request.json();
    
    if (!issueId || !projectId) {
      return NextResponse.json({
        success: false,
        error: 'issueId and projectId are required'
      }, { status: 400 });
    }

    const projectLink = await linearAPI.addIssueToProject(issueId, projectId);
    
    return NextResponse.json({
      success: true,
      projectLink,
      message: 'Issue added to project successfully!'
    });
  } catch (error) {
    console.error('Linear API add to project error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}