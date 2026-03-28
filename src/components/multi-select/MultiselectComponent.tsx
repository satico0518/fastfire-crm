import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
      backgroundColor: '#1c1c1e',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
};

const darkSelectSx = {
  color: 'white',
  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3)' },
  '& .MuiInput-underline:after': { borderBottomColor: 'white' },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
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

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <FormControl fullWidth variant="standard">
        <InputLabel 
          id="demo-multiple-chip-label"
          sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: 'white' } }}
        >
          {title}
        </InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          multiple
          value={value}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label={title} />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 0.5 }}>
              {selected.map((val) => (
                <Chip 
                  key={val} 
                  label={val} 
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px'
                  }} 
                />
              ))}
            </Box>
          )}
          fullWidth
          variant="standard"
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
