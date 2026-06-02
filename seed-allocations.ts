import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding dummy daily task allocations for the past 40 days...');

  // Get resources
  const resources = await prisma.resource.findMany({ take: 5 });
  if (resources.length === 0) {
    console.log('No resources found to seed allocations for.');
    return;
  }

  // Get projects and tasks
  const projects = await prisma.project.findMany({
    include: {
      milestones: {
        include: { tasks: true }
      }
    },
    take: 3
  });

  if (projects.length === 0) {
    console.log('No projects found to seed allocations for.');
    return;
  }

  // Clear existing allocations
  await prisma.dailyTaskAllocation.deleteMany({});

  const dummyData = [];
  const today = new Date();
  
  // Create allocations for the last 40 days
  for (let i = 0; i < 40; i++) {
    const loopDate = new Date(today);
    loopDate.setDate(today.getDate() - i);
    loopDate.setHours(10, 0, 0, 0); // Normalize time
    
    // Skip weekends optionally? We'll just populate all days for robust testing
    const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;

    for (const resource of resources) {
      // Maybe give them 1 project a day to avoid massive bloat
      const project = projects[(i + resource.id.length) % projects.length];
      
      let taskId = null;
      const allTasks = project.milestones.flatMap(m => m.tasks);
      if (allTasks.length > 0) {
          taskId = allTasks[i % allTasks.length].id;
      }

      // 1 real task
      if (taskId && !isWeekend) {
          dummyData.push({
              resourceId: resource.id,
              projectId: project.id,
              taskId: taskId,
              estimatedHours: 4,
              actualHours: 4.5,
              date: loopDate,
          });
      }

      // 1 dummy task sometimes
      if (i % 3 === 0 && !isWeekend) {
          dummyData.push({
              resourceId: resource.id,
              projectId: project.id,
              desc: "Daily Standup & Sync",
              estimatedHours: 1,
              actualHours: 1,
              date: loopDate,
          });
      }
    }
  }

  // Batch insert
  await prisma.dailyTaskAllocation.createMany({
    data: dummyData
  });

  console.log(`Seeded ${dummyData.length} daily task allocations over the last 40 days.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
