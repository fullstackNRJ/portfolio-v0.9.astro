import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const md = new MarkdownIt();

export interface BlogContent {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  image: string;
  tags: string[];
  author: string;
  content: string;
  htmlContent: string;
  readingTime: number;
  aiSummary?: string;
  aiHashtags?: string[];
}

// Calculate reading time based on word count
function calculateReadingTime(text: string, wordsPerMinute = 200): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Extract text from HTML for reading time calculation
function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Generate AI-powered hashtags from content
function generateHashtags(content: string, existingTags: string[]): string[] {
  const text = content.toLowerCase();
  const additionalHashtags: string[] = [];
  
  // Simple keyword detection for common tech topics
  const keywordMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'node': 'NodeJS',
    'python': 'Python',
    'machine learning': 'MachineLearning',
    'artificial intelligence': 'AI',
    'web development': 'WebDev',
    'frontend': 'Frontend',
    'backend': 'Backend',
    'fullstack': 'FullStack',
    'api': 'API',
    'database': 'Database',
    'cloud': 'Cloud',
    'aws': 'AWS',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
  };

  for (const [keyword, hashtag] of Object.entries(keywordMap)) {
    if (text.includes(keyword) && !existingTags.includes(hashtag)) {
      additionalHashtags.push(hashtag);
    }
  }

  return [...existingTags, ...additionalHashtags.slice(0, 3)]; // Limit additional hashtags
}

// Generate AI-powered summary
function generateSummary(content: string): string {
  const text = extractTextFromHtml(content);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length <= 2) {
    return text.substring(0, 200) + '...';
  }
  
  // Take first 2 sentences as a simple summary
  return sentences.slice(0, 2).join('. ') + '.';
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let blogData: any = null;
    let isFromExternalAPI = false;

    // Try fetching from external API first
    try {
      const response = await fetch(`https://assets.themvpco.one/api/blogs/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        blogData = await response.json();
        isFromExternalAPI = true;
      } else if (response.status === 404) {
        // Continue to fallback
      } else {
        throw new Error(`External API failed: ${response.status}`);
      }
    } catch (apiError) {
      console.log('External API unavailable, falling back to local content:', apiError);
    }

    // Fallback to local content collections if external API failed
    if (!blogData) {
      const post = await getEntry('blog', slug);
      if (!post) {
        return new Response(JSON.stringify({ error: 'Blog not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      blogData = {
        slug: post.slug,
        title: post.data.title,
        excerpt: post.data.excerpt,
        publishDate: post.data.publishDate.toISOString(),
        image: post.data.image,
        tags: post.data.tags,
        author: post.data.author || 'Neeraj Mukta',
        content: post.body || '',
      };
    }
    
    // Process the content
    let htmlContent = '';
    let plainTextContent = '';

    if (blogData.content) {
      if (isFromExternalAPI) {
        // Convert markdown to HTML if needed for external content
        if (blogData.content.includes('##') || blogData.content.includes('**')) {
          htmlContent = md.render(blogData.content);
        } else {
          htmlContent = blogData.content;
        }
        
        // Sanitize HTML for security
        htmlContent = sanitizeHtml(htmlContent, {
          allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'strong', 'em', 'u', 's',
            'ul', 'ol', 'li', 'blockquote',
            'a', 'img', 'code', 'pre',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
          ],
          allowedAttributes: {
            'a': ['href', 'title', 'target', 'rel'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            '*': ['class']
          },
          allowedSchemes: ['http', 'https', 'mailto']
        });
      } else {
        // For local MDX content, render markdown
        htmlContent = md.render(blogData.content);
      }

      plainTextContent = extractTextFromHtml(htmlContent);
    }

    // Calculate reading time using the actual content
    const readingTime = calculateReadingTime(plainTextContent);

    // Generate AI enhancements
    const aiHashtags = generateHashtags(plainTextContent, blogData.tags || []);
    const aiSummary = generateSummary(htmlContent);

    const enrichedBlog: BlogContent = {
      slug: blogData.slug,
      title: blogData.title,
      excerpt: blogData.excerpt,
      publishDate: blogData.publishDate,
      image: blogData.image,
      tags: blogData.tags || [],
      author: blogData.author || 'Neeraj Mukta',
      content: blogData.content,
      htmlContent,
      readingTime,
      aiSummary,
      aiHashtags,
    };

    return new Response(JSON.stringify(enrichedBlog), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching blog content:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch blog content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};