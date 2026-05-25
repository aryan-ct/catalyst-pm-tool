import { prisma } from '../apps/api/src/app/config/prima.config';

async function main() {
  const resources = await prisma.resource.findMany({
    where: { isActive: true }
  });

  const projects = await prisma.project.findMany();

  if (resources.length === 0) {
    console.log("No resources found. Cannot seed.");
    return;
  }

  console.log(`Found ${resources.length} resources and ${projects.length} projects.`);

  // Create 10 days of dummy data
  for (let i = 0; i <= 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // ensure it's around mid-day so timezones don't push it to another day
    date.setHours(12, 0, 0, 0);

    // Give some random resources an allocation
    const numAllocations = Math.max(1, Math.floor(Math.random() * 4) + 1); // 1 to 4 resources per day
    const shuffledResources = [...resources].sort(() => 0.5 - Math.random());
    const selectedResources = shuffledResources.slice(0, numAllocations);

    for (const resource of selectedResources) {
      // Pick a random project or note
      const isProject = Math.random() > 0.3 && projects.length > 0;
      let projectId = null;
      let desc = null;

      if (isProject) {
        const proj = projects[Math.floor(Math.random() * projects.length)];
        projectId = proj.id;
        desc = "Worked on core features";
      } else {
        desc = "Internal meeting and training";
      }

      await prisma.resourceAllocation.create({
        data: {
          resourceId: resource.id,
          resourceName: resource.name,
          role: resource.role,
          projectId,
          desc,
          createdAt: date,
          updatedAt: date
        }
      });
    }

    console.log(`Seeded ${numAllocations} allocations for day: ${date.toDateString()}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
