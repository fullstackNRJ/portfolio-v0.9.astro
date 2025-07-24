import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const sessionCookie = cookies.get('session');
    
    if (!sessionCookie?.value) {
      return new Response(
        JSON.stringify({ message: 'No active session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In production, verify session against database/KV store
    // For demo, just check if session exists
    return new Response(
      JSON.stringify({ message: 'Session valid' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid session' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionCookie = cookies.get('session');
    
    if (!sessionCookie?.value) {
      return new Response(
        JSON.stringify({ message: 'No active session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In production, verify session against database/KV store
    // For demo, just check if session exists
    return new Response(
      JSON.stringify({ message: 'Session valid' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid session' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
};