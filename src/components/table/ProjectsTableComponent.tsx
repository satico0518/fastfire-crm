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
import { Button, Chip, IconButton, Box } from "@mui/material";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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

  const handleDeleteProject = async (projectKey: string) => {
    const deleteResult = await ProjectService.deleteProject(projectKey);

    if (deleteResult.result === 'OK')
      setSnackbar({
        open: true,
        message: "Proyecto eliminado exitosamente!",
        severity: "success",
      });
    else
      setSnackbar({
        open: true,
        message: deleteResult.errorMessage ?? "Error al eliminar Proyecto.",
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
      title: "Confirmación!",
      text: `Vas a eliminar el proyecto "${projectName.toUpperCase()}".`,
      actions: (
        <Button 
          onClick={() => handleDeleteProject(projectKey)}
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
      headerAlign: "right",
      align: "right",
      width: 140,
      resizable: false,
      getActions: (params: GridRowParams<Project>) => {
        const baseActions = [
          <GridActionsCellItem
            key="edit"
            icon={<ModeEditOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
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
                params.row.key as string,
                params.row.name
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
          />
        ];

        if (params.row.status === "DONE") return baseActions;

        return [
          ...baseActions,
          <GridActionsCellItem
            key="block"
            icon={<BlockOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={() =>
              ProjectService.updateProject({ ...params.row, status: "BLOCKED" })
            }
            label="Bloquear"
            sx={{
              color: '#ff9f0a',
              background: 'rgba(255,159,10,0.1)',
              border: '1px solid rgba(255,159,10,0.2)',
              borderRadius: '8px',
              padding: '4px',
              mx: 0.1,
              '&:hover': {
                background: 'rgba(255,159,10,0.2)',
                boxShadow: '0 0 10px rgba(255,159,10,0.2)',
              }
            }}
          />,
          <GridActionsCellItem
            key="done"
            icon={<TaskAltOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={() =>
              ProjectService.updateProject({ ...params.row, status: "DONE" })
            }
            label="Finalizar"
            sx={{
              color: '#30d158',
              background: 'rgba(48,209,88,0.1)',
              border: '1px solid rgba(48,209,88,0.2)',
              borderRadius: '8px',
              padding: '4px',
              mx: 0.1,
              '&:hover': {
                background: 'rgba(48,209,88,0.2)',
                boxShadow: '0 0 10px rgba(48,209,88,0.2)',
              }
            }}
          />
        ];
      },
    },
    {
      field: "name",
      headerName: "Nombre",
      type: "string",
      width: 300,
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Project>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'white', fontWeight: 500 }}>
          <span
            style={{
              textDecoration: row.status === "DONE" ? "line-through" : "none",
              opacity: row.status === "DONE" ? 0.6 : 1
            }}
          >
            {row.name}
          </span>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Estado",
      type: "string",
      width: 250,
      renderCell: (params: GridRenderCellParams<Project>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
          {params.row.status === "IN_PROGRESS" && (
            <Chip color="success" size="small" label={translateStatus(params.row.status)} sx={{ fontWeight: 700 }} />
          )}
          {params.row.status === "BLOCKED" && (
            <>
              <Chip color="error" size="small" label={translateStatus(params.row.status)} sx={{ fontWeight: 700 }} />
              <IconButton
                title="Iniciar"
                size="small"
                onClick={() =>
                  ProjectService.updateProject({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
                sx={{
                  color: '#30d158',
                  background: 'rgba(48,209,88,0.1)',
                  border: '1px solid rgba(48,209,88,0.3)',
                  padding: '4px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(48,209,88,0.2)',
                    boxShadow: '0 0 10px rgba(48,209,88,0.2)',
                  }
                }}
              >
                <PlayCircleFilledOutlinedIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === "ARCHIVED" && (
            <Chip color="default" size="small" label={translateStatus(params.row.status)} sx={{ fontWeight: 700 }} />
          )}
          {params.row.status === "DONE" && (
            <>
              <Chip color="info" size="small" label={translateStatus(params.row.status)} sx={{ fontWeight: 700 }} />
              <IconButton
                title="Reiniciar"
                size="small"
                onClick={() =>
                  ProjectService.updateProject({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
                sx={{
                  color: '#ff9f0a',
                  background: 'rgba(255,159,10,0.1)',
                  border: '1px solid rgba(255,159,10,0.3)',
                  padding: '4px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(255,159,10,0.2)',
                    boxShadow: '0 0 10px rgba(255,159,10,0.2)',
                  }
                }}
              >
                <PlayCircleFilledOutlinedIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === "TODO" && (
            <>
              <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{translateStatus(params.row.status)}</span>
              <IconButton
                title="Iniciar"
                size="small"
                onClick={() =>
                  ProjectService.updateProject({
                    ...params.row,
                    status: "IN_PROGRESS",
                  })
                }
                sx={{
                  color: '#30d158',
                  background: 'rgba(48,209,88,0.1)',
                  border: '1px solid rgba(48,209,88,0.3)',
                  padding: '4px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(48,209,88,0.2)',
                    boxShadow: '0 0 10px rgba(48,209,88,0.2)',
                  }
                }}
              >
                <PlayCircleFilledOutlinedIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
    {
      field: "location",
      headerName: "Ubicacion",
      type: "string",
      width: 250,
      renderCell: ({ value }: GridRenderCellParams<Project>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'rgba(255,255,255,0.7)' }}>
          {value}
        </Box>
      )
    },
    {
      field: "createdDate",
      headerName: "Fecha Creacion",
      type: "string",
      width: 250,
      valueGetter: (value) => translateTimestampToString(value),
      renderCell: ({ value }: GridRenderCellParams<Project>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'rgba(255,255,255,0.7)' }}>
          {value}
        </Box>
      )
    },
    {
      field: "budget",
      headerName: "Presupuesto",
      type: "number",
      width: 200,
      valueGetter: (value) => formatToCOP(value),
      renderCell: ({ value }: GridRenderCellParams<Project>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'white', fontWeight: 600 }}>
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
        rows={projects as Project[]}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[15, 30]}
        rowHeight={60}
        localeText={{
          MuiTablePagination: { labelRowsPerPage: "Filas por pagina" },
        }}
        sx={{ 
          border: 0,
          color: 'white',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 0,
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
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
