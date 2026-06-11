import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:toor@localhost:5432/pmtool';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding basic data for Resource, Project, Lead, Milestone, Task...');

  const hr = await prisma.resource.create({
    data: {
      email: 'hr@example.com',
      name: 'Alice HR',
      password: 'password123',
      role: 'HR',
      isActive: true,
    }
  });

  const dev1 = await prisma.resource.create({
    data: {
      email: 'dev1@example.com',
      name: 'Bob Dev 1',
      password: 'password123',
      role: 'DEV',
      isActive: true,
    }
  });
  
  const dev2 = await prisma.resource.create({
    data: {
      email: 'dev2@example.com',
      name: 'Charlie Dev 2',
      password: 'password123',
      role: 'DEV',
      isActive: true,
    }
  });

  const manager = await prisma.resource.create({
    data: {
      email: 'manager@example.com',
      name: 'Diana Manager',
      password: 'password123',
      role: 'MANAGER',
      isActive: true,
    }
  });

  const tester = await prisma.resource.create({
    data: {
      email: 'tester@example.com',
      name: 'Eve Tester',
      password: 'password123',
      role: 'TESTER',
      isActive: true,
    }
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Project Alpha',
      clientName: 'Acme Corp',
      commencementDate: new Date(),
      projectStatus: 'ACTIVE',
      description: 'First project for testing allocations',
    }
  });
  
  const project2 = await prisma.project.create({
    data: {
      name: 'Project Beta',
      clientName: 'Globex',
      commencementDate: new Date(),
      projectStatus: 'ACTIVE',
      description: 'Second project for testing allocations',
    }
  });

  const lead1 = await prisma.lead.create({
    data: {
      projectName: 'Project Alpha Lead',
      clientName: 'Acme Corp',
      links: ['http://acme.com'],
      leadStatus: 'ACTIVE',
      projectId: project1.id,
      createdById: manager.id,
    }
  });

  const lead2 = await prisma.lead.create({
    data: {
      projectName: 'Project Beta Lead',
      clientName: 'Globex',
      links: ['http://globex.com'],
      leadStatus: 'CONVERTED',
      projectId: project2.id,
      createdById: manager.id,
    }
  });

  const milestone1_1 = await prisma.milestone.create({
    data: {
      milestoneName: 'Alpha Milestone 1',
      milestoneDescription: 'First milestone of Alpha',
      estimatedHours: 100,
      projectId: project1.id,
    }
  });
  
  const milestone1_2 = await prisma.milestone.create({
    data: {
      milestoneName: 'Alpha Milestone 2',
      milestoneDescription: 'Second milestone of Alpha',
      estimatedHours: 150,
      projectId: project1.id,
    }
  });

  const milestone2_1 = await prisma.milestone.create({
    data: {
      milestoneName: 'Beta Milestone 1',
      milestoneDescription: 'First milestone of Beta',
      estimatedHours: 200,
      projectId: project2.id,
    }
  });

  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Database',
      description: 'Setup Postgres DB for Alpha',
      estimatedHours: 10,
      actualHours: 2,
      taskStatus: 'IN_PROGRESS',
      taskType: 'FEATURE',
      milestoneId: milestone1_1.id,
      assignedTo: {
        connect: [{ id: dev1.id }]
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Create API endpoints',
      description: 'Create API endpoints for Alpha',
      estimatedHours: 20,
      actualHours: 0,
      taskStatus: 'TODO',
      taskType: 'FEATURE',
      milestoneId: milestone1_1.id,
      assignedTo: {
        connect: [{ id: dev2.id }, { id: dev1.id }]
      }
    }
  });
  
  const task3 = await prisma.task.create({
    data: {
      title: 'Write test cases',
      description: 'Test API endpoints for Alpha',
      estimatedHours: 15,
      actualHours: 0,
      taskStatus: 'TODO',
      taskType: 'FEATURE',
      milestoneId: milestone1_2.id,
      assignedTo: {
        connect: [{ id: tester.id }]
      }
    }
  });
  
  const task4 = await prisma.task.create({
    data: {
      title: 'Fix login bug',
      description: 'Fix login bug for Beta',
      estimatedHours: 5,
      actualHours: 5,
      taskStatus: 'DONE',
      taskType: 'BUG',
      milestoneId: milestone2_1.id,
      assignedTo: {
        connect: [{ id: dev2.id }]
      }
    }
  });

  console.log('Basic data seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
