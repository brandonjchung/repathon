import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const issues = await linearAPI.getAllIssues();
    
    return NextResponse.json({
      success: true,
      issues,
      count: issues.length,
      message: 'Issues retrieved successfully!'
    });
  } catch (error) {
    console.error('Linear API get all issues error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}