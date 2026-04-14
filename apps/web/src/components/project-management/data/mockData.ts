import { Milestone } from "../types/types";


export const initialMilestones: Milestone[] = [
  // 🟡 TO DO
  {
    id: "ms-1",
    milestoneName: "Authentication Module",
    milestoneDescription:
      "Implement secure login and signup functionality with validation.",
    estimatedHours: 20,
    bugSheet: "https://docs.google.com/spreadsheets/d/auth-module",
    status: "todo",
    tasks: [
      {
        id: "t-1",
        title: "Design Login UI",
        taskType: "feature",
      },
      {
        id: "t-2",
        title: "Implement Signup API Integration",
        taskType: "feature",
      },
      {
        id: "t-3",
        title: "Fix validation error on empty fields",
        taskType: "bug",
      },
    ],
  },
  {
    id: "ms-2",
    milestoneName: "User Profile Setup",
    milestoneDescription:
      "Create profile page with editable user details and avatar upload.",
    estimatedHours: 12,
    bugSheet: "https://docs.google.com/spreadsheets/d/profile-module",
    status: "todo",
    tasks: [
      {
        id: "t-4",
        title: "Design Profile Layout",
        taskType: "feature",
      },
      {
        id: "t-5",
        title: "Implement Image Upload",
        taskType: "feature",
      },
    ],
  },

  // 🔵 IN PROGRESS
  {
    id: "ms-3",
    milestoneName: "Project Dashboard",
    milestoneDescription:
      "Develop dashboard with analytics, charts, and project summaries.",
    estimatedHours: 18,
    bugSheet: "https://docs.google.com/spreadsheets/d/dashboard-module",
    status: "in-progress",
    tasks: [
      {
        id: "t-6",
        title: "Integrate Chart Components",
        taskType: "feature",
      },
      {
        id: "t-7",
        title: "Fix responsive layout issue",
        taskType: "bug",
      },
      {
        id: "t-8",
        title: "Implement KPI Cards",
        taskType: "feature",
      },
    ],
  },
  {
    id: "ms-4",
    milestoneName: "Notification System",
    milestoneDescription:
      "Implement real-time notifications using WebSockets.",
    estimatedHours: 14,
    bugSheet: "https://docs.google.com/spreadsheets/d/notification-module",
    status: "in-progress",
    tasks: [
      {
        id: "t-9",
        title: "Setup WebSocket Connection",
        taskType: "feature",
      },
      {
        id: "t-10",
        title: "Fix duplicate notification bug",
        taskType: "bug",
      },
    ],
  },

  // 🟣 IN REVIEW
  {
    id: "ms-5",
    milestoneName: "Kanban Board UI",
    milestoneDescription:
      "Develop a dynamic Kanban board with milestone tracking.",
    estimatedHours: 16,
    bugSheet: "https://docs.google.com/spreadsheets/d/kanban-module",
    status: "in-review",
    tasks: [
      {
        id: "t-11",
        title: "Create Drag-and-Drop Layout",
        taskType: "feature",
      },
      {
        id: "t-12",
        title: "Fix column alignment issues",
        taskType: "bug",
      },
    ],
  },
  {
    id: "ms-6",
    milestoneName: "Role-Based Access Control",
    milestoneDescription:
      "Implement RBAC for Admin, Manager, and Developer roles.",
    estimatedHours: 10,
    bugSheet: "https://docs.google.com/spreadsheets/d/rbac-module",
    status: "in-review",
    tasks: [
      {
        id: "t-13",
        title: "Define Role Permissions",
        taskType: "feature",
      },
      {
        id: "t-14",
        title: "Restrict Unauthorized Access",
        taskType: "bug",
      },
    ],
  },

  // 🟢 DONE
  {
    id: "ms-7",
    milestoneName: "Project Initialization",
    milestoneDescription:
      "Set up project with Vite, TypeScript, Tailwind, and ShadCN UI.",
    estimatedHours: 6,
    bugSheet: "https://docs.google.com/spreadsheets/d/setup-module",
    status: "done",
    tasks: [
      {
        id: "t-15",
        title: "Configure Tailwind CSS",
        taskType: "feature",
      },
      {
        id: "t-16",
        title: "Setup ShadCN Components",
        taskType: "feature",
      },
    ],
  },
  {
    id: "ms-8",
    milestoneName: "CI/CD Pipeline",
    milestoneDescription:
      "Configure automated deployment using GitHub Actions and Vercel.",
    estimatedHours: 8,
    bugSheet: "https://docs.google.com/spreadsheets/d/cicd-module",
    status: "done",
    tasks: [
      {
        id: "t-17",
        title: "Setup GitHub Actions Workflow",
        taskType: "feature",
      },
      {
        id: "t-18",
        title: "Fix deployment environment variables issue",
        taskType: "bug",
      },
    ],
  },
];