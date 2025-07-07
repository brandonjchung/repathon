import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const { issueId, stateId } = await request.json();
    
    if (!issueId || !stateId) {
      return NextResponse.json({
        success: false,
        error: 'issueId and stateId are required'
      }, { status: 400 });
    }

    const issue = await linearAPI.updateIssueState(issueId, stateId);
    
    return NextResponse.json({
      success: true,
      issue,
      message: 'Issue status updated successfully!'
    });
  } catch (error) {
    console.error('Linear API update status error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}