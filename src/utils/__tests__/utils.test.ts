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
  compareLicitationVsStock
} from '../utils';
import { jsPDF } from 'jspdf';
import { User } from '../../interfaces/User';
import { Workgroup } from '../../interfaces/Workgroup';
import { Project } from '../../interfaces/Project';

jest.mock('jspdf', () => {
  const jsPDF = jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210 } },
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setTextColor: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    roundedRect: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    line: jest.fn(),
    addPage: jest.fn(),
    addImage: jest.fn(),
    getNumberOfPages: jest.fn().mockReturnValue(1),
    setPage: jest.fn(),
    save: jest.fn(),
  }));
  return { jsPDF };
});

jest.mock('jspdf-autotable', () => {
  return jest.fn((doc, opts) => {
    doc.lastAutoTable = { finalY: opts.startY || 0 };
  });
});

describe('Utils', () => {
  describe('formatToCOP', () => {
    test('debe formatear número a pesos colombianos', () => {
      const result = formatToCOP(1000000);
      expect(result).toContain('$');
      expect(result).toContain('1.000.000');
    });
  });

  describe('translateAccess', () => {
    test('debe traducir acceso ADMIN', () => {
      expect(translateAccess('ADMIN')).toBe('ADMIN');
    });

    test('debe traducir acceso PURCHASE', () => {
      expect(translateAccess('PURCHASE')).toBe('COMPRAS');
    });

    test('debe traducir acceso TYG', () => {
      expect(translateAccess('TYG')).toBe('T&G');
    });

    test('debe traducir acceso PROVIDER', () => {
      expect(translateAccess('PROVIDER')).toBe('Provedor');
    });
  });

  describe('translateStatus', () => {
    test('debe traducir status TODO', () => {
      expect(translateStatus('TODO')).toBe('A Iniciar');
    });

    test('debe traducir status IN_PROGRESS', () => {
      expect(translateStatus('IN_PROGRESS')).toBe('En Progreso');
    });

    test('debe traducir status DONE', () => {
      expect(translateStatus('DONE')).toBe('Finalizada');
    });
  });

  describe('translateTimestampToString', () => {
    test('debe convertir timestamp a string', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const result = translateTimestampToString(timestamp);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
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
      }
    ];

    test('debe retornar nombre completo del usuario', () => {
      const result = getUserNameByKey('user1', mockUsers);
      expect(result).toContain('Juan');
      expect(result).toContain('Pérez');
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
      }
    ];

    test('debe retornar keys por nombres', () => {
      const result = getUserKeysByNames(['Juan Pérez'], mockUsers);
      expect(Array.isArray(result)).toBe(true);
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
  });

  describe('changeDateFromDMA_MDA', () => {
    test('debe cambiar formato de fecha', () => {
      const result = changeDateFromDMA_MDA('15/01/2024');
      expect(result).toBe('01/15/2024');
    });

    test('debe retornar string vacío para string vacío', () => {
      expect(changeDateFromDMA_MDA('')).toBe('');
    });
  });

  describe('translatePriority', () => {
    test('debe traducir prioridad LOW', () => {
      const result = translatePriority('LOW');
      expect(result).toBeDefined();
    });

    test('debe traducir prioridad NORMAL', () => {
      const result = translatePriority('NORMAL');
      expect(result).toBeDefined();
    });

    test('debe traducir prioridad HIGH', () => {
      const result = translatePriority('HIGH');
      expect(result).toBeDefined();
    });

    test('debe traducir prioridad URGENT', () => {
      const result = translatePriority('URGENT');
      expect(result).toBeDefined();
    });

    test('debe retornar NA para prioridad desconocida', () => {
      const result = translatePriority('UNKNOWN' as any);
      expect(result).toBeDefined();
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
  });

  describe('exportSubmissionToPDF', () => {
    test('debe renderizar imagen inline y firma al final', async () => {
      const { exportSubmissionToPDF } = await import('../utils');
      const doc = ((jsPDF as unknown) as jest.Mock).mock.results[0].value;

      const submission: any = {
        formatTypeName: 'Formato Test',
        createdDate: new Date().toISOString(),
        data: {
          nombre: 'Test',
          foto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
          firma: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
        },
      };

      const fields: any[] = [
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'foto', label: 'Foto', type: 'image' },
        { name: 'firma', label: 'Firma', type: 'signature' },
      ];

      await exportSubmissionToPDF(submission, fields, 'Usuario', 'APROBADO');

      expect(doc.addImage).toHaveBeenCalledWith(expect.stringContaining('data:image/png;base64'), 'PNG', expect.any(Number), expect.any(Number), 85, 50);
      expect(doc.addImage).toHaveBeenCalledWith(expect.stringContaining('data:image/png;base64'), 'PNG', expect.any(Number), expect.any(Number), 100, 40);
      expect(doc.text).toHaveBeenCalledWith('FIRMAS', expect.any(Number), expect.any(Number), { align: 'center' });
    });
  });

  describe('compareLicitationVsStock', () => {
    test('debe retornar true cuando coinciden', () => {
      const licitation = [{ item: 'producto1' }, { item: 'producto2' }];
      const stock = [{ name: 'producto1' }, { name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(true);
    });

    test('debe retornar false cuando no coinciden', () => {
      const licitation = [{ item: 'producto1' }];
      const stock = [{ name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(false);
    });

    test('debe retornar false cuando diferentes longitudes', () => {
      const licitation = [{ item: 'producto1' }];
      const stock = [{ name: 'producto1' }, { name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(false);
      expect(result.item).toBe('length');
    });
  });
});
