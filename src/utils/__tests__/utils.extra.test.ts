// Extend existing utils tests with missing branches and functions
import {
  translateAccess,
  translateStatus,
  getUserNameByKey,
  getWorkgroupNameByKey,
  getWorkgroupColorByKey,
  compareLicitationVsStock,
  changeDateFromDMA_MDA,
  translateTimestampToString,
  getUserKeysByNames,
  getProjectNameByKey,
} from '../utils';
import { User } from '../../interfaces/User';
import { Workgroup } from '../../interfaces/Workgroup';

describe('Utils - ramas no cubiertas', () => {

  describe('translateAccess - ramas faltantes', () => {
    test('debe traducir acceso FORMATER', () => {
      expect(translateAccess('FORMATER')).toBe('FORMATOS');
    });

    test('debe traducir acceso PLANNER', () => {
      expect(translateAccess('PLANNER')).toBe('AGENDA PLANNER');
    });

    test('debe traducir acceso MANAGER', () => {
      expect(translateAccess('MANAGER')).toBe('MANAGER');
    });

    test('debe retornar NA para acceso desconocido', () => {
      expect(translateAccess('UNKNOWN' as any)).toBe('NA');
    });
  });

  describe('translateStatus - ramas faltantes', () => {
    test('debe traducir status BLOCKED', () => {
      expect(translateStatus('BLOCKED')).toBe('Bloqueada');
    });

    test('debe traducir status ARCHIVED', () => {
      expect(translateStatus('ARCHIVED')).toBe('Archivada');
    });

    test('debe traducir status DELETED', () => {
      expect(translateStatus('DELETED')).toBe('Eliminada');
    });

    test('debe retornar NA para status desconocido', () => {
      expect(translateStatus('UNKNOWN' as any)).toBe('NA');
    });
  });

  describe('getUserNameByKey - ramas faltantes', () => {
    const mockUsers: User[] = [
      { key: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'a@b.com', isActive: true, permissions: ['TYG'], workgroupKeys: [] },
      { key: 'u2', firstName: '', lastName: 'Jones', email: 'b@b.com', isActive: true, permissions: ['TYG'], workgroupKeys: [] },
      { key: 'u3', firstName: 'Bob', lastName: '', email: 'c@b.com', isActive: true, permissions: ['TYG'], workgroupKeys: [] },
      { key: 'u4', firstName: '', lastName: '', email: 'd@b.com', isActive: true, permissions: ['TYG'], workgroupKeys: [] },
    ];

    test('debe retornar NA si userKey es undefined', () => {
      expect(getUserNameByKey(undefined, mockUsers)).toBe('NA');
    });

    test('debe retornar el key entre paréntesis si no se encuentra el usuario', () => {
      expect(getUserNameByKey('unknown_key', mockUsers)).toBe('(unknown_key)');
    });

    test('debe retornar solo el apellido si no hay firstName', () => {
      expect(getUserNameByKey('u2', mockUsers)).toBe('Jones');
    });

    test('debe retornar solo el nombre si no hay lastName', () => {
      expect(getUserNameByKey('u3', mockUsers)).toBe('Bob');
    });

    test('debe retornar (key) si no hay ni firstName ni lastName', () => {
      expect(getUserNameByKey('u4', mockUsers)).toBe('(u4)');
    });

    test('debe retornar NA si la lista de usuarios está vacía', () => {
      expect(getUserNameByKey('u1', [])).toBe('NA');
    });
  });

  describe('getUserKeysByNames - ramas faltantes', () => {
    test('debe retornar array vacío si la lista de usuarios está vacía', () => {
      const result = getUserKeysByNames(['Alice Smith'], []);
      expect(result).toEqual([]);
    });
  });

  describe('getWorkgroupNameByKey - ramas faltantes', () => {
    test('debe retornar NA si la lista de workgroups está vacía', () => {
      expect(getWorkgroupNameByKey('wg1', [])).toBe('NA');
    });

    test('debe retornar NA si el workgroup no existe en la lista', () => {
      const workgroups: Workgroup[] = [
        { key: 'wg1', name: 'Alpha', isActive: true, isPrivate: false, color: '#fff', memberKeys: [] }
      ];
      expect(getWorkgroupNameByKey('wg_nonexistent', workgroups)).toBe('NA');
    });
  });

  describe('getWorkgroupColorByKey - ramas faltantes', () => {
    test('debe retornar "secondary" si la lista está vacía', () => {
      expect(getWorkgroupColorByKey('wg1', [])).toBe('secondary');
    });

    test('debe retornar "secondary" si el workgroup no existe', () => {
      const workgroups: Workgroup[] = [
        { key: 'wg1', name: 'Alpha', isActive: true, isPrivate: false, color: '#ff0000', memberKeys: [] }
      ];
      expect(getWorkgroupColorByKey('wg_missing', workgroups)).toBe('secondary');
    });
  });

  describe('getProjectNameByKey - ramas faltantes', () => {
    test('debe retornar NA si la lista de proyectos está vacía', () => {
      expect(getProjectNameByKey('proj1', [])).toBe('NA');
    });
  });

  describe('changeDateFromDMA_MDA - ramas faltantes', () => {
    test('debe manejar fechas con un solo dígito en día y mes', () => {
      const result = changeDateFromDMA_MDA('5/3/2024');
      expect(result).toBe('3/5/2024');
    });
  });

  describe('translateTimestampToString - ramas faltantes', () => {
    test('debe retornar undefined para timestamp falsy (null-like)', () => {
      expect(translateTimestampToString(null as any)).toBeUndefined();
    });

    test('debe manejar un timestamp válido reciente', () => {
      const ts = Date.now();
      const result = translateTimestampToString(ts);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('compareLicitationVsStock - ramas adicionales', () => {
    test('debe retornar resultado con item en mayúsculas si no coincide', () => {
      const licitation = [{ item: 'producto1' }, { item: 'producto3' }];
      const stock = [{ name: 'producto1' }, { name: 'producto2' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(false);
      expect(result.item).toBe('PRODUCTO2');
    });

    test('debe ser case-insensitive para comparación', () => {
      const licitation = [{ item: 'PRODUCTO1' }];
      const stock = [{ name: 'producto1' }];
      const result = compareLicitationVsStock(licitation, stock);
      expect(result.result).toBe(true);
    });
  });
});
