import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';

const app  = express();
const PORT = 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.set('trust proxy', 1);

app.use('/api', routes);
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\\n🔐 Backend running → http://localhost:${PORT}`);
  console.log(`\\n👤 Admin login: admin@example.com / Admin@123456`);
  console.log(`📬 Dev emails:  http://localhost:${PORT}/api/dev/emails\\n`);
});