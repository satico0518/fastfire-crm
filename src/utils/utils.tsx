import { Project } from "../interfaces/Project";
import { Status } from "../interfaces/Shared";
import { Priority } from "../interfaces/Task";
import { Access, User } from "../interfaces/User";
import { Workgroup } from "../interfaces/Workgroup";
import { FormatSubmission, FormatField } from "../interfaces/Format";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
    case "MANAGER":
      return "MANAGER";
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

export const downloadExcelFile = (jsonData: unknown[], fileName: string) => {
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
  const dataArray: unknown[][] = XLSX.utils.sheet_to_json(dataRows, { header: 1 });
  
  // Combine header and data
  const fullData: unknown[][] = [...headerRows, ...dataArray];
  
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

// Helper function to load image and convert to base64
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    // If already base64, return as is
    if (url.startsWith('data:image/')) {
      return url;
    }
    // Fetch image and convert to base64
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

// Check if value is an image
const isImageValue = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const str = value.trim();
  const lowerStr = str.toLowerCase();
  
  // Check for data URL images
  if (lowerStr.startsWith("data:image/")) return true;
  
  // Check for Cloudinary images
  if (lowerStr.startsWith("https://res.cloudinary.com")) return true;
  
  // Check for other common image hosting services
  if (lowerStr.startsWith("https://") && 
      (lowerStr.includes("image") || 
       lowerStr.includes("img") ||
       lowerStr.includes("photo") ||
       lowerStr.includes("upload"))) return true;
  
  // Check if it looks like base64 encoded image data
  // Base64 images are typically long strings with specific patterns
  if (str.length > 1000 && 
      (str.match(/^[A-Za-z0-9+/=]+$/) || // Pure base64
       lowerStr.includes("base64") ||
       str.includes('/9j/') || // JPEG magic bytes in base64
       str.includes('iVBORw0KGgo') || // PNG magic bytes in base64
       str.includes('R0lGODdh') || // GIF magic bytes
       str.includes('R0lGODlh'))) {
    return true;
  }
  
  return false;
};

// Recursively find all images in data object
const findAllImages = (data: any, path: string = ''): { label: string; value: string }[] => {
  const images: { label: string; value: string }[] = [];
  
  if (typeof data === 'string' && isImageValue(data)) {
    images.push({ label: path || 'Imagen', value: data });
  } else if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      images.push(...findAllImages(item, `${path} [${idx + 1}]`));
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      const newPath = path ? `${path} - ${key}` : key;
      images.push(...findAllImages(value, newPath));
    });
  }
  
  return images;
};

const getImageFormat = (base64: string): 'JPEG' | 'PNG' | 'GIF' => {
  const lower = base64.toLowerCase();
  if (lower.startsWith('data:image/png')) return 'PNG';
  if (lower.startsWith('data:image/gif')) return 'GIF';
  // Fallback JPEG
  return 'JPEG';
};

// Render a single image inline in the PDF, con manejo de saltos de página
const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (err) => reject(err);
    img.src = base64;
  });
};

const renderImageInline = async (
  doc: any,
  imageLabel: string,
  imageValue: string,
  currentYRef: { value: number },
  margin: number
) => {
  try {
    const base64 = await loadImageAsBase64(imageValue);
    if (!base64) {
      doc.setTextColor(255, 69, 58);
      doc.setFontSize(9);
      doc.text(`${imageLabel}: Error cargando imagen`, margin, currentYRef.value);
      currentYRef.value += 10;
      return;
    }

    const imgFormat = getImageFormat(base64);

    if (currentYRef.value > 200) {
      doc.addPage();
      currentYRef.value = 20;
    }

    doc.setTextColor(48, 209, 88);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(imageLabel, margin, currentYRef.value);
    currentYRef.value += 5;

    const targetWidth = 170; // mm available
    const maxWidth = 150; // leave margins
    const maxHeight = 80; // avoid taking too much page

    let imgWidth = 85;
    let imgHeight = 50;

    try {
      const dims = await getImageDimensions(base64);
      const ratio = dims.width / dims.height;
      imgWidth = Math.min(maxWidth, targetWidth);
      imgHeight = imgWidth / ratio;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * ratio;
      }
    } catch (err) {
      // Fallback fixed dimensions
      imgWidth = 85;
      imgHeight = 50;
    }

    // Ensure image does not overflow on current page; move to next page if needed
    if (currentYRef.value + imgHeight + 15 > 280) {
      doc.addPage();
      currentYRef.value = 20;
    }

    doc.addImage(base64, imgFormat, margin, currentYRef.value, imgWidth, imgHeight);
    currentYRef.value += imgHeight + 10;
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    doc.setTextColor(255, 69, 58);
    doc.setFontSize(9);
    doc.text(`${imageLabel}: Error al renderizar imagen`, margin, currentYRef.value);
    currentYRef.value += 10;
  }
};

