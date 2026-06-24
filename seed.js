const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.assetTracking.findMany({
    where: { allocatedTo: { not: null } }
  });
  let count = 0;
  for (const asset of assets) {
    const existing = await prisma.assetAllocationHistory.findFirst({
      where: { assetId: asset.id }
    });
    if (!existing) {
      await prisma.assetAllocationHistory.create({
        data: {
          assetId: asset.id,
          allocatedTo: asset.allocatedTo,
          allocatedToName: asset.allocatedToName || 'Unknown',
          allocatedAt: asset.dateOfAllocation || asset.createdAt
        }
      });
      count++;
    }
  }
  console.log('Migrated ' + count + ' assets');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
