import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress, Button, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
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
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf('week'));
  const [currentDay, setCurrentDay] = useState(dayjs().startOf('day'));
  const scheduleListRef = useRef<HTMLDivElement | null>(null);

  const isAllowedToView = user?.permissions?.includes("ADMIN") || user?.permissions?.includes("PLANNER");
  const isPlanner = user?.permissions?.includes("PLANNER");

  // Navigation handlers
  const prevWeek = () => setCurrentWeekStart(currentWeekStart.subtract(1, 'week'));
  const nextWeek = () => setCurrentWeekStart(currentWeekStart.add(1, 'week'));
  const prevDay = () => setCurrentDay(currentDay.subtract(1, 'day'));
  const nextDay = () => setCurrentDay(currentDay.add(1, 'day'));
  const goToToday = () => {
    setCurrentWeekStart(dayjs().startOf('week'));
    setCurrentDay(dayjs().startOf('day'));
  };

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
    setEditingSchedule(null); // Limpiar modo edición
    if (dateStr) {
      setCreationDate(dateStr);
    } else {
      setCreationDate(dayjs().format('YYYY-MM-DD'));
    }
    setIsCreationOpen(true);
  };

  const handleEditSchedule = (schedule: MaintenanceSchedule) => {
    setEditingSchedule(schedule);
    setCreationDate(null);
    setIsCreationOpen(true);
  };

  const groupedSchedules = useMemo(() => {
    // Filter to last 3 months only
    const threeMonthsAgo = dayjs().subtract(3, 'month').startOf('day');
    const filtered = schedulesData.filter(s => dayjs(s.dateStr).isAfter(threeMonthsAgo));

    // Sort ascending
    const sorted = [...filtered].sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

    const scheduleByDate: Record<string, MaintenanceSchedule[]> = {};
    sorted.forEach((schedule) => {
      const dateKey = dayjs(schedule.dateStr).format('YYYY-MM-DD');
      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = [];
      }
      scheduleByDate[dateKey].push(schedule);
    });

    // Ensure at least the next 14 days are visible, even if no schedules exist.
    const nextDays = 14;

    const today = dayjs().startOf('day');
    const futureLimit = dayjs().add(nextDays - 1, 'day').startOf('day');

    const steps: Array<{ dateKey: string; label: string; schedules: MaintenanceSchedule[] }> = [];

    // Past schedule days (antes de hoy)
    Object.keys(scheduleByDate)
      .sort()
      .filter(dateKey => dayjs(dateKey).isBefore(today, 'day'))
      .forEach(dateKey => {
        const date = dayjs(dateKey);
        const dayWord = date.isYesterday() ? 'AYER' : date.format('dddd').toUpperCase();
        const monDay = date.format('MMM D').toUpperCase().replace('.', '');
        const groupKey = `${dayWord} • ${monDay}`;
        steps.push({ dateKey, label: groupKey, schedules: scheduleByDate[dateKey] });
      });

    // Next 14 days (incluye hoy)
    for (let i = 0; i < nextDays; i += 1) {
      const date = dayjs().add(i, 'day');
      let dayWord = '';

      if (date.isToday()) dayWord = 'HOY';
      else if (date.isTomorrow()) dayWord = 'MAÑANA';
      else dayWord = date.format('dddd').toUpperCase();

      const monDay = date.format('MMM D').toUpperCase().replace('.', '');
      const groupKey = `${dayWord} • ${monDay}`;
      const dateKey = date.format('YYYY-MM-DD');

      const existingIndex = steps.findIndex(step => step.dateKey === dateKey);
      if (existingIndex !== -1) {
        steps[existingIndex].label = groupKey; // mantener label actual si se sobreescribe
      } else {
        steps.push({ dateKey, label: groupKey, schedules: scheduleByDate[dateKey] || [] });
      }
    }

    // Future schedule days beyond the 14-day window
    Object.keys(scheduleByDate)
      .sort()
      .filter(dateKey => dayjs(dateKey).isAfter(futureLimit, 'day'))
      .forEach(dateKey => {
        const date = dayjs(dateKey);
        const dayWord = date.format('dddd').toUpperCase();
        const monDay = date.format('MMM D').toUpperCase().replace('.', '');
        const groupKey = `${dayWord} • ${monDay}`;

        const exists = steps.some(step => step.dateKey === dateKey);
        if (!exists) {
          steps.push({ dateKey, label: groupKey, schedules: scheduleByDate[dateKey] });
        }
      });

    // Convert steps to object manteniendo orden cronológico
    const orderedResult: Record<string, MaintenanceSchedule[]> = {};
    steps.forEach(entry => {
      orderedResult[entry.label] = entry.schedules;
    });

    return orderedResult;
  }, [schedulesData]);

  // Direct index by date key for day/week views (not limited by groupedSchedules range)
  const schedulesByDate = useMemo(() => {
    const result: Record<string, MaintenanceSchedule[]> = {};
    schedulesData.forEach(schedule => {
      const dateKey = dayjs(schedule.dateStr).format('YYYY-MM-DD');
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(schedule);
    });
    return result;
  }, [schedulesData]);

  const displayedSchedules = useMemo(() => {
    if (viewMode === 'month') {
      return groupedSchedules;
    }

    const result: Record<string, MaintenanceSchedule[]> = {};

    if (viewMode === 'day') {
      // For day view, use schedulesByDate directly
      const currentDayKey = currentDay.format('YYYY-MM-DD');
      const isToday = currentDay.isToday();
      const dayWord = isToday ? 'HOY' : currentDay.format('dddd').toUpperCase();
      const monDay = currentDay.format('MMM D').toUpperCase().replace('.', '');
      const label = `${dayWord} • ${monDay}`;

      result[label] = schedulesByDate[currentDayKey] || [];
      return result;
    }

    if (viewMode === 'week') {
      // For week view, show all days in the current week using schedulesByDate
      for (let i = 0; i < 7; i++) {
        const date = currentWeekStart.add(i, 'day');
        const dateKey = date.format('YYYY-MM-DD');
        const isToday = date.isToday();
        const dayWord = isToday ? 'HOY' : date.format('dddd').toUpperCase();
        const monDay = date.format('MMM D').toUpperCase().replace('.', '');
        const label = `${dayWord} • ${monDay}`;

        result[label] = schedulesByDate[dateKey] || [];
      }
    }

    return result;
  }, [groupedSchedules, viewMode, currentDay, currentWeekStart, schedulesByDate]);

  useEffect(() => {
    const todayEntry = Object.keys(groupedSchedules).find(label => label.startsWith('HOY'));
    if (!todayEntry) return;

    const container = scheduleListRef.current;
    if (!container) return;

    const todayNode = container.querySelector('[data-today-group]') as HTMLElement | null;
    if (todayNode) {
      todayNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [groupedSchedules]);

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
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 1, mb: 1, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          {[
            { id: 'day', label: 'Día' },
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mes' }
          ].map(view => (
            <Button
              key={view.id}
              size="small"
              variant={viewMode === view.id ? 'contained' : 'outlined'}
              onClick={() => setViewMode(view.id as 'day' | 'week' | 'month')}
              sx={{
                textTransform: 'none',
                flex: 1,
                fontWeight: 600,
                color: viewMode === view.id ? 'white' : 'rgba(255,255,255,0.8)',
                bgcolor: viewMode === view.id ? 'rgba(10,132,255,0.9)' : 'rgba(255,255,255,0.05)',
                border: viewMode === view.id ? '1px solid rgba(10,132,255,0.9)' : '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {view.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* MOBILE HEADER - Day/Week Navigation Controls */}
      {(viewMode === 'day' || viewMode === 'week') && (
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
          <IconButton onClick={viewMode === 'day' ? prevDay : prevWeek} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>
            {viewMode === 'day' 
              ? currentDay.format('dddd, D MMM').toUpperCase()
              : `${currentWeekStart.format('D MMM')} - ${currentWeekStart.add(6, 'day').format('D MMM')}`.toUpperCase()
            }
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Button onClick={goToToday} size="small" sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', minWidth: 'auto', px: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              HOY
            </Button>
            <IconButton onClick={viewMode === 'day' ? nextDay : nextWeek} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Stack>
        </Box>
      )}
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 1, mb: 1, mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </Box>

      <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', lg: 'flex' }, mb: 1 }}>
        {[
          { id: 'day', label: 'Día' },
          { id: 'week', label: 'Semana' },
          { id: 'month', label: 'Mes' }
        ].map(view => (
          <Button
            key={view.id}
            size="small"
            variant={viewMode === view.id ? 'contained' : 'outlined'}
            onClick={() => setViewMode(view.id as 'day' | 'week' | 'month')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: viewMode === view.id ? 'white' : 'rgba(255,255,255,0.8)',
              bgcolor: viewMode === view.id ? 'rgba(10,132,255,0.9)' : 'rgba(255,255,255,0.05)',
              border: viewMode === view.id ? '1px solid rgba(10,132,255,0.9)' : '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {view.label}
          </Button>
        ))}
      </Stack>

      {/* DESKTOP Day/Week Navigation Controls */}
      {(viewMode === 'day' || viewMode === 'week') && (
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={viewMode === 'day' ? prevDay : prevWeek} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Button onClick={goToToday} sx={{ color: 'white', px: 2, fontSize: '0.9rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              HOY
            </Button>
            <IconButton onClick={viewMode === 'day' ? nextDay : nextWeek} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>
            {viewMode === 'day' 
              ? currentDay.format('dddd, D [de] MMMM YYYY')
              : `Semana del ${currentWeekStart.format('D [de] MMMM')} al ${currentWeekStart.add(6, 'day').format('D [de] MMMM YYYY')}`
            }
          </Typography>
        </Box>
      )}

      {/* MOBILE LIST VIEW */}
      {(viewMode === 'day' || viewMode === 'week') && (
        <Box
          ref={scheduleListRef}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            flexDirection: 'column',
            gap: 1.5,
            flex: 1,
            overflowY: 'auto',
            pb: 12, // More padding to avoid collision with nav / FAB
            px: 0.5,
            scrollbarWidth: 'none', // Hide scrollbar for cleaner look
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {Object.entries(displayedSchedules).map(([dateLabel, schedules]) => (
            <ScheduleDayBlock
              key={dateLabel}
              dateLabel={dateLabel}
              schedules={schedules}
              isTodayGroup={dateLabel.startsWith('HOY')}
            />
          ))}

          {Object.keys(displayedSchedules).length === 0 && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 10 }}>
              No hay programaciones en los últimos 3 meses.
            </Typography>
          )}
        </Box>
      )}

      {/* DESKTOP LIST VIEW (día/semana) */}
      {(viewMode === 'day' || viewMode === 'week') && (
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', pt: 2, flexGrow: 1, minHeight: 0, overflowY: 'auto', gap: 1.5 }}>
          {Object.entries(displayedSchedules).map(([dateLabel, schedules]) => (
            <ScheduleDayBlock
              key={dateLabel}
              dateLabel={dateLabel}
              schedules={schedules}
              isTodayGroup={dateLabel.startsWith('HOY')}
            />
          ))}

          {Object.keys(displayedSchedules).length === 0 && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 10 }}>
              No hay programaciones en los últimos 3 meses.
            </Typography>
          )}
        </Box>
      )}

      {/* DESKTOP GRID VIEW (mes) */}
      {viewMode === 'month' && (
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, pt: 2, flexGrow: 1, minHeight: 0 }}>
          <CalendarGridView
            schedules={schedulesData}
            onOpenCreation={handleOpenCreation}
            onEdit={handleEditSchedule}
            isAdmin={isPlanner}
          />
        </Box>
      )}

      <ScheduleCreationModal
        open={isCreationOpen}
        onClose={() => {
          setIsCreationOpen(false);
          setEditingSchedule(null);
        }}
        selectedDateStr={creationDate}
        onSave={handleCreateSchedule}
        editingSchedule={editingSchedule}
      />
    </Box>
  );
};
