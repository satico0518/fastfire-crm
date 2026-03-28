import { RefObject, useRef } from "react";
import { useUiStore } from "../../stores/ui/ui.store";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button, Checkbox, IconButton, Input, Box } from "@mui/material";
import MoneyOutlinedIcon from '@mui/icons-material/MoneyOutlined';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  formatToCOP,
} from "../../utils/utils";
import { useStockStore } from "../../stores/stock/stock.store";
import { Item } from "../../interfaces/Item";
import { PurchaseService } from "../../services/purchase.service";

const paginationModel = { page: 0, pageSize: 50 };

type StockEditAction = 'eliminar'|'archivar';

export default function StockTableComponent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const stock = useStockStore((state) => state.stock);

  const handleDeleteOrArchiveItem = async (item: Item, action: StockEditAction) => {
    let response; 
    if (action === 'archivar')
      response = await PurchaseService.archiveItem(item);
    if (action === 'eliminar')
      response = await PurchaseService.deleteItem(item);

    if (response?.result === 'OK')
      setSnackbar({
        open: true,
        message: response.message ?? "Item modificado exitosamente!",
        severity: "success",
      });
    else
      setSnackbar({
        open: true,
        message: response?.errorMessage ?? "Error al modifiar Item.",
        severity: "error",
      });

    setConfirmation({ open: false, title: "", text: "", actions: null });
  };

  const handleConfirmation = (item: Item, action: StockEditAction) => {
    setConfirmation({
      open: true,
      title: "Confirmación!",
      text: `Vas a ${action} el item "${item.name.toUpperCase()}".`,
      actions: (
        <Button 
          onClick={() => handleDeleteOrArchiveItem(item, action)}
          variant="contained"
          size="small"
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            padding: '6px 16px',
            border: '1px solid rgba(255,69,58,0.5)',
            background: 'rgba(255,69,58,0.15)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'rgba(255,69,58,0.25)',
              border: '1px solid rgba(255,69,58,0.8)',
              boxShadow: '0 0 15px rgba(255,69,58,0.3)',
            },
          }}
        >
          {action}
        </Button>
      ),
    });
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      type: "actions",
      headerAlign: "right",
      align: "right",
      width: 100,
      resizable: false,
      getActions: ({row}: GridRowParams<Item>) => {
        return [
          <GridActionsCellItem
            icon={<MoneyOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={() => PurchaseService.modifyItem({...row, showInTender: !row.showInTender})}
            label={`${row.showInTender ? 'No' : ''} Licitar`}
            sx={{
              color: row.showInTender ? '#ff9f0a' : '#30d158',
              background: row.showInTender ? 'rgba(255,159,10,0.1)' : 'rgba(48,209,88,0.1)',
              border: row.showInTender ? '1px solid rgba(255,159,10,0.2)' : '1px solid rgba(48,209,88,0.2)',
              borderRadius: '8px',
              padding: '4px',
              mx: 0.1,
              '&:hover': {
                background: row.showInTender ? 'rgba(255,159,10,0.2)' : 'rgba(48,209,88,0.2)',
              }
            }}
          />,
          <GridActionsCellItem
            icon={<DeleteOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={() => handleConfirmation(row, 'eliminar')}
            label="Eliminar"
            sx={{
              color: '#ff453a',
              background: 'rgba(255,69,58,0.1)',
              border: '1px solid rgba(255,69,58,0.2)',
              borderRadius: '8px',
              padding: '4px',
              mx: 0.1,
              '&:hover': {
                background: 'rgba(255,69,58,0.2)',
                boxShadow: '0 0 10px rgba(255,69,58,0.2)',
              }
            }}
          />,
        ];
      },
    },
    {
      field: "showInTender",
      headerName: "Licitar",
      type: "boolean",
      width: 80,
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
          <Checkbox 
            checked={row.showInTender} 
            sx={{ color: 'rgba(0,0,0,0.1)', '&.Mui-checked': { color: '#30d158' } }}
          />
        </Box>
      ),
    },
    {
      field: "id",
      headerName: "Código",
      type: "string",
      width: 100,
      renderCell: ({ value }: GridRenderCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', fontWeight: 700, color: 'rgba(0,0,0,0.3)' }}>
          {value}
        </Box>
      )
    },
    {
      field: "name",
      headerName: "Item",
      type: "string",
      width: 300,
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', fontWeight: 500 }}>
          <span
            style={{
              opacity: row.status === "INACTIVE" ? 0.5 : 1,
            }}
          >
            {row.name}
          </span>
        </Box>
      ),
      editable: true,
      renderEditCell: ({row}: GridRenderEditCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Input 
            inputRef={inputRef} 
            placeholder={row.name}
            sx={{ color: '#444', borderBottom: '1px solid rgba(0,0,0,0.2)', width: '100%' }}
          />
          <IconButton
            title="Guardar"
            size="small"
            onClick={() =>
              handleEditItem("name", inputRef, row as Item)
            }
            sx={{
              color: '#0a84ff',
              background: 'rgba(10,132,255,0.1)',
              border: '1px solid rgba(10,132,255,0.3)',
              padding: '4px',
              borderRadius: '8px',
              '&:hover': {
                background: 'rgba(10,132,255,0.2)',
                boxShadow: '0 0 10px rgba(10,132,255,0.2)',
              }
            }}
          >
            <SaveOutlinedIcon fontSize="small"/>
          </IconButton>
        </Box>
      )
    },
    {
      field: "price",
      headerName: "Precio Unitario",
      type: "number",
      width: 200,
      valueGetter: (value) => formatToCOP(value),
      renderCell: ({ value }: GridRenderCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', fontWeight: 600 }}>
          {value}
        </Box>
      ),
      editable: true,
      renderEditCell: ({row}: GridRenderEditCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Input 
            type="number" 
            inputRef={inputRef} 
            sx={{ color: '#444', borderBottom: '1px solid rgba(0,0,0,0.2)' }}
          />
          <IconButton
            title="Guardar"
            size="small"
            onClick={() =>
              handleEditItem("price", inputRef, row as Item)
            }
            sx={{
              color: '#0a84ff',
              background: 'rgba(10,132,255,0.1)',
              border: '1px solid rgba(10,132,255,0.3)',
              padding: '4px',
              borderRadius: '8px',
              '&:hover': {
                background: 'rgba(10,132,255,0.2)',
                boxShadow: '0 0 10px rgba(10,132,255,0.2)',
              }
            }}
          >
            <SaveOutlinedIcon fontSize="small"/>
          </IconButton>
        </Box>
      )
    },    
    {
      field: "count",
      headerName: "Cantidad",
      type: "number",
      width: 200,
      renderCell: ({ value }: GridRenderCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: '#666' }}>
          {value} unidades
        </Box>
      ),
      editable: true,
      renderEditCell: ({row}: GridRenderEditCellParams<Item>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Input 
            type="number" 
            inputRef={inputRef} 
            sx={{ color: '#444', borderBottom: '1px solid rgba(0,0,0,0.2)' }}
          />
          <IconButton
            title="Guardar"
            size="small"
            onClick={() =>
              handleEditItem("count", inputRef, row as Item)
            }
            sx={{
              color: '#0a84ff',
              background: 'rgba(10,132,255,0.1)',
              border: '1px solid rgba(10,132,255,0.3)',
              padding: '4px',
              borderRadius: '8px',
              '&:hover': {
                background: 'rgba(10,132,255,0.2)',
                boxShadow: '0 0 10px rgba(10,132,255,0.2)',
              }
            }}
          >
            <SaveOutlinedIcon fontSize="small"/>
          </IconButton>
        </Box>
      )
    },
  ];

  const handleEditItem = async (
    field: string,
    inputRef: RefObject<HTMLInputElement>,
    item: Item
  ) => {
    try {
      if (!!inputRef.current && !!inputRef.current.value) {
        item[field] = inputRef.current?.value ?? item[field];

        const resp = await PurchaseService.modifyItem(item);
        if (resp.result === "OK") {
          setSnackbar({
            open: true,
            message: "Item editado exitosamente.",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: "Error editando item.",
            severity: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error editando item", { item }, { error });
      setSnackbar({
        open: true,
        message: "Error editando item.",
        severity: "error",
      });
    }
  };

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "100%" }}>
      <DataGrid
        rows={stock?.filter(s => s.status === 'ACTIVE') as Item[]}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[50]}
        rowHeight={60}
        showColumnVerticalBorder
        density="standard"
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por página" },
        }}
        sx={{ 
          border: 0,
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(255,255,255,0.05)',
          }
        }}
      />
    </Paper>
  );
}
