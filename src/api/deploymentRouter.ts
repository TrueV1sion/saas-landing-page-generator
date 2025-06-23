import { Router } from 'express'; 
export const deploymentRouter = Router(); 
deploymentRouter.get('/', (req, res) => res.json({ status: 'ok' })); 
