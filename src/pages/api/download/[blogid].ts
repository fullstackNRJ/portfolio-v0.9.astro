import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { blogid } = params;
    
    if (!blogid) {
      return new Response(JSON.stringify({ error: 'Blog ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the blog entry
    const post = await getEntry('blog', blogid);
    
    if (!post) {
      return new Response(JSON.stringify({ error: 'Blog post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the query parameters for format
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'md';

    // Read the original file content
    const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const filePath = path.join(contentDir, `${blogid}.${post.id.includes('.') ? post.id.split('.').pop() : 'md'}`);
    
    let fileContent: string;
    try {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      // Fallback: construct content from post data
      fileContent = `---
title: "${post.data.title}"
publishDate: ${post.data.publishDate.toISOString().split('T')[0]}
excerpt: "${post.data.excerpt}"
image: "${post.data.image}"
tags: [${post.data.tags.map(tag => `"${tag}"`).join(', ')}]
---

${post.body || ''}`;
    }

    // Determine file extension and content type based on format
    let fileExtension: string;
    let contentType: string;
    let content: string = fileContent;

    switch (format.toLowerCase()) {
      case 'txt':
        fileExtension = 'txt';
        contentType = 'text/plain';
        // Strip frontmatter for plain text
        content = content.replace(/^---[\s\S]*?---\n/, '');
        break;
      case 'md':
      case 'mdx':
      default:
        fileExtension = post.id.includes('.mdx') ? 'mdx' : 'md';
        contentType = 'text/markdown';
        break;
    }

    // Create filename
    const filename = `${post.data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}.${fileExtension}`;

    // Return the file as a download
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': content.length.toString(),
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;