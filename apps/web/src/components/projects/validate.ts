export const validateProject = (form: any) => {
  const errors = {
    name: "",
    client: "",
    date: "",
    hours: "",
    status: "",
    docLink: "",
    milestones: [] as any[],
  };

  let isValid = true;

  // ---------- BASIC FIELDS ----------

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

  // ---------- OPTIONAL DOC LINK ----------

  if (form.docLink && !/^https?:\/\/.+\..+/.test(form.docLink)) {
    errors.docLink = "Enter valid URL";
    isValid = false;
  }

  // ---------- MILESTONES VALIDATION ----------

  if (form.milestones && form.milestones.length > 0) {
    errors.milestones = form.milestones.map((m:any) => {
      const mErrors = {
        name: "",
        hours: "",
      };

      if (!m.name.trim()) {
        mErrors.name = "Milestone name required";
        isValid = false;
      }

      if (!m.hours || m.hours <= 0) {
        mErrors.hours = "Enter valid hours";
        isValid = false;
      }

      return mErrors;
    });
  }

  return { isValid, errors };
};