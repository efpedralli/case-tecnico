import { useEffect, useState } from 'react';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';
import { Box, Typography, Stack, Chip } from '@mui/material';
import api from '../api/client';

type Occupancy = {
  environmentId: number;
  name: string;
  type: string;
  currentOccupancy: number;
  capacity?: number;
};

export function DashboardPage() {
  const [data, setData] = useState<Occupancy[]>([]);

  async function load() {
    const { data } = await api.get<Occupancy[]>('/entries/occupancy');
    setData(data);
  }

  useEffect(() => {
    load();
  }, []);

  const totalPresent = data.reduce((sum, d) => sum + d.currentOccupancy, 0);

  return (
    <AppShell title="Dashboard de ocupação">
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Card>
            <Typography variant="subtitle2" color="text.secondary">
              Presentes agora
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {totalPresent}
            </Typography>
          </Card>
          <Card>
            <Typography variant="subtitle2" color="text.secondary">
              Ambientes monitorados
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {data.length}
            </Typography>
          </Card>
        </Stack>

        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ocupação por ambiente
          </Typography>
          <Stack spacing={1}>
            {data.map((env) => (
              <Box
                key={env.environmentId}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography>{env.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {env.type}
                  </Typography>
                </Box>
                <Chip
                  label={`${env.currentOccupancy} / ${env.capacity ?? '?'}`}
                  color={env.currentOccupancy > 0 ? 'secondary' : 'default'}
                />
              </Box>
            ))}
          </Stack>
        </Card>
      </Stack>
    </AppShell>
  );
}
