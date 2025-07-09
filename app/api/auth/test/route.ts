import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  try {
    // Test signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (signUpError) {
      return NextResponse.json({
        success: false,
        error: signUpError.message,
        message: 'Auth signup failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Auth system working!',
      user: signUpData.user ? {
        id: signUpData.user.id,
        email: signUpData.user.email,
        created_at: signUpData.user.created_at
      } : null
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Auth test failed'
    }, { status: 500 });
  }
}