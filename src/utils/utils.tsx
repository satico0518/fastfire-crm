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
      return "PROVEEDOR";
    case "FORMATER":
      return "FORMATOS";
    case "PLANNER":
      return "AGENDA PLANNER";
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

export const translateTimestampToString = (
  date: number
): string | undefined => {
  if (!date) return;

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

export const getUserNameByKey = (userKey: string | undefined, users: User[]): string => {
  if (!userKey) return "NA";
  if (users.length) {
    const user = users.find((u) => u.key === userKey);
    if (!user) return `(${userKey})`;

    const firstName = user.firstName?.trim() || "";
    const lastName = user.lastName?.trim() || "";

    if (!firstName && !lastName) return `(${userKey})`;
    if (!firstName) return lastName;
    if (!lastName) return firstName;

    return `${firstName} ${lastName}`;
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

export const downloadExcelFile = (jsonData: unknown[], fileName: string, logoUrl?: string) => {
  const book = XLSX.utils.book_new();
  
  // Create header rows with company branding
  const headerRows = [
    ['🏢 FAST FIRE DE COLOMBIA SAS'], // Company name with icon
    ['📊 Sistema de Gestión CRM'], // System name with icon
    [`📅 Reporte generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`], // Date with icon
    [''], // Empty row for spacing
  ];
  
  // Convert data to array format
  const dataRows = XLSX.utils.json_to_sheet(jsonData);
  const dataArray = XLSX.utils.sheet_to_json(dataRows, { header: 1 });
  
  // Combine header and data
  const fullData = [...headerRows, ...dataArray];
  
  // Create the final sheet
  const sheet = XLSX.utils.aoa_to_sheet(fullData);
  
  // Style the header rows
  // Company name (row 0)
  const companyCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  sheet[companyCell] = { 
    t: 's', 
    v: '🏢 FAST FIRE DE COLOMBIA SAS',
    s: {
      font: { 
        sz: 18, 
        bold: true, 
        color: { rgb: "FF1C1C1E" } // Dark color like app theme
      },
      alignment: { horizontal: 'center' }
    }
  };
  
  // System name (row 1)
  const systemCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
  sheet[systemCell] = { 
    t: 's', 
    v: '📊 Sistema de Gestión CRM',
    s: {
      font: { 
        sz: 14, 
        bold: true,
        color: { rgb: "FF666666" } // Gray color
      },
      alignment: { horizontal: 'center' }
    }
  };
  
  // Date (row 2)
  const dateCell = XLSX.utils.encode_cell({ r: 2, c: 0 });
  sheet[dateCell] = { 
    t: 's', 
    v: `📅 Reporte generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`,
    s: {
      font: { 
        sz: 11, 
        color: { rgb: "FF888888" } // Light gray
      },
      alignment: { horizontal: 'center' }
    }
  };
  
  // Merge header cells across all columns
  const numCols = Object.keys(jsonData[0] || {}).length;
  if (!sheet['!merges']) sheet['!merges'] = [];
  sheet['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }, // Company name
    { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } }, // System name
    { s: { r: 2, c: 0 }, e: { r: 2, c: numCols - 1 } }  // Date
  );
  
  // Style the header row (row 4, after the 3 header rows + 1 empty row)
  const headerRow = 4;
  for (let col = 0; col < numCols; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (sheet[cellRef]) {
      sheet[cellRef].s = {
        fill: { 
          fgColor: { rgb: "FF1C1C1E" }, // Dark background like the app
          patternType: 'solid'
        },
        font: { 
          color: { rgb: "FFFFFFFF" }, // White text
          bold: true,
          sz: 11
        },
        border: {
          top: { style: 'medium', color: { rgb: "FF333333" } },
          bottom: { style: 'medium', color: { rgb: "FF333333" } },
          left: { style: 'thin', color: { rgb: "FF333333" } },
          right: { style: 'thin', color: { rgb: "FF333333" } }
        },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }
  
  // Style data rows with alternating colors and borders
  for (let row = 5; row < fullData.length; row++) {
    for (let col = 0; col < numCols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (sheet[cellRef]) {
        const isEvenRow = (row - 5) % 2 === 0; // -5 because we start from row 5
        sheet[cellRef].s = {
          fill: { 
            fgColor: { rgb: isEvenRow ? "FFFAFAFA" : "FFFFFFFF" }, // Light alternating rows
            patternType: 'solid'
          },
          font: { 
            sz: 10,
            color: { rgb: "FF333333" }
          },
          border: {
            top: { style: 'thin', color: { rgb: "FFE0E0E0" } },
            bottom: { style: 'thin', color: { rgb: "FFE0E0E0" } },
            left: { style: 'thin', color: { rgb: "FFE0E0E0" } },
            right: { style: 'thin', color: { rgb: "FFE0E0E0" } }
          },
          alignment: { vertical: 'center' }
        };
      }
    }
  }
  
  // Set column widths
  sheet['!cols'] = Object.keys((jsonData[0] as object) || {}).map(() => ({ 
    hidden: false, 
    wch: 20,
    wpx: 120 
  }));
  
  // Set row heights
  sheet['!rows'] = [
    { hpt: 30 }, // Company name
    { hpt: 25 }, // System name
    { hpt: 20 }, // Date
    { hpt: 10 }, // Empty row
    { hpt: 25 }, // Headers
  ];
  
  XLSX.utils.book_append_sheet(book, sheet, 'Datos');
  
  const wbout = XLSX.write(book, { bookType: "xlsx", type: "array" });
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
