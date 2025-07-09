import { linearAPI } from '../../../../lib/linear';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, description, teamIds } = await request.json();
    
    if (!name || !teamIds || !Array.isArray(teamIds)) {
      return NextResponse.json({
        success: false,
        error: 'name and teamIds array are required'
      }, { status: 400 });
    }

    const project = await linearAPI.createProject(name, description || '', teamIds);
    
    return NextResponse.json({
      success: true,
      project,
      message: 'Project created successfully!'
    });
  } catch (error) {
    console.error('Linear API create project error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}