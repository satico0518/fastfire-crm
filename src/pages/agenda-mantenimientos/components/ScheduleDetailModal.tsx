import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, Divider, Grid, Stack, Chip, Button, DialogActions, Collapse } from '@mui/material';
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
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import { useAuthStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: MaintenanceSchedule;
  onEdit?: (schedule: MaintenanceSchedule) => void;
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

export const ScheduleDetailModal: React.FC<Props> = ({ open, onClose, schedule, onEdit }) => {
  const user = useAuthStore(state => state.user);
  const setSnackbar = useUiStore(state => state.setSnackbar);
  const [showHistory, setShowHistory] = useState(false);
  
  const isAllowedToManage = schedule.type === 'MANAGER_ACTIVITY' 
    ? user?.permissions?.includes("MANAGER")
    : user?.permissions?.includes("PLANNER");
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
    const resp = await MaintenanceService.updateSchedule(schedule.id, { status: newStatus }, user?.email || 'Sistema');
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
           {schedule.type === 'MANAGER_ACTIVITY' && (
             <Chip 
               label="PERSONAL" 
               size="small" 
               sx={{ 
                 mb: 1.5, 
                 ml: schedule.priority === 'URGENT' ? 1 : 0, 
                 fontWeight: 900, 
                 bgcolor: 'rgba(168, 85, 247, 0.2)', 
                 color: '#a855f7',
                 border: '1px solid rgba(168, 85, 247, 0.4)'
               }} 
             />
           )}
           <Typography variant="h5" component="div" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2, color: '#0a84ff' }}>
             {schedule.type === 'MANAGER_ACTIVITY' ? 'Actividad Personal' : schedule.projectName}
           </Typography>
           <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5, color: 'rgba(255,255,255,0.7)' }}>
             {schedule.type === 'MANAGER_ACTIVITY' ? schedule.projectName : schedule.title}
           </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {schedule.editHistory && schedule.editHistory.length > 0 && (
            <IconButton 
              onClick={() => setShowHistory(!showHistory)} 
              size="small" 
              sx={{ bgcolor: 'rgba(10,132,255,0.1)', color: '#0a84ff', '&:hover': { bgcolor: 'rgba(10,132,255,0.2)' } }}
              title="Ver histórico de cambios"
            >
              <HistoryIcon />
            </IconButton>
          )}
          {isAllowedToManage && (
            <IconButton 
              onClick={() => {
                onEdit?.(schedule);
                onClose();
              }} 
              size="small" 
              sx={{ bgcolor: 'rgba(10,132,255,0.1)', color: '#0a84ff', '&:hover': { bgcolor: 'rgba(10,132,255,0.2)' } }}
              title="Editar agendamiento"
            >
              <EditIcon />
            </IconButton>
          )}
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
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>Ubicación</Typography>
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

          {schedule.type !== 'MANAGER_ACTIVITY' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.5)', mb: 1.5, textTransform: 'uppercase' }}>
                  Factura
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
                      {schedule.hasQuotation === 'SI' 
                        ? (schedule.quotationNumber ? `Nº ${schedule.quotationNumber}` : 'SÍ TIENE') 
                        : (schedule.hasQuotation === 'NO' ? 'PENDIENTE' : 'N/A')}
                    </Typography>
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
                      {schedule.hasReport === 'SI' 
                        ? (schedule.reportNumber ? `Nº ${schedule.reportNumber}` : 'SÍ TIENE') 
                        : (schedule.hasReport === 'NO' ? 'PENDIENTE' : 'N/A')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </>
          )}
        </Grid>

        {schedule.observations && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'rgba(255,255,255,0.5)' }}>Observaciones</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              {schedule.observations}
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

        {schedule.updatedBy && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              Última actualización: {schedule.updatedBy}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              {schedule.updatedAt ? dayjs(schedule.updatedAt).format('DD/MMM/YYYY HH:mm') : ''}
            </Typography>
          </Box>
        )}

        <Collapse in={showHistory} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Histórico de Cambios
            </Typography>
            <Stack spacing={2}>
              {schedule.editHistory?.map((entry, idx) => (
                <Box key={idx} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1.5, borderLeft: '3px solid #0a84ff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                      {entry.changedBy}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {dayjs(entry.timestamp).format('DD/MMM HH:mm')}
                    </Typography>
                  </Box>
                  <Stack spacing={0.5}>
                    {Object.entries(entry.changes).map(([field, change]) => (
                      <Typography key={field} variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                        <strong>{field}:</strong> <span style={{textDecoration: 'line-through', opacity: 0.6}}>{JSON.stringify(change.old)}</span> → <span style={{color: '#30d158'}}>{JSON.stringify(change.new)}</span>
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Collapse>
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
