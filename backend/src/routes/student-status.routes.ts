import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureStudentAuthenticated, StudentAuthRequest } from '../middleware/studentAuth';

export const studentStatusRouter = Router();

studentStatusRouter.use(ensureStudentAuthenticated);

studentStatusRouter.get('/status', async (req: StudentAuthRequest, res) => {
  const studentId = req.studentId!;

  const openEntry = await prisma.entry.findFirst({
    where: { studentId, checkOutAt: null }
  });

  return res.json({
    inEnvironmentId: openEntry ? openEntry.environmentId : null
  });
});
