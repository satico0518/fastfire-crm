import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Project } from "../../interfaces/Project";
import { useStockStore } from "../../stores/stock/stock.store";
import { Item } from "../../interfaces/Item";
import { Input } from "@mui/material";

const paginationModel = { page: 0, pageSize: 50 };

export default function LicitationTableComponent() {
  const stock = useStockStore((state) => state.stock);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Item",
      type: "string",
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Item>) => <span>{row.name.toUpperCase()}</span>
    },
    {
      field: "price",
      headerName: "Precio",
      type: "number",
      width: 100,
      headerAlign: 'center',
      renderCell: ({ row }: GridRenderCellParams<Project>) => <Input type="number" name={row.id}/>,
    }
  ];

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "500px" }}>
      <DataGrid
        rows={stock?.filter(s => s.status === 'ACTIVE' && s.showInTender) as Item[]}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[50]}
        rowHeight={25}
        showColumnVerticalBorder
        density="compact"
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por página" },
        }}
        onRowEditStop={(p, e) => console.log(p, e)}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
