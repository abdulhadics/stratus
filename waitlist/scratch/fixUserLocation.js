const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'd3monslay3r333@gmail.com' },
    data: {
      ghlLocationId: 'jfoD7cKt3XJ0FObiU5i3',
      ghlApiToken: null // Will fall back to the main GHL_API_TOKEN env var
    }
  });
  console.log('Updated user:', updated.email, '-> Location:', updated.ghlLocationId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
