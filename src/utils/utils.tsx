import { Project } from "../interfaces/Project";
import { Status } from "../interfaces/Shared";
import { Priority } from "../interfaces/Task";
import { Access, User } from "../interfaces/User";
import { Workgroup } from "../interfaces/Workgroup";
import * as XLSX from "xlsx";
import EmojiFlagsOutlinedIcon from "@mui/icons-material/EmojiFlagsOutlined";

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
    case "TYG":
      return "T&G";
    case "PROVIDER":
      return "Provedor";
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
      return "Bloqueada";
    case "ARCHIVED":
      return "Archivada";
    case "DELETED":
      return "Eliminada";
    case "DONE":
      return "Finalizada";
    default:
      return "NA";
  }
};

export const translateTimestampToString = (date: number): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("es-ES", options);
  const fecha = new Date(date);
  return formatter.format(fecha) || "";
};

export const translatePriority = (priority: Priority): JSX.Element => {
  switch (priority) {
    case "LOW":
      return (
        <span>
          <EmojiFlagsOutlinedIcon
            sx={{ color: "gray", position: "relative", top: "5px" }}
          />{" "}
          Baja
        </span>
      );
    case "NORMAL":
      return (
        <span>
          <EmojiFlagsOutlinedIcon
            sx={{ color: "blue", position: "relative", top: "5px" }}
          />{" "}
          Normal
        </span>
      );
    case "HIGH":
      return (
        <span>
          <EmojiFlagsOutlinedIcon
            sx={{ color: "orange", position: "relative", top: "5px" }}
          />{" "}
          Alta
        </span>
      );
    case "URGENT":
      return (
        <span>
          <EmojiFlagsOutlinedIcon
            sx={{ color: "red", position: "relative", top: "5px" }}
          />{" "}
          Urgente
        </span>
      );
    default:
      return <span>NA</span>;
  }
};

export const getUserNameByKey = (userKey: string, users: User[]): string => {
  if (users.length) {
    const user = users.filter((u) => u.key === userKey)[0];

    return `${user?.firstName} ${user?.lastName}`;
  }
  return "NA";
};

export const getUserKeysByNames = (
  ownerNames: string[],
  users: User[]
): string[] => {
  if (users.length) {
    const owners = users?.filter((u) =>
      ownerNames.some(
        (o) =>
          o.includes(u.firstName) &&
          ownerNames.some((o) => o.includes(u.lastName))
      )
    );
    return (owners?.map((o) => o.key) as string[]) || [];
  }
  return [];
};

export const getProjectNameByKey = (
  projectKey: string,
  projects: Project[]
) => {
  if (projects.length) {
    const project = projects.filter((p) => p.key === projectKey)[0];
    return project.name;
  }
  return "NA";
};

export const getWorkgroupNameByKey = (
  workgroupKey: string,
  workgroups: Workgroup[]
) => {
  if (workgroups.length) {
    const workgroup = workgroups.filter((wg) => wg.key === workgroupKey)[0];
    return workgroup?.name ?? "NA";
  }
  return "NA";
};

export const getWorkgroupColorByKey = (
  workgroupKey: string,
  workgroups: Workgroup[]
): string => {
  if (workgroups.length) {
    const workgroup = workgroups.filter((wg) => wg.key === workgroupKey)[0];
    return workgroup?.color ?? "secondary";
  }
  return "secondary";
};

export const changeDateFromDMA_MDA = (date: string): string => {
  if (date.length) {
    return `${date.split("/")[1]}/${date.split("/")[0]}/${date.split("/")[2]}`;
  }
  return "";
};

export const downloadExcelFile = (jsonData: unknown[], fileName: string) => {
  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(jsonData);
  XLSX.utils.book_append_sheet(libro, hoja);
  const wbout = XLSX.write(libro, { bookType: "xlsx", type: "array" });
  const blob = new Blob([new Uint8Array(wbout)], {
    type: "application/octet-stream",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const compareLicitationVsStock = (
  providerLicitation: { item: string }[],
  stockToTender: { name: string }[]
): { result: boolean; item: string } => {
  if (providerLicitation.length !== stockToTender.length) {
    return { result: false, item: "length" };
  }

  for (let i = 0; i < stockToTender.length; i++) {
    if (
      !providerLicitation.some(
        (p) => p.item.toLowerCase() === stockToTender[i].name.toLowerCase()
      )
    ) {
      return { result: false, item: stockToTender[i].name.toUpperCase() };
    }
  }

  return { result: true, item: "" };
};
