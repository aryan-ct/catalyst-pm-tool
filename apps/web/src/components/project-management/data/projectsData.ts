import { Project } from "../types/types";



export const projectsData: Project[] = [
  {
    id: "proj-1",
    name: "Catalyst PM Tool",
    description: "Internal project management system",
    milestones: [
      {
        id: "ms-1",
        milestoneName: "Authentication Module",
        milestoneDescription: "Implement login and signup.",
        estimatedHours: 20,
        bugSheet: "https://docs.google.com",
        status: "todo",
        tasks: [
          { id: "t-1", title: "Design Login UI", taskType: "feature" },
          { id: "t-2", title: "Fix validation bug", taskType: "bug" },
        ],
      },
      {
        id: "ms-2",
        milestoneName: "Dashboard UI",
        milestoneDescription: "Build analytics dashboard.",
        estimatedHours: 18,
        bugSheet: "https://docs.google.com",
        status: "in-progress",
        tasks: [
          { id: "t-3", title: "Create KPI Cards", taskType: "feature" },
        ],
      },
      {
        id: "ms-3",
        milestoneName: "Kanban Board",
        milestoneDescription: "Develop milestone tracking.",
        estimatedHours: 12,
        bugSheet: "https://docs.google.com",
        status: "in-review",
        tasks: [
          { id: "t-4", title: "Fix drag alignment", taskType: "bug" },
        ],
      },
      {
        id: "ms-4",
        milestoneName: "Deployment",
        milestoneDescription: "Deploy to Vercel.",
        estimatedHours: 6,
        bugSheet: "https://docs.google.com",
        status: "done",
        tasks: [
          { id: "t-5", title: "Setup CI/CD", taskType: "feature" },
        ],
      },
    ],
  },
  {
    id: "proj-2",
    name: "E-Commerce Platform",
    description: "Online shopping web application",
    milestones: [
      {
        id: "ms-5",
        milestoneName: "Product Listing",
        milestoneDescription: "Display products with filters.",
        estimatedHours: 15,
        bugSheet: "https://docs.google.com",
        status: "todo",
        tasks: [
          { id: "t-6", title: "Create Product Card", taskType: "feature" },
        ],
      },
      {
        id: "ms-6",
        milestoneName: "Shopping Cart",
        milestoneDescription: "Add to cart functionality.",
        estimatedHours: 10,
        bugSheet: "https://docs.google.com",
        status: "in-progress",
        tasks: [
          { id: "t-7", title: "Fix cart bug", taskType: "bug" },
        ],
      },
      {
        id: "ms-7",
        milestoneName: "Payment Integration",
        milestoneDescription: "Integrate Razorpay.",
        estimatedHours: 12,
        bugSheet: "https://docs.google.com",
        status: "in-review",
        tasks: [
          { id: "t-8", title: "Add payment gateway", taskType: "feature" },
        ],
      },
      {
        id: "ms-8",
        milestoneName: "Order Management",
        milestoneDescription: "Track and manage orders.",
        estimatedHours: 8,
        bugSheet: "https://docs.google.com",
        status: "done",
        tasks: [
          { id: "t-9", title: "Order history page", taskType: "feature" },
        ],
      },
    ],
  },
];