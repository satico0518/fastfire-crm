import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, IconButton, Typography, Autocomplete, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { useAuhtStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { useUsersStore } from '../../../stores/users/users.store';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedDateStr: string | null;
  onSave: (schedule: MaintenanceSchedule) => void;
}

export const ScheduleCreationModal: React.FC<Props> = ({ open, onClose, selectedDateStr, onSave }) => {
  const user = useAuhtStore(state => state.user);
  const users = useUsersStore((state) => state.users);
  const setSnackbar = useUiStore(state => state.setSnackbar);
  
  const [ubication, setUbication] = useState('');
  const [activity, setActivity] = useState('');
  const [obs, setObs] = useState('');
  const [dateVal, setDateVal] = useState(selectedDateStr || '');
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);

  React.useEffect(() => {
    if (open && selectedDateStr) {
      setDateVal(selectedDateStr + 'T08:00'); // default 8am
    }
  }, [open, selectedDateStr]);

  const handleSave = () => {
    if (!ubication || !activity || !dateVal) return; // Simple validation handled natively

    // Restriction: No past dates
    if (dayjs(dateVal).isBefore(dayjs().startOf('day'))) {
      setSnackbar({
        open: true,
        message: 'No puedes programar mantenimientos en fechas pasadas',
        severity: 'warning'
      });
      return;
    }

    const newSched: Omit<MaintenanceSchedule, 'id'> = {
      title: activity,
      dateStr: new Date(dateVal).toISOString(),
      address: ubication,
      description: activity,
      observations: obs,
      operatorNames: selectedOperators,
      status: 'SCHEDULED',
      priority: 'NORMAL',
      createdAt: new Date().toISOString(),
      createdBy: user ? `${user.firstName} ${user.lastName}` : 'Administrador',
    };

    onSave(newSched as MaintenanceSchedule);
    
    // reset
    setUbication('');
    setActivity('');
    setObs('');
    setSelectedOperators([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1c1c1e', color: 'white' } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>Nuevo Agendamiento</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailableOutlinedIcon fontSize="small" /> Fecha de Mantenimiento *
            </Typography>
            <TextField 
              fullWidth
              type="datetime-local"
              variant="outlined"
              size="small"
              required
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: dayjs().format('YYYY-MM-DDTHH:mm') 
              }}
              sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }, '&.Mui-focused fieldset': { borderColor: '#0a84ff' } } }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnOutlinedIcon fontSize="small" /> Ubicación *
            </Typography>
            <TextField 
              fullWidth
              placeholder="Ej: Conjunto Residencial ABC"
              variant="outlined"
              size="small"
              required
              value={ubication}
              onChange={(e) => setUbication(e.target.value)}
              sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }, '&.Mui-focused fieldset': { borderColor: '#0a84ff' } } }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditNoteOutlinedIcon fontSize="small" /> Actividad *
            </Typography>
            <TextField 
              fullWidth
              placeholder="Ej: Limpieza de cuarto de bombas"
              variant="outlined"
              size="small"
              required
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }, '&.Mui-focused fieldset': { borderColor: '#0a84ff' } } }}
            />
          </Box>

           <Box>
            <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
              Operarios Asignados (Opcional)
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              options={(users?.filter(u => u.isActive && u.permissions.includes('PROVIDER')) || []).map(u => `${u.firstName} ${u.lastName}`)}
              value={selectedOperators}
              onChange={(_, newValue) => setSelectedOperators(newValue as string[])}
              renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(10,132,255,0.1)' }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Seleccionar o escribir nombre..."
                  variant="outlined"
                  size="small"
                  sx={{ 
                    input: { color: 'white' }, 
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, 
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }, 
                      '&.Mui-focused fieldset': { borderColor: '#0a84ff' } 
                    } 
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
              Observaciones (Opcional)
            </Typography>
            <TextField 
              fullWidth
              multiline
              rows={3}
              placeholder="Detalles adicionales, contactos, etc..."
              variant="outlined"
              size="small"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              sx={{ textarea: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }, '&.Mui-focused fieldset': { borderColor: '#0a84ff' } } }}
            />
          </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1.5, borderColor: 'rgba(255,255,255,0.1)' }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={!activity || !ubication || !dateVal}
          sx={{ bgcolor: '#0a84ff', fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Agendar Mantenimiento
        </Button>
      </DialogActions>
    </Dialog>
  );
};
