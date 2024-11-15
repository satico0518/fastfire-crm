import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useUiStore } from "../../stores/ui/ui.store";
import { Avatar, Button, Chip } from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Access, User } from "../../interfaces/User";
import { useUsersStore } from "../../stores/users/users.store";
import {
  getWorkgroupColorByKey,
  getWorkgroupNameByKey,
  translateAccess,
} from "../../utils/utils";
import { UserFormComponent } from "../user-form/UserFormComponent";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { Workgroup } from "../../interfaces/Workgroup";
import { UsersService } from "../../services/users.service";

const paginationModel = { page: 0, pageSize: 15 };

export default function UsersTable() {
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const users = useUsersStore((state) => state.users);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);

  const columns: GridColDef[] = [
    {
      field: "actions",
      type: "actions",
      maxWidth: 50,
      resizable: false,
      align: "right",
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<ModeEditOutlineOutlinedIcon />}
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Editar Usuario",
              text: "Ingrese las modificaciones del usuario.",
              content: <UserFormComponent editingUser={params.row} />,
            })
          }
          label="Modificar"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon />}
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
    {
      field: "fullName",
      headerName: "Nombre",
      sortable: false,
      width: 220,
      renderCell: (params: GridRenderCellParams<User>) => (
        <div className="user-name">
          {params.row.avatarURL ? (
            <Avatar src={params.row.avatarURL} sx={{width: '30px', height: '30px'}}/>
          ) : (
            <Avatar
              sx={{
                color: params.row.color ?? "purple",
                height: "30px",
                width: "30px",
              }}
            />
          )}
          <span style={{ marginLeft: "10px" }}>
            {params.row.firstName || ""} {params.row.lastName || ""}
          </span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Correo",
      type: "string",
      width: 320,
    },
    {
      field: "workgroupKeys",
      headerName: "Grupos de trabajo",
      type: "string",
      width: 280,
      renderCell: (params: GridRenderCellParams<User>) => (
        <div className="permissions">
          {params.row?.workgroupKeys?.length > 0 ? (
            params.row?.workgroupKeys?.map((key: string) => {
              const groupName = getWorkgroupNameByKey(
                key,
                workgroups as Workgroup[]
              );
              if (key && groupName !== "NA") {
                return (
                  <Chip
                    size="small"
                    key={key}
                    label={groupName}
                    sx={{
                      backgroundColor:
                        getWorkgroupColorByKey(
                          key,
                          workgroups as Workgroup[]
                        ) || "deepskyblue",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                );
              }
            })
          ) : (
            <Chip label="Sin grupo" color="warning" />
          )}
        </div>
      ),
    },
    {
      field: "permissions",
      headerName: "Permisos",
      type: "string",
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <div className="permissions">
          {params.row.permissions.map((acc: Access) => (
            <Chip
              size="small"
              key={acc}
              label={translateAccess(acc)}
              color="primary"
            />
          ))}
        </div>
      ),
    },
  ];

  const handleDeleteUser = async (userKey: string) => {
    const deleteResult = await UsersService.deleteUser(userKey);

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
        rows={users?.filter((u) => u.isActive) as User[]}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[15, 30]}
        rowHeight={35}
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por pagina" },
        }}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
