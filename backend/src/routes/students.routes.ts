import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureAuthenticated } from '../middleware/auth';

export const studentsRouter = Router();

// protege todas as rotas abaixo
studentsRouter.use(ensureAuthenticated);

// GET /api/students
studentsRouter.get('/', async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(students);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar alunos.' });
  }
});

// GET /api/students/:id
studentsRouter.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: 'Aluno não encontrado.' });
    return res.json(student);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar aluno.' });
  }
});

// POST /api/students
studentsRouter.post('/', async (req, res) => {
  try {
    const { name, registration, email } = req.body;

    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });

    const student = await prisma.student.create({
      data: { name, registration, email },
    });

    return res.status(201).json(student);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Registro ou e-mail já cadastrado para outro aluno.' });
    }
    return res.status(500).json({ message: 'Erro ao criar aluno.' });
  }
});

// PUT /api/students/:id
studentsRouter.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, registration, email } = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: { name, registration, email },
    });

    return res.json(student);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao atualizar aluno.' });
  }
});

// DELETE /api/students/:id
studentsRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.student.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao remover aluno.' });
  }
});
