import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'demo123';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();

    if (!password) {
      return new Response(
        JSON.stringify({ message: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For demo purposes, using simple comparison
    // In production, use proper password hashing
    const isValid = password === MASTER_PASSWORD;

    if (!isValid) {
      return new Response(
        JSON.stringify({ message: 'Invalid password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Password verified' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};