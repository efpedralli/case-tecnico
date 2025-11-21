import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { AppShell } from '../design-system/components/AppShell';

type Entry = {
  id: number;
  checkInAt: string;
  checkOutAt: string | null;
  environment: {
    name: string;
  };
};

export function StudentHistoryAdminPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [studentName, setStudentName] = useState<string>('');

  async function loadHistory() {
    if (!id) return;
    const { data } = await api.get<Entry[]>('/entries/history', {
      params: { studentId: id },
    });
    setEntries(data);

    try {
      const studentRes = await api.get(`/students/${id}`);
      setStudentName(studentRes.data.name);
    } catch {
      setStudentName('');
    }
  }

  useEffect(() => {
    loadHistory();
  }, [id]);

  return (
    <AppShell title="Histórico de Presenças do Aluno">
      <Box>
        {studentName && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aluno: {studentName}
          </Typography>
        )}

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
                Saída:{' '}
                {e.checkOutAt
                  ? new Date(e.checkOutAt).toLocaleString()
                  : '—'}
              </Typography>
            </Card>
          ))}

          {entries.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Este aluno ainda não possui presenças registradas.
            </Typography>
          )}
        </Stack>

        <Button
          sx={{ mt: 4 }}
          variant="contained"
          onClick={() => navigate('/students')}
        >
          Voltar para lista de alunos
        </Button>
      </Box>
    </AppShell>
  );
}
