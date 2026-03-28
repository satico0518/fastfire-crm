import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, Divider, Grid, Stack, Chip, Button, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { MaintenanceService } from '../../../services/maintenance.service';
import dayjs from 'dayjs';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { useAuhtStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: MaintenanceSchedule;
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

const getStatusText = (status: string) => {
  switch(status) {
    case 'IN_PROGRESS': return 'En progreso';
    case 'COMPLETED': return 'Completado';
    case 'CANCELLED': return 'Cancelado';
    case 'SCHEDULED':
    default: return 'Programado';
  }
};

export const ScheduleDetailModal: React.FC<Props> = ({ open, onClose, schedule }) => {
  const user = useAuhtStore(state => state.user);
  const setSnackbar = useUiStore(state => state.setSnackbar);
  
  const isAllowedToManage = user?.permissions?.includes("ADMIN") || user?.permissions?.includes("PLANNER");
  const dateObj = dayjs(schedule.dateStr);
  const statusColor = getStatusColor(schedule.status);

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este agendamiento?")) return;
    
    const resp = await MaintenanceService.deleteSchedule(schedule.id);
    if (resp.result === "OK") {
      setSnackbar({ open: true, message: "Agendamiento eliminado", severity: "success" });
      onClose();
    }
  };

  const handleUpdateStatus = async (newStatus: MaintenanceSchedule['status']) => {
    const resp = await MaintenanceService.updateSchedule(schedule.id, { status: newStatus });
    if (resp.result === "OK") {
      setSnackbar({ open: true, message: `Estado actualizado a: ${getStatusText(newStatus)}`, severity: "success" });
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm" 
      PaperProps={{ 
        sx: { 
          borderRadius: 4, 
          bgcolor: '#1c1c1e', 
          color: 'white',
          backgroundImage: 'none'
        } 
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
           <Chip 
              label={getStatusText(schedule.status)} 
              size="small"
              sx={{ 
                mb: 1.5,
                bgcolor: 'rgba(255,255,255,0.08)', 
                color: statusColor,
                fontWeight: 700 
              }} 
           />
           {schedule.priority === 'URGENT' && (
             <Chip label="URGENTE" size="small" sx={{ mb: 1.5, ml: 1, fontWeight: 800, bgcolor: 'rgba(255,69,58,0.2)', color: '#ff453a' }} />
           )}
           <Typography variant="h5" component="div" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2, color: 'white' }}>
             {schedule.title}
           </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {isAllowedToManage && (
            <IconButton onClick={handleDelete} size="small" sx={{ bgcolor: 'rgba(255,69,58,0.1)', color: '#ff453a', '&:hover': { bgcolor: 'rgba(255,69,58,0.2)' } }}>
              <DeleteOutlineIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pb: 2, pt: 1 }}>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <Box sx={{ p: 1, bgcolor: 'rgba(10,132,255,0.15)', borderRadius: 2, color: '#0a84ff', display: 'flex' }}>
              <CalendarTodayOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>Fecha Programada</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                {dateObj.format('dddd, D [de] MMMM [de] YYYY')} - {dateObj.format('HH:mm')} hrs
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <Box sx={{ p: 1, bgcolor: 'rgba(10,132,255,0.15)', borderRadius: 2, color: '#0a84ff', display: 'flex' }}>
              <LocationOnOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>Dirección / Establecimiento</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                {schedule.address}
              </Typography>
            </Box>
          </Stack>

        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.5)', mb: 1.5, textTransform: 'uppercase' }}>
              Contacto en Sitio
            </Typography>
            
            <Stack spacing={1.5} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonOutlineOutlinedIcon fontSize="small" />
                <Typography variant="body2">{schedule.contactName || 'Sin contacto definido'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneOutlinedIcon fontSize="small" />
                <Typography variant="body2">{schedule.contactPhone || 'No hay teléfono'}</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.5)', mb: 1.5, textTransform: 'uppercase' }}>
              Cotización
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ 
                p: 0.8, 
                bgcolor: schedule.hasQuotation === 'SI' ? 'rgba(48,209,88,0.15)' : (schedule.hasQuotation === 'NO' ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.05)'), 
                borderRadius: 1.5, 
                color: schedule.hasQuotation === 'SI' ? '#30d158' : (schedule.hasQuotation === 'NO' ? '#ff453a' : 'rgba(255,255,255,0.4)'), 
                display: 'flex' 
              }}>
                <RequestQuoteOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 700, 
                  color: schedule.hasQuotation === 'SI' ? 'white' : 'rgba(255,255,255,0.5)' 
                }}>
                  {schedule.hasQuotation === 'SI' ? 'SÍ TIENE' : (schedule.hasQuotation === 'NO' ? 'PENDIENTE' : 'N/A')}
                </Typography>
                {schedule.hasQuotation === 'SI' && schedule.quotationNumber && (
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                     Nº {schedule.quotationNumber}
                   </Typography>
                )}
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.5)', mb: 1.5, textTransform: 'uppercase' }}>
              Informe Técnico
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ 
                p: 0.8, 
                bgcolor: schedule.hasReport === 'SI' ? 'rgba(10,132,255,0.15)' : (schedule.hasReport === 'NO' ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.05)'), 
                borderRadius: 1.5, 
                color: schedule.hasReport === 'SI' ? '#0a84ff' : (schedule.hasReport === 'NO' ? '#ff453a' : 'rgba(255,255,255,0.4)'), 
                display: 'flex' 
              }}>
                <FactCheckOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 700, 
                  color: schedule.hasReport === 'SI' ? 'white' : 'rgba(255,255,255,0.5)' 
                }}>
                  {schedule.hasReport === 'SI' ? 'ENTREGADO' : (schedule.hasReport === 'NO' ? 'PENDIENTE' : 'N/A')}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {schedule.description && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'rgba(255,255,255,0.5)' }}>Detalle del mantenimiento</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              {schedule.description}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
             Creado por: {schedule.createdBy || 'Sistema'}
           </Typography>
           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
             {schedule.createdAt ? dayjs(schedule.createdAt).format('DD/MMM/YYYY HH:mm') : ''}
           </Typography>
        </Box>
      </DialogContent>
      
      {isAllowedToManage && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<PlayCircleOutlineIcon />} 
            onClick={() => handleUpdateStatus('IN_PROGRESS')}
            disabled={schedule.status === 'IN_PROGRESS'}
            sx={{ borderRadius: 2, color: '#ff9f0a', borderColor: 'rgba(255,159,10,0.5)' }}
          >
            Iniciar
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<CheckCircleOutlineIcon />} 
            onClick={() => handleUpdateStatus('COMPLETED')}
            disabled={schedule.status === 'COMPLETED'}
            sx={{ borderRadius: 2, color: '#30d158', borderColor: 'rgba(48,209,88,0.5)' }}
          >
            Completar
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<BlockIcon />} 
            onClick={() => handleUpdateStatus('CANCELLED')}
            disabled={schedule.status === 'CANCELLED'}
            sx={{ borderRadius: 2, color: '#ff453a', borderColor: 'rgba(255,69,58,0.5)' }}
          >
            Cancelar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
