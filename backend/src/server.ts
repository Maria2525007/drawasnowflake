import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './routes/health';
import { snowflakeRouter } from './routes/snowflakes';
import { initSentry, captureException } from './utils/sentry';

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  initSentry(sentryDsn);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

app.use('/api/health', healthRouter);
app.use('/api/snowflakes', snowflakeRouter);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
