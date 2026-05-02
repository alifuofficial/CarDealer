import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create Primary Admin (Requested)
  const mainAdminPasswordHash = await bcrypt.hash('@myCardealer@303', 10)
  await prisma.user.upsert({
    where: { email: 'alifuhaji@gmail.com' },
    update: {},
    create: {
      email: 'alifuhaji@gmail.com',
      name: 'Alifu Haji',
      password: mainAdminPasswordHash,
      role: 'ADMIN',
    },
  })

  // Create System Admin
  await prisma.user.upsert({
    where: { email: 'admin@cardealer.local' },
    update: {},
    create: {
      email: 'admin@cardealer.local',
      name: 'System Admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  // Create Demo Admin
  await prisma.user.upsert({
    where: { email: 'demo@cardealer.com' },
    update: {},
    create: {
      email: 'demo@cardealer.com',
      name: 'Demo Admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  // Create Seller
  await prisma.user.upsert({
    where: { email: 'seller@cardealer.local' },
    update: {},
    create: {
      email: 'seller@cardealer.local',
      name: 'Ali Seller',
      password: passwordHash,
      role: 'SELLER',
    },
  })

  // Create Default SMS Templates
  const templates = [
    {
      name: 'PROFORMA_CREATED',
      content: 'Hello [CustomerName], your proforma [ProformaNumber] for [CarModel] is ready. Total: [Amount] ETB. Valid until [ExpiryDate].',
    },
    {
      name: 'MARKETING_HOLIDAY',
      content: 'Eid Mubarak! Visit Alif Soreti for exclusive holiday discounts on all [Year] models. Limited time offer!',
    },
    {
      name: 'MARKETING_NEW_STOCK',
      content: 'New Stock Alert! We just received [CarModel] at Alif Soreti. Come for a test drive today.',
    },
  ];

  for (const template of templates) {
    await prisma.smsTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    });
  }

  console.log('SMS templates seeded successfully!')

  console.log('Database seeded successfully!')

  // Add a sample Proforma if inventory exists
  const firstCar = await prisma.carUnit.findFirst();
  const firstCustomer = await prisma.customer.findFirst();
  const demoAdmin = await prisma.user.findUnique({ where: { email: 'demo@cardealer.com' } });

  if (firstCar && firstCustomer && demoAdmin) {
    await prisma.proforma.upsert({
      where: { number: 'PF-2024-001' },
      update: {},
      create: {
        number: 'PF-2024-001',
        customerId: firstCustomer.id,
        carUnitId: firstCar.id,
        amount: 25000,
        status: 'SENT',
        createdById: demoAdmin.id,
      },
    });
    console.log('Sample proforma created!');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
