import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { AuthService } from "../../services/auth.service";
import { useUiStore } from "../../stores/ui/ui.store";
import userNoImage from "../../assets/img/user-no-image.png";
import { Button, Chip } from "@mui/material";
import { Access, User } from "../../interfaces/User";
import { useUsersStore } from "../../stores/users/users.store";
import { GetWorkgroupNameByKey, translateAccess } from "../../utils/utils";
import { UserFormComponent } from "../user-form/UserFormComponent";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { Workgroup } from "../../interfaces/Workgroup";

const paginationModel = { page: 0, pageSize: 15 };

export default function UsersTable() {
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const users = useUsersStore(state => state.users);
  const workgroups = useWorkgroupStore(state => state.workgroups);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "Nombre",
      sortable: false,
      width: 350,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <img
            className="user-image"
            src={
              params.row?.avatar?.lenght > 0 ? params.row.avatar : userNoImage
            }
          />{" "}
          <span>
            {params.row.firstName || ""} {params.row.lastName || ""}
          </span>
        </>
      ),
    },
    {
      field: "email",
      headerName: "Correo",
      type: "string",
      width: 350,
    },
    {
      field: "workgroupKeys",
      headerName: "Grupos de trabajo",
      type: "string",
      width: 400,
      renderCell: (params: GridRenderCellParams<User>) => (
        <div className="permissions">
          {params.row.workgroupKeys.map((wg: string) => (
            <Chip size="small" key={wg} label={GetWorkgroupNameByKey(wg, workgroups as Workgroup[])} color="secondary" />
          ))}
        </div>
      ),
    },
    {
      field: "permissions",
      headerName: "Permisos",
      type: "string",
      width: 400,
      renderCell: (params: GridRenderCellParams) => (
        <div className="permissions">
          {params.row.permissions.map((acc: Access) => (
            <Chip size="small" key={acc} label={translateAccess(acc)} color="primary" />
          ))}
        </div>
      ),
    },
    {
      field: "actions",
      type: "actions",
      width: 100,
      align: "right",
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          onClick={() => 
            setModal({
            ...modal,
            open: true,
            title: "Editar Usuario",
            text: "Ingrese las modificaciones del usuario.",
            content: <UserFormComponent editingUser={params.row}/>,
          })}
          label="Editar"
          showInMenu
        />,
        <GridActionsCellItem
          onClick={() =>
            handleDeleteConfirmation(
              params.row.key,
              `${params.row.firstName || ""} ${params.row.lastName || ""}`
            )
          }
          label="Eliminar"
          showInMenu
        />,
      ],
    },
  ];

  const handleDeleteUser = async (userKey: string) => {
    const deleteResult = await AuthService.deleteUser(userKey);

    if (deleteResult)
      setSnackbar({
        open: true,
        message: "Usuario eliminado exitosamente!",
        severity: "success",
      });
    else
      setSnackbar({
        open: true,
        message: "Error al eliminar Usuario.",
        severity: "error",
      });

    setConfirmation({ open: false, title: "", text: "", actions: null });
  };

  const handleDeleteConfirmation = (userKey: string, userName: string) => {
    setConfirmation({
      open: true,
      title: "Confirmacion!",
      text: `Vas a eliminar al usuario "${userName.toUpperCase()}".`,
      actions: (
        <Button onClick={() => handleDeleteUser(userKey)}>Eliminar</Button>
      ),
    });
  };

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "100%" }}>
      <DataGrid
        rows={users as User[]}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[15, 30]}
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por pagina" },
        }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
