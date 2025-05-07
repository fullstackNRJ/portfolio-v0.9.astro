import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get form data from request
    const data = await request.json();
    
    // Validate form data
    if (!data.name || !data.email || !data.subject) {
      return new Response(
        JSON.stringify({
          message: 'Missing required fields',
        }),
        { status: 400 }
      );
    }
    
    // In a real app, you would send an email, store in database, etc.
    console.log('Contact form submission:', data);


      const response = await fetch('https://app.nocodb.com/api/v2/tables/m8x5b3n4xsnu2t7/records',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': 'HU87soieXeH9e1hgE1SS5THFWCxGaWJFr3mIc6bF' //move to env file
        },
        body: JSON.stringify({
        
            "Name": data.name,
            "Email": data.email,
            "Subject": data.subject,
            "Message": data.message
          
        })
      })

      if(!response.ok){
        throw new Error('Failed to save lead data');
      }

      const result = await response.json();

      return new Response(
        JSON.stringify({
          message: 'Message sent successfully!',
          result
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