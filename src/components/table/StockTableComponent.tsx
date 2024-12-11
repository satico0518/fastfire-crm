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
import { Project } from "../../interfaces/Project";
import { Button, Checkbox, Input } from "@mui/material";
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
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
        <Button onClick={() => handleDeleteOrArchiveItem(item, action)}>
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
      maxWidth: 50,
      resizable: false,
      getActions: ({row}: GridRowParams<Item>) => {
        return [
          <GridActionsCellItem
            icon={<MoneyOutlinedIcon color={row.showInTender ? 'warning' : 'success'}/>}
            onClick={() => PurchaseService.modifyItem({...row, showInTender: !row.showInTender})}
            label={`${row.showInTender ? 'No' : ''} Licitar`}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<ArchiveOutlinedIcon color="info"/>}
            onClick={() => handleConfirmation(row, 'archivar')}
            label="Archivar"
            showInMenu
          />,
          <GridActionsCellItem
            icon={<DeleteOutlineOutlinedIcon color="error" />}
            onClick={() => handleConfirmation(row, 'eliminar')}
            label="Eliminar"
            showInMenu
          />,
        ];
      },
    },
    {
      field: "showInTender",
      headerName: "Licitar",
      type: "boolean",
      width: 100,
      renderCell: ({ row }: GridRenderCellParams<Item>) => (
        <Checkbox checked={row.showInTender}/>
      ),
    },
    {
      field: "id",
      headerName: "Código",
      type: "string",
      width: 100,
    },
    {
      field: "name",
      headerName: "Item",
      type: "string",
      width: 300,
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Project>) => (
        <span
          style={{
            textDecoration: row.status === "DONE" ? "line-through" : "none",
          }}
        >
          {row.name}
        </span>
      ),
      editable: true,
      renderEditCell: ({row}: GridRenderEditCellParams<Item>) => (
        <>
          <Input inputRef={inputRef} placeholder={row.name}></Input>
          <Button
            title="Guardar"
            onClick={() =>
              handleEditItem("name", inputRef, row as Item)
            }
          >
            <SaveOutlinedIcon fontSize="small"/>
          </Button>
        </>
      )
    },
    {
      field: "price",
      headerName: "Precio",
      type: "number",
      width: 200,
      valueGetter: (value) => formatToCOP(value),
      editable: true,
      renderEditCell: ({row}: GridRenderEditCellParams<Item>) => (
        <>
          <Input type="number" inputRef={inputRef} placeholder={row.name}></Input>
          <Button
            title="Guardar"
            onClick={() =>
              handleEditItem("price", inputRef, row as Item)
            }
          >
            <SaveOutlinedIcon fontSize="small"/>
          </Button>
        </>
      )
    },    
    {
      field: "count",
      headerName: "Cantidad",
      type: "number",
      width: 200,
      editable: true,
      renderEditCell: ({row}: GridRenderEditCellParams<Item>) => (
        <>
          <Input type="number" inputRef={inputRef} placeholder={row.name}></Input>
          <Button
            title="Guardar"
            onClick={() =>
              handleEditItem("count", inputRef, row as Item)
            }
          >
            <SaveOutlinedIcon fontSize="small"/>
          </Button>
        </>
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
        rowHeight={25}
        showColumnVerticalBorder
        density="compact"
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por página" },
        }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
