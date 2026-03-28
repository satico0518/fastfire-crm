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
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
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
      getActions: (params: GridRowParams<User>) => [
        <GridActionsCellItem
          icon={<ModeEditOutlineOutlinedIcon color="info" />}
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
          icon={<DeleteOutlineOutlinedIcon color="error" />}
          onClick={() =>
            handleDeleteConfirmation(
              params?.row?.key as string,
              `${params.row.firstName || ""} ${params.row.lastName || ""}`,
              params.row.permissions.includes("PROVIDER")
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
      renderCell: ({ row }: GridRenderCellParams<User>) => (
        <div className="user-name">
          {row.avatarURL ? (
            <Avatar
              src={row.avatarURL}
              sx={{ 
                width: "40px", 
                height: "40px",
                p: "2px", // Safe space for logos
                border: "1.5px solid rgba(255,255,255,0.15)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                bgcolor: "white", 
                transform: "translateZ(0)", // Hardware acceleration
                transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                "&:hover": { transform: "scale(1.1) translateZ(0)", zIndex: 10 }
              }}
              imgProps={{ 
                style: { 
                  objectFit: "contain", // Contain for logos to be safe
                  borderRadius: "50%" 
                } 
              }}
            />
          ) : !row.permissions.includes("PROVIDER") ? (
            <Avatar
              sx={{
                color: row.color ?? "purple",
                height: "30px",
                width: "30px",
              }}
            />
          ) : (
            <StoreOutlinedIcon fontSize="large" />
          )}
          <span style={{ marginLeft: "10px" }}>
            {row.firstName || ""} {row.lastName || ""}
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
      renderCell: ({ row }: GridRenderCellParams<User>) => (
        <div className="permissions">
          {row?.workgroupKeys?.length > 0
            ? row?.workgroupKeys?.map((key: string) => {
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
                        backgroundColor: (getWorkgroupColorByKey(
                            key,
                            workgroups as Workgroup[]
                          ) || "deepskyblue"),
                        opacity: 0.8,
                        color: "white",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                        height: "18px",
                        "& .MuiChip-label": { padding: "0 5px" },
                      }}
                    />
                  );
                }
              })
            : !row.permissions.includes("PROVIDER") && (
                <Chip 
                  label="SIN GRUPO" 
                  color="warning" 
                  size="small"
                  sx={{
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    opacity: 0.8,
                    height: "18px",
                    "& .MuiChip-label": { padding: "0 5px" },
                  }}
                />
              )}
        </div>
      ),
    },
    {
      field: "permissions",
      headerName: "Permisos",
      type: "string",
      width: 320,
      renderCell: ({ row }: GridRenderCellParams<User>) => (
        <div className="permissions" style={{ display: 'flex', flexWrap: 'nowrap', gap: '3px', overflowX: 'auto' }}>
          {row.permissions.map((acc: Access) => (
            <Chip
              size="small"
              key={acc}
              label={translateAccess(acc)}
              sx={{
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.01em",
                background: row.permissions.includes("PROVIDER")
                  ? "linear-gradient(135deg, rgba(236,72,153,0.85) 0%, rgba(244,63,94,0.85) 100%)"
                  : "linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(168,85,247,0.85) 100%)",
                backdropFilter: "blur(8px)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: row.permissions.includes("PROVIDER")
                  ? "0 2px 8px rgba(244,63,94,0.45)" 
                  : "0 2px 8px rgba(99,102,241,0.45)",
                height: "18px",
                "& .MuiChip-label": { padding: "0 5px" },
              }}
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

  const handleDeleteConfirmation = (
    userKey: string,
    userName: string,
    isProvider: boolean
  ) => {
    setConfirmation({
      open: true,
      title: "Confirmacion!",
      text: `Vas a eliminar al ${ !isProvider ? "usuario" : "proveedor" } "${userName.toUpperCase()}".
      ${isProvider ? "Recuerda que se perderán sus licitaciones y el ranking se verá afectado." : ''}`,
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
