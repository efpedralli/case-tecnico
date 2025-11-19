import type { ReactNode } from 'react';
import type { PaperProps } from '@mui/material/Paper';
import { Paper } from '@mui/material';

type Props = PaperProps & {
  children: ReactNode;
};

export function Card({ children, ...rest }: Props) {
  return (
    <Paper
      elevation={2}
      sx={{ p: 3, borderRadius: 3, border: '1px solid #1f2937' }}
      {...rest}
    >
      {children}
    </Paper>
  );
}
