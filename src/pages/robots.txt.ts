export function GET() {
    return new Response(
        `User-agent: *
Allow: /

Sitemap: https://neerajmukta.com/sitemap.xml
Sitemap: https://neerajmukta.com/rss.xml
`, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}