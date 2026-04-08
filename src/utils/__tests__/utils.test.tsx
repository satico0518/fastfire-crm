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
} from '../utils.tsx';
import * as XLSX from "xlsx";
import { render } from '@testing-library/react';

jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      internal: { pageSize: { getWidth: () => 210 } },
      addImage: jest.fn(),
      setFillColor: jest.fn(),
      setDrawColor: jest.fn(),
      setTextColor: jest.fn(),
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      setLineWidth: jest.fn(),
      text: jest.fn(),
      rect: jest.fn(),
      roundedRect: jest.fn(),
      line: jest.fn(),
      splitTextToSize: jest.fn().mockImplementation((val) => [val]),
      addPage: jest.fn(),
      getNumberOfPages: jest.fn().mockReturnValue(1),
      setPage: jest.fn(),
      save: jest.fn(),
      lastAutoTable: { finalY: 50 }
    }))
  };
});

jest.mock('jspdf-autotable', () => jest.fn());

jest.mock("xlsx", () => {
  return {
    utils: {
      book_new: jest.fn().mockReturnValue({}),
      json_to_sheet: jest.fn().mockReturnValue({}),
      sheet_to_json: jest.fn().mockReturnValue([['header1']]),
      aoa_to_sheet: jest.fn().mockReturnValue({}),
      encode_cell: jest.fn().mockReturnValue('A1'),
      book_append_sheet: jest.fn()
    },
    write: jest.fn().mockReturnValue(new Uint8Array([]))
  };
});

