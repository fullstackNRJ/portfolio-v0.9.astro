import type { APIRoute } from 'astro';
import { clean } from 'nanostores';

export const POST: APIRoute = async ({ request }) => {
    try {
        // Get form data from request
        const data = await request.json();

        // Validate form data
        if (!data.content) {
            return new Response(
                JSON.stringify({
                    message: 'Missing required field content',
                }),
                { status: 400 }
            );
        }

        // In a real app, you would send an email, store in database, etc.
        console.log('Contact form submission:', data);


        const result = await run("@cf/meta/llama-3-8b-instruct", {
            messages: [
                {
                    role: "system",
                    content: "You are a content repurposing assistant. Given a long-form text, break it down into up to 10 small slides. Each slide should have a strong hook or insight. Format output as JSON with keys: slideNumber, title, body. Keep each slide punchy. Start with first slide as bold intro hook and end slide with a CTA like username/brandname provided by user with `follow for more such content` kind of message. For ex. [{Slide:1, Title: `Why AI Is Eating Hollywood`,Subtitle: `And What It Means for the Rest of Us`},...so on]",
                },
                {
                    role: "user",
                    content: cleanText(data.content),
                },
            ],
        })
       // const parsedResult = JSON.parse(result);
      //  console.log('API response:', parsedResult);
        return new Response(
            JSON.stringify({
                message: 'API call successful!',
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

async function run(model: string, input: object) {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/1956532513f840e226c7b62310878988/ai/run/${model}`,
        {
            headers: { Authorization: "Bearer Eh4kwRh-b49l83Ui9fdkGwEYTzlyQ_QTnS5JuIXU", "Content-Type": "application/json", 'accept': 'application/json' },
            method: "POST",
            body: JSON.stringify(input),
        }
    );
    const result = await response.json();
    return result;
}


function cleanText(text: string) {
    // Remove any unwanted characters or formatting, replace "" with ``
    //escape any special characters
    text = text.replace(/""/g, '``');
    text = text.replace(/\s+/g, ' ').trim();
    // Remove any unwanted characters
    return text.replace(/[^a-zA-Z0-9\s.,!?]/g, '');
}