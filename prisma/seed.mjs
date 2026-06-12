import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const connectionString = 'postgresql://postgres:toor@localhost:5432/pmtool';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data...');
  await prisma.dailyTaskAllocation.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.assetTracking.deleteMany();
  await prisma.project.deleteMany();
  await prisma.resource.deleteMany();

  // ── Resources ──────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('Catalyst@123', 10);

  const [rahul, priya, arjun, sneha, vikram, ananya, rohan, kavya] =
    await Promise.all([
      prisma.resource.create({ data: { name: 'Rahul Sharma',  email: 'rahul@catalyst.sh',  password, role: 'MANAGER',  isActive: true } }),
      prisma.resource.create({ data: { name: 'Priya Patel',   email: 'priya@catalyst.sh',   password, role: 'DEV',      isActive: true } }),
      prisma.resource.create({ data: { name: 'Arjun Singh',   email: 'arjun@catalyst.sh',   password, role: 'DEV',      isActive: true } }),
      prisma.resource.create({ data: { name: 'Sneha Kumar',   email: 'sneha@catalyst.sh',   password, role: 'TESTER',   isActive: true } }),
      prisma.resource.create({ data: { name: 'Vikram Mehta',  email: 'vikram@catalyst.sh',  password, role: 'DESIGNER', isActive: true } }),
      prisma.resource.create({ data: { name: 'Ananya Gupta',  email: 'ananya@catalyst.sh',  password, role: 'HR',       isActive: true } }),
      prisma.resource.create({ data: { name: 'Rohan Verma',   email: 'rohan@catalyst.sh',   password, role: 'BDE',      isActive: true } }),
      prisma.resource.create({ data: { name: 'Kavya Reddy',   email: 'kavya@catalyst.sh',   password, role: 'JR_HR',   isActive: true } }),
    ]);
  console.log('✓ 8 resources');

  // ── Projects ───────────────────────────────────────────────────────────────
  const [eduTrack, retailPulse, medSafe] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'EduTrack LMS',
        clientName: 'Greenwood Academy',
        commencementDate: new Date('2025-01-15'),
        projectStatus: 'ACTIVE',
        description: 'Full-featured Learning Management System with course builder, quizzes, and analytics.',
        documentLink: 'https://docs.example.com/edutrack',
      },
    }),
    prisma.project.create({
      data: {
        name: 'RetailPulse POS',
        clientName: 'FreshMart Retail',
        commencementDate: new Date('2025-03-01'),
        projectStatus: 'ACTIVE',
        description: 'Point-of-sale system with inventory management, billing, and sales reporting.',
        documentLink: 'https://docs.example.com/retailpulse',
      },
    }),
    prisma.project.create({
      data: {
        name: 'MedSafe Clinic Management',
        clientName: 'HealthFirst Clinics',
        commencementDate: new Date('2024-06-01'),
        projectStatus: 'ARCHIVED',
        description: 'Patient records, appointment scheduling, and billing for clinics.',
        documentLink: 'https://docs.example.com/medsafe',
      },
    }),
  ]);
  console.log('✓ 3 projects');

  // ── Leads ──────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.lead.create({
      data: {
        clientName: 'FinEdge Capital',
        projectName: 'FinanceFlow Dashboard',
        links: ['https://finedge.com', 'https://drive.example.com/finedge-brief'],
        leadStatus: 'ACTIVE',
        createdById: rohan.id,
      },
    }),
    prisma.lead.create({
      data: {
        clientName: 'SwiftMove Logistics',
        projectName: 'LogiTrack Delivery App',
        links: ['https://swiftmove.in'],
        leadStatus: 'CONVERTED',
        projectId: retailPulse.id,
        createdById: rohan.id,
      },
    }),
    prisma.lead.create({
      data: {
        clientName: 'TalentBridge Corp',
        projectName: 'HR Nexus Portal',
        links: ['https://talentbridge.io', 'https://notion.example.com/talentbridge-spec'],
        leadStatus: 'LOST',
        createdById: rohan.id,
      },
    }),
  ]);
  console.log('✓ 3 leads');

  // ── Milestones ─────────────────────────────────────────────────────────────
  const [m1, m2, m3, m4, m5, m6] = await Promise.all([
    prisma.milestone.create({ data: { milestoneName: 'Phase 1 – Core Platform',            milestoneDescription: 'User auth, course builder, content upload.',               estimatedHours: 240, projectId: eduTrack.id    } }),
    prisma.milestone.create({ data: { milestoneName: 'Phase 2 – Assessments & Analytics',  milestoneDescription: 'Quiz engine, progress tracking, reporting dashboard.',      estimatedHours: 180, projectId: eduTrack.id    } }),
    prisma.milestone.create({ data: { milestoneName: 'Phase 1 – POS & Inventory',          milestoneDescription: 'Billing, barcode scan, stock management.',                  estimatedHours: 200, projectId: retailPulse.id } }),
    prisma.milestone.create({ data: { milestoneName: 'Phase 2 – Reports & Integrations',   milestoneDescription: 'Sales reports, payment gateway, supplier portal.',          estimatedHours: 160, projectId: retailPulse.id } }),
    prisma.milestone.create({ data: { milestoneName: 'Phase 1 – Patient Records',          milestoneDescription: 'Patient registration, medical history, document uploads.',  estimatedHours: 150, projectId: medSafe.id     } }),
    prisma.milestone.create({ data: { milestoneName: 'Phase 2 – Appointments & Billing',   milestoneDescription: 'Scheduling, OPD billing, insurance claims.',               estimatedHours: 130, projectId: medSafe.id     } }),
  ]);
  console.log('✓ 6 milestones');

  // ── Tasks ──────────────────────────────────────────────────────────────────
  // EduTrack – Phase 1
  await prisma.task.create({ data: { title: 'User authentication & roles',    description: 'JWT-based login, role management for admin, teacher, student.', estimatedHours: 24, actualHours: 26, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m1.id, assignedTo: { connect: [{ id: priya.id }] } } });
  const t2 = await prisma.task.create({ data: { title: 'Course builder module',           description: 'Drag-and-drop course creation with sections and lessons.',           estimatedHours: 40, actualHours: 38, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m1.id, assignedTo: { connect: [{ id: priya.id }, { id: arjun.id }] } } });
  const t3 = await prisma.task.create({ data: { title: 'Media upload & CDN integration',  description: 'Video/image uploads with S3-backed CDN delivery.',                   estimatedHours: 32, actualHours: 35, taskStatus: 'IN_PROGRESS', taskType: 'FEATURE', milestoneId: m1.id, assignedTo: { connect: [{ id: arjun.id }] } } });
  await prisma.task.create({ data: { title: 'Fix video player seek bug',       description: 'Seek bar jumps to wrong timestamp on mobile Safari.',                  estimatedHours: 4,  actualHours: 0,  taskStatus: 'TODO',        taskType: 'BUG',     milestoneId: m1.id, parentTaskId: t3.id, assignedTo: { connect: [{ id: sneha.id }] } } });

  // EduTrack – Phase 2
  const t5 = await prisma.task.create({ data: { title: 'Quiz engine',                    description: 'MCQ, true/false, short-answer types with auto-grading.',              estimatedHours: 36, actualHours: 30, taskStatus: 'IN_REVIEW',   taskType: 'FEATURE', milestoneId: m2.id, assignedTo: { connect: [{ id: priya.id }, { id: arjun.id }] } } });
  await prisma.task.create({ data: { title: 'Student analytics dashboard',     description: 'Progress charts, completion rates, time-on-platform metrics.',         estimatedHours: 28, actualHours: 0,  taskStatus: 'TODO',        taskType: 'FEATURE', milestoneId: m2.id, assignedTo: { connect: [{ id: vikram.id }, { id: arjun.id }] } } });

  // RetailPulse – Phase 1
  await prisma.task.create({ data: { title: 'Billing & invoice generation',    description: 'Cart, tax calculation, thermal printer receipt output.',              estimatedHours: 32, actualHours: 34, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m3.id, assignedTo: { connect: [{ id: arjun.id }] } } });
  const t8 = await prisma.task.create({ data: { title: 'Inventory & stock management',   description: 'Product catalog, stock levels, low-stock alerts.',                    estimatedHours: 40, actualHours: 20, taskStatus: 'IN_PROGRESS', taskType: 'FEATURE', milestoneId: m3.id, assignedTo: { connect: [{ id: priya.id }] } } });
  await prisma.task.create({ data: { title: 'Barcode scan duplicate bug',      description: 'Duplicate line-item added on rapid successive scans.',                estimatedHours: 4,  actualHours: 0,  taskStatus: 'TODO',        taskType: 'BUG',     milestoneId: m3.id, parentTaskId: t8.id, assignedTo: { connect: [{ id: sneha.id }] } } });

  // RetailPulse – Phase 2
  await prisma.task.create({ data: { title: 'Sales analytics & reporting',     description: 'Daily/weekly/monthly sales charts, export to PDF/Excel.',             estimatedHours: 28, actualHours: 0,  taskStatus: 'TODO',        taskType: 'FEATURE', milestoneId: m4.id, assignedTo: { connect: [{ id: vikram.id }, { id: arjun.id }] } } });

  // MedSafe – Phase 1 (archived)
  await prisma.task.create({ data: { title: 'Patient registration & search',   description: 'UHID generation, demographic form, duplicate-check.',                estimatedHours: 20, actualHours: 22, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m5.id, assignedTo: { connect: [{ id: priya.id }] } } });
  await prisma.task.create({ data: { title: 'Medical history & document upload', description: 'Past diagnoses, prescriptions, lab report uploads.',                 estimatedHours: 24, actualHours: 26, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m5.id, assignedTo: { connect: [{ id: arjun.id }] } } });

  // MedSafe – Phase 2 (archived)
  await prisma.task.create({ data: { title: 'Appointment scheduling',          description: 'Doctor calendar, slot booking, SMS/email reminders.',                 estimatedHours: 32, actualHours: 34, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m6.id, assignedTo: { connect: [{ id: priya.id }, { id: vikram.id }] } } });
  await prisma.task.create({ data: { title: 'OPD billing & insurance claims',  description: 'Consultation billing, insurance form submission.',                    estimatedHours: 28, actualHours: 30, taskStatus: 'DONE',        taskType: 'FEATURE', milestoneId: m6.id, assignedTo: { connect: [{ id: arjun.id }] } } });
  console.log('✓ 13 tasks (2 are subtasks)');

  // ── Asset Tracking ─────────────────────────────────────────────────────────
  const assetRows = [
    { name: "Rahul's MacBook Pro",      product: 'Laptop',   productName: 'MacBook Pro 14"',        serialNumber: 'CAT-LAP-1001', status: 'ALLOCATED',  productConfiguration: 'Apple M2 Pro, 16GB RAM, 512GB SSD',          assetPrice: 175000, workingCondition: 'GOOD', allocatedTo: rahul.id,  allocatedToName: rahul.name,  addedByResourceId: ananya.id, dateOfAllocation: new Date('2025-01-20') },
    { name: "Priya's Dell XPS",         product: 'Laptop',   productName: 'Dell XPS 15',            serialNumber: 'CAT-LAP-1002', status: 'ALLOCATED',  productConfiguration: 'Intel i7-12700H, 16GB RAM, 512GB NVMe SSD',  assetPrice: 85000,  workingCondition: 'GOOD', allocatedTo: priya.id,  allocatedToName: priya.name,  addedByResourceId: ananya.id, dateOfAllocation: new Date('2025-01-20') },
    { name: "Arjun's Lenovo ThinkPad",  product: 'Laptop',   productName: 'Lenovo ThinkPad E14',    serialNumber: 'CAT-LAP-1003', status: 'ALLOCATED',  productConfiguration: 'AMD Ryzen 5 5600U, 8GB RAM, 256GB SSD',      assetPrice: 52000,  workingCondition: 'GOOD', allocatedTo: arjun.id,  allocatedToName: arjun.name,  addedByResourceId: ananya.id, dateOfAllocation: new Date('2025-02-01') },
    { name: "Sneha's HP EliteBook",     product: 'Laptop',   productName: 'HP EliteBook 840',       serialNumber: 'CAT-LAP-1004', status: 'ALLOCATED',  productConfiguration: 'Intel i5-1235U, 16GB RAM, 512GB SSD',        assetPrice: 72000,  workingCondition: 'GOOD', allocatedTo: sneha.id,  allocatedToName: sneha.name,  addedByResourceId: ananya.id, dateOfAllocation: new Date('2025-02-15') },
    { name: "Vikram's ASUS VivoBook",   product: 'Laptop',   productName: 'ASUS VivoBook 15',       serialNumber: 'CAT-LAP-1005', status: 'ALLOCATED',  productConfiguration: 'Intel i5-11300H, 8GB RAM, 512GB SSD',        assetPrice: 48000,  workingCondition: 'FAIR', allocatedTo: vikram.id, allocatedToName: vikram.name, addedByResourceId: ananya.id, dateOfAllocation: new Date('2025-03-01') },
    { name: 'Spare Laptop',             product: 'Laptop',   productName: 'Acer Aspire 5',          serialNumber: 'CAT-LAP-2001', status: 'AVAILABLE',  productConfiguration: 'AMD Ryzen 7 5700U, 16GB RAM, 512GB SSD',     assetPrice: 55000,  workingCondition: 'GOOD', comments: 'Available for new joinee.' },
    { name: 'Office Monitor',           product: 'Monitor',  productName: 'LG UltraWide 27"',       serialNumber: 'CAT-MON-1001', status: 'AVAILABLE',  productConfiguration: '27" IPS, 2560×1080, 75Hz',                   assetPrice: 22000,  workingCondition: 'GOOD', comments: 'Available for workstation setup.' },
    { name: 'Logitech MX Master 3',     product: 'Mouse',    productName: 'Logitech MX Master 3',   serialNumber: 'CAT-MOU-1001', status: 'IN_REPAIR',  productConfiguration: 'Wireless, USB-C charging, 4000 DPI',          assetPrice: 7500,   workingCondition: 'FAIR', comments: 'Scroll wheel repair pending.' },
    { name: 'Keychron K2 Pro',          product: 'Keyboard', productName: 'Keychron K2 Pro',        serialNumber: 'CAT-KEY-1001', status: 'AVAILABLE',  productConfiguration: 'TKL, Bluetooth + USB-C, RGB, Brown switches', assetPrice: 8500,   workingCondition: 'GOOD', comments: 'In stock.' },
  ];
  for (const a of assetRows) {
    await prisma.assetTracking.create({ data: a });
  }
  console.log(`✓ ${assetRows.length} assets`);

  // ── Daily Task Allocations ─────────────────────────────────────────────────
  const allocations = [
    { resourceId: priya.id,  projectId: eduTrack.id,    milestoneId: m1.id, taskId: t2.id, description: 'Implemented lesson reordering with drag-and-drop.',         estimatedHours: 4, actualHours: 4.5, date: new Date('2026-06-09') },
    { resourceId: arjun.id,  projectId: eduTrack.id,    milestoneId: m1.id, taskId: t3.id, description: 'Set up S3 bucket policies and multipart upload.',            estimatedHours: 4, actualHours: 5,   date: new Date('2026-06-09') },
    { resourceId: sneha.id,  projectId: retailPulse.id, milestoneId: m3.id,               description: 'Tested barcode scan flow on multiple Android devices.',       estimatedHours: 4, actualHours: 4,   date: new Date('2026-06-09') },
    { resourceId: vikram.id, projectId: eduTrack.id,    milestoneId: m1.id,               description: 'Created hi-fi mockups for course builder UI.',                estimatedHours: 3, actualHours: 3,   date: new Date('2026-06-09') },

    { resourceId: priya.id,  projectId: eduTrack.id,    milestoneId: m2.id, taskId: t5.id, description: 'Reviewed quiz engine PR, added edge-case unit tests.',        estimatedHours: 3, actualHours: 3.5, date: new Date('2026-06-10') },
    { resourceId: arjun.id,  projectId: retailPulse.id, milestoneId: m3.id, taskId: t8.id, description: 'Built low-stock alert notification service.',                 estimatedHours: 4, actualHours: 4,   date: new Date('2026-06-10') },
    { resourceId: sneha.id,  projectId: eduTrack.id,    milestoneId: m2.id, taskId: t5.id, description: 'Wrote test cases for quiz auto-grading module.',              estimatedHours: 4, actualHours: 4,   date: new Date('2026-06-10') },
    { resourceId: vikram.id, projectId: eduTrack.id,    milestoneId: m2.id,               description: 'Designed analytics dashboard wireframes in Figma.',            estimatedHours: 3, actualHours: 3,   date: new Date('2026-06-10') },
    { resourceId: rahul.id,  projectId: eduTrack.id,    milestoneId: m1.id,               description: 'Sprint review with client, updated backlog.',                  estimatedHours: 2, actualHours: 2,   date: new Date('2026-06-10') },

    { resourceId: priya.id,  projectId: retailPulse.id, milestoneId: m3.id, taskId: t8.id, description: 'Integrating stock adjustment API with front-end.',             estimatedHours: 4, actualHours: 2,   date: new Date('2026-06-11') },
    { resourceId: arjun.id,  projectId: eduTrack.id,    milestoneId: m1.id, taskId: t3.id, description: 'Implemented CDN cache invalidation on content publish.',       estimatedHours: 3, actualHours: 3,   date: new Date('2026-06-11') },
    { resourceId: rahul.id,  projectId: retailPulse.id, milestoneId: m3.id,               description: 'Stakeholder demo prep for RetailPulse Phase 1.',               estimatedHours: 2, actualHours: 2,   date: new Date('2026-06-11') },
    { resourceId: sneha.id,  projectId: retailPulse.id, milestoneId: m3.id, taskId: t8.id, description: 'Regression testing for inventory module after latest build.',   estimatedHours: 3, actualHours: 3,   date: new Date('2026-06-11') },
  ];
  for (const a of allocations) {
    await prisma.dailyTaskAllocation.create({ data: a });
  }
  console.log(`✓ ${allocations.length} daily task allocations`);

  console.log('\n✅ Seed complete. Default password for all accounts: Catalyst@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
