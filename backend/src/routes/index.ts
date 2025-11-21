import { Router } from 'express';
import { authRouter } from './auth.routes';
import { studentsRouter } from './students.routes';
import { environmentsRouter } from './environments.routes';
import { entriesRouter } from './entries.routes';
import { studentEntriesRouter } from './student-entries.routes';
import { studentAuthRouter } from './auth.student.routes';
import { studentStatusRouter } from './student-status.routes';
import { studentHistoryRouter } from './student-history.routes';

export const router = Router();

router.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/students', studentsRouter);
router.use('/environments', environmentsRouter);
router.use('/entries', entriesRouter);
router.use('/student/entries', studentEntriesRouter);
router.use('/auth/student', studentAuthRouter);
router.use('/student/entries', studentStatusRouter);
router.use('/student/entries', studentHistoryRouter);

