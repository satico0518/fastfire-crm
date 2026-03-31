import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  disablePortal: true,
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
      backgroundColor: '#1c1c1e',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    sx: {
      zIndex: 9999,
    }
  },
  anchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'left' as const,
  },
  transformOrigin: {
    vertical: 'top' as const,
    horizontal: 'left' as const,
  },
  MenuListProps: {
    style: {
      padding: 0,
    },
  },
};

const darkSelectSx = {
  color: '#1c1c1e',
  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0,0,0,0.3)' },
  '& .MuiInput-underline:after': { borderBottomColor: '#1c1c1e' },
  '& .MuiSvgIcon-root': { color: 'rgba(0,0,0,0.5)' },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName?.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
    color: personName?.includes(name) ? 'white' : 'rgba(255,255,255,0.7)',
    backgroundColor: personName?.includes(name) ? 'rgba(255,255,255,0.1)' : 'transparent',
  };
}

interface MultiselectComponentProps {
  title: string;
  labels: string[];
  value: string[];
  setValue: React.Dispatch<React.SetStateAction<string[]>>;
}

export const MultiselectComponent = ({
  title,
  labels,
  value,
  setValue,
}: MultiselectComponentProps) => {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    const {
      target: { value },
    } = event;
    setValue(typeof value === "string" ? value.split(",") : value);
  };

  const handleDelete = (valToDelete: string) => {
    setValue(value.filter((v) => v !== valToDelete));
  };

  return (
    <Box sx={{ width: '100%', mt: 1, p: 0.5 }}>
      <FormControl fullWidth variant="outlined">
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={value}
          displayEmpty
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" placeholder={title} />}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <span style={{ color: 'rgba(0,0,0,0.5)' }}>{title}</span>;
            }
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 0.5 }}>
                {selected.map((val) => (
                  <Chip 
                    key={val} 
                    label={val} 
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation();
                      handleDelete(val);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    sx={{ 
                      bgcolor: 'rgba(10,132,255,0.15)', 
                      color: '#0a84ff', 
                      border: '1px solid rgba(10,132,255,0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px'
                    }} 
                  />
                ))}
              </Box>
            );
          }}
          fullWidth
          sx={darkSelectSx}
          MenuProps={MenuProps}
        >
          {labels.length > 0 && labels?.map((lb) => (
            <MenuItem 
              key={lb} 
              value={lb} 
              sx={{
                ...getStyles(lb, value, theme),
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              {lb}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
