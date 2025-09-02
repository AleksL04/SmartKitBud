"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace with your actual Supabase URL and Anon Key
// You can find these in your Supabase project settings -> API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not set. Please set SUPABASE_URL and SUPABASE_ANON_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main App component for demonstration
export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null); // To store the authenticated user

  // Effect to check for user session on component mount
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_IN') {
          setMessage('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          setMessage('Successfully signed out!');
        }
      }
    );

    // Initial check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    // Cleanup the auth listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle user sign-up
  const handleSignUp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        setMessage('Sign up successful! Check your email for a confirmation link.');
        // User data is available here, but they need to confirm email
      } else if (data.session === null && data.user === null) {
         // This case happens if email confirmation is required and no session is created immediately
         setMessage('Sign up successful! Please check your email to confirm your account.');
      }

    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error signing up: ${error.message}`);
      } else {
        setMessage('Error signing up: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // The onAuthStateChange listener will update the user state
      // if (data.user) {
      //   setMessage('Successfully signed in!');
      // }

    } catch (error) {
      setMessage(`Error signing in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // The onAuthStateChange listener will update the user state
    } catch (error) {
      setMessage(`Error signing out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {user ? 'Welcome!' : 'Sign Up / Sign In'}
        </h1>

        {user ? (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">You are logged in as:</p>
            <p className="text-xl font-semibold text-indigo-600 mb-6">{user.email}</p>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              disabled={loading}
            >
              {loading ? 'Logging out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSignUp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
              <button
                onClick={handleSignIn}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {message && (
          <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
