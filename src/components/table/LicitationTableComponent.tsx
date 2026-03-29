import { ChangeEvent, Dispatch, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Item } from "../../interfaces/Item";
import { Button, styled } from "@mui/material";
import * as XLSX from "xlsx";
import { useUiStore } from "../../stores/ui/ui.store";
import { compareLicitationVsStock, formatToCOP } from "../../utils/utils";
import { useStockStore } from "../../stores/stock/stock.store";
import { LicitationExcel, LicitationTable } from "../../interfaces/Licitation";

const paginationModel = { page: 0, pageSize: 50 };

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface LicitationTableComponentProps {
  items: LicitationExcel[];
  setItems: Dispatch<React.SetStateAction<LicitationExcel[]>>;
  totalAmount: number;
  setTotalAmount: Dispatch<React.SetStateAction<number>>;
}

export default function LicitationTableComponent({
  items,
  setItems,
  totalAmount,
  setTotalAmount,
}: LicitationTableComponentProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const stockToTender = useStockStore((state) => state.stock).filter(
    (s) => s.showInTender
  );

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Item",
      type: "string",
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <span>{row.name.toUpperCase()}</span>
      ),
    },
    {
      field: "price",
      headerName: "Precio Unitario",
      type: "number",
      width: 150,
      headerAlign: "center",
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <span>{formatToCOP(row.price)}</span>
      ),
    },
  ];

  const readExcel = (event: ChangeEvent<HTMLInputElement> | null) => {
    setIsLoading(true);
    const files = event?.target?.files || null;
    if (!files || files.length === 0) {
      return;
      setIsLoading(false);
    }

    const promise = new Promise<LicitationTable[]>(
      (resolve, reject) => {
        const fr = new FileReader();
        fr.readAsArrayBuffer(files[0]);

        fr.onload = (e) => {
          const ba = e.target?.result;
          const wb = XLSX.read(ba, { type: "buffer" });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const data = XLSX.utils.sheet_to_json(ws) as LicitationTable[];

          if (
            data.some(
              (i) => !i.precio || i.precio === 0 || typeof i.precio !== "number"
            )
          ) {
            setSnackbar({
              open: true,
              message:
                "La columna PRECIO solo puede contener datos numéricos y diferente de 0, corrija el archivo y súbalo de nuevo.",
              severity: "error",
            });
            setIsLoading(false);
            return;
          }

          const comparatorResponse = compareLicitationVsStock(
            data,
            stockToTender
          );

          if (
            !comparatorResponse.result &&
            comparatorResponse.item === "length"
          ) {
            setSnackbar({
              open: true,
              message:
                "La cantidad de items licitados no corresponde con la cantidad de items en la plantilla. Descargue la plantilla e intente de nuevo.",
              severity: "error",
              duration: 5000,
            });
            setIsLoading(false);
            return;
          }

          if (!comparatorResponse.result) {
            setSnackbar({
              open: true,
              message: `El item "${comparatorResponse.item}" no ha sido licitado, agréguelo al archivo e intente de nuevo.`,
              severity: "error",
              duration: 5000,
            });
            setIsLoading(false);
            return;
          }

          const total = data.reduce((acc, val) => acc + val.precio, 0);
          setTotalAmount(total);
          resolve(data);
          setIsLoading(false);
        };

        fr.onerror = (err) => {
          reject(err);
          setIsLoading(false);
        };
      }
    );

    promise
      .then(async (data: LicitationTable[]) => {
        const requiredKeys = ["id", "item", "precio"];
        if (!requiredKeys.every((key) => Object.keys(data[0]).includes(key))) {
          const msg = 'La tabla no tiene el formato requerido, debe incluir las columnas "id", "item" y "precio" y no llevar espacios en blanco. Descargue nuevamente la plantilla y solo modifique la columna de precios';
          setSnackbar({
            open: true,
            message: msg,
            severity: "error",
            duration: 10000,
          });
          console.error(msg);
          return;
        }

        console.log({data});
        
        const mappedData = data.map((v) => ({
          id: v.id,
          name: v.item,
          price: v.precio,
        }));
        console.log({mappedData});

        setItems(mappedData);
        setSnackbar({
          open: true,
          message: "Archivo cargado exitosamente!",
          severity: "success",
          duration: 1500,
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: "Error tratando de cargar el Excel" + JSON.stringify(error),
          severity: "error",
        });
        console.error({ error });
      });
  };

  return (
    <>
      <Paper sx={{ 
        height: "calc(100vh - 230px)", 
        width: "550px",
        backgroundColor: 'rgba(28, 28, 30, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        p: 1
      }}>
        <DataGrid
          rows={items}
          columns={columns}
          columnHeaderHeight={36}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[50]}
          rowHeight={25}
          showColumnVerticalBorder
          density="compact"
          localeText={{
            MuiTablePagination: { labelRowsPerPage: "Filas por página" },
          }}
          sx={{ 
            border: 0,
            color: 'white',
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 0,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 800,
              textTransform: 'uppercase',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiTablePagination-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            }
          }}
          loading={isLoading}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Button
            className="upload-btn"
            component="label"
            role={undefined}
            variant="contained"
            title="Cargar excel"
            startIcon={<UploadFileIcon />}
            size="small"
            sx={{ 
              color: "white",
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: '10px',
              padding: '6px 14px',
              border: '1px solid rgba(48,209,88,0.5)',
              background: 'rgba(48,209,88,0.15)',
              backdropFilter: 'blur(10px)',
              mt: 1,
              '&:hover': {
                background: 'rgba(48,209,88,0.25)',
                border: '1px solid rgba(48,209,88,0.8)',
                boxShadow: '0 0 15px rgba(48,209,88,0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Subir plantilla
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => readExcel(e || null)}
            />
          </Button>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: '0.9rem' }}>
            Valor total licitado: <strong style={{ color: 'white' }}>{formatToCOP(totalAmount)}</strong>
          </span>
        </div>
      </Paper>
    </>
  );
}
