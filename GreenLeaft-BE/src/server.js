import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GreenLeaf Shop API',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/products', productsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint không tồn tại' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
});

app.listen(PORT, () => {
  console.log(`🌿 GreenLeaf Server is running at http://localhost:${PORT}`);
  console.log(`🌿 API Endpoint: http://localhost:${PORT}/api/products`);
});
