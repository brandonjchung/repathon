'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';

// Temporary User type until MCP integration is complete
interface User {
  id: string;
  email: string;
}

interface AuthWrapperProps {
  children: (user: User, onSignOut: () => void) => React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || ''
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      // Get the current authenticated user from Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } else if (user) {
        setUser({
          id: user.id,
          email: user.email || ''
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate user with Supabase
      const { data, error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || ''
        });
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null); // Sign out locally even if API fails
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Repathon</h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                placeholder="Password (min 6 characters)"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              <span className="text-white">{loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              <span className="text-blue-400 hover:text-blue-300">{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {children(user, handleSignOut)}
    </div>
  );
}