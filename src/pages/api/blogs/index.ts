import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  image: string;
  tags: string[];
  author: string;
}

export interface BlogListResponse {
  blogs: BlogListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const tag = url.searchParams.get('tag') || '';

    let blogs: BlogListItem[] = [];

    // Try fetching from external API first
    try {
      const response = await fetch('https://assets.themvpco.one/api/blogs', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        blogs = await response.json();
      } else {
        throw new Error(`External API failed: ${response.status}`);
      }
    } catch (apiError) {
      console.log('External API unavailable, falling back to local content:', apiError);
      
      // Fallback to local content collections
      const posts = await getCollection('blog');
      blogs = posts.map(post => ({
        slug: post.slug,
        title: post.data.title,
        excerpt: post.data.excerpt,
        publishDate: post.data.publishDate.toISOString(),
        image: post.data.image,
        tags: post.data.tags,
        author: post.data.author || 'Neeraj Mukta',
      }));
    }

    // Apply filtering
    let filteredBlogs = blogs;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (tag) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }

    // Apply pagination
    const total = filteredBlogs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    const result: BlogListResponse = {
      blogs: paginatedBlogs,
      total,
      page,
      pageSize,
      totalPages,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    
    // Return empty result on error to maintain resilience
    const errorResult: BlogListResponse = {
      blogs: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };

    return new Response(JSON.stringify(errorResult), {
      status: 200, // Return 200 to prevent client-side errors
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};