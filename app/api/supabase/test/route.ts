import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  try {
    // Test the connection by checking if we can connect to Supabase
    const { data, error } = await supabase.from('workouts').select('count').limit(1);
    
    if (error) {
      // If the table doesn't exist yet, that's expected
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          message: 'Supabase connection successful! Database tables need to be created.',
          connection: 'connected',
          tables: 'not_created'
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection and tables working!',
      connection: 'connected',
      tables: 'created'
    });
  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Check your Supabase configuration in .env.local'
    }, { status: 500 });
  }
}