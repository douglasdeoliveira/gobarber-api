import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.save);
routes.post('/sessions', SessionController.save);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
