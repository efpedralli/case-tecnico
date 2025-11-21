import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureStudentAuthenticated, StudentAuthRequest } from '../middleware/studentAuth';

export const studentHistoryRouter = Router();

studentHistoryRouter.use(ensureStudentAuthenticated);

studentHistoryRouter.get('/history', async (req: StudentAuthRequest, res) => {
  const studentId = req.studentId!;

  const entries = await prisma.entry.findMany({
    where: { studentId },
    orderBy: { checkInAt: 'desc' },
    include: {
      environment: true
    }
  });

  return res.json(entries);
});
