import React, { useState } from 'react';
import { Box, Card, CardActionArea, Typography, Chip } from '@mui/material';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import dayjs from 'dayjs';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

interface Props {
  schedule: MaintenanceSchedule;
  onEdit?: (schedule: MaintenanceSchedule) => void;
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

export const ScheduleCard: React.FC<Props> = ({ schedule, onEdit }) => {
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

        <CardActionArea sx={{ p: 1.5, pl: 2.5 }} onClick={() => setOpen(true)}>
          {/* Top Row: Title and Time */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ maxWidth: '75%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: 'white', fontSize: '1rem' }}>
                {schedule.projectName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a84ff', fontSize: '0.8rem' }}>
                {isAllDay ? 'Todo el día' : timeStr}
              </Typography>
              {schedule.priority === 'URGENT' && (
                <Chip label="URGENTE" size="small" sx={{ bgcolor: 'rgba(255,69,58,0.2)', color: '#ff453a', fontWeight: 800, fontSize: '0.6rem', height: 18 }} />
              )}
            </Box>
          </Box>

          {/* Bottom Row: Location and Technicians */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', maxWidth: '65%' }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>
                {schedule.address}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {/* Quotation Indicator */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: schedule.hasQuotation === 'SI' ? '#30d158' : (schedule.hasQuotation === 'NO' ? '#ff453a' : 'rgba(255,255,255,0.2)'),
                transition: 'color 0.2s'
              }}>
                <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>

              {/* Report Indicator */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: schedule.hasReport === 'SI' ? '#0a84ff' : (schedule.hasReport === 'NO' ? '#ff453a' : 'rgba(255,255,255,0.2)'),
                transition: 'color 0.2s'
              }}>
                <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Box>
        </CardActionArea>
      </Card>

      <ScheduleDetailModal 
        open={open} 
        onClose={() => setOpen(false)} 
        schedule={schedule} 
        onEdit={onEdit} 
      />
    </>
  );
};
