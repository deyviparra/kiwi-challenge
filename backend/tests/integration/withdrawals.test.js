import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestDatabase, seedTestDatabase } from '../fixtures/testDb.js';
import withdrawalRoutes from '../../src/api/routes/withdrawalRoutes.js';
import withdrawalMethodRoutes from '../../src/api/routes/withdrawalMethodRoutes.js';
import { errorHandler } from '../../src/api/middleware/errorHandler.js';

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.db = db;
    req.id = 'test-req-id';
    next();
  });
  app.use('/api', withdrawalRoutes);
  app.use('/api', withdrawalMethodRoutes);
  app.use(errorHandler);
  return app;
}

describe('Withdrawal API', () => {
  let app, db;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    app = createApp(db);
  });

  describe('GET /api/withdrawal-methods', () => {
    it('returns masked account numbers', async () => {
      const res = await request(app).get('/api/withdrawal-methods');
      expect(res.status).toBe(200);
      expect(res.body.data.methods).toHaveLength(2);
      expect(res.body.data.methods[0].account_number).toMatch(/^\*{4}\d{4}$/);
    });
  });

  describe('POST /api/withdrawals', () => {
    it('returns 201 on successful withdrawal', async () => {
      const res = await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 50 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.withdrawal.amount).toBe(50);
      expect(res.body.data.new_balance).toBe(71.25);
      expect(res.body.message).toBe('Withdrawal completed successfully');
    });

    it('returns 422 on insufficient balance', async () => {
      const res = await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 500 });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('INSUFFICIENT_BALANCE');
      expect(res.body.error.details.requested).toBe(500);
    });

    it('returns 400 on missing method_id', async () => {
      const res = await request(app)
        .post('/api/withdrawals')
        .send({ amount: 10 });

      expect(res.status).toBe(400);
    });

    it('returns 404 on unknown method_id', async () => {
      const res = await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 999, amount: 10 });

      expect(res.status).toBe(404);
    });

    it('returns 409 on duplicate withdrawal of same amount within 5 minutes', async () => {
      await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 25 });

      const res = await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 25 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('DUPLICATE_WITHDRAWAL');
      expect(res.body.error.details.allow_override).toBe(true);
    });

    it('allows duplicate override with override_duplicate_check flag', async () => {
      await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 25 });

      const res = await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 25, override_duplicate_check: true });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('does not flag duplicate for different amounts', async () => {
      await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 25 });

      const res = await request(app)
        .post('/api/withdrawals')
        .send({ method_id: 1, amount: 30 });

      expect(res.status).toBe(201);
    });
  });
});
