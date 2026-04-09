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
import { jsPDF } from 'jspdf';

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
      output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
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

    it('usa color default de estado y muestra mensaje de sección vacía', async () => {
      const submission = {
        formatTypeName: 'SECCIONES',
        createdDate: Date.now(),
        data: {},
      };

      const fields = [
        {
          name: 'section_a',
          label: 'Sección A',
          type: 'section',
          subFields: [{ name: 'campo_a', label: 'Campo A', type: 'text' }],
        },
      ];

      await exportSubmissionToPDF(submission as any, fields as any, 'Tester', 'PENDIENTE');

      const doc = (jsPDF as unknown as jest.Mock).mock.results.at(-1)?.value;
      expect(doc.setFillColor).toHaveBeenCalledWith(48, 209, 88);
      expect(doc.text).toHaveBeenCalledWith(
        '— Sin comentarios registrados',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('maneja error cargando logo en header del PDF', async () => {
      const originalFetch = global.fetch;
      const originalFileReader = global.FileReader;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      class MockFileReader {
        result: string | ArrayBuffer | null = 'data:image/png;base64,AAA';
        onloadend: null | (() => void) = null;
        onerror: null | (() => void) = null;
        readAsDataURL() {
          if (this.onloadend) this.onloadend();
        }
      }

      global.fetch = jest.fn(async () => ({
        blob: async () => new Blob(['logo'], { type: 'image/png' }),
      })) as any;
      global.FileReader = MockFileReader as any;

      const doc = {
        internal: { pageSize: { getWidth: () => 210 } },
        addImage: jest.fn().mockImplementationOnce(() => {
          throw new Error('logo-add-image-fail');
        }),
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
        output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
        lastAutoTable: { finalY: 50 },
      };
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => doc as any);

      const submission = {
        formatTypeName: 'LOGO',
        createdDate: Date.now(),
        data: { campo: 'ok' },
      };
      const fields = [{ name: 'campo', label: 'Campo', type: 'text' }];

      await exportSubmissionToPDF(submission as any, fields as any, 'Tester', 'APROBADO');

      expect(consoleSpy).toHaveBeenCalledWith('Error loading logo for PDF:', expect.any(Error));

      global.fetch = originalFetch;
      global.FileReader = originalFileReader;
      consoleSpy.mockRestore();
    });

    it('agrega salto de página al superar límite y maneja error de firma', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const doc = {
        internal: { pageSize: { getWidth: () => 210 } },
        addImage: jest
          .fn()
          .mockImplementationOnce(() => undefined)
          .mockImplementationOnce(() => {
            throw new Error('signature-add-image-fail');
          }),
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
        splitTextToSize: jest.fn().mockImplementation(() => Array(50).fill('linea')),
        addPage: jest.fn(),
        getNumberOfPages: jest.fn().mockReturnValue(1),
        setPage: jest.fn(),
        save: jest.fn(),
        output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
        lastAutoTable: { finalY: 50 },
      };
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => doc as any);

      const submission = {
        formatTypeName: 'PAGINACION',
        createdDate: Date.now(),
        data: {
          h_data: 'valor',
          firma: 'data:image/png;base64,AAA',
        },
      };

      const fields = [
        { name: 'header_big', label: 'Header Grande', type: 'header' },
        { name: 'h_data', label: 'Dato', type: 'text' },
        { name: 'firma', label: 'Firma', type: 'signature' },
      ];

      await exportSubmissionToPDF(submission as any, fields as any, 'Tester', 'APROBADO');

      expect(doc.addPage).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error adding signature to PDF:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('usa fallback visual cuando no puede cargar el logo', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn(async () => {
        throw new Error('logo-fetch-fail');
      }) as any;

      const doc = {
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
        output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
        lastAutoTable: { finalY: 50 },
      };
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => doc as any);

      await exportSubmissionToPDF(
        { formatTypeName: 'FALLBACK', createdDate: Date.now(), data: { a: '1' } } as any,
        [{ name: 'a', label: 'Campo A', type: 'text' }] as any,
        'Tester',
        'APROBADO'
      );

      expect(doc.rect).toHaveBeenCalledWith(0, 0, 210, 35, 'F');
      expect(doc.text).toHaveBeenCalledWith(
        'FAST FIRE DE COLOMBIA SAS',
        105,
        15,
        { align: 'center' }
      );

      global.fetch = originalFetch;
    });

    it('usa dimensiones fallback y maneja error al renderizar imagen', async () => {
      const originalFetch = global.fetch;
      const originalImage = global.Image;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn(async () => {
        throw new Error('logo-fetch-fail');
      }) as any;

      class MockImageError {
        onload: null | (() => void) = null;
        onerror: null | ((err?: unknown) => void) = null;
        set src(_value: string) {
          if (this.onerror) this.onerror(new Error('image-dimensions-fail'));
        }
      }
      global.Image = MockImageError as any;

      const doc = {
        internal: { pageSize: { getWidth: () => 210 } },
        addImage: jest.fn().mockImplementationOnce(() => {
          throw new Error('render-image-fail');
        }),
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
        output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
        lastAutoTable: { finalY: 50 },
      };
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => doc as any);

      await exportSubmissionToPDF(
        {
          formatTypeName: 'IMAGEN',
          createdDate: Date.now(),
          data: { imagen: 'data:image/png;base64,AAA' },
        } as any,
        [{ name: 'imagen', label: 'Imagen', type: 'image' }] as any,
        'Tester',
        'APROBADO'
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error adding image to PDF:', expect.any(Error));
      expect(doc.text).toHaveBeenCalledWith(
        'Imagen: Error al renderizar imagen',
        expect.any(Number),
        expect.any(Number)
      );

      global.fetch = originalFetch;
      global.Image = originalImage;
      consoleSpy.mockRestore();
    });

    it('agrega salto de página cuando una imagen supera el alto disponible', async () => {
      const originalFetch = global.fetch;
      const originalImage = global.Image;

      global.fetch = jest.fn(async () => {
        throw new Error('logo-fetch-fail');
      }) as any;

      class MockImageDims {
        width = 10;
        height = 1000;
        onload: null | (() => void) = null;
        onerror: null | ((err?: unknown) => void) = null;
        set src(_value: string) {
          if (this.onload) this.onload();
        }
      }
      global.Image = MockImageDims as any;

      const doc = {
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
        splitTextToSize: jest.fn().mockImplementation((val: string) => {
          if (val === 'Texto:') return Array(10).fill('t');
          if (val === 'VALOR_LARGO') return Array(16).fill('v');
          return [val];
        }),
        addPage: jest.fn(),
        getNumberOfPages: jest.fn().mockReturnValue(1),
        setPage: jest.fn(),
        save: jest.fn(),
        output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
        lastAutoTable: { finalY: 50 },
      };
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => doc as any);

      await exportSubmissionToPDF(
        {
          formatTypeName: 'PAGINA_IMAGEN',
          createdDate: Date.now(),
          data: { texto: 'VALOR_LARGO', imagen: 'data:image/png;base64,AAA' },
        } as any,
        [
          { name: 'texto', label: 'Texto', type: 'text' },
          { name: 'imagen', label: 'Imagen', type: 'image' },
        ] as any,
        'Tester',
        'APROBADO'
      );

      expect(doc.addPage).toHaveBeenCalled();

      global.fetch = originalFetch;
      global.Image = originalImage;
    });

    it('agrega salto de página en firma cuando no hay espacio suficiente', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn(async () => {
        throw new Error('logo-fetch-fail');
      }) as any;

      const doc = {
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
        splitTextToSize: jest.fn().mockImplementation((val: string) => {
          if (val === 'Texto:') return Array(14).fill('t');
          if (val === 'VALOR_FIRMA') return Array(20).fill('v');
          return [val];
        }),
        addPage: jest.fn(),
        getNumberOfPages: jest.fn().mockReturnValue(1),
        setPage: jest.fn(),
        save: jest.fn(),
        output: jest.fn().mockReturnValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
        lastAutoTable: { finalY: 50 },
      };
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => doc as any);

      await exportSubmissionToPDF(
        {
          formatTypeName: 'PAGINA_FIRMA',
          createdDate: Date.now(),
          data: { texto: 'VALOR_FIRMA', firma: 'data:image/png;base64,AAA' },
        } as any,
        [
          { name: 'texto', label: 'Texto', type: 'text' },
          { name: 'firma', label: 'Firma', type: 'signature' },
        ] as any,
        'Tester',
        'APROBADO'
      );

      expect(doc.addPage).toHaveBeenCalled();

      global.fetch = originalFetch;
    });
  });
});
