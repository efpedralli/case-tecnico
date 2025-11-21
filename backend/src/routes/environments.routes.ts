import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureAuthenticated } from '../middleware/auth';
import QRCode from 'qrcode';


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

environmentsRouter.post('/', async (req, res) => {
  try {
    const { name, type, capacity, block } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name e type são obrigatórios.' });
    }

    const env = await prisma.environment.create({
      data: { name, type, capacity, block },
    });

    return res.status(201).json(env);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar ambiente.' });
  }
});

// GET /api/environments/:id
environmentsRouter.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const env = await prisma.environment.findUnique({
      where: { id },
    });

    if (!env) {
      return res.status(404).json({ message: 'Ambiente não encontrado.' });
    }

    return res.json(env);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar ambiente.' });
  }
});

// GET /api/environments/:id/qrcode
environmentsRouter.get('/:id/qrcode', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const env = await prisma.environment.findUnique({
      where: { id },
    });

    if (!env) {
      return res.status(404).json({ message: 'Ambiente não encontrado.' });
    }

    const qrText = `envId=${env.id}`;

    const pngBuffer = await QRCode.toBuffer(qrText, {
      type: 'png',
      margin: 1,
      width: 300,
    });

    res.setHeader('Content-Type', 'image/png');
    return res.send(pngBuffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao gerar QR Code.' });
  }
});

