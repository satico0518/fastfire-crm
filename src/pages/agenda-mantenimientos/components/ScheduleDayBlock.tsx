import React from 'react';
import { Box, Typography } from '@mui/material';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { ScheduleCard } from './ScheduleCard';

interface Props {
  dateLabel: string;
  schedules: MaintenanceSchedule[];
}

export const ScheduleDayBlock: React.FC<Props> = ({ dateLabel, schedules }) => {
  return (
    <Box sx={{ mb: 1 }}>
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
        {schedules.map(schedule => (
          <ScheduleCard key={schedule.id} schedule={schedule} />
        ))}
      </Box>
    </Box>
  );
};
