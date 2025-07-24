import type { APIRoute } from 'astro';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishDate: string;
  image: string;
  tags: string[];
  author: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  readingTime?: number;
  seoKeywords: string[];
  socialImage?: string;
}

// Calculate reading time (enhanced version)
function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  // Remove markdown syntax and HTML tags for more accurate word count
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .trim();
  
  const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

// Generate AI-optimized hashtags
function generateAIHashtags(title: string, tags: string[], category: string): string[] {
  const aiHashtags = [];
  
  // Add category-based hashtags
  aiHashtags.push(`#${category.replace(/\s+/g, '')}`);
  
  // Add title-based hashtags (extract key words)
  const titleWords = title.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3 && !['the', 'and', 'for', 'with', 'that', 'this'].includes(word))
    .slice(0, 2);
  titleWords.forEach(word => aiHashtags.push(`#${word}`));
  
  // Add existing tags with # prefix
  tags.slice(0, 3).forEach(tag => aiHashtags.push(`#${tag.replace(/\s+/g, '')}`));
  
  // Add trending tech hashtags based on content
  const trendingTags = ['#WebDev', '#TechTips', '#Programming', '#AI', '#Innovation', '#FullStack'];
  aiHashtags.push(trendingTags[Math.floor(Math.random() * trendingTags.length)]);
  
  return [...new Set(aiHashtags)]; // Remove duplicates
}

// Generate AI summary for social sharing
function generateAISummary(excerpt: string, title: string): string {
  // Create an engaging social media summary
  const hookPhrases = [
    "🚀 Discover:",
    "💡 Learn how to:",
    "🔥 Master the art of:",
    "✨ Unlock the secrets of:",
    "🎯 Essential guide to:"
  ];
  
  const hook = hookPhrases[Math.floor(Math.random() * hookPhrases.length)];
  const summary = excerpt.length > 120 ? excerpt.substring(0, 117) + '...' : excerpt;
  
  return `${hook} ${summary} 

#TechBlog #Learning #Development`;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search') || '';

    // Build API URL with parameters
    const apiUrl = new URL('https://assets.themvpco.one/api/blogs');
    apiUrl.searchParams.set('page', page.toString());
    apiUrl.searchParams.set('limit', limit.toString());
    if (category) apiUrl.searchParams.set('category', category);
    if (featured) apiUrl.searchParams.set('featured', 'true');
    if (search) apiUrl.searchParams.set('search', search);

    // Fetch from external API
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': import.meta.env.ASSETS_API_KEY || 'demo'
      }
    });

    let blogs: BlogPost[] = [];
    let totalPosts = 0;
    let totalPages = 1;

    if (response.ok) {
      const data = await response.json();
      blogs = data.blogs || data.data || [];
      totalPosts = data.total || blogs.length;
      totalPages = Math.ceil(totalPosts / limit);

      // Enhance each blog post with AI features
      blogs = blogs.map(blog => ({
        ...blog,
        readingTime: calculateReadingTime(blog.content || blog.excerpt),
        aiHashtags: generateAIHashtags(blog.title, blog.tags, blog.category || 'Technology'),
        aiSummary: generateAISummary(blog.excerpt, blog.title),
        difficulty: blog.difficulty || 'intermediate',
        featured: blog.featured || false,
        seoKeywords: blog.seoKeywords || blog.tags,
        socialImage: blog.socialImage || blog.image
      }));
    } else {
      // Fallback to local content if API is unavailable
      console.warn('External API unavailable, using local content');
      // This would normally import from Astro content collections
      // For now, return empty array with proper structure
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          blogs,
          pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          },
          filters: {
            category,
            featured,
            search
          }
        },
        message: `Found ${blogs.length} blog posts`
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 minute cache
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new Response(
      JSON.stringify({
        success: false,
        data: {
          blogs: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalPosts: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        message: 'Failed to fetch blog posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};