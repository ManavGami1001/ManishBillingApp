import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const tenant = await prisma.tenant.upsert({
    where: { id: 'seed-tenant-1' },
    update: {},
    create: {
      id: 'seed-tenant-1',
      name: 'Acme Supermart',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log({ tenant, admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
