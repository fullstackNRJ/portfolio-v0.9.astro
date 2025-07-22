import type { APIRoute } from 'astro';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const TOTP_SECRET = process.env.TOTP_SECRET || 'JBSWY3DPEHPK3PXP';

export const GET: APIRoute = async () => {
  try {
    // Generate QR code for TOTP setup
    const otpauthUrl = speakeasy.otpauthURL({
      secret: TOTP_SECRET,
      label: 'Portfolio Docs',
      issuer: 'Neeraj Mukta Portfolio',
      encoding: 'base32'
    });

    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

    // For development, also generate a current valid code
    const currentToken = speakeasy.totp({
      secret: TOTP_SECRET,
      encoding: 'base32'
    });

    return new Response(
      JSON.stringify({
        qrCode: qrCodeDataURL,
        secret: TOTP_SECRET,
        currentToken,
        instructions: [
          '1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
          '2. Or manually enter the secret key: ' + TOTP_SECRET,
          '3. Use the generated 6-digit code to login',
          '4. For testing, current valid code is: ' + currentToken,
          '5. Password is: demo123'
        ]
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('TOTP setup error:', error);
    return new Response(
      JSON.stringify({ message: 'Error generating TOTP setup' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};