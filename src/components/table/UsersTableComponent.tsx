import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useUiStore } from "../../stores/ui/ui.store";
import { Avatar, Button, Chip, Box } from "@mui/material";
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
        <Button 
          onClick={() => handleDeleteUser(userKey)}
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
          Eliminar
        </Button>
      ),
    });
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      type: "actions",
      width: 100,
      resizable: false,
      align: "right",
      getActions: (params: GridRowParams<User>) => [
        <GridActionsCellItem
          key="edit"
          icon={<ModeEditOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
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
          sx={{
            color: '#0a84ff',
            background: 'rgba(10,132,255,0.1)',
            border: '1px solid rgba(10,132,255,0.2)',
            borderRadius: '8px',
            padding: '4px',
            mx: 0.1,
            '&:hover': {
              background: 'rgba(10,132,255,0.2)',
              boxShadow: '0 0 10px rgba(10,132,255,0.2)',
            }
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
          onClick={() =>
            handleDeleteConfirmation(
              params?.row?.key as string,
              `${params.row.firstName || ""} ${params.row.lastName || ""}`,
              params.row.permissions?.includes("PROVIDER")
            )
          }
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
      ],
    },
    {
      field: "fullName",
      headerName: "Nombre",
      sortable: false,
      width: 220,
      renderCell: ({ row }: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%', color: 'white' }}>
          {row.avatarURL ? (
            <Avatar
              src={row.avatarURL}
              sx={{ 
                width: "40px", 
                height: "40px",
                p: "2px",
                border: "1.5px solid rgba(0,0,0,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                bgcolor: "white", 
                transition: "all 0.2s ease",
                "&:hover": { transform: "scale(1.1)" }
              }}
              imgProps={{ style: { objectFit: "contain", borderRadius: "50%" } }}
            />
          ) : !row.permissions?.includes("PROVIDER") ? (
            <Avatar
              sx={{
                color: 'white',
                height: "30px",
                width: "30px",
                bgcolor: row.color ?? "purple",
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              {(row.firstName?.[0] || '') + (row.lastName?.[0] || '')}
            </Avatar>
          ) : (
            <StoreOutlinedIcon fontSize="large" sx={{ color: 'rgba(255,255,255,0.7)' }} />
          )}
          <span style={{ fontWeight: 600 }}>
            {row.firstName || ""} {row.lastName || ""}
          </span>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Correo",
      type: "string",
      width: 220,
      renderCell: ({ value }: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'rgba(255,255,255,0.7)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </Box>
      )
    },
    {
      field: "workgroupKeys",
      headerName: "Grupos de trabajo",
      type: "string",
      width: 200,
      renderCell: ({ row }: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center', py: 0.5, height: '100%', overflow: 'hidden' }}>
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
                        color: "white",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        height: "22px",
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    />
                  );
                }
                return null;
              })
            : !row.permissions?.includes("PROVIDER") && (
                <Chip 
                  label="SIN GRUPO" 
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: '#ff9f0a',
                    borderColor: 'rgba(255,159,10,0.4)',
                    height: "22px",
                  }}
                />
              )}
        </Box>
      ),
    },
    {
      field: "permissions",
      headerName: "Permisos",
      type: "string",
      width: 250,
      renderCell: ({ row }: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center', py: 0.5, height: '100%', overflow: 'hidden' }}>
          {row.permissions?.map((acc: Access) => (
            <Chip
              size="small"
              key={acc}
              label={translateAccess(acc)}
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                background: row.permissions?.includes("PROVIDER")
                  ? "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)"
                  : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "white",
                border: "1px solid rgba(0,0,0,0.05)",
                height: "22px",
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ 
      height: "calc(100vh - 230px)", 
      width: "100%", 
      backgroundColor: 'rgba(28, 28, 30, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <DataGrid
        rows={users?.filter((u) => u.isActive) as User[]}
        columns={columns}
        columnHeaderHeight={36}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[15, 30]}
        rowHeight={60}
        localeText={{
          MuiTablePagination: { 
            labelRowsPerPage: "Filas por página",
            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count}`,
          },
          noRowsLabel: "Sin filas",
          footerRowSelected: (count) => `${count} fila${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`,
        }}
        sx={{ 
          border: 0,
          color: 'white',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          },
          '& .MuiDataGrid-actionsCell .MuiIconButton-root': {
            color: 'white'
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
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }
        }}
      />
    </Paper>
  );
}
