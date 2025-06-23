import { Router, Request, Response, NextFunction } from 'express';

export const templateRouter = Router();

templateRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      status: 'success',
      data: {
        templates: [
          { id: '1', name: 'Modern SaaS', category: 'technology' },
          { id: '2', name: 'Minimalist', category: 'simple' },
          { id: '3', name: 'Enterprise', category: 'corporate' }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

templateRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      status: 'success',
      data: {
        id: req.params.id,
        name: 'Template',
        preview: '/preview/template.html'
      }
    });
  } catch (error) {
    next(error);
  }
});