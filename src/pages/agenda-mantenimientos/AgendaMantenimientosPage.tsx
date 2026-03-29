import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress, Button, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import { MaintenanceSchedule } from '../../interfaces/Maintenance';
import { MaintenanceService } from '../../services/maintenance.service';
import { UnauthorizedPage } from '../unauthorized/UnauthorizedPage';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import 'dayjs/locale/es';
import { ScheduleDayBlock } from './components/ScheduleDayBlock';
import { CalendarGridView } from './components/CalendarGridView';
import { ScheduleCreationModal } from './components/ScheduleCreationModal';
import { MaintenanceExportControls } from './components/MaintenanceExportControls';
import { useNavigate } from 'react-router-dom';
import { useAuhtStore } from '../../stores';
import { useUiStore } from '../../stores/ui/ui.store';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.locale('es');

export const AgendaMantenimientosPage = () => {
  const navigate = useNavigate();
  const user = useAuhtStore(state => state.user);
  const setSnackbar = useUiStore(state => state.setSnackbar);
  
  const [schedulesData, setSchedulesData] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [creationDate, setCreationDate] = useState<string | null>(null);
  
  const isAllowedToView = user?.permissions?.includes("ADMIN") || user?.permissions?.includes("PLANNER");
  const isPlanner = user?.permissions?.includes("PLANNER");

  // Real-time subscription
  useEffect(() => {
    if (!isAllowedToView) {
      return;
    }
    
    const unsubscribe = MaintenanceService.subscribeToSchedules((data) => {
      setSchedulesData(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isAllowedToView, user?.id]);

  const handleCreateSchedule = async (newSchedule: MaintenanceSchedule) => {
    const { id, ...dataToSave } = newSchedule;
    const resp = await MaintenanceService.createSchedule(dataToSave);
    
    if (resp.result === "OK") {
      setSnackbar({
        open: true,
        message: "¡Mantenimiento agendado correctamente!",
        severity: "success"
      });
    } else {
      setSnackbar({
        open: true,
        message: resp.errorMessage || "Error al agendar mantenimiento",
        severity: "error"
      });
    }
  };

  const handleOpenCreation = (dateStr?: string) => {
    if (dateStr) {
      setCreationDate(dateStr);
    } else {
      setCreationDate(dayjs().format('YYYY-MM-DD'));
    }
    setIsCreationOpen(true);
  };

  const groupedSchedules = useMemo(() => {
    // Filter to last 3 months only
    const threeMonthsAgo = dayjs().subtract(3, 'month').startOf('day');
    const filtered = schedulesData.filter(s => dayjs(s.dateStr).isAfter(threeMonthsAgo));
    
    // Sort ascending
    const sorted = [...filtered].sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
    
    const groups: Record<string, MaintenanceSchedule[]> = {};
    sorted.forEach((schedule) => {
      const dt = dayjs(schedule.dateStr);
      let dayWord = '';
      
      if (dt.isToday()) dayWord = 'HOY';
      else if (dt.isTomorrow()) dayWord = 'MAÑANA';
      else if (dt.isYesterday()) dayWord = 'AYER';
      else {
        dayWord = dt.format('dddd').toUpperCase();
      }
      
      const monDay = dt.format('MMM D').toUpperCase().replace('.', '');
      const groupKey = `${dayWord} • ${monDay}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(schedule);
    });
    
    return groups;
  }, [schedulesData]);

  if (!isAllowedToView) {
    return <UnauthorizedPage />;
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: { xs: '100vh', lg: 'calc(100vh - 90px)' }, 
        width: '100%' 
      }}>
        <CircularProgress size={40} sx={{ color: '#2b90ff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, lg: 1 }, 
      width: '100%',
      maxWidth: { xs: '100%', lg: '100%' }, 
      margin: '0 auto',
      height: { xs: 'calc(100vh - 50px - 16px)', lg: 'calc(100vh - 90px)' },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: { xs: '#000000', lg: 'transparent' }, 
      color: 'white',
      overflow: 'hidden', 
    }}>
      {/* Header */}
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', mb: 1, pt: 1 }}>
        <IconButton onClick={() => navigate('/home')} sx={{ color: '#2b90ff', p: 0, mr: 1 }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 24, strokeWidth: 2 }} />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2b90ff', flexGrow: 1 }}>
          Calendario
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <MaintenanceExportControls schedules={schedulesData} setSnackbar={setSnackbar} />
          {isPlanner && (
            <IconButton size="small" onClick={() => handleOpenCreation()} sx={{ color: 'white', bgcolor: '#0a84ff', '&:hover': { bgcolor: '#0070e0' } }}>
              <AddIcon />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* DESKTOP HEADER */}
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
          Agenda de Mantenimientos
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <MaintenanceExportControls schedules={schedulesData} setSnackbar={setSnackbar} />
          {isPlanner && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCreation()}
              sx={{
                background: 'rgba(10,132,255,0.15)',
                border: '1px solid rgba(10,132,255,0.4)',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                color: '#0a84ff',
                backdropFilter: 'blur(10px)',
                py: 0.5,
                px: 2,
                '&:hover': {
                  background: 'rgba(10,132,255,0.25)',
                  border: '1px solid #0a84ff'
                }
              }}
            >
              Nuevo Agendamiento
            </Button>
          )}
        </Stack>
      </Box>

      {/* MOBILE LIST VIEW */}
      <Box sx={{ 
        display: { xs: 'flex', lg: 'none' }, 
        flexDirection: 'column', 
        gap: 1.5,
        flex: 1,
        overflowY: 'auto',
        pb: 12, // More padding to avoid collision with nav / FAB
        px: 0.5,
        scrollbarWidth: 'none', // Hide scrollbar for cleaner look
        '&::-webkit-scrollbar': { display: 'none' } 
      }}>
         {Object.entries(groupedSchedules).map(([dateLabel, schedules]) => (
           <ScheduleDayBlock key={dateLabel} dateLabel={dateLabel} schedules={schedules} />
         ))}
         
         {Object.keys(groupedSchedules).length === 0 && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 10 }}>
              No hay programaciones en los últimos 3 meses.
            </Typography>
         )}
      </Box>

      {/* DESKTOP GRID VIEW */}
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, pt: 2, flexGrow: 1, minHeight: 0 }}>
        <CalendarGridView 
          schedules={schedulesData} 
          onOpenCreation={handleOpenCreation}
          isAdmin={isPlanner}
        />
      </Box>

      <ScheduleCreationModal 
        open={isCreationOpen} 
        onClose={() => setIsCreationOpen(false)}
        selectedDateStr={creationDate} 
        onSave={handleCreateSchedule}
      />
    </Box>
  );
};
