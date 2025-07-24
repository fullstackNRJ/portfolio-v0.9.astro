import type { APIRoute } from 'astro';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'demo123';
const TOTP_SECRET = process.env.TOTP_SECRET || 'JBSWY3DPEHPK3PXP'; // Default for demo - change in production

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password, totpCode } = await request.json();

    if (!password || !totpCode) {
      return new Response(
        JSON.stringify({ message: 'Password and TOTP code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password again
    const isPasswordValid = password === MASTER_PASSWORD;
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify TOTP
    const verified = speakeasy.totp.verify({
      secret: TOTP_SECRET,
      encoding: 'base32',
      token: totpCode,
      window: 2 // Allow 2 time steps tolerance
    });

    if (!verified) {
      return new Response(
        JSON.stringify({ message: 'Invalid TOTP code' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Set secure session cookie
    cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/'
    });

    // Set a separate cookie for client-side navigation detection (non-httpOnly)
    cookies.set('authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/'
    });

    // In production, store session in database/KV store
    // For demo, we'll just use the session ID as proof of authentication

    return new Response(
      JSON.stringify({ 
        message: 'Authentication successful',
        expiresAt: expiresAt.toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TOTP verification error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};