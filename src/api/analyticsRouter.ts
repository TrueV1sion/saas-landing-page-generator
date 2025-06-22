import { Router } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { ABTestingEngine } from '../core/ABTestingEngine';

const router = Router();
const abTesting = new ABTestingEngine();

router.post('/track', async (req, res) => {
  try {
    const { event, data, variantId } = req.body;
    await AnalyticsService.track({
      projectId: data.projectId,
      variantId,
      event,
      properties: data,
      timestamp: new Date(),
      sessionId: req.sessionID || req.ip,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track event' });
  }
});

router.get('/:projectId/metrics', async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    const metrics = await AnalyticsService.getMetrics(
      req.params.projectId,
      timeframe as any
    );
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

router.post('/ab-testing/track', async (req, res) => {
  try {
    const { testId, variant, metric } = req.body;
    await abTesting.trackEvent(testId, variant, 'conversion', metric);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track A/B test event' });
  }
});

export { router as analyticsRouter };