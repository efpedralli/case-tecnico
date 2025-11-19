import { Router } from 'express';
import { authRouter } from './auth.routes';
import { studentsRouter } from './students.routes';
import { environmentsRouter } from './environments.routes';
import { entriesRouter } from './entries.routes';

export const router = Router();

router.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/students', studentsRouter);
router.use('/environments', environmentsRouter);
router.use('/entries', entriesRouter);
