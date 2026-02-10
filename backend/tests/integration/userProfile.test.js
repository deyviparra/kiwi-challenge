import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestDatabase, seedTestDatabase } from '../fixtures/testDb.js';
import userRoutes from '../../src/api/routes/userRoutes.js';
import { errorHandler } from '../../src/api/middleware/errorHandler.js';

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.db = db;
    req.id = 'test-req-id';
    next();
  });
  app.use('/api/user', userRoutes);
  app.use(errorHandler);
  return app;
}

describe('GET /api/user/profile', () => {
  let app, db;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    app = createApp(db);
  });

  it('returns 200 with user profile and balance', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('John Doe');
    expect(res.body.data.user.balance).toBe(121.25);
  });
});
