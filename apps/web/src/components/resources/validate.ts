import { Roles } from "@/lib/enum";

export type ResourceForm = {
  name: string;
  role: Roles | null;
  email: string;
};

export type ResourceErrors = {
  name: string;
  role: string;
  email: string;
};

export const validateResource = (form: ResourceForm) => {
  const errors: ResourceErrors = {
    name: "",
    role: "",
    email: "",
  };

  let isValid = true;

  if (!form.name.trim()) {
    errors.name = "Name is required";
    isValid = false;
  }

  if (!form.role) {
    errors.role = "Role is required";
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Invalid email format";
    isValid = false;
  }

  return { isValid, errors };
};