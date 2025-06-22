import { logger } from '../utils/logger';
import { DatabaseService } from '../services/DatabaseService';
import { v4 as uuidv4 } from 'uuid';

export interface ABTestConfig {
  projectId: string;
  variants: Array<{
    id: string;
    weight: number;
    url: string;
  }>;
  metrics: string[];
  duration: number; // days
}

export interface TestResults {
  variantId: string;
  conversions: number;
  visitors: number;
  conversionRate: number;
  confidence: number;
  isWinner: boolean;
}

export class ABTestingEngine {
  private activeTests: Map<string, ABTestConfig>;

  constructor() {
    this.activeTests = new Map();
  }

  /**
   * Set up A/B test for a project
   */
  async setup(config: ABTestConfig): Promise<{
    testId: string;
    trackingCode: string;
    dashboardUrl: string;
  }> {
    const testId = uuidv4();
    
    // Store test configuration
    this.activeTests.set(testId, config);
    
    // Generate tracking code
    const trackingCode = this.generateTrackingCode(testId, config);
    
    logger.info(`A/B test created: ${testId}`);
    
    return {      testId,
      trackingCode,
      dashboardUrl: `${process.env.BASE_URL}/ab-testing/${testId}`,
    };
  }

  /**
   * Generate tracking code for A/B test
   */
  private generateTrackingCode(testId: string, config: ABTestConfig): string {
    return `<script>
(function() {
  // A/B Test Tracking for ${config.projectId}
  const TEST_ID = '${testId}';
  const VARIANTS = ${JSON.stringify(config.variants)};
  
  // Get or assign variant
  function getVariant() {
    let variant = sessionStorage.getItem('ab_variant_' + TEST_ID);
    if (!variant) {
      variant = selectWeightedVariant();
      sessionStorage.setItem('ab_variant_' + TEST_ID, variant);
    }
    return variant;
  }
  
  function selectWeightedVariant() {
    const random = Math.random();
    let cumulative = 0;
    for (const v of VARIANTS) {
      cumulative += v.weight;
      if (random < cumulative) return v.id;
    }
    return VARIANTS[0].id;
  }
  
  // Track conversion
  window.trackConversion = function(metric) {
    const variant = getVariant();
    fetch('/api/ab-testing/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testId: TEST_ID,
        variant: variant,
        metric: metric,
        timestamp: Date.now()
      })
    });
  };
  
  // Apply variant
  const variant = getVariant();
  document.body.classList.add('ab-variant-' + variant);
})();
</script>`;
  }
  /**
   * Track visitor or conversion event
   */
  async trackEvent(
    testId: string,
    variantId: string,
    eventType: 'visit' | 'conversion',
    metric?: string
  ): Promise<void> {
    await DatabaseService.trackABTestEvent({
      testId,
      variantId,
      eventType,
      metric,
      timestamp: new Date(),
    });
    
    logger.info(`A/B test event tracked: ${testId}/${variantId}/${eventType}`);
  }

  /**
   * Get real-time test results
   */
  async getResults(testId: string): Promise<TestResults[]> {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }

    const events = await DatabaseService.getABTestEvents(testId);
    const results: TestResults[] = [];

    for (const variant of test.variants) {
      const variantEvents = events.filter(e => e.variantId === variant.id);
      const visitors = variantEvents.filter(e => e.eventType === 'visit').length;
      const conversions = variantEvents.filter(e => e.eventType === 'conversion').length;
      
      const conversionRate = visitors > 0 ? conversions / visitors : 0;
      const confidence = this.calculateConfidence(conversions, visitors);
      
      results.push({
        variantId: variant.id,
        conversions,
        visitors,
        conversionRate,
        confidence,
        isWinner: false, // Determined after all results calculated
      });
    }

    // Determine winner if test has enough data
    const winner = this.determineWinner(results);
    if (winner) {
      winner.isWinner = true;
    }

    return results;
  }
  /**
   * Calculate statistical confidence
   */
  private calculateConfidence(conversions: number, visitors: number): number {
    if (visitors < 30) return 0; // Need minimum sample size
    
    // Simplified confidence calculation (Z-test for proportions)
    const p = conversions / visitors;
    const z = 1.96; // 95% confidence
    const margin = z * Math.sqrt((p * (1 - p)) / visitors);
    
    return Math.min(99, Math.max(0, (1 - margin) * 100));
  }

  /**
   * Determine test winner based on statistical significance
   */
  private determineWinner(results: TestResults[]): TestResults | null {
    if (results.length < 2) return null;
    
    // Need minimum visitors for each variant
    const minVisitors = results.every(r => r.visitors >= 100);
    if (!minVisitors) return null;
    
    // Sort by conversion rate
    const sorted = [...results].sort((a, b) => b.conversionRate - a.conversionRate);
    const best = sorted[0];
    const second = sorted[1];
    
    // Check if difference is statistically significant
    const improvement = (best.conversionRate - second.conversionRate) / second.conversionRate;
    const minImprovement = 0.05; // 5% minimum improvement
    const minConfidence = 95;
    
    if (improvement >= minImprovement && best.confidence >= minConfidence) {
      return best;
    }
    
    return null;
  }

  /**
   * End test and apply winner
   */
  async endTest(testId: string): Promise<{
    winner: string | null;
    results: TestResults[];
  }> {
    const results = await this.getResults(testId);
    const winner = results.find(r => r.isWinner);
    
    await DatabaseService.updateABTest(testId, {
      status: 'completed',
      winner: winner?.variantId || null,
      endDate: new Date(),
    });
    
    this.activeTests.delete(testId);
    
    return {
      winner: winner?.variantId || null,
      results,
    };
  }
}