import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { healthRouter } from './routes/health.js';
import { snowflakeRouter } from './routes/snowflakes.js';
import { metricsRouter } from './routes/metrics.js';
import { trackUserSession } from './middleware/analytics.js';
import { initSentry, captureException } from './utils/sentry.js';

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  initSentry(sentryDsn);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);

app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://www.drawasnowflake.ru',
  'http://www.drawasnowflake.ru',
  'https://drawasnowflake.ru',
  'http://drawasnowflake.ru',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (
        origin.includes('drawasnowflake.ru') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(trackUserSession);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

app.use('/api/health', healthRouter);
app.use('/api/snowflakes', snowflakeRouter);
app.use('/api/metrics', metricsRouter);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    captureException(err, { url: req.url, method: req.method });
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  }
);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    const { checkDbHealth, getDbStats } = await import('./utils/dbHealth.js');
    const health = await checkDbHealth();
    const stats = await getDbStats();

    console.log('Database Health Check:');
    console.log(`  Status: ${health.status}`);
    console.log(`  Connected: ${health.connected}`);
    console.log(`  Tables Exist: ${health.tablesExist}`);
    console.log(`  Snowflake Count: ${health.snowflakeCount}`);

    if (stats) {
      console.log('Database Stats:');
      console.log(`  Total Snowflakes: ${stats.totalSnowflakes}`);
      if (stats.oldestSnowflakeDate) {
        console.log(
          `  Oldest Snowflake: ${stats.oldestSnowflakeDate.toISOString()}`
        );
      }
      if (stats.newestSnowflakeDate) {
        console.log(
          `  Newest Snowflake: ${stats.newestSnowflakeDate.toISOString()}`
        );
      }
    }

    if (health.status === 'unhealthy') {
      console.warn(
        'WARNING: Database health check failed. Some features may not work correctly.'
      );
    }
  } catch (error) {
    console.error('Failed to check database health on startup:', error);
  }
});
