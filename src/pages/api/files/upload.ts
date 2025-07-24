import type { APIRoute } from 'astro';

// Check authentication middleware
async function checkAuth(request: Request): Promise<boolean> {
  const sessionCookie = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
  return !!sessionCookie; // Simple check for demo
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ message: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 10MB for demo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ message: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new FormData for API request
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    // Upload to the external API
    const uploadResponse = await fetch('https://assets.themvpco.one/api/upload/markdown', {
      method: 'POST',
      body: uploadFormData,
      headers: {
        'X-API-KEY': import.meta.env.ASSETS_API_KEY
      }
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload API error:', errorText);
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();

    return new Response(
      JSON.stringify({
        message: 'File uploaded successfully',
        file: result
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        message: 'Upload failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};