// Main PDF export function for format submissions
export const exportSubmissionToPDF = async (
  submission: FormatSubmission,
  fields: FormatField[],
  userName: string,
  statusLabel: string
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = 20;
  
  // Header with company styling and Logo
  try {
    const logoBase64 = await loadImageAsBase64('/src/assets/img/Logo.jpg');
    if (logoBase64) {
      const imgFormat = getImageFormat(logoBase64);
      doc.addImage(logoBase64, imgFormat, margin, 10, 25, 20); // Logo on the left
      
      doc.setFillColor(28, 28, 30);
      doc.rect(40, 0, pageWidth - 40, 35, 'F');
      
      doc.setTextColor(48, 209, 88);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FAST FIRE DE COLOMBIA SAS', 45, 15);
      
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión CRM - Reporte de Formato', 45, 22);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 45, 30);
    } else {
      // Fallback if logo fails
      doc.setFillColor(28, 28, 30);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(48, 209, 88);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FAST FIRE DE COLOMBIA SAS', pageWidth / 2, 15, { align: 'center' });
    }
  } catch (err) {
    console.error('Error loading logo for PDF:', err);
  }
  
  currentY = 45;
  
  // Format type title
  doc.setTextColor(48, 209, 88);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(submission.formatTypeName.toUpperCase(), margin, currentY);
  currentY += 8;
  
  // Status badge
  const badgeColor = (() => {
    const status = statusLabel?.toLowerCase?.() || '';
    if (status.includes('rechaz')) return { r: 220, g: 53, b: 69 }; // rojo
    if (status.includes('aprobad')) return { r: 48, g: 209, b: 88 }; // verde
    if (status.includes('enviad') || status.includes('submitted')) return { r: 0, g: 123, b: 255 }; // azul
    if (status.includes('borrad') || status.includes('draft')) return { r: 108, g: 117, b: 125 }; // gris
    return { r: 48, g: 209, b: 88 }; // default verde
  })();

  doc.setFillColor(badgeColor.r, badgeColor.g, badgeColor.b);
  doc.roundedRect(margin, currentY - 4, 40, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(statusLabel.toUpperCase(), margin + 20, currentY + 1, { align: 'center' });
  currentY += 12;
  
  // Metadata section
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Creado por: ${userName}`, margin, currentY);
  currentY += 5;
  doc.text(`Fecha: ${new Date(submission.createdDate).toLocaleDateString('es-CO')}`, margin, currentY);
  if (submission.reviewNotes) {
    currentY += 5;
    doc.setTextColor(255, 159, 10);
    doc.text(`Notas del revisor: ${submission.reviewNotes}`, margin, currentY);
  }
  currentY += 10;
  
  // Separator line
  doc.setDrawColor(48, 209, 88);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  // Process each field recursively
  const data = submission.data || {};
  const currentYRef = { value: currentY };

  const renderRecursiveFields = async (fieldsArray: any[], currentData: Record<string, any>, depth: number = 0) => {
    for (const field of fieldsArray) {
      const value = currentData[field.name];
      const indent = depth * 6;
      
      // Page break check
      if (currentYRef.value > 270) {
        doc.addPage();
        currentYRef.value = 20;
      }

      // Handle Section
      if (field.type === 'section' && field.subFields) {
        doc.setTextColor(0, 122, 255); // Blue for sections
        doc.setFontSize(11); // Slightly smaller for better fit
        doc.setFont('helvetica', 'bold');
        
        const sectionTitle = field.label.toUpperCase();
        const splitSection = doc.splitTextToSize(sectionTitle, pageWidth - (margin + indent) - 10);
        doc.text(splitSection, margin + indent, currentYRef.value);
        
        const sectionLines = splitSection.length;
        doc.setDrawColor(0, 122, 255, 50);
        doc.line(margin + indent, currentYRef.value + (sectionLines * 5) - 2, pageWidth - margin, currentYRef.value + (sectionLines * 5) - 2);
        currentYRef.value += (sectionLines * 5) + 5;
        
        // Check if section has data
        const hasDataInSection = field.subFields.some((sub: any) => {
          const v = currentData[sub.name];
          return v !== undefined && v !== null && String(v).trim() !== "" && !sub.name.endsWith("_obs_check");
        });

        if (!hasDataInSection) {
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('— Sin comentarios registrados', margin + indent + 5, currentYRef.value);
          currentYRef.value += 8;
        } else {
          await renderRecursiveFields(field.subFields, currentData, depth + 1);
        }

        currentYRef.value += 5;
        continue;
      }

      // Handle Header (Sub-titles)
      if (field.type === 'header') {
        const currentIdx = fieldsArray.findIndex(f => f === field);
        let hasDataBelow = false;
        
        for (let j = currentIdx + 1; j < fieldsArray.length; j++) {
           const nextF = fieldsArray[j];
           if (nextF.type === 'header') break; // Stop looking at the next header
           
           const v = currentData[nextF.name];
           if (v !== undefined && v !== null && v !== "" && !nextF.name.endsWith("_obs_check")) {
             hasDataBelow = true;
             break;
           }
        }

        if (!hasDataBelow) continue;

        doc.setTextColor(28, 28, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        
        const splitHeader = doc.splitTextToSize(`• ${field.label}`, pageWidth - (margin + indent) - 10);
        const headerHeight = splitHeader.length * 5;
        doc.rect(margin + indent, currentYRef.value - 4, pageWidth - margin - (margin + indent), headerHeight + 2, 'F');
        doc.text(splitHeader, margin + indent + 2, currentYRef.value);
        currentYRef.value += headerHeight + 4;
        continue;
      }

      // Regular fields
      if (value === undefined || value === null || value === '' || field.name.endsWith("_obs_check")) continue;

      const isObservation = field.name.endsWith("_obs");
      const fieldIndent = isObservation ? indent + 5 : indent;

      // Handle Signature separately
      if (field.type === 'signature') {
        const signatureValue = value as string;
        if (currentYRef.value + 60 > 280) {
          doc.addPage();
          currentYRef.value = 20;
        }

        doc.setTextColor(48, 209, 88);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${field.label}:`, margin + fieldIndent, currentYRef.value);
        currentYRef.value += 6;

        try {
          const base64 = await loadImageAsBase64(signatureValue);
          if (base64) {
            const imgFormat = getImageFormat(base64);
            // Background for contrast
            doc.setFillColor(242, 242, 242);
            doc.rect(margin + fieldIndent, currentYRef.value, 100, 40, 'F');
            doc.setDrawColor(230, 230, 230);
            doc.rect(margin + fieldIndent, currentYRef.value, 100, 40, 'D');
            
            doc.addImage(base64, imgFormat, margin + fieldIndent, currentYRef.value, 100, 40);
            currentYRef.value += 48;
          }
        } catch (error) {
          console.error('Error adding signature to PDF:', error);
          doc.setTextColor(255, 69, 58);
          doc.text('Error al cargar firma', margin + fieldIndent, currentYRef.value);
          currentYRef.value += 10;
        }
        continue;
      }

      // Label with wrapping
      doc.setTextColor(48, 209, 88);
      doc.setFontSize(9);
      doc.setFont('helvetica', isObservation ? 'italic' : 'bold');
      const labelPrefix = isObservation ? '|-- ' : '';
      const splitLabel = doc.splitTextToSize(`${labelPrefix}${field.label}:`, contentWidth - fieldIndent);
      doc.text(splitLabel, margin + fieldIndent, currentYRef.value);
      currentYRef.value += (splitLabel.length * 4) + 1;

      // Value rendering
      if (field.type === 'image' || isImageValue(value)) {
        await renderImageInline(doc, field.label, String(value), currentYRef, margin + fieldIndent);
      } else if (Array.isArray(value)) {
        // Handle Dynamic Groups or simple arrays
        if (value.length > 0 && typeof value[0] === 'object') {
           // Reuse existing autoTable logic for arrays...
           // (Simplifying for brevity in this replace call, but keeping core logic)
           const keys = Object.keys(value[0]);
           const rows = value.map((item: any) => keys.map(k => String(item[k] || '-')));
           autoTable(doc, {
             head: [keys.map(k => k.replace(/_/g, ' ').toUpperCase())],
             body: rows,
             startY: currentYRef.value,
             margin: { left: margin + fieldIndent },
             styles: { fontSize: 8 },
             headStyles: { fillColor: [28, 28, 30] }
           });
           currentYRef.value = (doc as any).lastAutoTable.finalY + 8;
        } else {
           const valText = value.join(", ");
           doc.setTextColor(60, 60, 60);
           doc.setFontSize(9);
           doc.setFont('helvetica', 'normal');
           const splitVal = doc.splitTextToSize(valText, contentWidth - fieldIndent);
           doc.text(splitVal, margin + fieldIndent + 2, currentYRef.value);
           currentYRef.value += splitVal.length * 4 + 4;
        }
      } else {
        // Simple value
        let displayValue = String(value);
        const lowerLabel = field.label.toLowerCase();
        const isCurrency = (lowerLabel.includes('valor') || lowerLabel.includes('precio') || 
                           lowerLabel.includes('monto') || lowerLabel.includes('costo')) && 
                           !lowerLabel.includes('cantidad');
        
        if (!isNaN(Number(value)) && value !== '' && isCurrency) {
          displayValue = `$ ${Number(value).toLocaleString('es-CO')}`;
        }
        
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(displayValue, contentWidth - fieldIndent);
        doc.text(splitText, margin + fieldIndent + 2, currentYRef.value);
        currentYRef.value += splitText.length * 4 + 5;
      }
    }
  };

  await renderRecursiveFields(fields, data);
  currentY = currentYRef.value;

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(28, 28, 30);
    doc.rect(0, 287, pageWidth, 10, 'F');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount} - Fast Fire de Colombia SAS`, pageWidth / 2, 293, { align: 'center' });
  }
  
  // Save PDF
  const fileName = `${submission.formatTypeName.replace(/\s+/g, '_').toLowerCase()}_${new Date(submission.createdDate).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};
