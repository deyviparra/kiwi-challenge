import { Router } from 'express';
import { createWithdrawal } from '../controllers/withdrawalController.js';

const router = Router();

router.post('/withdrawals', createWithdrawal);

export default router;
