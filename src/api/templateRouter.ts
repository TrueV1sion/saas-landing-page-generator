import { Router } from 'express'; 
export const templateRouter = Router(); 
templateRouter.get('/', (req, res) => res.json({ status: 'ok' })); 
