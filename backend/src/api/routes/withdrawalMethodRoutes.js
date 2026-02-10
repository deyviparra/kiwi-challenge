import { Router } from 'express';
import { getMethods } from '../controllers/withdrawalMethodController.js';

const router = Router();

router.get('/withdrawal-methods', getMethods);

export default router;
