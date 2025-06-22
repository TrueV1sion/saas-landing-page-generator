import { Router } from 'express';
import { LandingPageGenerator, ProductDescriptionSchema } from '../core/LandingPageGenerator';
import { generationRateLimiter } from '../middleware/rateLimiter';
import { DatabaseService } from '../services/DatabaseService';

const router = Router();
const generator = new LandingPageGenerator();

router.post('/generate', generationRateLimiter, async (req, res, next) => {
  try {
    const productDesc = ProductDescriptionSchema.parse(req.body.productDescription);
    const options = req.body.options || {};
    const result = await generator.generateLandingPage(productDesc, options);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Invalid product description',
        details: error.errors,
      });
    }
    next(error);
  }
});

router.get('/:projectId', async (req, res, next) => {
  try {
    const project = await DatabaseService.getProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: [], total: 0 });
  } catch (error) {
    next(error);
  }
});

export { router as landingPageRouter };