import { readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger';
import { minifyHTML, minifyCSS, minifyJS } from '../utils/minifiers';

export interface TemplateData {
  template: string;
  content: any;
  productDesc: any;
  competitorInsights: any;
  variantId: string;
  analytics: boolean;
}

export interface TemplateResult {
  html: string;
  css: string;
  js: string;
}

export class TemplateEngine {
  private templatesPath: string;
  private templateCache: Map<string, string>;

  constructor() {
    this.templatesPath = join(process.cwd(), 'src', 'templates');
    this.templateCache = new Map();
  }

  /**
   * Load template from file system with caching
   */
  private async loadTemplate(path: string): Promise<string> {
    const fullPath = join(this.templatesPath, path);
    
    if (this.templateCache.has(fullPath)) {
      return this.templateCache.get(fullPath)!;
    }

    try {
      const content = await readFile(fullPath, 'utf-8');
      this.templateCache.set(fullPath, content);
      return content;
    } catch (error) {
      logger.error(`Failed to load template: ${path}`, error);
      throw new Error(`Template not found: ${path}`);
    }
  }
  /**
   * Render a landing page using the specified template
   */
  async render(data: TemplateData): Promise<TemplateResult> {
    try {
      // Load template files
      const [htmlTemplate, cssTemplate, jsTemplate] = await Promise.all([
        this.loadTemplate(`${data.template}/index.html`),
        this.loadTemplate(`${data.template}/styles.css`),
        this.loadTemplate(`${data.template}/script.js`),
      ]);

      // Process and inject content
      const processedHTML = this.processHTML(htmlTemplate, data);
      const processedCSS = this.processCSS(cssTemplate, data);
      const processedJS = this.processJS(jsTemplate, data);

      // Minify for production
      return {
        html: await minifyHTML(processedHTML),
        css: await minifyCSS(processedCSS),
        js: await minifyJS(processedJS),
      };
    } catch (error) {
      logger.error('Template rendering failed:', error);
      throw new Error(`Failed to render template: ${data.template}`);
    }
  }

  /**
   * Process HTML template with content injection
   */
  private processHTML(template: string, data: TemplateData): string {
    let html = template;

    // Replace placeholders with actual content
    const replacements = {
      '{{PRODUCT_NAME}}': data.productDesc.productName,
      '{{HERO_HEADLINE}}': data.content.hero.headline,
      '{{HERO_SUBHEADLINE}}': data.content.hero.subheadline,
      '{{CTA_PRIMARY}}': data.content.hero.ctaText,
      '{{CTA_SECONDARY}}': data.content.hero.ctaSecondary || '',
      '{{VARIANT_ID}}': data.variantId,
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(placeholder, 'g'), value);
    }
    // Inject features section
    html = this.injectFeatures(html, data.content.features);
    
    // Inject testimonials
    html = this.injectTestimonials(html, data.content.testimonials);
    
    // Inject FAQ section
    html = this.injectFAQ(html, data.content.faq);
    
    // Add analytics if enabled
    if (data.analytics) {
      html = this.injectAnalytics(html, data.variantId);
    }

    return html;
  }

  /**
   * Inject features into template
   */
  private injectFeatures(html: string, features: any[]): string {
    const featuresHTML = features.map(feature => `
      <div class="feature-card" data-aos="fade-up">
        <div class="feature-icon">
          <i class="icon-${feature.icon}"></i>
        </div>
        <h3 class="feature-title">${feature.title}</h3>
        <p class="feature-description">${feature.description}</p>
        <p class="feature-benefit">${feature.benefit}</p>
      </div>
    `).join('');

    return html.replace('{{FEATURES_CONTENT}}', featuresHTML);
  }

  /**
   * Inject testimonials into template
   */
  private injectTestimonials(html: string, testimonials: any[]): string {
    const testimonialsHTML = testimonials.map(testimonial => `
      <div class="testimonial-card" data-rating="${testimonial.rating}">
        <div class="testimonial-content">
          <p>"${testimonial.content}"</p>
        </div>
        <div class="testimonial-author">
          <strong>${testimonial.name}</strong>
          <span>${testimonial.role} at ${testimonial.company}</span>
        </div>
      </div>
    `).join('');

    return html.replace('{{TESTIMONIALS_CONTENT}}', testimonialsHTML);
  }
  /**
   * Inject FAQ section
   */
  private injectFAQ(html: string, faqs: any[]): string {
    const faqHTML = faqs.map((faq, index) => `
      <div class="faq-item" data-category="${faq.category || 'general'}">
        <button class="faq-question" aria-expanded="false" aria-controls="faq-${index}">
          ${faq.question}
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer" id="faq-${index}">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');

    return html.replace('{{FAQ_CONTENT}}', faqHTML);
  }

  /**
   * Inject analytics tracking
   */
  private injectAnalytics(html: string, variantId: string): string {
    const analyticsScript = `
      <script>
        // Custom analytics tracking
        window.lpAnalytics = {
          projectId: '${variantId}',
          track: function(event, data) {
            fetch('/api/analytics/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event, data, variantId: '${variantId}' })
            });
          }
        };
        
        // Track page view
        window.lpAnalytics.track('pageview', { timestamp: Date.now() });
      </script>
    `;

    return html.replace('</body>', `${analyticsScript}</body>`);
  }
  /**
   * Process CSS with dynamic values
   */
  private processCSS(template: string, data: TemplateData): string {
    const colorScheme = this.getColorScheme(data.productDesc.colorScheme || 'blue');
    
    let css = template;
    
    // Replace color variables
    css = css.replace(/\{\{PRIMARY_COLOR\}\}/g, colorScheme.primary);
    css = css.replace(/\{\{SECONDARY_COLOR\}\}/g, colorScheme.secondary);
    css = css.replace(/\{\{ACCENT_COLOR\}\}/g, colorScheme.accent);
    css = css.replace(/\{\{BACKGROUND_COLOR\}\}/g, colorScheme.background);
    css = css.replace(/\{\{TEXT_COLOR\}\}/g, colorScheme.text);
    
    // Add variant-specific styles for A/B testing
    if (data.variantId) {
      css += `\n/* Variant-specific styles */\n.variant-${data.variantId} { }`;
    }
    
    return css;
  }

  /**
   * Process JavaScript with configuration
   */
  private processJS(template: string, data: TemplateData): string {
    const config = {
      productName: data.productDesc.productName,
      features: data.content.features.map(f => f.title),
      analytics: data.analytics,
      variantId: data.variantId,
    };
    
    return template.replace(
      '{{CONFIG}}',
      `const lpConfig = ${JSON.stringify(config, null, 2)};`
    );
  }

  /**
   * Get color scheme based on preference
   */
  private getColorScheme(scheme: string) {
    const schemes = {
      blue: {
        primary: '#0066FF',
        secondary: '#0052CC',
        accent: '#00D4FF',
        background: '#F8FAFF',
        text: '#1A1A1A'
      },
      green: {
        primary: '#00A878',
        secondary: '#008C65',
        accent: '#50E3C2',
        background: '#F0FFF9',
        text: '#1A1A1A'
      },
      purple: {
        primary: '#7B4AFF',
        secondary: '#6936F5',
        accent: '#E0CCFF',
        background: '#FAF8FF',
        text: '#1A1A1A'
      },
      dark: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
        accent: '#4AFF7B',
        background: '#0A0A0A',
        text: '#FFFFFF'
      }
    };
    
    return schemes[scheme] || schemes.blue;
  }
}