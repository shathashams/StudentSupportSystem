const { prisma, initDb } = require('../src/config/db')
const bcrypt = require('bcrypt')

async function main() {
  // Make sure the embedded PGlite schema exists before seeding
  await initDb()

  // Clear existing data in correct order (comments → tickets → users)
  await prisma.comment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data.')

  // Create demo users with hashed passwords
  const studentPassword = await bcrypt.hash('Student123!', 10)
  const supportPassword = await bcrypt.hash('Support123!', 10)

  const student = await prisma.user.create({
    data: {
      name: 'Maya Cohen',
      email: 'student@test.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  const support = await prisma.user.create({
    data: {
      name: 'Daniel Levi',
      email: 'support@test.com',
      password: supportPassword,
      role: 'SUPPORT',
    },
  })

  console.log(`Created users: ${student.name} (STUDENT), ${support.name} (SUPPORT)`)

  // Create demo tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Cannot access Moodle',
      description:
        'I am unable to log in to my Moodle account. I tried resetting my password, but the issue still continues.',
      category: 'Technical Support',
      priority: 'HIGH',
      status: 'OPEN',
      studentId: student.id,
      createdAt: new Date('2026-06-20T09:30:00'),
      updatedAt: new Date('2026-06-20T09:30:00'),
    },
  })

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Tuition payment was not updated',
      description:
        'I completed the payment yesterday, but the student portal still shows an unpaid balance.',
      category: 'Payments',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      studentId: student.id,
      createdAt: new Date('2026-06-18T12:15:00'),
      updatedAt: new Date('2026-06-21T10:00:00'),
    },
  })

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Course registration question',
      description:
        'I would like to know whether I can register for the advanced databases course next semester.',
      category: 'Academic Services',
      priority: 'LOW',
      status: 'RESOLVED',
      studentId: student.id,
      createdAt: new Date('2026-06-10T08:45:00'),
      updatedAt: new Date('2026-06-12T14:20:00'),
    },
  })

  console.log(`Created ${3} demo tickets.`)

  // Create demo comments
  await prisma.comment.create({
    data: {
      message:
        'The problem started this morning and I still cannot access the system.',
      ticketId: ticket1.id,
      authorId: student.id,
      createdAt: new Date('2026-06-20T09:35:00'),
    },
  })

  await prisma.comment.create({
    data: {
      message:
        'We are checking the payment information with the finance department.',
      ticketId: ticket2.id,
      authorId: support.id,
      createdAt: new Date('2026-06-21T10:00:00'),
    },
  })

  await prisma.comment.create({
    data: {
      message:
        'You meet the prerequisites and can register when registration opens.',
      ticketId: ticket3.id,
      authorId: support.id,
      createdAt: new Date('2026-06-12T14:20:00'),
    },
  })

  console.log('Created demo comments.')
  console.log('Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    // The app's embedded DB server keeps the event loop alive, so exit explicitly.
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('Seed failed:', error)
    try {
      await prisma.$disconnect()
    } catch {}
    process.exit(1)
  })
