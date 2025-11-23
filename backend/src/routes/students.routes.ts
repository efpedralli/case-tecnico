import { Router } from 'express';
import { prisma } from '../prisma';
import { ensureAuthenticated } from '../middleware/auth';
import bcrypt from 'bcryptjs';


export const studentsRouter = Router();

studentsRouter.use(ensureAuthenticated);

// GET /api/students
studentsRouter.get('/', async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
       where: { deletedAt: null },
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
    const student = await prisma.student.findUnique({ 
      where: { id, deletedAt: null } 
    });
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
    const { name, registration, email, course } = req.body;

    if (!name || !registration) {
      return res.status(400).json({ message: 'Nome e matrícula são obrigatórios.' });
    }

    const passwordHash = await bcrypt.hash(registration, 10);

    const student = await prisma.student.create({
      data: {
        name,
        registration,
        email,
        passwordHash,
        course,
      },
    });

    return res.status(201).json(
      { id: student.id, name: student.name, registration: student.registration, email: student.email, course: student.course, createdAt: student.createdAt }
    );

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
    const { name, registration, email, course, password } = req.body;



    const student = await prisma.student.update({
      where: { id },
      data: { 
        name, 
        registration, 
        email, 
        course,
        passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
        updatedAt: new Date(),
       },
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

    const updated = await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return res.status(200).json({ message: 'Aluno arquivado com sucesso.' });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao arquivar aluno.' });
  }
});


// POST /api/students/bulk
studentsRouter.post('/bulk', async (req, res) => {
  try {
    const { students } = req.body as {
      students: Array<{
        name: string;
        registration?: string | null;
        email?: string | null;
        course?: string | null;
      }>;
    };

    if (!Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ message: 'Lista de estudantes é obrigatória.' });
    }

    const data = await Promise.all(
      students.map(async (s) => {
        const registration = s.registration?.toString().trim() || '';
        const passwordHash = registration
          ? await bcrypt.hash(registration, 10)
          : null;

        return {
          name: s.name,
          registration: registration || null,
          email: s.email || null,
          passwordHash,
          course: s.course || null,
        };
      })
    );

    const result = await prisma.student.createMany({
      data,
      skipDuplicates: true,
    });

    return res.status(201).json({
      inserted: result.count,
      totalReceived: students.length,
      message:
        'Importação concluída. Registros duplicados foram ignorados (com base em matrícula/e-mail).',
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Erro ao importar alunos em massa.' });
  }
});