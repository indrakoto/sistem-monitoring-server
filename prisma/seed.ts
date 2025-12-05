import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword
    }
  })
  
  // Create sample servers
  await prisma.server.createMany({
    data: [
      {
        name: 'Web Server 1',
        url_api: 'http://localhost:5001/api/system'
      },
      {
        name: 'Database Server',
        url_api: 'http://localhost:5002/api/system'
      },
      {
        name: 'API Gateway',
        url_api: 'http://localhost:5003/api/system'
      }
    ]
  })
  
  console.log('✅ Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })