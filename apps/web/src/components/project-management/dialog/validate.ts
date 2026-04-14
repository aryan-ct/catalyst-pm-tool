
import { Milestone } from "../types/types";

export interface MilestoneErrors {
  milestoneName?: string;
  milestoneDescription?: string;
  estimatedHours?: string;
  tasks?: string;
}

export const validateMilestone = (
  data: Partial<Milestone>
): MilestoneErrors => {
  const errors: MilestoneErrors = {};

  if (!data.milestoneName || data.milestoneName.trim() === "") {
    errors.milestoneName = "Milestone name is required.";
  } else if (data.milestoneName.trim().length < 3) {
    errors.milestoneName =
      "Milestone name must be at least 3 characters long.";
  }

  if (
    !data.milestoneDescription ||
    data.milestoneDescription.trim() === ""
  ) {
    errors.milestoneDescription = "Description is required.";
  }
  
  if (
    data.estimatedHours === undefined ||
    data.estimatedHours === null ||
    Number(data.estimatedHours) <= 0
  ) {
    errors.estimatedHours =
      "Estimated hours must be greater than 0.";
  }

if (data.tasks && data.tasks.length > 0) {
  const invalidTask = data.tasks.find(
    (task) => !task.title || task.title.trim() === ""
  );

  if (invalidTask) {
    errors.tasks = "Each task must have a valid title.";
  }
}

  return errors;
};