export type ProjectForm = {
  name: string;
  client: string;
  date: string;
  hours: number;
  status: string;
  docLink: string;
};

export const validateProject = (form: ProjectForm) => {
  const errors = {
    name: "",
    client: "",
    date: "",
    hours: "",
    status: "",
    docLink: "",
  };

  let isValid = true;

  if (!form.name.trim()) {
    errors.name = "Project name is required";
    isValid = false;
  }

  if (!form.client.trim()) {
    errors.client = "Client name is required";
    isValid = false;
  }

  if (!form.date) {
    errors.date = "Date is required";
    isValid = false;
  }

  if (!form.hours || form.hours <= 0) {
    errors.hours = "Enter valid hours";
    isValid = false;
  }

  if (!form.status) {
    errors.status = "Status required";
    isValid = false;
  }

  if (!form.docLink.trim()) {
    errors.docLink = "Document link required";
    isValid = false;
  }

  return { isValid, errors };
};