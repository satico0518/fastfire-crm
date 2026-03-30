import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Button, Paper, Stack, Tooltip, useMediaQuery } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { ScheduleDetailModal } from './ScheduleDetailModal';

dayjs.extend(localeData);

interface Props {
  schedules: MaintenanceSchedule[];
  onOpenCreation: (dateStr: string) => void;
  onEdit?: (schedule: MaintenanceSchedule) => void;
  isAdmin?: boolean;
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'IN_PROGRESS': return '#ff9f0a'; 
    case 'COMPLETED': return '#30d158'; 
    case 'CANCELLED': return '#ff453a'; 
    case 'SCHEDULED':
    default: return '#0a84ff'; 
  }
};

export const CalendarGridView: React.FC<Props> = ({ schedules, onOpenCreation, onEdit, isAdmin }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const calendarMatrix = useMemo(() => {
    const jsDay = currentMonth.startOf('month').day();
    const startDayIndex = jsDay === 0 ? 6 : jsDay - 1; 
    
    const daysInMonth = currentMonth.daysInMonth();
    const blanks = Array.from({ length: startDayIndex }).map(() => null);
    const monthDays = Array.from({ length: daysInMonth }).map((_, index) => index + 1);
    
    const totalCells = blanks.length + monthDays.length;
    const endBlanksAmount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const endBlanks = Array.from({ length: endBlanksAmount }).map(() => null);

    return [...blanks, ...monthDays, ...endBlanks];
  }, [currentMonth]);

  const schedulesByDay = useMemo(() => {
    const map: Record<number, MaintenanceSchedule[]> = {};
    schedules.forEach(schedule => {
      const dt = dayjs(schedule.dateStr);
      if (dt.isSame(currentMonth, 'month')) {
        const d = dt.date();
        if (!map[d]) map[d] = [];
        map[d].push(schedule);
      }
    });
    return map;
  }, [schedules, currentMonth]);

  const daysOfWeek = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  return (
    <Box sx={{ width: '100%', pt: 2, px: { md: 0, lg: 2 }, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      
      {/* Calendar Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-1px', textTransform: 'capitalize' }}>
          {currentMonth.format('MMMM YYYY')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={prevMonth} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Button onClick={() => setCurrentMonth(dayjs().startOf('month'))} sx={{ color: 'white', px: 2, fontSize: '0.9rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            HOY
          </Button>
          <IconButton onClick={nextMonth} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Grid Container */}
      <Paper elevation={0} sx={{ 
        bgcolor: 'rgba(20, 20, 25, 0.4)', 
        backdropFilter: 'blur(12px)',
        borderRadius: 4, 
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: 0 
      }}>
        {/* Days of week header */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          bgcolor: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          {daysOfWeek.map((day, dIdx) => (
            <Box 
              key={day} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: dIdx === 6 ? 'rgba(255, 69, 58, 0.1)' : 'transparent', 
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: dIdx === 6 ? '#ff453a' : 'rgba(255,255,255,0.6)', 
                  fontWeight: 800, 
                  letterSpacing: '1px' 
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Days Matrix */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(${calendarMatrix.length / 7}, 1fr)`,
          flexGrow: 1,
          minHeight: 0,
        }}>
          {calendarMatrix.map((dayNum, idx) => {
            const isToday = dayNum === dayjs().date() && currentMonth.isSame(dayjs(), 'month');
            const daySchedules = dayNum ? (schedulesByDay[dayNum] || []) : [];
            const isSunday = (idx + 1) % 7 === 0;

            return (
              <Box 
                key={idx} 
                onClick={() => {
                  if (isAdmin && dayNum) {
                    const date = currentMonth.date(dayNum);
                    if (date.isBefore(dayjs(), 'day')) return; 
                    onOpenCreation(date.format('YYYY-MM-DD'));
                  }
                }}
                sx={{ 
                  p: 0,
                  borderRight: isSunday ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  borderBottom: idx < calendarMatrix.length - 7 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  bgcolor: dayNum 
                    ? (isSunday ? 'rgba(255, 69, 58, 0.22)' : 'transparent') 
                    : 'rgba(0,0,0,0.15)',
                  transition: 'background-color 0.2s',
                  cursor: (isAdmin && dayNum && !currentMonth.date(dayNum).isBefore(dayjs(), 'day')) ? 'pointer' : 'default',
                  '&:hover': { bgcolor: (dayNum && !currentMonth.date(dayNum).isBefore(dayjs(), 'day')) 
                    ? (isSunday ? 'rgba(255, 69, 58, 0.35)' : 'rgba(255,255,255,0.03)') 
                    : 'transparent' 
                  },
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0
                }}
              >
                {dayNum && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pb: 0.5, flexShrink: 0 }}>
                      <Box sx={{ 
                        width: 26, height: 26, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isToday ? '#0a84ff' : 'transparent',
                        color: isToday ? 'white' : (isSunday ? '#ff453a' : 'rgba(255,255,255,0.8)'),
                        fontWeight: (isToday || isSunday) ? 800 : 500,
                        fontSize: '0.8rem'
                      }}>
                        {dayNum}
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      flexGrow: 1, 
                      overflowY: 'auto', 
                      px: 1, 
                      pb: 1,
                      minHeight: 0,
                      '&::-webkit-scrollbar': { width: '3px' },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        borderRadius: 10,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }
                    }}>
                      <Stack spacing={0.5}>
                        {daySchedules.map(sch => (
                          <Tooltip title={sch.title} key={sch.id} arrow placement="top">
                            <Box 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchedule(sch);
                              }}
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.1)', 
                                borderLeft: `3px solid ${getStatusColor(sch.status)}`,
                                borderRadius: 1, 
                                px: 1, 
                                py: 0.5,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                transition: 'all 0.15s'
                              }}>
                              <Typography variant="caption" sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.2,
                                fontSize: '0.7rem'
                              }}>
                                {dayjs(sch.dateStr).format('HH:mm')} {sch.title}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ))}
                        {isMobile && daySchedules.length === 0 && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#ff9f0a', 
                              fontWeight: 600, 
                              fontSize: '0.65rem',
                              textAlign: 'center',
                              opacity: 0.8
                            }}
                          >
                            sin agendamiento
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {selectedSchedule && (
        <ScheduleDetailModal 
          open={!!selectedSchedule} 
          onClose={() => setSelectedSchedule(null)} 
          schedule={selectedSchedule}
          onEdit={onEdit}
        />
      )}
    </Box>
  );
};
