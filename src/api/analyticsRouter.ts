import { Router } from 'express'; 
export const analyticsRouter = Router(); 
analyticsRouter.get('/', (req, res) => res.json({ status: 'ok' })); 
