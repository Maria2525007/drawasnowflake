import { Box } from '@mui/material';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onColorChange,
}) => {
  return (
    <Box sx={{ width: 200, padding: 2 }}>
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        style={{ width: '100%', height: 40 }}
      />
    </Box>
  );
};
