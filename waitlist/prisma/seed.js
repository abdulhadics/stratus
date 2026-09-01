const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Str@tusGHL@97', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'hax2730@gmail.com' },
    update: {},
    create: {
      email: 'hax2730@gmail.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const entrepreneurPassword = await bcrypt.hash('password123', 10);
  
  const entrepreneurUser = await prisma.user.upsert({
    where: { email: 'u1@stratusystems.co' },
    update: {},
    create: {
      email: 'u1@stratusystems.co',
      name: 'Test Entrepreneur',
      passwordHash: entrepreneurPassword,
      role: 'USER',
      ghlLocationId: 'jfoD7cKt3XJ0FObiU5i3', // The default one from .env.local
    },
  });

  console.log('Database seeded:', { adminUser, entrepreneurUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
