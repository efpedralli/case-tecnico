import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureAuthenticated } from '../middleware/auth';

export const entriesRouter = Router();

entriesRouter.use(ensureAuthenticated);

// POST /api/entries/checkin
entriesRouter.post('/checkin', async (req, res) => {
  try {
    const { studentId, environmentId } = req.body;

    if (!studentId || !environmentId) {
      return res.status(400).json({ message: 'studentId e environmentId são obrigatórios.' });
    }

    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student) return res.status(404).json({ message: 'Aluno não encontrado.' });

    const environment = await prisma.environment.findUnique({ where: { id: Number(environmentId) } });
    if (!environment) return res.status(404).json({ message: 'Ambiente não encontrado.' });

    const openEntry = await prisma.entry.findFirst({
      where: { studentId: Number(studentId), checkOutAt: null },
    });

    if (openEntry) {
      return res.status(400).json({ message: 'Este aluno já está com presença aberta em um ambiente.' });
    }

    const entry = await prisma.entry.create({
      data: {
        studentId: Number(studentId),
        environmentId: Number(environmentId),
      },
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao registrar entrada.' });
  }
});

// POST /api/entries/checkout
entriesRouter.post('/checkout', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId é obrigatório.' });
    }

    const openEntry = await prisma.entry.findFirst({
      where: { studentId: Number(studentId), checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    });

    if (!openEntry) {
      return res.status(400).json({ message: 'Não há presença em aberto para este aluno.' });
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

// GET /api/entries/occupancy
entriesRouter.get('/occupancy', async (_req, res) => {
  try {
    const environments = await prisma.environment.findMany({
      orderBy: { id: 'asc' },
      include: {
        entries: {
          where: { checkOutAt: null },
        },
      },
    });

    const result = environments.map(env => ({
      environmentId: env.id,
      name: env.name,
      type: env.type,
      currentOccupancy: env.entries.length,
    }));

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao calcular ocupação.' });
  }
});
