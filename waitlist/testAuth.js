import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const envConfig = fs.readFileSync('.env.local', 'utf-8');
envConfig.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'u1@stratusystems.co' } });
  if (!user) {
    console.log("User not found!");
    return;
  }
  const isValid = await bcrypt.compare('password123', user.passwordHash);
  console.log("Password is valid:", isValid);
}

main().catch(console.error).finally(() => prisma.$disconnect());
