import { Router } from 'express';
import { snowflakeController } from '../controllers/snowflakeController.js';

export const snowflakeRouter = Router();

snowflakeRouter.get('/', snowflakeController.getAll);
snowflakeRouter.post('/', snowflakeController.create);
snowflakeRouter.get('/:id', snowflakeController.getById);
snowflakeRouter.put('/:id', snowflakeController.update);
snowflakeRouter.delete('/:id', snowflakeController.delete);
