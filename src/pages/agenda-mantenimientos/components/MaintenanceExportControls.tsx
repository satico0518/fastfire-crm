import React, { useState, useMemo } from 'react';
import { 
  Box, Button, Popover, List, ListItem, ListItemIcon, 
  Checkbox, ListItemText, Typography, 
  Tooltip, Badge 
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import { MaintenanceSchedule } from '../../../interfaces/Maintenance';
import { downloadExcelFile } from '../../../utils/utils';

interface Props {
  schedules: MaintenanceSchedule[];
  setSnackbar: (params: { open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }) => void;
}

export const MaintenanceExportControls: React.FC<Props> = ({ schedules, setSnackbar }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const availableMonths = useMemo(() => {
    const now = dayjs().startOf('month');
    const start = now.subtract(6, 'month');
    
    // Find the latest schedule date, but default to current month + 6
    let lastDate = now.add(6, 'month');
    schedules.forEach(s => {
      const d = dayjs(s.dateStr);
      if (d.isAfter(lastDate)) lastDate = d;
    });
    
    const end = lastDate.endOf('month');
    const months = [];
    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, 'month')) {
      months.push(curr.format('YYYY-MM'));
      curr = curr.add(1, 'month');
    }
    return months;
  }, [schedules]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleMonth = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month) 
        : [...prev, month]
    );
  };

  const handleSelectAll = () => {
    if (selectedMonths.length === availableMonths.length) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths([...availableMonths]);
    }
  };

  const handleExport = () => {
    if (selectedMonths.length === 0) {
      setSnackbar({ open: true, message: "Por favor selecciona al menos un mes", severity: "warning" });
      return;
    }

    const filtered = schedules.filter(s => {
      const m = dayjs(s.dateStr).format('YYYY-MM');
      return selectedMonths.includes(m);
    });

    if (filtered.length === 0) {
      setSnackbar({ open: true, message: "No hay programaciones en los meses seleccionados", severity: "info" });
      return;
    }

    const sortedData = [...filtered].sort((a, b) => dayjs(a.dateStr).diff(dayjs(b.dateStr)));

    const excelData = sortedData.map(s => ({
      'Proyecto': s.projectName || '-',
      'Actividad': s.title,
      'Fecha': dayjs(s.dateStr).format('DD/MM/YYYY'),
      'Hora': dayjs(s.dateStr).format('HH:mm'),
      'Dirección': s.address,
      'Estado': s.status === 'SCHEDULED' ? 'Agendado' : s.status === 'IN_PROGRESS' ? 'En Progreso' : s.status === 'COMPLETED' ? 'Completado' : 'Cancelado',
      'Prioridad': s.priority === 'LOW' ? 'Baja' : s.priority === 'NORMAL' ? 'Normal' : s.priority === 'HIGH' ? 'Alta' : 'Urgente',
      'Factura': s.hasQuotation || '-',
      'Nº Factura': s.quotationNumber || '-',
      'Reporte': s.hasReport || '-',
      'Contacto': s.contactName || '-',
      'Teléfono': s.contactPhone || '-',
      'Descripción': s.description || '-',
      'Observaciones': s.observations || '-',
      'Creado por': s.createdBy || '-',
      'Fecha Creación': dayjs(s.createdAt).format('DD/MM/YYYY HH:mm')
    }));

    downloadExcelFile(excelData, `Reporte_Mantenimientos_${dayjs().format('YYYYMMDD')}.xlsx`);
    handleClose();
    setSnackbar({ open: true, message: "Excel generado exitosamente", severity: "success" });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'month-popover' : undefined;

  return (
    <Box>
      <Tooltip title="Exportar Programaciones">
        <Button
          variant="contained"
          size="small"
          onClick={handleClick}
          startIcon={<FileDownloadIcon />}
          sx={{
            background: 'rgba(48, 209, 88, 0.15)',
            border: '1px solid rgba(48, 209, 88, 0.4)',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            color: '#30d158',
            backdropFilter: 'blur(10px)',
            py: 0.5,
            px: 2,
            '&:hover': {
              background: 'rgba(48, 209, 88, 0.25)',
              border: '1px solid #30d158'
            }
          }}
        >
          Exportar
          {selectedMonths.length > 0 && (
            <Badge 
              badgeContent={selectedMonths.length} 
              color="success" 
              sx={{ ml: 2, '& .MuiBadge-badge': { fontSize: '0.65rem' } }} 
            />
          )}
        </Button>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 280,
            background: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: 'white',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Seleccionar Meses</Typography>
          <Button size="small" onClick={handleSelectAll} sx={{ fontSize: '0.7rem', color: '#0a84ff' }}>
            {selectedMonths.length === availableMonths.length ? 'Limpiar' : 'Todo'}
          </Button>
        </Box>
        
        <List sx={{ maxHeight: 300, overflow: 'auto', px: 1 }}>
          {availableMonths.map((m) => {
            const date = dayjs(m);
            return (
              <ListItem 
                key={m} 
                disablePadding
              >
                <ListItemButton 
                  onClick={() => handleToggleMonth(m)}
                  sx={{ 
                    borderRadius: '8px', 
                    mb: 0.5,
                    bgcolor: selectedMonths.includes(m) ? 'rgba(10, 132, 255, 0.1)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      checked={selectedMonths.includes(m)}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#0a84ff' } }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={date.format('MMMM')} 
                    secondary={date.format('YYYY')}
                    primaryTypographyProps={{ sx: { fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' } }}
                    secondaryTypographyProps={{ sx: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button 
            fullWidth 
            variant="contained" 
            disabled={selectedMonths.length === 0}
            onClick={handleExport}
            sx={{ 
              bgcolor: '#0a84ff', 
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'none',
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
            }}
          >
            Descargar Excel
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};
