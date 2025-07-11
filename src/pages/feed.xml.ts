import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
    const blog = await getCollection('blog');
    return rss({
        title: 'Buzz’s Blog',
        description: 'A humble Astronaut’s guide to the stars',
        site: context.url!,
        items: blog.map((post) => ({
            link: `/blog/${post.id?.split('.')[0]}/`,
            // Note: this will not process components or JSX expressions in MDX files.
            content: sanitizeHtml(parser.render(post.body), {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
            }),
            ...post.data,
        })),
        stylesheet: '/rss.xsl',
    });
}