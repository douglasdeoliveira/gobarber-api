import * as Sentry from '@sentry/node';
import cors from 'cors';
import express from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { resolve } from 'path';
import RateLimitRedis from 'rate-limit-redis';
import redis from 'redis';
import Youch from 'youch';

import 'dotenv/config';
import 'express-async-errors';

import './database';
import redisConfig from './config/redis';
import sentryConfig from './config/sentry';
import routes from './routes';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    const corsOptions = {
      origin: 'https://gobarber.douglasdeoliveira.dev',
      optionsSuccessStatus: 200,
    };

    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(helmet());
    this.server.use(cors(corsOptions));
    this.server.use(express.json());

    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );

    if (process.env.NODE_ENV !== 'development') {
      const { port, host, password } = redisConfig;
      const redisClient = redis.createClient(port, host);
      redisClient.auth(password);

      this.server.use(
        new RateLimit({
          store: new RateLimitRedis({
            client: redisClient,
          }),
          windowMs: 1000 * 60 * 15,
          max: 100,
        })
      );
    }
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        res.status(500).json(errors);
      }

      res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
