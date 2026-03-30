import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Button,
  Chip,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Box,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";

import { Workgroup } from "../../interfaces/Workgroup";
import { useUiStore } from "../../stores/ui/ui.store";
import { useWorkgroupStore } from "../../stores/workgroups/workgroups.store";
import { WorkgroupService } from "../../services/workgroup.service";

import { useUsersStore } from "../../stores/users/users.store";
import { getUserNameByKey } from "../../utils/utils";
import { User } from "../../interfaces/User";
import { WorkgroupsFormComponent } from "../workgroups-form/WorkgroupsFormComponent";
import { TasksFormComponent } from "../tasks-form/TasksFormComponent";
import { useAuhtStore } from "../../stores";
import { useTasksStore } from "../../stores/tasks/tasks.store";
import { Task } from "../../interfaces/Task";

const paginationModel = { page: 0, pageSize: 15 };

export default function WorksgroupTable() {
  const currentUser = useAuhtStore((state) => state.user);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const workgroups = useWorkgroupStore((state) => state.workgroups);
  const users = useUsersStore((state) => state.users);
  const tasks = useTasksStore((state) => state.tasks);

  const isAdmin = currentUser?.permissions.includes("ADMIN");
  const workgroupsByRole = (): Workgroup[] => {
    if (isAdmin) return workgroups?.filter((wg) => wg.isActive) as Workgroup[];

    return workgroups
      ?.filter((wg) => currentUser?.workgroupKeys.some((key) => wg.key === key))
      .filter((wg) => wg.isActive) as Workgroup[];
  };

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} arrow />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#f5f5f9",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
    },
  }));

  const handleDeleteMember = async (
    workgroup: Workgroup,
    memberKey: string
  ) => {
    setIsLoading(true);
    const response = await WorkgroupService.deleteMemberFromWorkgroup(
      workgroup,
      memberKey
    );
    if (response.result === "OK") {
      setSnackbar({
        open: true,
        message: response.message as string,
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: response.errorMessage as string,
        severity: "error",
      });
    }
    setIsLoading(false);
  };

  const handleModifyWorkgroup = (workgroup: Workgroup) => {
    setModal({
      ...modal,
      open: true,
      title: "Modificar Grupo de Trabajo",
      text: "Ingrese los datos a modificar del grupo de trabajo.",
      content: <WorkgroupsFormComponent editingGroup={workgroup} />,
    });
  };

  const handleDeleteWorkgroup = async (workgroup: Workgroup) => {
    const deleteResult = await WorkgroupService.deleteWorkgroup(
      workgroup,
      tasks as Task[],
      users as User[]
    );

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

  const handleDeleteConfirmation = (workgroup: Workgroup) => {
    setConfirmation({
      open: true,
      title: "Confirmacion!",
      text: `Vas a eliminar el grupo de trabajo "${workgroup.name.toUpperCase()}".`,
      actions: (
        <Button 
          onClick={() => handleDeleteWorkgroup(workgroup)}
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
      width: 120,
      resizable: false,
      align: "right",
      getActions: (params: GridRowParams<Workgroup>) => [
        <GridActionsCellItem
          key="task"
          icon={<AddTaskOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
          onClick={() =>
            setModal({
              ...modal,
              open: true,
              title: "Nueva Tarea",
              text: "Ingrese los datos de la tarea.",
              content: (
                <TasksFormComponent workgroupKey={params.row.key as string} />
              ),
            })
          }
          label="Nueva tarea"
          sx={{
            color: '#30d158',
            background: 'rgba(48,209,88,0.1)',
            border: '1px solid rgba(48,209,88,0.2)',
            borderRadius: '8px',
            padding: '4px',
            mx: 0.1,
            '&:hover': { background: 'rgba(48,209,88,0.2)' }
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<ModeEditOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
          onClick={() => handleModifyWorkgroup(params.row)}
          label="Modificar"
          sx={{
            color: '#0a84ff',
            background: 'rgba(10,132,255,0.1)',
            border: '1px solid rgba(10,132,255,0.2)',
            borderRadius: '8px',
            padding: '4px',
            mx: 0.1,
            '&:hover': { background: 'rgba(10,132,255,0.2)' }
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
          onClick={() => handleDeleteConfirmation(params.row)}
          label="Eliminar"
          sx={{
            color: '#ff453a',
            background: 'rgba(255,69,58,0.1)',
            border: '1px solid rgba(255,69,58,0.2)',
            borderRadius: '8px',
            padding: '4px',
            mx: 0.1,
            '&:hover': { background: 'rgba(255,69,58,0.2)' }
          }}
        />,
      ],
    },
    {
      field: "name",
      headerName: "Nombre",
      flex: 1,
      renderCell: ({ value }: GridRenderCellParams<Workgroup>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', fontWeight: 600, color: 'white' }}>
          {value}
        </Box>
      )
    },
    {
      field: "memberKeys",
      headerName: "Colaboradores",
      type: "string",
      width: 200,
      renderCell: (params: GridRenderCellParams<Workgroup>) => {
        if (!params.row.memberKeys?.length)
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' }}>
              <PublicOutlinedIcon
                titleAccess="Público"
                fontSize="medium"
                sx={{
                  color: "rgba(255,255,255,0.3)",
                }}
              />
            </Box>
          );

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' }}>
            <HtmlTooltip
              title={
                <div className="members">
                  {params.row.memberKeys.map((key) => (
                    <Chip
                      key={key}
                      size="small"
                      label={getUserNameByKey(key, users as User[])}
                      color="info"
                      onDelete={() => handleDeleteMember(params.row, key)}
                    />
                  ))}
                </div>
              }
            >
              <Groups2OutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
            </HtmlTooltip>
          </Box>
        );
      },
    },
    {
      field: "description",
      headerName: "Descripción",
      width: 450,
      renderCell: ({ value }: GridRenderCellParams<Workgroup>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'rgba(255,255,255,0.7)' }}>
          {value}
        </Box>
      )
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
        rows={workgroupsByRole() as Workgroup[]}
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
            borderColor: 'rgba(255, 255, 255, 0.1)',
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
