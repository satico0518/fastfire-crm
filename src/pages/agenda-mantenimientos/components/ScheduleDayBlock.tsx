import React from 'react';
import { Box, Typography } from '@mui/material';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { ScheduleCard } from './ScheduleCard';

interface Props {
  dateLabel: string;
  schedules: MaintenanceSchedule[];
  isTodayGroup?: boolean;
  onEdit?: (schedule: MaintenanceSchedule) => void;
}

export const ScheduleDayBlock: React.FC<Props> = ({ dateLabel, schedules, isTodayGroup = false, onEdit }) => {
  return (
    <Box sx={{ mb: 1 }} data-today-group={isTodayGroup ? 'true' : undefined}>
      {/* Date Header Tag */}
      <Box sx={{
        mb: 1,
        ml: 1 // slight inset for the header text like in the mock
      }}>
        <Typography variant="caption" sx={{ 
          fontWeight: 800, 
          color: 'rgba(255,255,255,0.9)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          fontSize: '0.75rem'
        }}>
          {dateLabel}
        </Typography>
      </Box>

      {/* Cards List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {schedules.length > 0 ? (
          schedules.map(schedule => (
            <ScheduleCard key={schedule.id} schedule={schedule} onEdit={onEdit} />
          ))
        ) : (
          <Box sx={{
            px: 2,
            py: 1.2,
            borderRadius: 2,
            border: '1px dashed rgba(255,255,255,0.25)',
            bgcolor: 'rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 44,
          }}>
            <Typography sx={{ color: '#ff9f0a', fontWeight: 700, fontSize: '0.8rem' }}>
              sin agendamiento
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