describe('Utils', () => {
  beforeAll(() => {
    // Mock URL.createObjectURL and document layout manipulation
    global.URL.createObjectURL = jest.fn();
    
    // Simulate an anchor tag for download test
    const mockClick = jest.fn();
    const anchor = document.createElement('a');
    anchor.click = mockClick;
    
    const createElementSpy = jest.spyOn(document, 'createElement');
    createElementSpy.mockReturnValue(anchor as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('formatToCOP', () => {
    it('debe formatear numero a COP', () => {
      const resp = formatToCOP(1000);
      expect(resp).toBeTruthy(); // Avoid precise string matching due to node environment locale differences, just check it produces something
    });
  });

  describe('translateAccess', () => {
    it('debe traducir accesos correctamente', () => {
      expect(translateAccess('ADMIN')).toBe('ADMIN');
      expect(translateAccess('PURCHASE')).toBe('COMPRAS');
      expect(translateAccess('TYG')).toBe('T&G');
      expect(translateAccess('PROVIDER')).toBe('PROVEEDOR');
      expect(translateAccess('FORMATER')).toBe('FORMATOS');
      expect(translateAccess('PLANNER')).toBe('AGENDA PLANNER');
      expect(translateAccess('MANAGER')).toBe('MANAGER');
      expect(translateAccess('UNKNOWN' as any)).toBe('NA');
    });
  });

  describe('translateStatus', () => {
    it('debe traducir estados correctamente', () => {
      expect(translateStatus('TODO')).toBe('A Iniciar');
      expect(translateStatus('IN_PROGRESS')).toBe('En Progreso');
      expect(translateStatus('BLOCKED')).toBe('Bloqueada');
      expect(translateStatus('ARCHIVED')).toBe('Archivada');
      expect(translateStatus('DELETED')).toBe('Eliminada');
      expect(translateStatus('DONE')).toBe('Finalizada');
      expect(translateStatus('NO_STATE' as any)).toBe('NA');
    });
  });

  describe('translateTimestampToString', () => {
    it('debe retornar fecha formateada', () => {
      const resp = translateTimestampToString(1600000000000);
      expect(typeof resp).toBe('string');
    });
    
    it('debe retornar indefinido si recibe falsey', () => {
      expect(translateTimestampToString(0)).toBeUndefined();
    });
  });

  describe('translatePriority', () => {
    it('debe retornar iconos para prioridades', () => {
      const { container: low } = render(translatePriority('LOW'));
      expect(low.textContent).toContain('Baja');

      const { container: normal } = render(translatePriority('NORMAL'));
      expect(normal.textContent).toContain('Normal');

      const { container: high } = render(translatePriority('HIGH'));
      expect(high.textContent).toContain('Alta');
      
      const { container: urgent } = render(translatePriority('URGENT'));
      expect(urgent.textContent).toContain('Urgente');

      const { container: none } = render(translatePriority('NONE' as any));
      expect(none.textContent).toContain('NA');
    });
  });

  describe('getUserNameByKey', () => {
    const users = [
      { key: '1', firstName: 'Juan', lastName: 'Perez' },
      { key: '2', firstName: ' ', lastName: ' ' },
      { key: '3', firstName: 'Mario', lastName: '' },
      { key: '4', firstName: '', lastName: 'Gomez' },
    ];
    
    it('retorna NA si userKey no existe o esta vacio', () => {
      expect(getUserNameByKey('', users as any)).toBe('NA');
      expect(getUserNameByKey('non-exist', [])).toBe('NA');
    });
    
    it('concatena nombres', () => {
      expect(getUserNameByKey('1', users as any)).toBe('Juan Perez');
      expect(getUserNameByKey('2', users as any)).toBe('(2)');
      expect(getUserNameByKey('3', users as any)).toBe('Mario');
      expect(getUserNameByKey('4', users as any)).toBe('Gomez');
    });
    
    it('retorna identificador si el usuario no existe', () => {
       expect(getUserNameByKey('10', users as any)).toBe('(10)');
    });
  });

  describe('getUserKeysByNames', () => {
    it('retorna kays correctas o vacio', () => {
      expect(getUserKeysByNames(['Juan Perez'], [])).toEqual([]);
      const users = [{ key: 'k1', firstName: 'Ana', lastName: 'Maria' }];
      expect(getUserKeysByNames(['Ana Maria'], users as any)).toEqual(['k1']);
    });
  });

  describe('getProjectNameByKey', () => {
    it('retorna name o NA', () => {
      expect(getProjectNameByKey('1', [])).toBe('NA');
      expect(getProjectNameByKey('1', [{ key: '1', name: 'Project 1' }] as any)).toBe('Project 1');
    });
  });

  describe('getWorkgroupNameByKey', () => {
    it('retorna name o NA', () => {
      expect(getWorkgroupNameByKey('1', [])).toBe('NA');
      expect(getWorkgroupNameByKey('1', [{ key: '1', name: 'WG 1' }] as any)).toBe('WG 1');
      expect(getWorkgroupNameByKey('2', [{ key: '1', name: 'WG 1' }] as any)).toBe('NA');
    });
  });

  describe('getWorkgroupColorByKey', () => {
    it('retorna color o default secondary', () => {
      expect(getWorkgroupColorByKey('1', [])).toBe('secondary');
      expect(getWorkgroupColorByKey('1', [{ key: '1', color: 'red' }] as any)).toBe('red');
      expect(getWorkgroupColorByKey('2', [{ key: '1', color: 'red' }] as any)).toBe('secondary');
    });
  });

  describe('changeDateFromDMA_MDA', () => {
    it('transforma 21/04/2026 a 04/21/2026', () => {
      expect(changeDateFromDMA_MDA('21/04/2026')).toBe('04/21/2026');
      expect(changeDateFromDMA_MDA('')).toBe('');
    });
  });

  describe('compareLicitationVsStock', () => {
    it('retorna true si coinciden', () => {
       expect(compareLicitationVsStock([{ item: 'P1' }], [{ name: 'P1' }])).toEqual({ result: true, item: '' });
    });

    it('falla por logitud', () => {
      expect(compareLicitationVsStock([{ item: 'P1' }, { item: 'P2' }], [{ name: 'P1' }])).toEqual({ result: false, item: 'length' });
    });

    it('falla si stock no existe en licitacion', () => {
      expect(compareLicitationVsStock([{ item: 'P2' }], [{ name: 'P1' }])).toEqual({ result: false, item: 'P1' });
    });
  });

  describe('downloadExcelFile', () => {
    it('descarga archivo xlsx procesando el objeto', () => {
       downloadExcelFile([{ col1: 'val1'}], 'file.xlsx');
       expect(XLSX.utils.book_new).toHaveBeenCalled();
       expect(XLSX.write).toHaveBeenCalled();
    });
  });

  describe('exportSubmissionToPDF', () => {
    it('genera PDF exitosamente para formato de ejemplo', async () => {
      const submission = {
        formatTypeName: 'FORMATO TEST',
        createdDate: 1600000000000,
        reviewNotes: 'Todo ok',
        data: {
          campo_texto: 'Hola',
          campo_num: 150000,
          campo_obs_check: true,
          campo_obs: 'Observación',
        }
      };

      const fields = [
        { name: 'campo_texto', label: 'Campo Texto', type: 'text' },
        { name: 'campo_num', label: 'Costo Total', type: 'number' },
        { name: 'campo_obs_check', label: 'obs', type: 'checkbox' },
        { name: 'campo_obs', label: 'Observación', type: 'text' }
      ];

      const resp = await exportSubmissionToPDF(submission as any, fields as any, 'Usuario', 'APROBADO');
      
      expect(resp).toBeTruthy();
      expect(resp).toContain('formato_test');
    });

    it('renderiza secciones anidadas y arreglos sin error', async () => {
      const submission = {
        formatTypeName: 'OTRO',
        createdDate: 10,
        data: {
          sect_uno: 'si',
          arr_data: ['A', 'B']
        }
      };
      
      const fields = [
        { name: 'section1', label: 'Section', type: 'section', subFields: [ { name: 'sect_uno', label: 'A', type: 'text'} ] },
        { name: 'header_uno', label: 'HeaderTitle', type: 'header' },
        { name: 'arr_data', label: 'Array', type: 'checkbox-group' },
        { name: 'empty', label: 'E', type: 'text' }
      ];

      const resp = await exportSubmissionToPDF(submission as any, fields as any, 'User', 'RECHAZADO');
      expect(resp).toBeTruthy();
    });

    it('procesa signature rendering y arreglos dinamicos', async () => {
       const submission = {
          formatTypeName: 'FIRMAS',
          createdDate: 0,
          data: {
             firma1: 'data:image/png;base64,aaa',
             din_arr: [{ a: 1 }]
          }
       };

       const fields = [
           { name: 'firma1', label: 'Firma Admin', type: 'signature' },
           { name: 'din_arr', label: 'Grupo', type: 'dynamic-group' }
       ];

       const resp = await exportSubmissionToPDF(submission as any, fields as any, 'USRR', 'DRAFT');
       expect(resp).toBeTruthy();
    });
  });
});
