import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestLogger } from './middleware/logger.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitAuth } from './middleware/rate-limit.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import workspaceRoutes from './routes/workspaces.js';
import loopRoutes from './routes/loops.js';
import sessionRoutes from './routes/sessions.js';
import featureRoutes from './routes/features.js';
import eventRoutes from './routes/events.js';
import kaiRoutes from './routes/kai.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import onboardingRoutes from './routes/onboarding.js';

const app = new Hono();

// CORS — aceitar requisições do hub
app.use(
  '/api/*',
  cors({
    origin: [
      `http://localhost:${process.env.HUB_PORT || '8100'}`,
      'http://localhost:8100',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Logger
app.use('*', requestLogger);

// Rate limiting nas rotas de auth
app.use('/api/auth/*', rateLimitAuth);

// Auth middleware (global, exceto rotas públicas)
app.use('/api/*', authMiddleware);

// Health check
app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// Rotas de autenticação
app.route('/api/auth', authRoutes);

// Rotas de projetos, workspaces, loop, sessões e features
app.route('/api/projects', projectRoutes);
app.route('/api/projects', workspaceRoutes);
app.route('/api/projects', loopRoutes);
app.route('/api/projects', sessionRoutes);
app.route('/api/projects', featureRoutes);

// SSE — eventos em tempo real
app.route('/api/events', eventRoutes);

// Kai — copilot agentico
app.route('/api/kai', kaiRoutes);

// Notificações
app.route('/api/notifications', notificationRoutes);

// Configurações
app.route('/api/settings', settingsRoutes);

// Onboarding
app.route('/api/onboarding', onboardingRoutes);

export default app;
