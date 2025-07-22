import type { APIRoute } from 'astro';

// Check authentication middleware
async function checkAuth(request: Request): Promise<boolean> {
  const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
  return !!sessionCookie; // Simple check for demo
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch files from the API
    const response = await fetch('https://assets.themvpco.one/docs', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const files = await response.json();

    return new Response(
      JSON.stringify({ 
        files: files || [],
        message: 'Files retrieved successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching files:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error fetching files',
        files: []
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};