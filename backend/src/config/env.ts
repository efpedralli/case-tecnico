import 'dotenv/config';

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 3333,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
};
