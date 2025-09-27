/**
 * SEO utility functions for generating optimized metadata and descriptions
 */

export interface SEOData {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    image?: string;
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
    author?: string;
}

/**
 * Generate a compelling meta description from content
 */
export function generateMetaDescription(
    content: string,
    title: string,
    maxLength: number = 160
): string {
    // Remove HTML tags and clean up content
    const cleanContent = content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // Try to find a good sentence or paragraph
    const sentences = cleanContent.split(/[.!?]+/);
    let description = "";

    // Look for the first substantial sentence
    for (const sentence of sentences) {
        if (sentence.length > 50 && sentence.length < maxLength - 20) {
            description = sentence.trim();
            break;
        }
    }

    // If no good sentence found, truncate content
    if (!description) {
        description = cleanContent.substring(0, maxLength - 3) + "...";
    }

    // Add context if description is too short
    if (description.length < 80) {
        description = `${description} Read more about ${title.toLowerCase()} on Bob with a Blog.`;
    }

    // Ensure it doesn't exceed max length
    if (description.length > maxLength) {
        description = description.substring(0, maxLength - 3) + "...";
    }

    return description;
}

/**
 * Generate SEO-friendly keywords from content and tags
 */
export function generateKeywords(
    title: string,
    content: string,
    tags: string[] = [],
    maxKeywords: number = 10
): string[] {
    const keywords = new Set<string>();

    // Add tags first (highest priority)
    tags.forEach((tag) => keywords.add(tag.toLowerCase()));

    // Extract keywords from title
    const titleWords = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2);

    titleWords.forEach((word) => keywords.add(word));

    // Extract keywords from content (first 500 characters)
    const contentWords = content
        .toLowerCase()
        .replace(/<[^>]*>/g, "")
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 100); // Limit to first 100 words

    // Count word frequency
    const wordCount = new Map<string, number>();
    contentWords.forEach((word) => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Add most frequent words that aren't common stop words
    const stopWords = new Set([
        "the",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "up",
        "about",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "between",
        "among",
        "this",
        "that",
        "these",
        "those",
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
        "me",
        "him",
        "her",
        "us",
        "them",
        "my",
        "your",
        "his",
        "her",
        "its",
        "our",
        "their",
        "am",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "can",
        "shall",
        "a",
        "an",
        "some",
        "any",
        "all",
        "both",
        "each",
        "every",
        "no",
        "other",
        "another",
        "such",
        "what",
        "which",
        "who",
        "when",
        "where",
        "why",
        "how",
        "yes",
        "no",
        "not",
        "only",
        "just",
        "also",
        "even",
        "still",
        "already",
        "yet",
        "again",
        "here",
        "there",
        "now",
        "then",
        "today",
        "tomorrow",
        "yesterday",
        "always",
        "never",
        "sometimes",
        "often",
        "usually",
        "very",
        "quite",
        "rather",
        "too",
        "so",
        "much",
        "many",
        "more",
        "most",
        "less",
        "least",
        "little",
        "big",
        "small",
        "good",
        "bad",
        "new",
        "old",
        "first",
        "last",
        "next",
        "previous",
        "same",
        "different",
    ]);

    const sortedWords = Array.from(wordCount.entries())
        .filter(([word]) => !stopWords.has(word))
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxKeywords - keywords.size);

    sortedWords.forEach(([word]) => keywords.add(word));

    // Add some default tech-related keywords if we don't have enough
    const defaultKeywords = [
        "blog",
        "technology",
        "programming",
        "software development",
        "coding",
    ];
    defaultKeywords.forEach((keyword) => {
        if (keywords.size < maxKeywords) {
            keywords.add(keyword);
        }
    });

    return Array.from(keywords).slice(0, maxKeywords);
}

/**
 * Generate a comprehensive SEO data object
 */
export function generateSEOData(
    title: string,
    content: string,
    tags: string[] = [],
    options: Partial<SEOData> = {}
): SEOData {
    const description = generateMetaDescription(content, title);
    const keywords = generateKeywords(title, content, tags);

    return {
        title: options.title || title,
        description: options.description || description,
        keywords: options.keywords || keywords,
        canonicalUrl: options.canonicalUrl,
        image: options.image,
        publishedTime: options.publishedTime,
        modifiedTime: options.modifiedTime,
        tags: options.tags || tags,
        author: options.author || "Bob",
    };
}

/**
 * Validate and clean SEO data
 */
export function validateSEOData(data: SEOData): SEOData {
    return {
        ...data,
        title: data.title.substring(0, 60), // Optimal title length
        description: data.description.substring(0, 160), // Optimal description length
        keywords: data.keywords.slice(0, 10), // Limit keywords
    };
}

