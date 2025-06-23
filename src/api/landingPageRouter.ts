import { Router } from 'express'; 
export const landingPageRouter = Router(); 
landingPageRouter.get('/', (req, res) => res.json({ status: 'ok' })); 
