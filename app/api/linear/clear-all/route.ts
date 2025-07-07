import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const issues = await linearAPI.getAllIssues();
    
    if (issues.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No issues to delete',
        deletedCount: 0
      });
    }

    const deletePromises = issues.map(async (issue) => {
      try {
        const result = await linearAPI.deleteIssue(issue.id);
        return { id: issue.id, title: issue.title, success: result };
      } catch (error) {
        return { 
          id: issue.id, 
          title: issue.title, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });
    
    const results = await Promise.all(deletePromises);
    
    const successCount = results.filter(result => result.success).length;
    const failedCount = results.filter(result => !result.success).length;
    const failedIssues = results.filter(result => !result.success);
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${successCount} issues${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      deletedCount: successCount,
      failedCount,
      failedIssues: failedIssues.map(issue => ({ id: issue.id, title: issue.title, error: issue.error }))
    });
  } catch (error) {
    console.error('Linear API clear all issues error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}