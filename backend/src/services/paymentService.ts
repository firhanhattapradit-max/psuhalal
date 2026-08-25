import { Pool } from 'pg';
import { RedisClientType } from 'redis';
import * as crypto from 'crypto';
import * as qrcode from 'qrcode';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: 'THB' | 'MYR';
  method: 'promptpay' | 'duitnow' | 'tng'; // Touch 'n Go
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  referenceId: string;
  qrCodeData?: string; // base64 QR code image
  qrCodeString?: string; // raw QR string for display
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  ticketData?: ETicket;
  error?: string;
}

export interface ETicket {
  ticketId: string;
  passengerName: string;
  from: string;
  to: string;
  departureTime: string;
  vehicleType: string;
  routeName: string;
  amount: number;
  currency: string;
  qrCode: string; // base64 QR image data
  validUntil: string;
  isMultiModal: boolean;
  segments?: TicketSegment[];
}

export interface TicketSegment {
  mode: 'van' | 'train' | 'songthaew' | 'ev_shuttle';
  from: string;
  to: string;
  departureTime: string;
}

export interface SadaqahRequest {
  userId: string;
  pointsToConvert: number;
  recipientId: string; // 'mosque_fund' | 'orphan_fund' | 'education_fund'
  donorName: string;
}

export interface SadaqahResult {
  success: boolean;
  donationId: string;
  pointsConverted: number;
  amountTHB: number;
  recipientName: string;
  receiptUrl: string;
  transactionRef: string;
  error?: string;
}

export interface ReceiptData {
  donationId: string;
  donorName: string;
  amountTHB: number;
  pointsConverted: number;
  recipientName: string;
  recipientAccount: string;
  transactionRef: string;
  timestamp: string;
  qrVerificationCode: string;
}

const SADAQAH_RECIPIENTS: Record<string, any> = {
  mosque_fund: { name: 'มัสยิดกลางปัตตานี', account: '123-4-56789-0', nameAr: 'مسجد باتاني المركزي' },
  orphan_fund: { name: 'กองทุนเด็กกำพร้า', account: '234-5-67890-1', nameAr: 'صندوق الأيتام' },
  education_fund: { name: 'ทุนการศึกษา 3 จชต.', account: '345-6-78901-2', nameAr: 'منحة التعليم' },
};

const SECRET_KEY = process.env.PAYMENT_SECRET_KEY || 'default-secret-key-for-hmac';

export class PaymentService {
  private db: Pool;
  private redis: RedisClientType;

  constructor(db: Pool, redis: RedisClientType) {
    this.db = db;
    this.redis = redis;
  }

