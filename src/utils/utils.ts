import { Project } from "../interfaces/Project";
import { Status } from "../interfaces/Shared";
import { Access, User } from "../interfaces/User";

export const formatToCOP = (value: number): string => {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  };

  const formatter = new Intl.NumberFormat("es-CO", options);
  return formatter.format(value);
};

export const translateAccess = (access: Access) => {
  switch (access) {
    case "ADMIN":
      return access;
    case "PURCHASE":
      return "COMPRAS";
    case "TYP":
      return "T&P";
    default:
      return "NA";
  }
};

export const translateStatus = (status: Status): string => {
  switch (status) {
    case "TODO":
      return "A Iniciar";
    case "IN_PROGRESS":
      return "En Progreso";
    case "BLOCKED":
      return "Bloqueado";
    case "ARCHIVED":
      return "Archivado";
    case "DONE":
      return "Finalizado";
    default:
      return "NA";
  }
};

export const translateTimestampToString = (date: number): string => {
  interface FormatOptions {
    year: "numeric" | "2-digit";
    month: "numeric" | "2-digit" | "long" | "short";
    day: "numeric" | "2-digit";
    // Puedes agregar más opciones según tus necesidades
  }

  const options: FormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formatter = new Intl.DateTimeFormat("es-ES", options);
  const fecha = new Date(date);
  return formatter.format(fecha);
};

export const GetUserNameByKey = (userKey: string, users: User[]) => {
  if (users.length) {
    const user = users.filter((u) => u.key === userKey)[0];
    return `${user.firstName} ${user.lastName}`;
  }
  return "NA";
};

export const GetProjectNameByKey = (projectKey: string, projects: Project[]) => {
  if (projects.length) {
    const project = projects.filter((p) => p.key === projectKey)[0];
    return project.name;
  }
  return "NA";
};
