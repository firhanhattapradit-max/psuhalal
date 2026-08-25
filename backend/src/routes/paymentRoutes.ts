import { Router, Request, Response } from 'express';
import { PaymentService, PaymentRequest, SadaqahRequest } from '../services/paymentService';
import { Pool } from 'pg';
import { createClient } from 'redis';
import * as path from 'path';
import * as fs from 'fs';

// Mock DB and Redis for Router setup (in a real app, injected via DI or a singleton)
const db = new Pool({ /* connect config */ });
const redis = createClient();
redis.connect().catch(console.error);

const paymentService = new PaymentService(db, redis as any);
const router = Router();

// Mock JWT Middleware
const authMiddleware = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Simplified mock auth
  (req as any).user = { id: 'USER-123' };
  next();
};

router.use(authMiddleware);

router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const paymentRequest: PaymentRequest = { ...req.body, userId };
    
    if (!paymentRequest.amount || !paymentRequest.currency || !paymentRequest.method) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    const result = await paymentService.initiatePayment(paymentRequest);
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/confirm/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const result = await paymentService.confirmPayment(transactionId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/ticket/:ticketId/validate', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { qrData } = req.query;
    
    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ error: 'Missing qrData query parameter' });
    }
    
    const result = await paymentService.validateTicket(ticketId, qrData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sadaqah', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const sadaqahRequest: SadaqahRequest = { ...req.body, userId };
    
    if (!sadaqahRequest.pointsToConvert || !sadaqahRequest.recipientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await paymentService.processSadaqah(sadaqahRequest);
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const history = await paymentService.getTransactionHistory(userId, limit);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Assuming no auth required for downloading receipt directly if they have URL, or could keep it protected
router.get('/receipts/:donationId', (req: Request, res: Response) => {
  try {
    const { donationId } = req.params;
    // Basic sanitize
    const sanitizedId = path.basename(donationId);
    const filePath = path.join(process.cwd(), 'uploads', 'receipts', \`\${sanitizedId}.pdf\`);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Receipt not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
