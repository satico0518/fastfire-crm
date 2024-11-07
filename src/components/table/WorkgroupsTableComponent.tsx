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
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";

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

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nombre",
      width: 300,
    },
    {
      field: "memberKeys",
      headerName: "Colaboradores",
      type: "string",
      width: 200,
      display: "flex",
      align: "center",
      renderCell: (params: GridRenderCellParams<Workgroup>) => {
        if (!params.row.memberKeys?.length)
          return (
            <PublicOutlinedIcon
              titleAccess="Público"
              fontSize="medium"
              sx={{
                marginLeft: "10px",
                color: "#b8d2e9",
              }}
            />
          );

        return (
          <div className="members-cell">
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
              <Groups2OutlinedIcon />
            </HtmlTooltip>
          </div>
        );
      },
    },
    {
      field: "description",
      headerName: "Descripción",
      width: 450,
    },
    {
      field: "actions",
      type: "actions",
      width: 100,
      align: "right",
      getActions: (params: GridRowParams<Workgroup>) => [
        <GridActionsCellItem
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
          showInMenu
        />,
        <GridActionsCellItem
          onClick={() => handleModifyWorkgroup(params.row)}
          label="Modificar"
          showInMenu
        />,
        <GridActionsCellItem
          onClick={() => handleDeleteConfirmation(params.row)}
          label="Eliminar"
          showInMenu
        />,
      ],
    },
  ];

  const handleDeleteWorkgroup = async (workgroup: Workgroup) => {
    const deleteResult = await WorkgroupService.deleteWorkgroup(workgroup, tasks as Task[], users as User[]);

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
        <Button onClick={() => handleDeleteWorkgroup(workgroup)}>
          Eliminar
        </Button>
      ),
    });
  };

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "100%" }}>
      <DataGrid
        rows={workgroupsByRole() as Workgroup[]}
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
