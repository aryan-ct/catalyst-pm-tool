import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = 'postgresql://postgres:toor@localhost:5432/pmtool';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PRODUCTS = [
  {
    product: 'Laptop',
    productName: 'Dell XPS 15',
    productConfiguration: 'Intel i7-12700H, 16GB RAM, 512GB NVMe SSD, 15.6" FHD',
    assetPrice: 85000,
    otherAccessories: 'Dell 65W Charger, Laptop Bag',
  },
  {
    product: 'Laptop',
    productName: 'MacBook Pro 14"',
    productConfiguration: 'Apple M2 Pro, 16GB RAM, 512GB SSD, 14.2" Liquid Retina',
    assetPrice: 175000,
    otherAccessories: 'Apple 67W USB-C Charger, Magic Mouse',
  },
  {
    product: 'Laptop',
    productName: 'Lenovo ThinkPad E14',
    productConfiguration: 'AMD Ryzen 5 5600U, 8GB RAM, 256GB SSD, 14" FHD',
    assetPrice: 52000,
    otherAccessories: 'Lenovo 45W Charger',
  },
  {
    product: 'Laptop',
    productName: 'HP EliteBook 840',
    productConfiguration: 'Intel i5-1235U, 16GB RAM, 512GB SSD, 14" FHD IPS',
    assetPrice: 72000,
    otherAccessories: 'HP 65W Charger, USB Hub',
  },
  {
    product: 'Laptop',
    productName: 'ASUS VivoBook 15',
    productConfiguration: 'Intel i5-11300H, 8GB RAM, 512GB SSD, 15.6" FHD',
    assetPrice: 48000,
    otherAccessories: 'ASUS 45W Charger',
  },
  {
    product: 'Laptop',
    productName: 'Acer Aspire 5',
    productConfiguration: 'AMD Ryzen 7 5700U, 16GB RAM, 512GB SSD, 15.6" FHD',
    assetPrice: 55000,
    otherAccessories: 'Acer 45W Charger, Mouse',
  },
  {
    product: 'Laptop',
    productName: 'MSI Modern 14',
    productConfiguration: 'Intel i7-1195G7, 16GB RAM, 512GB NVMe, 14" FHD IPS',
    assetPrice: 68000,
    otherAccessories: 'MSI 65W Charger, Laptop Sleeve',
  },
];

const CONDITIONS = ['GOOD', 'GOOD', 'GOOD', 'FAIR', 'GOOD', 'FAIR', 'GOOD'];

const AVAILABLE_ASSETS = [
  {
    name: 'Spare Laptop #1',
    product: 'Laptop',
    productName: 'Dell Inspiron 15',
    serialNumber: 'CAT-LAP-2001',
    productConfiguration: 'Intel i5-1135G7, 8GB RAM, 256GB SSD, 15.6" FHD',
    assetPrice: 45000,
    otherAccessories: 'Dell 45W Charger',
    workingCondition: 'GOOD',
    comments: 'Available for new joinee.',
  },
  {
    name: 'Spare Laptop #2',
    product: 'Laptop',
    productName: 'HP Pavilion 14',
    serialNumber: 'CAT-LAP-2002',
    productConfiguration: 'AMD Ryzen 5 5500U, 8GB RAM, 512GB SSD, 14" FHD',
    assetPrice: 49000,
    otherAccessories: 'HP 45W Charger, Mouse',
    workingCondition: 'GOOD',
    comments: 'Available for new joinee.',
  },
  {
    name: 'Office Monitor #1',
    product: 'Monitor',
    productName: 'LG UltraWide 27"',
    serialNumber: 'CAT-MON-2001',
    productConfiguration: '27" IPS, 2560x1080, 75Hz, HDMI + DisplayPort',
    assetPrice: 22000,
    otherAccessories: 'HDMI Cable, Power Cable',
    workingCondition: 'GOOD',
    comments: 'Available for workstation setup.',
  },
  {
    name: 'Wireless Mouse #1',
    product: 'Mouse',
    productName: 'Logitech MX Master 3',
    serialNumber: 'CAT-MOU-2001',
    productConfiguration: 'Wireless, USB-C charging, 4000 DPI',
    assetPrice: 7500,
    otherAccessories: 'USB-C Cable, USB Receiver',
    workingCondition: 'GOOD',
    comments: 'In stock.',
  },
  {
    name: 'Mechanical Keyboard #1',
    product: 'Keyboard',
    productName: 'Keychron K2 Pro',
    serialNumber: 'CAT-KEY-2001',
    productConfiguration: 'TKL, Bluetooth + USB-C, RGB, Brown switches',
    assetPrice: 8500,
    otherAccessories: 'USB-C Cable',
    workingCondition: 'GOOD',
    comments: 'In stock.',
  },
  {
    name: 'Spare Laptop #3',
    product: 'Laptop',
    productName: 'Lenovo IdeaPad Slim 5',
    serialNumber: 'CAT-LAP-2003',
    productConfiguration: 'AMD Ryzen 7 5700U, 16GB RAM, 512GB SSD, 14" FHD',
    assetPrice: 58000,
    otherAccessories: 'Lenovo 65W Charger',
    workingCondition: 'FAIR',
    comments: 'Minor scratch on lid, fully functional.',
  },
];