  public async initiatePayment(req: PaymentRequest): Promise<PaymentResult> {
    try {
      const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const referenceId = `REF-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      
      let qrCodeString = '';
      
      if (req.method === 'promptpay' && req.currency === 'THB') {
        qrCodeString = `00020101021229370016A0000006770101110103004540${req.amount.toFixed(2).replace('.', '')}53037645802TH5914MERC${referenceId}6304`;
      } else if (req.method === 'duitnow' && req.currency === 'MYR') {
        qrCodeString = `00020101021226360014MY.GOV.BNM.DUITNOW011400000000000000520400005303458540${req.amount.toFixed(2).replace('.', '')}5802MY5914MERC${referenceId}6304`;
      } else if (req.method === 'tng') {
        qrCodeString = `https://payment.tngdigital.com.my/v1/payment?ref=${referenceId}&amount=${req.amount}`;
      } else {
        throw new Error('Unsupported payment method and currency combination');
      }

      const qrCodeData = await qrcode.toDataURL(qrCodeString);

      await this.db.query(
        `INSERT INTO payment_transactions (transaction_id, user_id, amount, currency, method, status, reference_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [transactionId, req.userId, req.amount, req.currency, req.method, 'pending', referenceId]
      );

      await this.redis.setEx(`payment:${transactionId}`, 600, JSON.stringify(req));

      return {
        success: true,
        transactionId,
        referenceId,
        qrCodeData,
        qrCodeString,
        amount: req.amount,
        currency: req.currency,
        status: 'pending'
      };
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        referenceId: '',
        amount: req.amount,
        currency: req.currency,
        status: 'failed',
        error: error.message
      };
    }
  }

  public async confirmPayment(transactionId: string): Promise<PaymentResult> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      const txResult = await client.query(
        `UPDATE payment_transactions SET status = 'completed', updated_at = NOW() 
         WHERE transaction_id = $1 AND status = 'pending' RETURNING *`,
        [transactionId]
      );

      if (txResult.rowCount === 0) {
        throw new Error('Transaction not found or already processed');
      }

      const tx = txResult.rows[0];
      
      // Points calculation
      let pointsAwarded = 0;
      if (tx.currency === 'THB') {
        pointsAwarded = Math.floor(tx.amount / 10) * 5;
      } else if (tx.currency === 'MYR') {
        pointsAwarded = Math.floor((tx.amount * 7.5) / 10) * 5; // Mock conversion rate
      }

      if (pointsAwarded > 0) {
        await client.query(
          `INSERT INTO wallet_transactions (user_id, points, type, description, created_at)
           VALUES ($1, $2, 'earned', 'Payment reward', NOW())`,
          [tx.user_id, pointsAwarded]
        );
      }

      const ticketData = await this.generateETicket(transactionId, {
        passengerName: 'Passenger', // Should fetch from user
        from: 'Origin',
        to: 'Destination',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        vehicleType: 'van',
        routeName: 'Default Route',
        amount: tx.amount,
        currency: tx.currency,
        isMultiModal: false
      });

      await client.query('COMMIT');

      return {
        success: true,
        transactionId: tx.transaction_id,
        referenceId: tx.reference_id,
        amount: tx.amount,
        currency: tx.currency,
        status: 'completed',
        ticketData
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async generateETicket(transactionId: string, journeyDetails: Partial<ETicket>): Promise<ETicket> {
    const ticketId = \`TKT-\${Date.now()}-\${crypto.randomBytes(4).toString('hex').toUpperCase()}\`;
    const validUntil = new Date(Date.now() + 86400000).toISOString(); // 24 hours
    
    const payload = JSON.stringify({ ticketId, transactionId, validUntil });
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    
    const qrPayload = JSON.stringify({ ...JSON.parse(payload), signature });
    const qrCode = await qrcode.toDataURL(qrPayload);

    const ticket: ETicket = {
      ticketId,
      passengerName: journeyDetails.passengerName || 'Unknown',
      from: journeyDetails.from || 'Unknown',
      to: journeyDetails.to || 'Unknown',
      departureTime: journeyDetails.departureTime || new Date().toISOString(),
      vehicleType: journeyDetails.vehicleType || 'Unknown',
      routeName: journeyDetails.routeName || 'Unknown',
      amount: journeyDetails.amount || 0,
      currency: journeyDetails.currency || 'THB',
      qrCode,
      validUntil,
      isMultiModal: journeyDetails.isMultiModal || false,
      segments: journeyDetails.segments
    };

    await this.redis.setEx(\`ticket:\${ticketId}\`, 86400, JSON.stringify(ticket));

    return ticket;
  }

  public async validateTicket(ticketId: string, qrData: string): Promise<{ isValid: boolean; ticket?: ETicket; reason?: string }> {
    try {
      const parsedData = JSON.parse(qrData);
      
      const payload = JSON.stringify({ ticketId: parsedData.ticketId, transactionId: parsedData.transactionId, validUntil: parsedData.validUntil });
      const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
      
      if (parsedData.signature !== expectedSignature) {
        return { isValid: false, reason: 'Invalid signature' };
      }

      if (new Date(parsedData.validUntil) < new Date()) {
        return { isValid: false, reason: 'Ticket expired' };
      }

      const isUsed = await this.redis.get(\`ticket:used:\${ticketId}\`);
      if (isUsed) {
        return { isValid: false, reason: 'Ticket already used' };
      }

      const ticketStr = await this.redis.get(\`ticket:\${ticketId}\`);
      if (!ticketStr) {
        return { isValid: false, reason: 'Ticket not found' };
      }

      await this.redis.setEx(\`ticket:used:\${ticketId}\`, 86400, '1');

      return { isValid: true, ticket: JSON.parse(ticketStr) };
    } catch (e: any) {
      return { isValid: false, reason: 'Invalid QR format' };
    }
  }

  public async processSadaqah(req: SadaqahRequest): Promise<SadaqahResult> {
    if (req.pointsToConvert < 100) {
      throw new Error('Minimum conversion is 100 points');
    }

    const amountTHB = req.pointsToConvert * 0.1;
    const recipient = SADAQAH_RECIPIENTS[req.recipientId];
    
    if (!recipient) {
      throw new Error('Invalid recipient');
    }

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      // Assuming a users table or wallet_balance table
      // Mocking check for points:
      const userRes = await client.query('SELECT SUM(points) as balance FROM wallet_transactions WHERE user_id = $1', [req.userId]);
      const balance = parseInt(userRes.rows[0]?.balance || '0');
      
      if (balance < req.pointsToConvert) {
        throw new Error('Insufficient points');
      }

      await client.query(
        \`INSERT INTO wallet_transactions (user_id, points, type, description, created_at)
         VALUES ($1, $2, 'redeemed', 'Sadaqah donation', NOW())\`,
        [req.userId, -req.pointsToConvert]
      );

      const donationId = \`DON-\${Date.now()}-\${crypto.randomBytes(3).toString('hex').toUpperCase()}\`;
      const transactionRef = \`SADQ-\${crypto.randomBytes(4).toString('hex').toUpperCase()}\`;

      await client.query(
        \`INSERT INTO sadaqah_donations (donation_id, user_id, recipient_id, points_converted, amount_thb, transaction_ref, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())\`,
        [donationId, req.userId, req.recipientId, req.pointsToConvert, amountTHB, transactionRef]
      );

      const receiptData: ReceiptData = {
        donationId,
        donorName: req.donorName,
        amountTHB,
        pointsConverted: req.pointsToConvert,
        recipientName: recipient.name,
        recipientAccount: recipient.account,
        transactionRef,
        timestamp: new Date().toISOString(),
        qrVerificationCode: JSON.stringify({ donationId, transactionRef })
      };

      const receiptUrl = await this.generateReceiptPDF(receiptData);

      await client.query('COMMIT');

      return {
        success: true,
        donationId,
        pointsConverted: req.pointsToConvert,
        amountTHB,
        recipientName: recipient.name,
        receiptUrl,
        transactionRef
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      return {
        success: false,
        donationId: '',
        pointsConverted: 0,
        amountTHB: 0,
        recipientName: '',
        receiptUrl: '',
        transactionRef: '',
        error: error.message
      };
    } finally {
      client.release();
    }
  }

  private async generateReceiptPDF(data: ReceiptData): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const fileName = \`\${data.donationId}.pdf\`;
        const filePath = path.join(uploadDir, fileName);
        
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        
        // Border
        doc.rect(20, 20, 555, 802).lineWidth(2).stroke('#006400');
        
        // Header
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#006400').text('بسم الله الرحمن الرحيم', { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).fillColor('#000000').text('Sadaqah Receipt', { align: 'center' });
        doc.moveDown();
        
        // Content
        doc.font('Helvetica').fontSize(12);
        doc.text(\`Donation ID: \${data.donationId}\`);
        doc.text(\`Date: \${new Date(data.timestamp).toLocaleString()}\`);
        doc.text(\`Transaction Ref: \${data.transactionRef}\`);
        doc.moveDown();
        
        doc.text(\`Donor: \${data.donorName}\`);
        doc.text(\`Recipient: \${data.recipientName}\`);
        doc.text(\`Account: \${data.recipientAccount}\`);
        doc.moveDown();
        
        // Amount Box
        doc.rect(50, doc.y, 495, 60).fill('#e8f5e9').stroke();
        doc.fillColor('#006400').font('Helvetica-Bold').fontSize(16).text(\`Amount: \${data.amountTHB.toFixed(2)} THB\`, 70, doc.y - 45);
        doc.fontSize(12).text(\`(Converted from \${data.pointsConverted} Points)\`, 70, doc.y + 5);
        
        doc.moveDown(4);
        
        // QR Code
        const qrImgData = await qrcode.toDataURL(data.qrVerificationCode);
        const qrBuffer = Buffer.from(qrImgData.split(',')[1], 'base64');
        doc.image(qrBuffer, 245, doc.y, { width: 100 });
        
        doc.moveDown(6);
        doc.font('Helvetica-Oblique').fillColor('#555555').text('May Allah accept your charity and reward you abundantly.', { align: 'center' });
        
        doc.end();
        
        stream.on('finish', () => {
          resolve(\`/uploads/receipts/\${fileName}\`);
        });
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  public async getTransactionHistory(userId: string, limit: number = 20): Promise<PaymentResult[]> {
    const res = await this.db.query(
      \`SELECT * FROM payment_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2\`,
      [userId, limit]
    );
    
    return res.rows.map(row => ({
      success: true,
      transactionId: row.transaction_id,
      referenceId: row.reference_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status
    }));
  }
}
