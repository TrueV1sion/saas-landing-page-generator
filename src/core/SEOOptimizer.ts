import { logger } from '../utils/logger';
import { AIService } from '../services/AIService';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  author?: string;
  robots?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  [key: string]: any;
}

export class SEOOptimizer {
  private aiService: AIService;
  private readonly titleMaxLength = 60;
  private readonly descriptionMaxLength = 160;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Optimize content for SEO
   */
  async optimizeContent(html: string, config: SEOConfig): Promise<string> {
    let optimizedHTML = html;

    // Add meta tags
    const metaTags = this.generateMetaTags(config);
    optimizedHTML = optimizedHTML.replace('</head>', `${metaTags}\n</head>`);

    // Add structured data
    const structuredData = this.generateStructuredData(config);
    optimizedHTML = optimizedHTML.replace('</head>', `${structuredData}\n</head>`);

    // Optimize headings
    optimizedHTML = this.optimizeHeadings(optimizedHTML, config.keywords);

    return optimizedHTML;
  }
  /**
   * Generate comprehensive meta tags
   */
  private generateMetaTags(config: SEOConfig): string {
    const canonical = config.canonicalUrl || 'https://example.com';
    const ogImage = config.ogImage || '/og-default.jpg';
    
    return `
    <!-- Primary Meta Tags -->
    <title>${this.truncateText(config.title, this.titleMaxLength)}</title>
    <meta name="title" content="${this.truncateText(config.title, this.titleMaxLength)}">
    <meta name="description" content="${this.truncateText(config.description, this.descriptionMaxLength)}">
    <meta name="keywords" content="${config.keywords.join(', ')}">
    <meta name="author" content="${config.author || 'SaaS Landing Page Generator'}">
    <meta name="robots" content="${config.robots || 'index, follow'}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${config.title}">
    <meta property="og:description" content="${config.description}">
    <meta property="og:image" content="${ogImage}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonical}">
    <meta property="twitter:title" content="${config.title}">
    <meta property="twitter:description" content="${config.description}">
    <meta property="twitter:image" content="${ogImage}">
    
    <!-- Additional SEO -->
    <link rel="canonical" href="${canonical}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">`;
  }

  /**
   * Generate structured data for rich snippets
   */
  private generateStructuredData(config: SEOConfig): string {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: config.title,
      description: config.description,
      url: config.canonicalUrl || 'https://example.com',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    };
    return `
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>`;
  }

  /**
   * Optimize heading structure for SEO
   */
  private optimizeHeadings(html: string, keywords: string[]): string {
    let optimized = html;
    
    // Ensure only one H1 tag
    const h1Count = (html.match(/<h1/g) || []).length;
    if (h1Count > 1) {
      logger.warn(`Multiple H1 tags found (${h1Count}). Converting extras to H2.`);
      let firstH1 = true;
      optimized = optimized.replace(/<h1/g, () => {
        if (firstH1) {
          firstH1 = false;
          return '<h1';
        }
        return '<h2';
      });
    }
    
    // Add keywords to headings where relevant
    keywords.forEach(keyword => {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      optimized = optimized.replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, (match, content) => {
        if (!keywordRegex.test(content) && Math.random() > 0.7) {
          return match; // Don't force keywords everywhere
        }
        return match;
      });
    });
    
    return optimized;
  }

  /**
   * Add internal linking structure
   */
  private addInternalLinks(html: string): string {
    // Add skip navigation for accessibility
    const skipNav = '<a href="#main-content" class="skip-nav">Skip to main content</a>';
    let optimized = html.replace('<body>', `<body>${skipNav}`);
    
    // Ensure main content has ID
    optimized = optimized.replace('<main', '<main id="main-content"');
    
    return optimized;
  }
  /**
   * Generate sitemap.xml content
   */
  async generateSitemap(pages: string[]): Promise<string> {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return sitemap;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(sitemapUrl: string): string {
    return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: ${sitemapUrl}

# Crawl-delay for bots that respect it
User-agent: *
Crawl-delay: 1`;
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Analyze SEO score
   */
  analyzeSEOScore(html: string, config: SEOConfig): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    // Check title length
    if (config.title.length > this.titleMaxLength) {
      issues.push(`Title too long (${config.title.length} chars)`);
      score -= 10;
    }
    
    // Check description length
    if (config.description.length > this.descriptionMaxLength) {
      issues.push(`Description too long (${config.description.length} chars)`);
      score -= 10;
    }
    
    // Check H1 presence
    if (!html.includes('<h1')) {
      issues.push('Missing H1 tag');
      score -= 15;
    }
    
    // Check image alt tags
    const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/g) || []).length;
    if (imgWithoutAlt > 0) {
      issues.push(`${imgWithoutAlt} images missing alt text`);
      score -= imgWithoutAlt * 2;
    }
    
    // Suggestions
    if (config.keywords.length < 5) {
      suggestions.push('Add more relevant keywords');
    }
    
    if (!config.canonicalUrl) {
      suggestions.push('Set a canonical URL');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
}