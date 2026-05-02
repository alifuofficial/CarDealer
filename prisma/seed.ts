import { PrismaClient } from '@prisma/client'
// Removed bcryptjs import to avoid runtime dependency errors in standalone build
// import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Pre-hashed 'password123'
  const passwordHash = '$2b$10$1LiNaXSi505ht7MGvAJlr.Xo7Qf5Zn6cTRzTm4IfGnIy.oP8n9GqG'

  // Create Primary Admin (Requested)
  // Pre-hashed '@myCardealer@303'
  const mainAdminPasswordHash = '$2b$10$/otvIYQ5xQyFtVDKqLuzfOeiltF57FDkEA9v7Raw9tfWOekkuHvtW'
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

  // Create Initial Organization Settings
  await prisma.organization.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      name: 'Alif Soreti Car Dealer',
    },
  })
  console.log('Organization settings seeded!')

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
      name: 'PROFORMA_REMINDER_2_DAYS',
      content: 'Hello [CustomerName], this is a reminder that your proforma [ProformaNumber] will expire in 2 days. Please complete payment to reserve your [CarModel].',
    },
    {
      name: 'PROFORMA_FINAL_DAY',
      content: 'URGENT: Hello [CustomerName], your proforma [ProformaNumber] expires TODAY. Contact Alif Soreti immediately if you wish to proceed.',
    },
    {
      name: 'PROFORMA_PAID',
      content: 'Payment Confirmed! Hello [CustomerName], we have received your payment for proforma [ProformaNumber]. Thank you for choosing Alif Soreti.',
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