async function main() {
  // Fetch all active resources (exclude HR roles)
  const resources = await prisma.resource.findMany({
    where: { isActive: true, role: { notIn: ['HR', 'JR_HR'] } },
    select: { id: true, name: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  if (resources.length === 0) {
    console.log('No non-HR active resources found. Skipping seed.');
    return;
  }

  console.log(`Found ${resources.length} resources. Seeding assets…\n`);

  // Clear existing asset-tracking records first to avoid conflicts
  await prisma.assetTracking.deleteMany({
    where: { addedByResourceId: { in: resources.map((r) => r.id) } },
  });

  const today = new Date();
  const results = [];

  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    const product = PRODUCTS[i % PRODUCTS.length];
    const condition = CONDITIONS[i % CONDITIONS.length];

    const allocationDate = new Date(today);
    allocationDate.setMonth(allocationDate.getMonth() - (i + 1) * 2);

    const serialSuffix = String(1000 + i).padStart(4, '0');

    const asset = await prisma.assetTracking.create({
      data: {
        name: `${resource.name}'s ${product.product}`,
        product: product.product,
        productName: product.productName,
        serialNumber: `CAT-${product.product.toUpperCase().slice(0, 3)}-${serialSuffix}`,
        status: 'ALLOCATED',
        productConfiguration: product.productConfiguration,
        laptopPassword: `Pass@${serialSuffix}`,
        assetPrice: product.assetPrice,
        dateOfAllocation: allocationDate,
        otherAccessories: product.otherAccessories,
        comments: `Assigned to ${resource.name} (${resource.role}).`,
        workingCondition: condition,
        allocatedTo: resource.id,
        allocatedToName: resource.name,
        addedByResourceId: resource.id,
      },
    });

    results.push({ resource: resource.name, role: resource.role, asset: asset.productName, serial: asset.serialNumber });
    console.log(`✓ ${resource.name} (${resource.role}) → ${asset.productName} [${asset.serialNumber}]`);
  }

  console.log(`\nSeeded ${results.length} allocated asset record(s) successfully.`);

  // ── Available (unallocated) inventory ──
  console.log('\nSeeding available assets…\n');

  await prisma.assetTracking.deleteMany({
    where: { status: 'AVAILABLE', addedByResourceId: null },
  });

  for (const a of AVAILABLE_ASSETS) {
    await prisma.assetTracking.create({
      data: {
        name: a.name,
        product: a.product,
        productName: a.productName,
        serialNumber: a.serialNumber,
        status: 'AVAILABLE',
        productConfiguration: a.productConfiguration,
        assetPrice: a.assetPrice,
        otherAccessories: a.otherAccessories,
        workingCondition: a.workingCondition,
        comments: a.comments,
      },
    });
    console.log(`✓ ${a.name} → ${a.productName} [${a.serialNumber}]`);
  }

  console.log(`\nSeeded ${AVAILABLE_ASSETS.length} available asset record(s) successfully.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
