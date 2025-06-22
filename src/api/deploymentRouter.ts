import { Router } from 'express';
import { QueueService } from '../services/QueueService';
import { DatabaseService } from '../services/DatabaseService';

const router = Router();

router.post('/deploy', async (req, res, next) => {
  try {
    const { projectId, target, customDomain } = req.body;
    const project = await DatabaseService.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const job = await QueueService.addJob('deployment', {
      projectId,
      pages: project.pages,
      target,
      customDomain,
    });
    
    res.json({
      success: true,
      data: { jobId: job.id, status: 'queued', estimatedTime: '2-5 minutes' }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/status/:jobId', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        jobId: req.params.jobId,
        status: 'in_progress',
        progress: 75,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get deployment status' });
  }
});

router.get('/:projectId/history', async (req, res) => {
  res.json({ success: true, data: [] });
});

export { router as deploymentRouter };