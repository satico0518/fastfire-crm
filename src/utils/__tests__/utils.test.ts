import { 
  formatToCOP,
  translateAccess,
  translateStatus,
  translateTimestampToString,
  translatePriority,
  getUserNameByKey, 
  getUserKeysByNames,
  getProjectNameByKey,
  getWorkgroupNameByKey,
  getWorkgroupColorByKey,
  changeDateFromDMA_MDA,
  compareLicitationVsStock,
  downloadExcelFile,
  exportSubmissionToPDF
} from '../utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { User } from '../../interfaces/User';
import { Workgroup } from '../../interfaces/Workgroup';
import { Project } from '../../interfaces/Project';

// Mock XLSX
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    json_to_sheet: jest.fn(() => ({})),
    sheet_to_json: jest.fn(() => [[]]),
    aoa_to_sheet: jest.fn(() => ({})),
    encode_cell: jest.fn(({ r, c }) => `R${r}C${c}`),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(() => new Uint8Array()),
}));

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { jsPDF } = require('jspdf');
    const autoTable = require('jspdf-autotable').default;
    const mockDoc = new jsPDF();
    
    (mockDoc.splitTextToSize as jest.Mock).mockImplementation((text: string | string[]) => 
      Array.isArray(text) ? text : [text]
    );
    
    (autoTable as jest.Mock).mockImplementation((doc: any) => {
      doc.lastAutoTable = { finalY: 100 };
    });
    
    (jsPDF as unknown as jest.Mock).mockReturnValue(mockDoc);
  });



  describe('formatToCOP', () => {
    test('debe formatear número a pesos colombianos', () => {
      const result = formatToCOP(1000000);
      expect(result).toMatch(/\$\s?1\.000\.000,00/);
    });
  });

  describe('translateAccess', () => {
    const accessMap: Record<string, string> = {
      'ADMIN': 'ADMIN',
      'PURCHASE': 'COMPRAS',
      'TYG': 'T&G',
      'PROVIDER': 'PROVEEDOR',
      'FORMATER': 'FORMATOS',
      'PLANNER': 'AGENDA PLANNER',
      'MANAGER': 'MANAGER',
    };

    Object.entries(accessMap).forEach(([key, value]) => {
      test(`debe traducir acceso ${key}`, () => {
        expect(translateAccess(key as any)).toBe(value);
      });
    });

    test('debe retornar NA para acceso desconocido', () => {
      expect(translateAccess('' as any)).toBe('NA');
    });
  });

  describe('translateStatus', () => {
    const statusMap: Record<string, string> = {
      'TODO': 'A Iniciar',
      'IN_PROGRESS': 'En Progreso',
      'BLOCKED': 'Bloqueada',
      'ARCHIVED': 'Archivada',
      'DELETED': 'Eliminada',
      'DONE': 'Finalizada',
    };

    Object.entries(statusMap).forEach(([key, value]) => {
      test(`debe traducir status ${key}`, () => {
        expect(translateStatus(key as any)).toBe(value);
      });
    });

    test('debe retornar NA para status desconocido', () => {
      expect(translateStatus('' as any)).toBe('NA');
    });
  });

  describe('translateTimestampToString', () => {
    test('debe convertir timestamp a string', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const result = translateTimestampToString(timestamp);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // "15 ene 2024, 10:30" (depended on locale, but checking basic presence)
      expect(result).toContain('2024');
      expect(result).toContain('30');
    });

    test('debe retornar undefined para timestamp 0', () => {
      expect(translateTimestampToString(0)).toBeUndefined();
    });
  });

  describe('getUserNameByKey', () => {
    const mockUsers: User[] = [
      {
        key: 'user1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: ['wg1']
      },
      {
        key: 'user2',
        firstName: 'Ana',
        lastName: '',
        email: 'ana@test.com',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: []
      },
      {
        key: 'user3',
        firstName: '',
        lastName: 'Soto',
        email: 'soto@test.com',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: []
      },
      {
        key: 'user4',
        firstName: '',
        lastName: '',
        email: 'empty@test.com',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: []
      }
    ];

    test('debe retornar nombre completo del usuario', () => {
      const result = getUserNameByKey('user1', mockUsers);
      expect(result).toBe('Juan Pérez');
    });

    test('debe retornar solo nombre si no hay apellido', () => {
      expect(getUserNameByKey('user2', mockUsers)).toBe('Ana');
    });

    test('debe retornar solo apellido si no hay nombre', () => {
      expect(getUserNameByKey('user3', mockUsers)).toBe('Soto');
    });

    test('debe retornar (key) si el usuario no tiene nombre ni apellido', () => {
      expect(getUserNameByKey('user4', mockUsers)).toBe('(user4)');
    });

    test('debe retornar (key) si el usuario no existe', () => {
      expect(getUserNameByKey('nonexistent', mockUsers)).toBe('(nonexistent)');
    });

    test('debe retornar NA si key no es válida o array está vacío', () => {
      expect(getUserNameByKey('', mockUsers)).toBe('NA');
      expect(getUserNameByKey('user1', [])).toBe('NA');
    });
  });

  describe('getUserKeysByNames', () => {
    const mockUsers: User[] = [
      {
        key: 'user1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        isActive: true,
        permissions: ['TYG'],
        workgroupKeys: ['wg1']
      },
      {
        key: 'user2',
        firstName: 'Maria',
        lastName: 'Gomez',
        email: 'maria@test.com',
        isActive: true,
        permissions: ['PURCHASE'],
        workgroupKeys: []
      }
    ];

    test('debe retornar keys por nombres concurrentes', () => {
      const result = getUserKeysByNames(['Juan Pérez'], mockUsers);
      expect(result).toEqual(['user1']);
    });

    test('debe retornar array vacío si no hay coincidencias', () => {
      const result = getUserKeysByNames(['Pedro Picapiedra'], mockUsers);
      expect(result).toEqual([]);
    });

    test('debe retornar array vacío si users está vacío', () => {
      expect(getUserKeysByNames(['Juan Pérez'], [])).toEqual([]);
    });
  });

  describe('getWorkgroupNameByKey', () => {
    const mockWorkgroups: Workgroup[] = [
      {
        key: 'wg1',
        name: 'Grupo Test',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: ['user1']
      }
    ];

    test('debe retornar nombre del workgroup', () => {
      const result = getWorkgroupNameByKey('wg1', mockWorkgroups);
      expect(result).toBe('Grupo Test');
    });

    test('debe retornar NA si no existe', () => {
      const result = getWorkgroupNameByKey('wg999', mockWorkgroups);
      expect(result).toBe('NA');
    });

    test('debe retornar NA si array está vacío', () => {
      expect(getWorkgroupNameByKey('wg1', [])).toBe('NA');
    });
  });

  describe('getWorkgroupColorByKey', () => {
    const mockWorkgroups: Workgroup[] = [
      {
        key: 'wg1',
        name: 'Grupo Test',
        isActive: true,
        isPrivate: false,
        color: '#FF5722',
        memberKeys: ['user1']
      }
    ];

    test('debe retornar color del workgroup', () => {
      const result = getWorkgroupColorByKey('wg1', mockWorkgroups);
      expect(result).toBe('#FF5722');
    });

    test('debe retornar secondary si no existe', () => {
      const result = getWorkgroupColorByKey('wg999', mockWorkgroups);
      expect(result).toBe('secondary');
    });

    test('debe retornar secondary si array está vacío', () => {
      expect(getWorkgroupColorByKey('wg1', [])).toBe('secondary');
    });
  });

  describe('getProjectNameByKey', () => {
    const mockProjects: Project[] = [
      {
        id: 'proj1',
        key: 'proj1',
        name: 'Proyecto Test',
        status: 'TODO',
        createdDate: Date.now(),
        createdByUserId: 'user1',
        location: 'Bogotá'
      }
    ];

    test('debe retornar nombre del proyecto', () => {
      const result = getProjectNameByKey('proj1', mockProjects);
      expect(result).toBe('Proyecto Test');
    });

    test('debe retornar NA para array vacío', () => {
      const result = getProjectNameByKey('proj1', []);
      expect(result).toBe('NA');
    });
  });

  describe('changeDateFromDMA_MDA', () => {
    test('debe cambiar formato de fecha de 15/01/2024 a 01/15/2024', () => {
      const result = changeDateFromDMA_MDA('15/01/2024');
      expect(result).toBe('01/15/2024');
    });

    test('debe retornar string vacío para string vacío', () => {
      expect(changeDateFromDMA_MDA('')).toBe('');
    });
  });

  describe('translatePriority', () => {
    test('debe traducir prioridades y retornar JSX', () => {
      ['LOW', 'NORMAL', 'HIGH', 'URGENT'].forEach(p => {
        const result = translatePriority(p as any);
        expect(result).toBeDefined();
        expect(result.type).toBe('span');
      });
    });

    test('debe retornar NA para prioridad desconocida', () => {
      const result = translatePriority('UNKNOWN' as any);
      expect(result.props.children).toBe('NA');
    });
  });

  describe('compareLicitationVsStock', () => {
    test('debe retornar true cuando coinciden nombres', () => {
      const licitation = [{ item: 'producto1' }, { item: 'producto2' }];
      const stock = [{ name: 'producto1' }, { name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(true);
    });

    test('debe retornar false e indicar el item faltante', () => {
      const licitation = [{ item: 'producto1' }];
      const stock = [{ name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(false);
      expect(result.item).toBe('PRODUCTO2');
    });

    test('debe retornar false cuando diferentes longitudes', () => {
      const licitation = [{ item: 'producto1' }];
      const stock = [{ name: 'producto1' }, { name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(false);
      expect(result.item).toBe('length');
    });
  });

  describe('downloadExcelFile', () => {
    let originalCreateObjectURL: any;
    let originalRevokeObjectURL: any;

    beforeEach(() => {
      originalCreateObjectURL = window.URL.createObjectURL;
      originalRevokeObjectURL = window.URL.revokeObjectURL;
      window.URL.createObjectURL = jest.fn(() => 'blob:url');
      window.URL.revokeObjectURL = jest.fn();
      
      // Mock document methods
      const mockElem = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        href: '',
        download: '',
        style: {},
      };
      document.createElement = jest.fn().mockReturnValue(mockElem);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    afterEach(() => {
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    test('debe llamar a XLSX y crear un link de descarga', () => {
      const data = [{ a: 1, b: 2 }];
      downloadExcelFile(data, 'test.xlsx');
      
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
      expect(XLSX.write).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('exportSubmissionToPDF', () => {
    test('debe renderizar todos los campos recursivamente e imágenes', async () => {
      const submission: any = {
        formatTypeName: 'Formato Test',
        createdDate: new Date().toISOString(),
        reviewNotes: 'Notas de revisión',
        data: {
          campo1: 'Valor 1',
          campo2: 1000,
          foto1: 'data:image/png;base64,test',
          array1: [{ item: 'A' }, { item: 'B' }],
          array2: ['Simple 1', 'Simple 2'],
          firma: 'data:image/png;base64,signature',
          monto_valor: 500000,
        },
      };

      const fields: any[] = [
        { 
          name: 'seccion1', 
          label: 'Sección 1', 
          type: 'section', 
          subFields: [
            { name: 'campo1', label: 'Campo 1', type: 'text' },
            { name: 'campo2', label: 'Campo 2', type: 'number' },
            { name: 'foto1', label: 'Foto 1', type: 'image' },
            { name: 'array1', label: 'Array 1', type: 'group' },
            { name: 'array2', label: 'Array 2', type: 'multi-select' },
          ]
        },
        { name: 'monto_valor', label: 'Valor Total', type: 'number' },
        { name: 'firma', label: 'Firma', type: 'signature' },
      ];

      const resultFileName = await exportSubmissionToPDF(submission, fields, 'Juan Pérez', 'APROBADO');
      
      expect(resultFileName).toContain('formato_test');
      expect(jsPDF).toHaveBeenCalled();
      
      const doc = ((jsPDF as unknown) as jest.Mock).mock.results[0].value;
      
      const textCalls = doc.text.mock.calls.map((call: any) => {
        const val = call[0];
        return Array.isArray(val) ? val.join(' ') : String(val);
      });

      expect(textCalls.some((tc: string) => tc.includes('FAST FIRE'))).toBeTruthy();
      expect(doc.rect).toHaveBeenCalled();
      expect(doc.addImage).toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalled();
      expect(autoTable).toHaveBeenCalled();
      expect(textCalls.some((tc: string) => tc.includes('Simple 1, Simple 2'))).toBeTruthy();
    });

    test('debe manejar errores al cargar imágenes', async () => {
      // Mock fetch to fail for this test
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation(() => Promise.reject('error'));

      const submission: any = {
        formatTypeName: 'Error Test',
        createdDate: new Date().toISOString(),
        data: { foto: 'invalid-url', firma: 'invalid-url' },
      };

      const fields: any[] = [
        { name: 'foto', label: 'Foto', type: 'image' },
        { name: 'firma', label: 'Firma', type: 'signature' },
      ];

      await exportSubmissionToPDF(submission, fields, 'Test', 'APROBADO');
      const doc = ((jsPDF as unknown) as jest.Mock).mock.results[0].value;
      
      const textCalls = doc.text.mock.calls.map((call: any) => {
        const val = call[0];
        return Array.isArray(val) ? val.join(' ') : String(val);
      });

      expect(textCalls.some((tc: string) => tc.includes('Error cargando imagen') || tc.includes('Error al renderizar'))).toBeTruthy();

      global.fetch = originalFetch;
    });


    test('debe formatear campos de moneda correctamente', async () => {
      const submission: any = {
        formatTypeName: 'Currency Test',
        createdDate: new Date().toISOString(),
        data: {
          precio_item: 1250500,
        },
      };

      const fields: any[] = [{ name: 'precio_item', label: 'Precio Item', type: 'number' }];

      await exportSubmissionToPDF(submission, fields, 'Test', 'APROBADO');
      const doc = ((jsPDF as unknown) as jest.Mock).mock.results[0].value;
      
      const textCalls = doc.text.mock.calls.map((call: any) => {
        const val = call[0];
        return Array.isArray(val) ? val.join(' ') : String(val);
      });
      
      expect(textCalls.some((tc: string) => tc.includes('$ 1.250.500'))).toBeTruthy();
    });

    test('debe manejar secciones vacías', async () => {
      const submission: any = {
        formatTypeName: 'Vacío',
        createdDate: new Date().toISOString(),
        data: {},
      };

      const fields: any[] = [
        { 
          name: 'seccion_vacia', 
          label: 'Sección Vacía', 
          type: 'section', 
          subFields: [{ name: 'sub', label: 'Sub', type: 'text' }]
        }
      ];

      await exportSubmissionToPDF(submission, fields, 'Test', 'BORRADOR');
      const doc = ((jsPDF as unknown) as jest.Mock).mock.results[0].value;
      expect(doc.text).toHaveBeenCalledWith('— Sin comentarios registrados', expect.any(Number), expect.any(Number));
    });

    test('debe manejar headers y omitirlos si no hay data debajo', async () => {
      const submission: any = {
        formatTypeName: 'Headers',
        createdDate: new Date().toISOString(),
        data: { sub1: 'Con data' },
      };

      const fields: any[] = [
        { name: 'h1', label: 'Header 1', type: 'header' },
        { name: 'sub1', label: 'Sub 1', type: 'text' },
        { name: 'h2', label: 'Header 2', type: 'header' },
      ];

      await exportSubmissionToPDF(submission, fields, 'Test', 'ENVIADO');
      const doc = ((jsPDF as unknown) as jest.Mock).mock.results[0].value;
      
      const textCalls = doc.text.mock.calls.map((call: any) => {
        const val = call[0];
        return Array.isArray(val) ? val.join(' ') : String(val);
      });
      
      expect(textCalls.some((tc: string) => tc.includes('Header 1'))).toBeTruthy();
      expect(textCalls.some((tc: string) => tc.includes('Header 2'))).toBeFalsy();
    });
  });


});

