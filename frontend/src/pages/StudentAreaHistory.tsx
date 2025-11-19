import {
  Box,
  Card,
  Stack,
  Typography,
  Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { getStudentFromToken } from '../utils/getStudentFromToken';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../design-system/components/AppShell';

export function StudentAreaHistory() {
  const navigate = useNavigate();
  const session = getStudentFromToken();

  const [entries, setEntries] = useState<any[]>([]);

  if (!session) {
    navigate('/login');
  }

  async function loadHistory() {
    const { data } = await api.get('/student/entries/history');
    setEntries(data);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <AppShell title="Meu Histórico de Presenças">
    <Box
      minHeight="100vh"
      bgcolor="background.default"
      color="text.primary"
      p={4}
    >

      <Stack spacing={2}>
        {entries.map((e) => (
          <Card key={e.id} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {e.environment.name}
            </Typography>
            <Typography variant="body2">
              Entrada: {new Date(e.checkInAt).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Saída: {e.checkOutAt ? new Date(e.checkOutAt).toLocaleString() : '—'}
            </Typography>
          </Card>
        ))}
      </Stack>

      <Button
        sx={{ mt: 4 }}
        variant="outlined"
        onClick={() => navigate('/student-area')}
      >
        Voltar
      </Button>
    </Box>
    </AppShell>
  );
}
