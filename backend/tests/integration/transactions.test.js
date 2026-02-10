import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestDatabase, seedTestDatabase } from '../fixtures/testDb.js';
import transactionRoutes from '../../src/api/routes/transactionRoutes.js';
import { errorHandler } from '../../src/api/middleware/errorHandler.js';

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.db = db;
    req.id = 'test-req-id';
    next();
  });
  app.use('/api', transactionRoutes);
  app.use(errorHandler);
  return app;
}

describe('GET /api/transactions', () => {
  let app, db;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    app = createApp(db);
  });

  it('returns 200 with transactions and balance', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions).toHaveLength(6);
    expect(res.body.data.total).toBe(6);
    expect(res.body.data.balance).toBe(121.25);
  });

  it('respects limit and offset', async () => {
    const res = await request(app).get('/api/transactions?limit=2&offset=1');
    expect(res.status).toBe(200);
    expect(res.body.data.transactions).toHaveLength(2);
  });

  it('filters by type', async () => {
    const res = await request(app).get('/api/transactions?type=cashback');
    expect(res.status).toBe(200);
    expect(res.body.data.transactions).toHaveLength(3);
    res.body.data.transactions.forEach((t) => expect(t.type).toBe('cashback'));
  });

  it('returns 400 for invalid type', async () => {
    const res = await request(app).get('/api/transactions?type=invalid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
