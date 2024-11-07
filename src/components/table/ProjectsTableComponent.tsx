import { useUiStore } from "../../stores/ui/ui.store";
import { useProjectsStore } from "../../stores/projects/projects.store";
import { ProjectService } from "../../services/project.service";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Project } from "../../interfaces/Project";
import { Button, Chip } from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { ProjectsFormComponent } from "../projects-form/ProjectsFormComponent";
import {
  formatToCOP,
  translateStatus,
  translateTimestampToString,
} from "../../utils/utils";

const paginationModel = { page: 0, pageSize: 15 };

export default function ProjectsTable() {
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const setConfirmation = useUiStore((state) => state.setConfirmation);
  const projects = useProjectsStore((state) => state.projects);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nombre",
      type: "string",
      width: 300,
      renderCell: ({ row }: GridRenderCellParams<Project>) => (
        <span
          style={{
            textDecoration: row.status === "DONE" ? "line-through" : "none",
          }}
        >
          {row.name}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Estado",
      type: "string",
      width: 250,
      renderCell: (params: GridRenderCellParams<Project>) => (
        <>
          {params.row.status === "IN_PROGRESS" && (
            <Chip color="success" label={translateStatus(params.row.status)} />
          )}
          {params.row.status === "BLOCKED" && (
            <>
              <Chip color="error" label={translateStatus(params.row.status)} />
              <Button
                title="Iniciar"
                onClick={() =>
                  ProjectService.updateProject({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
              >
                <PlayCircleFilledOutlinedIcon />
              </Button>
            </>
          )}
          {params.row.status === "ARCHIVED" && (
            <Chip color="default" label={translateStatus(params.row.status)} />
          )}
          {params.row.status === "DONE" && (
            <>
              <Chip color="info" label={translateStatus(params.row.status)} />
              <Button
                title="Reiniciar"
                onClick={() =>
                  ProjectService.updateProject({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
              >
                <PlayCircleFilledOutlinedIcon />
              </Button>
            </>
          )}
          {params.row.status === "TODO" && (
            <>
              <span>{translateStatus(params.row.status)}</span>
              <Button
                title="Iniciar"
                onClick={() =>
                  ProjectService.updateProject({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
              >
                <PlayCircleFilledOutlinedIcon />
              </Button>
            </>
          )}
        </>
      ),
    },
    {
      field: "location",
      headerName: "Ubicacion",
      type: "string",
      width: 250,
    },
    {
      field: "createdDate",
      headerName: "Fecha Creacion",
      type: "string",
      width: 250,
      valueGetter: (value) => translateTimestampToString(value),
    },
    {
      field: "budget",
      headerName: "Presupuesto",
      type: "number",
      width: 200,
      valueGetter: (value) => formatToCOP(value),
    },
    {
      field: "actions",
      type: "actions",
      headerAlign: "right",
      align: "right",
      getActions: (params: GridRowParams<Project>) => {
        if (params.row.status === "DONE")
          return [
            <GridActionsCellItem
              onClick={() =>
                handleDeleteConfirmation(
                  params.row.key as string,
                  params.row.name
                )
              }
              label="Eliminar"
              showInMenu
            />,
          ];
        return [
          <GridActionsCellItem
            icon={<ModeEditOutlineOutlinedIcon />}
            onClick={() =>
              setModal({
                ...modal,
                open: true,
                title: "Modificar Proyecto",
                text: "Ingrese los datos del proyecto a modificar.",
                content: <ProjectsFormComponent editingProject={params.row} />,
              })
            }
            label="Modificar"
            showInMenu
          />,
          <GridActionsCellItem
            icon={<BlockOutlinedIcon />}
            onClick={() =>
              ProjectService.updateProject({ ...params.row, status: "BLOCKED" })
            }
            label="Bloquear"
            showInMenu
          />,
          <GridActionsCellItem
            icon={<TaskAltOutlinedIcon />}
            onClick={() =>
              ProjectService.updateProject({ ...params.row, status: "DONE" })
            }
            label="Finalizar"
            showInMenu
          />,
        ];
      },
    },
  ];

  const handleDeleteProject = async (projectKey: string) => {
    const deleteResult = await ProjectService.deleteProject(projectKey);

    if (deleteResult)
      setSnackbar({
        open: true,
        message: "Proyecto eliminado exitosamente!",
        severity: "success",
      });
    else
      setSnackbar({
        open: true,
        message: "Error al eliminar Proyecto.",
        severity: "error",
      });

    setConfirmation({ open: false, title: "", text: "", actions: null });
  };

  const handleDeleteConfirmation = (
    projectKey: string,
    projectName: string
  ) => {
    setConfirmation({
      open: true,
      title: "Confirmacion!",
      text: `Vas a eliminar el proyecto "${projectName.toUpperCase()}".`,
      actions: (
        <Button onClick={() => handleDeleteProject(projectKey)}>
          Eliminar
        </Button>
      ),
    });
  };

  return (
    <Paper sx={{ height: "calc(100vh - 230px)", width: "100%" }}>
      <DataGrid
        rows={projects as Project[]}
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
