// src/routes/student-entries.routes.ts
import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureStudentAuthenticated, StudentAuthRequest } from '../middleware/studentAuth';

export const studentEntriesRouter = Router();

studentEntriesRouter.use(ensureStudentAuthenticated);

// POST /api/student/entries/checkin
studentEntriesRouter.post('/checkin', async (req: StudentAuthRequest, res) => {
  try {
    const { environmentId } = req.body;
    const studentId = req.studentId!;

    if (!environmentId) {
      return res.status(400).json({ message: 'environmentId é obrigatório.' });
    }

    const environment = await prisma.environment.findUnique({
      where: { id: Number(environmentId) },
    });
    if (!environment) {
      return res.status(404).json({ message: 'Ambiente não encontrado.' });
    }

    const openEntry = await prisma.entry.findFirst({
      where: { studentId, checkOutAt: null },
    });

    if (openEntry) {
      return res.status(400).json({ message: 'Você já está com presença aberta em um ambiente.' });
    }

    const entry = await prisma.entry.create({
      data: {
        studentId,
        environmentId: Number(environmentId),
      },
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao registrar entrada.' });
  }
});

// POST /api/student/entries/checkout
studentEntriesRouter.post('/checkout', async (req: StudentAuthRequest, res) => {
  try {
    const studentId = req.studentId!;

    const openEntry = await prisma.entry.findFirst({
      where: { studentId, checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    });

    if (!openEntry) {
      return res.status(400).json({ message: 'Você não possui presença em aberto.' });
    }

    const updated = await prisma.entry.update({
      where: { id: openEntry.id },
      data: { checkOutAt: new Date() },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao registrar saída.' });
  }
});
