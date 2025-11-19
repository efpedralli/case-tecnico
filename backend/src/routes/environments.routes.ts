import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureAuthenticated } from '../middleware/auth';

export const environmentsRouter = Router();

environmentsRouter.use(ensureAuthenticated);

// GET /api/environments
environmentsRouter.get('/', async (_req, res) => {
  try {
    const environments = await prisma.environment.findMany({
      orderBy: { id: 'asc' },
    });
    return res.json(environments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar ambientes.' });
  }
});

// opcional: criar novos ambientes
environmentsRouter.post('/', async (req, res) => {
  try {
    const { name, type, capacity } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name e type são obrigatórios.' });
    }

    const env = await prisma.environment.create({
      data: { name, type, capacity },
    });

    return res.status(201).json(env);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar ambiente.' });
  }
});
