require('dotenv').config();
const env = require('./config');        // validates all env vars on startup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const path = require('path');
const logger = require('./logger');
const { errorHandler } = require('./middleware/errorHandler');
const { sanitiseBody } = require('./middleware/sanitise');

const app = express();

// ── Security headers ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // Vite needs inline scripts
      styleSrc:  ["'self'", "'unsafe-inline'"],
      imgSrc:    ["'self'", 'data:'],
    }
  }
}));

// ── CORS ────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? env.FRONTEND_URL
    : [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));

// ── Request logging ─────────────────────────────────────────────────
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));

// ── Body parsing + sanitisation ──────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(sanitiseBody);

// ── Rate limiting ────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 20,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 min
  max: 300,
  message: { error: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);

// ── API routes ───────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/schools',    require('./routes/schools'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/classes',    require('./routes/classes'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/behaviour',  require('./routes/behaviour'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/sms',        require('./routes/sms'));
app.use('/api/export',     require('./routes/export'));
app.use('/api/terms',      require('./routes/terms'));
app.use('/api/parent',     require('./routes/parent'));

// ── Health check (deep) ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const db = require('./db');
  try {
    const { c } = db.prepare('SELECT COUNT(*) as c FROM schools').get();
    res.json({ status: 'ok', schools: c, ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unreachable' });
  }
});

// ── Serve built frontend in production ───────────────────────────────
if (env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(dist, { maxAge: '1d' }));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// ── Error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => logger.info(`🇯🇲 Jamaica School Platform on port ${PORT} [${env.NODE_ENV}]`));
