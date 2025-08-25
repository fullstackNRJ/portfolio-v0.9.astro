import type { APIRoute } from 'astro';

interface BlogContent {
    filename: string;
    slug: string;
    content: string;
    lastModified: string;
    contentType: string;
}

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    publishDate: string;
    image?: string;
    tags: string[];
    author: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    featured: boolean;
    readingTime?: number;
    seoKeywords: string[];
    socialImage?: string;
    filename: string;
    lastModified: string;
    aiHashtags?: string[];
    aiSummary?: string;
}

// Extract title from markdown content
function extractTitleFromMarkdown(content: string, filename: string): string {
    // Look for h1 title (# Title)
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
        return h1Match[1].trim();
    }

    // Look for yaml frontmatter title
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const titleMatch = frontmatterMatch[1].match(/^title:\s*['"]?([^'"]+)['"]?$/m);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
    }

    // Fallback to filename
    return filename.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Extract excerpt from markdown content
function extractExcerptFromMarkdown(content: string): string {
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---\s*\n([\s\S]*?)\n---\s*\n?/, '');

    // Get first paragraph after title
    const lines = contentWithoutFrontmatter.split('\n').filter(line => line.trim());
    let excerpt = '';

    for (const line of lines) {
        // Skip markdown headings
        if (line.startsWith('#')) continue;

        // Get the first meaningful paragraph
        if (line.trim() && !line.startsWith('!') && !line.startsWith('[')) {
            excerpt = line.trim();
            break;
        }
    }

    // Limit excerpt length
    if (excerpt.length > 150) {
        excerpt = excerpt.substring(0, 147) + '...';
    }

    return excerpt || 'No excerpt available';
}

// Extract metadata from frontmatter
function extractFrontmatterData(content: string) {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    const defaults = {
        tags: [] as string[],
        author: 'Neeraj Mukta',
        category: 'Technology',
        difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
        featured: false,
        publishDate: new Date().toISOString(),
        image: '/assets/default-blog.png'
    };

    if (!frontmatterMatch) {
        return defaults;
    }

    const frontmatter = frontmatterMatch[1];
    const metadata = { ...defaults };

    // Parse YAML-like frontmatter (simple parsing)
    const lines = frontmatter.split('\n');
    for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            const value = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');

            switch (key.trim()) {
                case 'tags':
                    metadata.tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
                    break;
                case 'author':
                    metadata.author = value;
                    break;
                case 'category':
                    metadata.category = value;
                    break;
                case 'difficulty':
                    if (['beginner', 'intermediate', 'advanced'].includes(value)) {
                        metadata.difficulty = value as 'beginner' | 'intermediate' | 'advanced';
                    }
                    break;
                case 'featured':
                    metadata.featured = value.toLowerCase() === 'true';
                    break;
                case 'publishDate':
                case 'date':
                    metadata.publishDate = value;
                    break;
                case 'image':
                    metadata.image = value;
                    break;
            }
        }
    }

    return metadata;
}

// Calculate reading time (enhanced version)
function calculateReadingTime(content: string, wordsPerMinute = 200): number {
    // Remove markdown syntax and HTML tags for more accurate word count
    const plainText = content
        .replace(/^---\s*\n([\s\S]*?)\n---\s*\n?/, '') // Remove frontmatter
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

export const GET: APIRoute = async ({ params, request }) => {
    try {
        const { slug } = params;

        if (!slug) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Blog slug is required'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Fetch individual blog content from external API
        const contentResponse = await fetch(`https://assets.themvpco.one/api/blogs/${slug}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-KEY': import.meta.env.ASSETS_API_KEY || 'demo'
            }
        });

        if (!contentResponse.ok) {
            if (contentResponse.status === 404) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: 'Blog post not found'
                    }),
                    {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }

            throw new Error(`API request failed with status ${contentResponse.status}`);
        }

        const contentData: BlogContent = await contentResponse.json();

        // Extract metadata and content from markdown
        const title = extractTitleFromMarkdown(contentData.content, contentData.filename);
        const excerpt = extractExcerptFromMarkdown(contentData.content);
        const metadata = extractFrontmatterData(contentData.content);

        // Create enhanced blog post
        const blogPost: BlogPost = {
            id: contentData.slug,
            slug: contentData.slug,
            title,
            excerpt,
            content: contentData.content,
            publishDate: metadata.publishDate,
            image: metadata.image,
            tags: metadata.tags,
            author: metadata.author,
            category: metadata.category,
            difficulty: metadata.difficulty,
            featured: metadata.featured,
            readingTime: calculateReadingTime(contentData.content),
            seoKeywords: metadata.tags,
            socialImage: metadata.image,
            filename: contentData.filename,
            lastModified: contentData.lastModified,
            aiHashtags: generateAIHashtags(title, metadata.tags, metadata.category),
            aiSummary: generateAISummary(excerpt, title)
        };

        return new Response(
            JSON.stringify({
                success: true,
                data: blogPost,
                message: 'Blog post retrieved successfully'
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
        console.error('Error fetching blog post:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to fetch blog post',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
