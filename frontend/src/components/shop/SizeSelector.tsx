import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { ProductSize } from '../../types';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: ProductSize | null;
  onChange: (size: ProductSize | null) => void;
  required?: boolean;
}

export const SizeSelector = ({
  sizes,
  selectedSize,
  onChange,
  required = true,
}: SizeSelectorProps) => {
  if (sizes.length === 0) {
    return (
      <ToggleButtonGroup
        exclusive
        value={null}
        onChange={() => {}}
        aria-label="Məhsul ölçüsünü seçin"
        disabled
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '6px !important',
          },
        }}
      />
    );
  }

  return (
    <ToggleButtonGroup
      exclusive
      value={selectedSize}
      onChange={(_, size: ProductSize | null) => onChange(size)}
      aria-label="Məhsul ölçüsünü seçin"
      aria-required={required}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        '& .MuiToggleButtonGroup-grouped': {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '6px !important',
        },
        '& .MuiToggleButton-root.Mui-selected': {
          bgcolor: 'primary.dark',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.main' },
        },
      }}
    >
      {sizes.map((size) => (
        <ToggleButton key={size} value={size} aria-label={`Ölçü ${size}`}>
          {size}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
