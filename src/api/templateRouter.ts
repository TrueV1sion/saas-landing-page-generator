import { Router } from 'express';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const router = Router();
const templatesPath = join(process.cwd(), 'src', 'templates');

router.get('/', async (req, res) => {
  try {
    const templates = await readdir(templatesPath);
    const templateList = await Promise.all(
      templates.map(async (name) => {
        try {
          const configPath = join(templatesPath, name, 'config.json');
          const config = JSON.parse(await readFile(configPath, 'utf-8'));
          return {
            id: name,
            name: config.name || name,
            description: config.description,
            thumbnail: config.thumbnail,
            tags: config.tags || [],
          };
        } catch {
          return {
            id: name,
            name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: 'A modern landing page template',
            tags: [],
          };
        }
      })
    );
    
    res.json({ success: true, data: templateList });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

router.get('/:templateId/preview', async (req, res) => {
  try {
    const htmlPath = join(templatesPath, req.params.templateId, 'index.html');
    const html = await readFile(htmlPath, 'utf-8');
    res.send(html);
  } catch (error) {
    res.status(404).json({ error: 'Template not found' });
  }
});

export { router as templateRouter };