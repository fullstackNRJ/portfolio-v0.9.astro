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
    const response = await fetch('https://assets.themvpco.one/api/blogs?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': import.meta.env.ASSETS_API_KEY
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
        message: 'Unable to connect to file storage service. This may be a temporary issue.',
        files: [],
        error: 'CONNECTION_ERROR'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};