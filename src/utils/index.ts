export function calculateReadingTime(text: string, wordsPerMinute = 200): number {
    // Remove markdown syntax and HTML tags for more accurate word count
    const plainText = text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '') // Remove inline code
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[#*_~`]/g, '') // Remove markdown formatting
        .trim();

    const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.round(words / wordsPerMinute));
}