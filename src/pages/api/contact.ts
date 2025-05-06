import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get form data from request
    const data = await request.json();
    
    // Validate form data
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({
          message: 'Missing required fields',
        }),
        { status: 400 }
      );
    }
    
    // In a real app, you would send an email, store in database, etc.
    console.log('Contact form submission:', data);
    
    // Return success response
    return new Response(
      JSON.stringify({
        message: 'Message sent successfully!',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return new Response(
      JSON.stringify({
        message: 'An error occurred while processing your request',
      }),
      { status: 500 }
    );
  }
};