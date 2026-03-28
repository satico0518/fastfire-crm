import React, { useState } from 'react';
import { Box, Card, CardActionArea, Typography, Chip, Stack, Avatar, AvatarGroup } from '@mui/material';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import dayjs from 'dayjs';

interface Props {
  schedule: MaintenanceSchedule;
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'IN_PROGRESS': return '#ff9f0a'; // Apple neon orange
    case 'COMPLETED': return '#30d158'; // Apple neon green
    case 'CANCELLED': return '#ff453a'; // Apple neon red
    case 'SCHEDULED':
    default: return '#0a84ff'; // Apple neon blue
  }
};

export const ScheduleCard: React.FC<Props> = ({ schedule }) => {
  const [open, setOpen] = useState(false);
  const timeStr = dayjs(schedule.dateStr).format('HH:mm');
  const isAllDay = timeStr === '00:00';

  return (
    <>
      <Card sx={{ 
        mx: 1,
        bgcolor: '#1c1c1e', // iOS Dark Mode secondary bg
        borderRadius: 4, 
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'none',
        backgroundImage: 'none'
      }}>
        {/* Accent Bar */}
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: 16,
          bottom: 16,
          width: '3px',
          bgcolor: getStatusColor(schedule.status),
          borderTopRightRadius: 2,
          borderBottomRightRadius: 2,
          zIndex: 1
        }} />

        <CardActionArea sx={{ p: 2, pl: 2.5 }} onClick={() => setOpen(true)}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', mb: 0.2, fontSize: '0.85rem' }}>
                {isAllDay ? 'All Day' : timeStr}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: 'white', fontSize: '1.05rem', mb: 0.5 }}>
                {schedule.title}
              </Typography>
            </Box>
            
            {schedule.priority === 'URGENT' && (
              <Chip label="URGENT" size="small" sx={{ bgcolor: 'rgba(255,69,58,0.2)', color: '#ff453a', fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
            )}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'rgba(255,255,255,0.5)' }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>
              {schedule.address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.65rem', border: '2px solid #1c1c1e', bgcolor: 'rgba(255,255,255,0.2)' } }}>
              {schedule.operatorNames.map((name, i) => (
                <Avatar key={i} alt={name}>{name.charAt(0)}</Avatar>
              ))}
            </AvatarGroup>
          </Box>
        </CardActionArea>
      </Card>

      <ScheduleDetailModal 
        open={open} 
        onClose={() => setOpen(false)} 
        schedule={schedule} 
      />
    </>
  );
};
