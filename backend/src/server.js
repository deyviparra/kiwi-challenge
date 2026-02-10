import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from './api/middleware/errorHandler.js';
import { getDatabase } from './db/database.js';
import { runMigrations } from './db/migrate.js';
import userRoutes from './api/routes/userRoutes.js';
import transactionRoutes from './api/routes/transactionRoutes.js';
import withdrawalMethodRoutes from './api/routes/withdrawalMethodRoutes.js';
import withdrawalRoutes from './api/routes/withdrawalRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request ID middleware
app.use((req, _res, next) => {
  req.id = uuidv4();
  next();
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api', transactionRoutes);
app.use('/api', withdrawalMethodRoutes);
app.use('/api', withdrawalRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server (only when run directly, not during tests)
if (process.env.NODE_ENV !== 'test') {
  const db = getDatabase();
  runMigrations(db);
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
