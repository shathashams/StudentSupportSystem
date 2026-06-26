const { prisma, initDb } = require('../src/config/db')
const bcrypt = require('bcrypt')

async function main() {
  // Make sure the embedded PGlite schema exists before seeding
  await initDb()

  console.log('Starting database seeding...')

  // Create demo users with hashed passwords (upsert based on unique email)
  const studentPassword = await bcrypt.hash('Student123!', 10)
  const supportPassword = await bcrypt.hash('Support123!', 10)

  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {}, // Do not overwrite existing registered user details if they exist
    create: {
      name: 'Maya Cohen',
      email: 'student@test.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  const support = await prisma.user.upsert({
    where: { email: 'support@test.com' },
    update: {}, // Do not overwrite existing registered user details if they exist
    create: {
      name: 'Daniel Levi',
      email: 'support@test.com',
      password: supportPassword,
      role: 'SUPPORT',
    },
  })

  console.log(`Verified/created demo users: ${student.name} (STUDENT), ${support.name} (SUPPORT)`)

  // Create demo tickets only if they do not exist
  let ticket1 = await prisma.ticket.findFirst({
    where: {
      title: 'Cannot access Moodle',
      studentId: student.id,
    },
  })
  if (!ticket1) {
    ticket1 = await prisma.ticket.create({
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
    console.log(`Created demo ticket: "${ticket1.title}"`)
  } else {
    console.log(`Demo ticket already exists: "${ticket1.title}"`)
  }

  let ticket2 = await prisma.ticket.findFirst({
    where: {
      title: 'Tuition payment was not updated',
      studentId: student.id,
    },
  })
  if (!ticket2) {
    ticket2 = await prisma.ticket.create({
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
    console.log(`Created demo ticket: "${ticket2.title}"`)
  } else {
    console.log(`Demo ticket already exists: "${ticket2.title}"`)
  }

  let ticket3 = await prisma.ticket.findFirst({
    where: {
      title: 'Course registration question',
      studentId: student.id,
    },
  })
  if (!ticket3) {
    ticket3 = await prisma.ticket.create({
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
    console.log(`Created demo ticket: "${ticket3.title}"`)
  } else {
    console.log(`Demo ticket already exists: "${ticket3.title}"`)
  }

  // Create demo comments only if they do not exist
  const comment1Data = {
    message: 'The problem started this morning and I still cannot access the system.',
    ticketId: ticket1.id,
    authorId: student.id,
    createdAt: new Date('2026-06-20T09:35:00'),
  }
  const comment1 = await prisma.comment.findFirst({
    where: {
      message: comment1Data.message,
      ticketId: comment1Data.ticketId,
      authorId: comment1Data.authorId,
    },
  })
  if (!comment1) {
    await prisma.comment.create({ data: comment1Data })
    console.log('Created demo comment for ticket 1.')
  } else {
    console.log('Demo comment for ticket 1 already exists.')
  }

  const comment2Data = {
    message: 'We are checking the payment information with the finance department.',
    ticketId: ticket2.id,
    authorId: support.id,
    createdAt: new Date('2026-06-21T10:00:00'),
  }
  const comment2 = await prisma.comment.findFirst({
    where: {
      message: comment2Data.message,
      ticketId: comment2Data.ticketId,
      authorId: comment2Data.authorId,
    },
  })
  if (!comment2) {
    await prisma.comment.create({ data: comment2Data })
    console.log('Created demo comment for ticket 2.')
  } else {
    console.log('Demo comment for ticket 2 already exists.')
  }

  const comment3Data = {
    message: 'You meet the prerequisites and can register when registration opens.',
    ticketId: ticket3.id,
    authorId: support.id,
    createdAt: new Date('2026-06-12T14:20:00'),
  }
  const comment3 = await prisma.comment.findFirst({
    where: {
      message: comment3Data.message,
      ticketId: comment3Data.ticketId,
      authorId: comment3Data.authorId,
    },
  })
  if (!comment3) {
    await prisma.comment.create({ data: comment3Data })
    console.log('Created demo comment for ticket 3.')
  } else {
    console.log('Demo comment for ticket 3 already exists.')
  }

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
