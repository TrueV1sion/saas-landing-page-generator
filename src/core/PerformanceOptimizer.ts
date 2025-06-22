import { logger } from '../utils/logger';

export interface OptimizationResult {
  content: string;
  size: number;
  savings: number;
}

export class PerformanceOptimizer {
  private readonly imageSizes = [320, 640, 1024, 1920];
  
  /**
   * Optimize HTML for performance
   */
  async optimizeHTML(html: string): Promise<string> {
    try {
      let optimized = html;
      
      // Remove comments
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
      
      // Remove extra whitespace
      optimized = optimized.replace(/\s+/g, ' ');
      optimized = optimized.replace(/>\s+</g, '><');
      
      // Add performance hints
      optimized = this.addResourceHints(optimized);
      
      // Lazy load images
      optimized = this.addLazyLoading(optimized);
      
      logger.info(`HTML optimized: ${html.length} → ${optimized.length} bytes`);
      
      return optimized;
    } catch (error) {
      logger.error('HTML optimization failed:', error);
      return html;
    }
  }

  /**
   * Optimize CSS for performance
   */
  async optimizeCSS(css: string): Promise<string> {
    let optimized = css.replace(/\/\*[\s\S]*?\*\//g, '');
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/\s*([{}:;,])\s*/g, '$1');
    return optimized;
  }
  /**
   * Optimize JavaScript for performance
   */
  async optimizeJS(js: string): Promise<string> {
    try {
      // Basic minification
      let optimized = js.replace(/\/\/.*$/gm, ''); // Remove single-line comments
      optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      optimized = optimized.replace(/\s+/g, ' '); // Collapse whitespace
      optimized = optimized.replace(/\s*([{}:;,=\(\)])\s*/g, '$1'); // Remove spaces around operators
      
      return optimized;
    } catch (error) {
      logger.error('JS optimization failed:', error);
      return js;
    }
  }

  /**
   * Add resource hints for faster loading
   */
  private addResourceHints(html: string): string {
    const hints = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">`;
    
    return html.replace('</head>', `${hints}\n</head>`);
  }

  /**
   * Add lazy loading to images
   */
  private addLazyLoading(html: string): string {
    // Add loading="lazy" to images below the fold
    let optimized = html.replace(
      /<img(?![^>]*loading=)([^>]*src=["'][^"']+["'][^>]*)>/g,
      '<img loading="lazy"$1>'
    );
    
    // Add intersection observer for advanced lazy loading
    const lazyScript = `
    <script>
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach(img => imageObserver.observe(img));
    }
    </script>`;
    
    return optimized.replace('</body>', `${lazyScript}\n</body>`);
  }
  /**
   * Prioritize critical resources
   */
  private prioritizeCriticalResources(html: string): string {
    // Add fetchpriority="high" to critical resources
    let optimized = html;
    
    // Hero image gets high priority
    optimized = optimized.replace(
      /<img([^>]*class=["'][^"']*hero[^"']*["'][^>]*)>/i,
      '<img fetchpriority="high"$1>'
    );
    
    // Critical CSS gets high priority
    optimized = optimized.replace(
      /<link([^>]*rel=["']stylesheet["'][^>]*critical[^>]*)>/gi,
      '<link fetchpriority="high"$1>'
    );
    
    return optimized;
  }

  /**
   * Generate critical CSS
   */
  async generateCriticalCSS(css: string, html: string): Promise<{
    critical: string;
    remaining: string;
  }> {
    // Extract above-the-fold CSS rules
    const criticalSelectors = [
      'body', 'html', 'header', 'nav', '.hero', 
      'h1', 'h2', '.cta-primary', '.logo'
    ];
    
    let critical = '';
    let remaining = css;
    
    criticalSelectors.forEach(selector => {
      const regex = new RegExp(`${selector}\\s*{[^}]+}`, 'gi');
      const matches = css.match(regex);
      if (matches) {
        critical += matches.join('\n');
        remaining = remaining.replace(regex, '');
      }
    });
    
    return { critical, remaining };
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(metrics: {
    htmlSize: number;
    cssSize: number;
    jsSize: number;
    imageCount: number;
    requestCount: number;
  }): number {
    let score = 100;
    
    // Penalize large files
    if (metrics.htmlSize > 100000) score -= 10;
    if (metrics.cssSize > 50000) score -= 10;
    if (metrics.jsSize > 100000) score -= 15;
    
    // Penalize too many requests
    if (metrics.requestCount > 20) score -= 10;
    if (metrics.imageCount > 15) score -= 5;
    
    return Math.max(0, score);
  }
}