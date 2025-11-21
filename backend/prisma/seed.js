// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Admin default
  const adminEmail = 'admin@case.com';
  const adminPassword = '123456';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      passwordHash,
    },
  });

  console.log('Usuário admin:', adminEmail, '/', adminPassword);

  // Ambientes padrão
  const environmentsData = [
    { name: 'Sala 101', type: 'sala', capacity: 40 },
    { name: 'Lab Informática', type: 'laboratorio', capacity: 25 },
    { name: 'Sala de Estudos 01', type: 'estudos', capacity: 10 },
  ];

  // createMany + skipDuplicates resolve o seed sem depender de unique
  await prisma.environment.createMany({
    data: environmentsData,
    skipDuplicates: true,
  });

  console.log('Ambientes padrão criados (ou já existiam)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed finalizado.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
