import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  IconButton, 
  Typography,
  ToggleButton, 
  ToggleButtonGroup 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { MaintenanceService } from '../../../services/maintenance.service';
import { useAuthStore } from '../../../stores';
import { useUiStore } from '../../../stores/ui/ui.store';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import dayjs from 'dayjs';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedDateStr: string | null;
  onSave: (schedule: MaintenanceSchedule) => void;
  editingSchedule?: MaintenanceSchedule | null;
}

const darkInputFieldSx = {
  '& label': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
  '& label.Mui-focused': { color: 'white' },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#0a84ff' },
    '& .MuiInputBase-input': { color: 'white' },
  },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
};

export const ScheduleCreationModal: React.FC<Props> = ({ open, onClose, selectedDateStr, onSave, editingSchedule }) => {
  const user = useAuthStore(state => state.user);
  const setSnackbar = useUiStore(state => state.setSnackbar);
  const [isLoading, setIsLoading] = useState(false);
  
  const [ubication, setUbication] = useState('');
  const [activity, setActivity] = useState('');
  const [obs, setObs] = useState('');
  const [projectName, setProjectName] = useState('');
  const [dateVal, setDateVal] = useState(selectedDateStr || '');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [hasQuotation, setHasQuotation] = useState<'SI' | 'NO' | 'NA'>('NO');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [hasReport, setHasReport] = useState<'SI' | 'NO' | 'NA'>('NO');
  const [reportNumber, setReportNumber] = useState('');
  const [currentType, setCurrentType] = useState<'MAINTENANCE' | 'MANAGER_ACTIVITY'>('MAINTENANCE');

  const isEditMode = !!editingSchedule;

  useEffect(() => {
    if (open) {
      if (editingSchedule) {
        {/* Modo edición: cargar datos existentes */}
        setUbication(editingSchedule.address || '');
        setActivity(editingSchedule.title || '');
        setObs(editingSchedule.observations || '');
        setProjectName(editingSchedule.projectName || '');
        setDateVal(editingSchedule.dateStr ? dayjs(editingSchedule.dateStr).format('YYYY-MM-DDTHH:mm') : '');
        setHasQuotation(editingSchedule.hasQuotation || 'NO');
        setQuotationNumber(editingSchedule.quotationNumber || '');
        setHasReport(editingSchedule.hasReport || 'NO');
        setReportNumber(editingSchedule.reportNumber || '');
        setContactName(editingSchedule.contactName || '');
        setContactPhone(editingSchedule.contactPhone || '');
        setCurrentType(editingSchedule.type || 'MAINTENANCE');
      } else {
        {/* Modo creación: inicializar con fecha seleccionada */}
        setDateVal(selectedDateStr ? selectedDateStr + 'T08:00' : dayjs().format('YYYY-MM-DDTHH:mm'));
        setUbication('');
        setActivity('');
        setProjectName('');
        setObs('');
        setHasQuotation('NO');
        setQuotationNumber('');
        setHasReport('NO');
        setReportNumber('');
        setContactName('');
        setContactPhone('');
        
        // Determinar tipo por defecto basado en rol
        if (user?.permissions?.includes('MANAGER')) {
          setCurrentType('MANAGER_ACTIVITY');
        } else {
          setCurrentType('MAINTENANCE');
        }
      }
    }
  }, [open, selectedDateStr, editingSchedule, user]);

  const handleSave = async () => {
    if (!projectName || !ubication || !activity || !dateVal) return;
    
    if (projectName.length > 50) {
      setSnackbar({
        open: true,
        message: 'El nombre del proyecto no puede superar los 50 caracteres',
        severity: 'warning'
      });
      return;
    }

    if (dayjs(dateVal).isBefore(dayjs().startOf('day'))) {
      setSnackbar({
        open: true,
        message: 'No puedes programar mantenimientos en fechas pasadas',
        severity: 'warning'
      });
      return;
    }

    if (currentType === 'MAINTENANCE') {
      if (hasQuotation === 'SI' && !quotationNumber.trim()) {
        setSnackbar({
          open: true,
          message: 'Debes completar el número de factura',
          severity: 'warning'
        });
        return;
      }

      if (hasReport === 'SI' && !reportNumber.trim()) {
        setSnackbar({
          open: true,
          message: 'Debes completar el número de informe',
          severity: 'warning'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isEditMode && editingSchedule) {
        {/* Modo actualización */}
        const updates: Partial<MaintenanceSchedule> = {
          projectName,
          title: activity,
          dateStr: new Date(dateVal).toISOString(),
          address: ubication,
          observations: obs,
          hasQuotation,
          quotationNumber: hasQuotation === 'SI' ? quotationNumber : '',
          reportNumber: hasReport === 'SI' ? reportNumber : '',
          contactName,
          contactPhone,
          type: currentType,
        };

        const resp = await MaintenanceService.updateSchedule(
          editingSchedule.id,
          updates,
          user?.email || 'Sistema'
        );

        if (resp.result === 'OK') {
          setSnackbar({
            open: true,
            message: 'Agendamiento actualizado correctamente',
            severity: 'success'
          });
          
          {/* Reset y cierre */}
          setUbication('');
          setActivity('');
          setProjectName('');
          setObs('');
          setHasQuotation('NO');
          setQuotationNumber('');
          setHasReport('NO');
          setReportNumber('');
          setContactName('');
          setContactPhone('');
          onClose();
        } else {
          setSnackbar({
            open: true,
            message: resp.errorMessage || 'Error al actualizar',
            severity: 'error'
          });
        }
      } else {
        {/* Modo creación */}
        const newSched: Omit<MaintenanceSchedule, 'id'> = {
          projectName,
          title: activity,
          dateStr: new Date(dateVal).toISOString(),
          address: ubication,
          observations: obs,
          hasQuotation,
          quotationNumber: hasQuotation === 'SI' ? quotationNumber : '',
          hasReport,
          reportNumber: hasReport === 'SI' ? reportNumber : '',
          contactName,
          contactPhone,
          status: 'SCHEDULED',
          priority: 'NORMAL',
          type: currentType,
          createdAt: new Date().toISOString(),
          createdBy: user ? `${user.firstName} ${user.lastName}` : 'Administrador',
        };

        onSave(newSched as MaintenanceSchedule);
        
        {/* Reset y cierre */}
        setUbication('');
        setActivity('');
        setProjectName('');
        setObs('');
        setHasQuotation('NO');
        setQuotationNumber('');
        setHasReport('NO');
        setReportNumber('');
        setContactName('');
        setContactPhone('');
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs" 
      disableRestoreFocus 
      PaperProps={{ 
        sx: { 
          borderRadius: 5, 
          bgcolor: 'rgba(28, 28, 30, 0.9)', 
          backdropFilter: 'blur(20px) saturate(180%)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'none'
        } 
      }}
    >

      <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
          {currentType === 'MANAGER_ACTIVITY' 
            ? (isEditMode ? 'Editar Actividad' : 'Nueva Actividad Personal')
            : (isEditMode ? 'Editar Agendamiento' : 'Nuevo Agendamiento')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pt: 1 }}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
              <BusinessOutlinedIcon fontSize="small" /> {currentType === 'MANAGER_ACTIVITY' ? 'Título' : 'Nombre del Proyecto'} *
            </Typography>
            <TextField 
              fullWidth
              placeholder="Ej: Mantenimiento Preventivo Q1"
              variant="outlined"
              size="small"
              required
              inputProps={{ maxLength: 50 }}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              sx={darkInputFieldSx}
            />
          </Box>
          
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
              <EventAvailableOutlinedIcon fontSize="small" /> {currentType === 'MANAGER_ACTIVITY' ? 'Fecha' : 'Fecha de Mantenimiento'} *
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
              sx={darkInputFieldSx}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
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
              sx={darkInputFieldSx}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
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
              sx={darkInputFieldSx}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <PersonOutlinedIcon fontSize="small" /> Nombre de Contacto
              </Typography>
              <TextField 
                fullWidth
                placeholder="Nombre de quien recibe"
                variant="outlined"
                size="small"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                sx={darkInputFieldSx}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <PhoneOutlinedIcon fontSize="small" /> Teléfono
              </Typography>
              <TextField 
                fullWidth
                placeholder="Celular / Fijo"
                variant="outlined"
                size="small"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                sx={darkInputFieldSx}
              />
            </Box>
          </Box>

           {currentType === 'MAINTENANCE' && (
             <>
               <Box>
                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                   <RequestQuoteOutlinedIcon fontSize="small" /> ¿Ya tiene Factura?
                 </Typography>
                 <ToggleButtonGroup
                   value={hasQuotation}
                   exclusive
                   onChange={(_, val) => val && setHasQuotation(val)}
                   size="small"
                   fullWidth
                   sx={{ 
                     mb: hasQuotation === 'SI' ? 1.5 : 0,
                     bgcolor: 'rgba(255,255,255,0.05)',
                     borderRadius: '12px',
                     overflow: 'hidden',
                     border: '1px solid rgba(255,255,255,0.1)',
                     '& .MuiToggleButton-root': { 
                       color: 'rgba(255,255,255,0.5)', 
                       border: 'none',
                       py: 0.8,
                       '&.Mui-selected': { 
                         color: 'white', 
                         bgcolor: 'rgba(48,209,88,0.2)',
                         fontWeight: 800,
                         '&:hover': { bgcolor: 'rgba(48,209,88,0.3)' }
                       } 
                     } 
                   }}
                 >
                   <ToggleButton value="SI">SI</ToggleButton>
                   <ToggleButton value="NO">NO</ToggleButton>
                   <ToggleButton value="NA">NA</ToggleButton>
                 </ToggleButtonGroup>
                 
                 {hasQuotation === 'SI' && (
                   <TextField 
                     fullWidth
                     placeholder="Escribe el Nº de Factura..."
                     variant="outlined"
                     size="small"
                     required
                     value={quotationNumber}
                     onChange={(e) => setQuotationNumber(e.target.value)}
                     sx={{ 
                       mt: 1,
                       ...darkInputFieldSx,
                       '& .MuiOutlinedInput-root': {
                         ...darkInputFieldSx['& .MuiOutlinedInput-root'],
                         '&.Mui-focused fieldset': { borderColor: '#30d158' }
                       }
                     }}
                   />
                 )}
               </Box>

               <Box>
                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                   <DescriptionOutlinedIcon fontSize="small" /> ¿Ya tiene Informe?
                 </Typography>
                 <ToggleButtonGroup
                   value={hasReport}
                   exclusive
                   onChange={(_, val) => val && setHasReport(val)}
                   size="small"
                   fullWidth
                   sx={{ 
                     mb: hasReport === 'SI' ? 1.5 : 0,
                     bgcolor: 'rgba(255,255,255,0.05)',
                     borderRadius: '12px',
                     overflow: 'hidden',
                     border: '1px solid rgba(255,255,255,0.1)',
                     '& .MuiToggleButton-root': { 
                       color: 'rgba(255,255,255,0.5)', 
                       border: 'none',
                       py: 0.8,
                       '&.Mui-selected': { 
                         color: 'white', 
                         bgcolor: 'rgba(10,132,255,0.2)',
                         fontWeight: 800,
                         '&:hover': { bgcolor: 'rgba(10,132,255,0.3)' }
                       } 
                     } 
                   }}
                 >
                   <ToggleButton value="SI">SI</ToggleButton>
                   <ToggleButton value="NO">NO</ToggleButton>
                   <ToggleButton value="NA">NA</ToggleButton>
                 </ToggleButtonGroup>

                 {hasReport === 'SI' && (
                   <TextField 
                     fullWidth
                     placeholder="Escribe el Nº de Informe..."
                     variant="outlined"
                     size="small"
                     required
                     value={reportNumber}
                     onChange={(e) => setReportNumber(e.target.value)}
                     sx={{ 
                       mt: 1,
                       ...darkInputFieldSx,
                       '& .MuiOutlinedInput-root': {
                         ...darkInputFieldSx['& .MuiOutlinedInput-root'],
                         '&.Mui-focused fieldset': { borderColor: '#0a84ff' }
                       }
                     }}
                   />
                 )}
               </Box>
             </>
           )}

           <Box>
             <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block', fontWeight: 700 }}>
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
               sx={darkInputFieldSx}
             />
           </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: 'rgba(255,255,255,0.5)', 
            textTransform: 'none', 
            fontWeight: 600,
            mr: 1
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!projectName || !activity || !ubication || !dateVal || (currentType === 'MAINTENANCE' && ((hasQuotation === 'SI' && !quotationNumber.trim()) || (hasReport === 'SI' && !reportNumber.trim()))) || isLoading}
          sx={{ 
            bgcolor: 'rgba(10,132,255,0.2)', 
            border: '1px solid rgba(10,132,255,0.5)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontWeight: 700, 
            borderRadius: '12px', 
            textTransform: 'none', 
            px: 3,
            py: 1,
            '&:hover': { 
              bgcolor: 'rgba(10,132,255,0.3)',
              border: '1px solid rgba(10,132,255,0.8)'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(125,125,125,0.4)',
              color: 'rgba(245,245,245,0.8)',
              border: '1px solid rgba(180,180,180,0.7)'
            }
          }}
        >
          {isLoading ? 'Guardando...' : (currentType === 'MANAGER_ACTIVITY' 
            ? (isEditMode ? 'Actualizar Actividad' : 'Guardar Actividad')
            : (isEditMode ? 'Actualizar Agendamiento' : 'Agendar Mantenimiento'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
