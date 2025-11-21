// src/middleware/studentAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtStudentPayload {
  sub: number;
  type: 'student';
  iat: number;
  exp: number;
}

export interface StudentAuthRequest extends Request {
  studentId?: number;
}

export function ensureStudentAuthenticated(
  req: StudentAuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtStudentPayload;

    if (decoded.type !== 'student') {
      return res.status(403).json({ message: 'Somente alunos podem acessar esta rota.' });
    }

    req.studentId = Number(decoded.sub);
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}
