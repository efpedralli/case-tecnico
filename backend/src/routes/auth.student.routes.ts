import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { env } from '../config/env';

export const studentAuthRouter = Router();

studentAuthRouter.post('/student-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student || !student.passwordHash) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const valid = await bcrypt.compare(password, student.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      {
        sub: student.id,
        type: 'student',
      },
      env.jwtSecret,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        registration: student.registration,
        email: student.email,
        course: student.course,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Erro ao fazer login do aluno.' });
  }
});

