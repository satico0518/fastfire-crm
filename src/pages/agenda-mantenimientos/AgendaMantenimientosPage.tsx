import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
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
        height: { xs: '100vh', md: 'calc(100vh - 90px)' }, 
        width: '100%' 
      }}>
        <CircularProgress size={40} sx={{ color: '#2b90ff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 1 }, // Reduced padding on desktop
      pb: { xs: 10, md: 2 }, // Only large padding on mobile
      width: '100%',
      maxWidth: { xs: '600px', md: '100%' }, 
      margin: '0 auto',
      minHeight: { xs: '100vh', md: 'calc(100vh - 90px)' },
      height: { md: 'calc(100vh - 90px)' },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: { xs: '#000000', md: 'transparent' }, 
      color: 'white',
      overflow: 'hidden', // Prevent page-level scroll on desktop
    }}>
      {/* Header */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 3, pt: 2 }}>
        <IconButton onClick={() => navigate('/home')} sx={{ color: '#2b90ff', p: 0, mr: 1 }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 24, strokeWidth: 2 }} />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2b90ff', flexGrow: 1 }}>
          Calendario
        </Typography>
        {isPlanner && (
          <IconButton size="small" onClick={() => handleOpenCreation()} sx={{ color: 'white', bgcolor: '#0a84ff', '&:hover': { bgcolor: '#0070e0' } }}>
            <AddIcon />
          </IconButton>
        )}
      </Box>

      {/* MOBILE LIST VIEW */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
         {Object.entries(groupedSchedules).map(([dateLabel, schedules]) => (
           <ScheduleDayBlock key={dateLabel} dateLabel={dateLabel} schedules={schedules} />
         ))}
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {Object.keys(groupedSchedules).length === 0 && (
           <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 10 }}>
             No hay programaciones en los últimos 3 meses.
           </Typography>
        )}
      </Box>

      {/* DESKTOP GRID VIEW */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, pt: 2, flexGrow: 1, minHeight: 0 }}>
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
