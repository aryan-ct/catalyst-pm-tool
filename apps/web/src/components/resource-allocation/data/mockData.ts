import { AllocationRow, Resource } from "../types";

export const resources: Resource[] = [
  { id: "1", name: "Yuvika", role: "Frontend" },
  { id: "2", name: "Aman", role: "Backend" },
  { id: "3", name: "Riya", role: "Designer" },
  { id: "4", name: "Karan", role: "QA" },
  { id: "5", name: "Neha", role: "Frontend" },
  { id: "6", name: "Arjun", role: "Backend" },
  { id: "7", name: "Simran", role: "Designer" },
  { id: "8", name: "Rohit", role: "QA" },
  { id: "9", name: "Priya", role: "Frontend" },
  { id: "10", name: "Vikas", role: "Backend" },
];

const today = new Date().toDateString();
const yesterday = new Date(
  Date.now() - 24 * 60 * 60 * 1000
).toDateString();

export const allocations: AllocationRow[] = [
  {
    resourceId: "1",
    resourceName: "Yuvika",
    date: today,
    projects: [
      { id: "p1", name: "PM Tool", description: "UI work" },
      { id: "p2", name: "Dashboard", description: "Charts UI" },
      { id: "p3", name: "Website", description: "Landing page fixes" },
      { id: "p4", name: "Mobile App", description: "Responsive fixes" },
      { id: "p5", name: "Dashboard", description: "Table UI update" },
      { id: "p6", name: "PM Tool", description: "Refactor components" },
    ],
  },
  {
    resourceId: "1",
    resourceName: "Yuvika",
    date: yesterday,
    projects: [
      { id: "p7", name: "Landing Page", description: "Hero section" },
      { id: "p8", name: "Website Revamp", description: "Navbar redesign" },
      { id: "p9", name: "Dashboard", description: "Filter UI" },
    ],
  },

  {
    resourceId: "2",
    resourceName: "Aman",
    date: today,
    projects: [
      { id: "p10", name: "Backend API", description: "Auth module" },
      { id: "p11", name: "Database", description: "Schema update" },
      { id: "p12", name: "API", description: "Rate limiting" },
    ],
  },
  {
    resourceId: "2",
    resourceName: "Aman",
    date: yesterday,
    projects: [
      { id: "p13", name: "API", description: "Optimize queries" },
    ],
  },

  {
    resourceId: "3",
    resourceName: "Riya",
    date: today,
    projects: [],
  },
  {
    resourceId: "3",
    resourceName: "Riya",
    date: yesterday,
    projects: [
      { id: "p14", name: "Design System", description: "Color tokens" },
    ],
  },

  {
    resourceId: "4",
    resourceName: "Karan",
    date: today,
    projects: [
      { id: "p15", name: "Bug Fixing", description: "Fix login issue" },
      { id: "p16", name: "Regression Testing", description: "Full cycle test" },
      { id: "p17", name: "Testing Suite", description: "Edge case testing" },
    ],
  },
  {
    resourceId: "4",
    resourceName: "Karan",
    date: yesterday,
    projects: [
      { id: "p18", name: "Automation", description: "Cypress setup" },
    ],
  },

  {
    resourceId: "5",
    resourceName: "Neha",
    date: today,
    projects: [
      { id: "p19", name: "Website", description: "UI polish" },
    ],
  },

  {
    resourceId: "6",
    resourceName: "Arjun",
    date: today,
    projects: [
      { id: "p20", name: "API", description: "Performance tuning" },
    ],
  },

  {
    resourceId: "7",
    resourceName: "Simran",
    date: today,
    projects: [
      { id: "p21", name: "Mobile App", description: "UX improvements" },
    ],
  },

  {
    resourceId: "8",
    resourceName: "Rohit",
    date: today,
    projects: [
      { id: "p22", name: "QA", description: "Smoke testing" },
    ],
  },


  {
    resourceId: "9",
    resourceName: "Priya",
    date: today,
    projects: [
      { id: "p23", name: "Frontend", description: "Component cleanup" },
    ],
  },

  {
    resourceId: "10",
    resourceName: "Vikas",
    date: today,
    projects: [
      { id: "p24", name: "Backend", description: "Microservices setup" },
    ],
  },
];