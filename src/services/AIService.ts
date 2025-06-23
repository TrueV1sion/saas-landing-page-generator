import { Configuration, OpenAIApi } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { cache } from '../utils/cache';

export class AIService {
  private openai: OpenAIApi;
  private anthropic: Anthropic;
  private provider: 'openai' | 'anthropic';

  constructor() {
    // Initialize OpenAI
    const openaiConfig = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(openaiConfig);

    // Initialize Anthropic
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Default provider based on available keys
    this.provider = process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai';
  }

  static async initialize() {
    logger.info('AI Service initialized');
  }

  /**
   * Core content generation method
   */
  private async generateContent(prompt: string, format: 'text' | 'json' = 'text'): Promise<any> {
    try {
      if (this.provider === 'anthropic') {
        return await this.generateWithAnthropic(prompt, format);
      } else {
        return await this.generateWithOpenAI(prompt, format);
      }
    } catch (error) {
      logger.error('AI generation failed:', error);
      throw new Error('Failed to generate content');
    }
  }

  private hashPrompt(prompt: string): string {
    return Buffer.from(prompt).toString('base64').substring(0, 16);
  }

  /**
   * Generate content using Anthropic Claude
   */
  private async generateWithAnthropic(prompt: string, format: 'text' | 'json'): Promise<any> {
    const systemPrompt = format === 'json' 
      ? 'You are a helpful AI that always responds with valid JSON objects.'
      : 'You are an expert copywriter for SaaS landing pages.';

    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].text;
    return format === 'json' ? JSON.parse(content) : content;
  }

  /**
   * Generate content using OpenAI GPT-4
   */
  private async generateWithOpenAI(prompt: string, format: 'text' | 'json'): Promise<any> {
    const systemPrompt = format === 'json'
      ? 'You are a helpful AI that always responds with valid JSON objects.'
      : 'You are an expert copywriter for SaaS landing pages.';

    const response = await this.openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: format === 'json' ? { type: 'json_object' } : undefined,
    });

    const content = response.data.choices[0].message?.content || '';
    return format === 'json' ? JSON.parse(content) : content;
  }

  /**
   * Analyze competitor website
   */
  async analyzeCompetitor(competitorUrl: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  }> {
    // This would integrate with web scraping service
    // For now, return AI-generated analysis
    const prompt = `Analyze the competitive landscape for a SaaS competing with ${competitorUrl}.
    Provide strengths, weaknesses, and opportunities in JSON format.`;
    
    return await this.generateContent(prompt, 'json');
  }

  /**
   * Generate hero section content
   */
  async generateHeroSection(prompt: string): Promise<{
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondary?: string;
  }> {
    const cacheKey = `hero:${this.hashPrompt(prompt)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const enhancedPrompt = `${prompt}
    
    Return a JSON object with:
    - headline: A powerful, attention-grabbing headline (max 10 words)
    - subheadline: Supporting text that elaborates the value prop (max 25 words)
    - ctaText: Primary call-to-action button text (max 4 words)
    - ctaSecondary: Optional secondary CTA text (max 4 words)`;

    const result = await this.generateContent(enhancedPrompt, 'json') as {
      headline: string;
      subheadline: string;
      ctaText: string;
      ctaSecondary?: string;
    };
    
    // Ensure required fields are present
    if (!result.headline || !result.subheadline || !result.ctaText) {
      return {
        headline: 'Transform Your Business Today',
        subheadline: 'Powerful SaaS solution that drives growth and innovation',
        ctaText: 'Get Started',
        ctaSecondary: 'Learn More'
      };
    }
    
    await cache.set(cacheKey, result, 3600);
    return result;
  }

  /**
   * Generate features section content
   */
  async generateFeaturesSection(prompt: string): Promise<Array<{
    title: string;
    description: string;
    icon: string;
    benefit: string;
  }>> {
    const enhancedPrompt = `${prompt}
    
    Return a JSON array of feature objects, each with:
    - title: Feature name (max 5 words)
    - description: Feature explanation (max 20 words)
    - icon: Suggested icon name (e.g., 'rocket', 'shield', 'chart')
    - benefit: Clear user benefit (max 15 words)`;

    return await this.generateContent(enhancedPrompt, 'json');
  }

  /**
   * Generate benefits section
   */
  async generateBenefitsSection(prompt: string): Promise<Array<{
    title: string;
    description: string;
    metric?: string;
  }>> {
    const enhancedPrompt = `${prompt}
    
    Return a JSON array of benefit objects, each with:
    - title: Benefit headline (max 6 words)
    - description: Detailed explanation (max 25 words)
    - metric: Optional quantifiable metric (e.g., "50% faster", "3x ROI")`;

    return await this.generateContent(enhancedPrompt, 'json');
  }

  /**
   * Generate testimonials
   */
  async generateTestimonials(prompt: string): Promise<Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
  }>> {
    const enhancedPrompt = `${prompt}
    
    Return a JSON array of 3-5 testimonial objects, each with:
    - name: Realistic person name
    - role: Job title
    - company: Company name
    - content: Testimonial text (30-50 words)
    - rating: Number 4-5`;

    return await this.generateContent(enhancedPrompt, 'json');
  }

  /**
   * Generate CTA section
   */
  async generateCTASection(prompt: string): Promise<{
    headline: string;
    description: string;
    primaryButton: string;
    secondaryButton?: string;
  }> {
    return await this.generateContent(`${prompt}
    
    Return JSON with:
    - headline: Compelling CTA headline
    - description: Supporting text
    - primaryButton: Main button text
    - secondaryButton: Optional secondary action`, 'json');
  }

  /**
   * Generate FAQ section
   */
  async generateFAQSection(prompt: string): Promise<Array<{
    question: string;
    answer: string;
    category?: string;
  }>> {
    const enhancedPrompt = `${prompt}
    
    Return a JSON array of 5-8 FAQ objects, each with:
    - question: Common user question
    - answer: Clear, helpful answer (30-60 words)
    - category: Optional category (e.g., "Pricing", "Features", "Support")`;

    return await this.generateContent(enhancedPrompt, 'json');
  }
}