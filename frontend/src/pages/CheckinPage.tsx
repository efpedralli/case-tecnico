import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';

type Student = { id: number; name: string };
type Environment = { id: number; name: string };
type Occupancy = {
  environmentId: number;
  name: string;
  type: string;
  currentOccupancy: number;
};

export function CheckinPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');
  const [message, setMessage] = useState('');
  const [occupancy, setOccupancy] = useState<Occupancy[]>([]);

  async function loadData() {
    const [studentsRes, envRes, occRes] = await Promise.all([
      api.get<Student[]>('/students'),
      api.get<Environment[]>('/environments'),
      api.get<Occupancy[]>('/entries/occupancy'),
    ]);
    setStudents(studentsRes.data);
    setEnvironments(envRes.data);
    setOccupancy(occRes.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCheckin() {
    setMessage('');
    try {
      await api.post('/entries/checkin', {
        studentId: Number(selectedStudent),
        environmentId: Number(selectedEnv),
      });
      setMessage('Entrada registrada com sucesso.');
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Erro ao registrar entrada.');
    }
  }

  async function handleCheckout() {
    setMessage('');
    try {
      await api.post('/entries/checkout', {
        studentId: Number(selectedStudent),
      });
      setMessage('Saída registrada com sucesso.');
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Erro ao registrar saída.');
    }
  }

  return (
    <AppShell title="Registro de presenças">
      <Stack spacing={3}>
        <Card>
          <Stack spacing={2}>
            <Typography variant="h6">Nova presença</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Aluno"
                size="small"
                fullWidth
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Ambiente"
                size="small"
                fullWidth
                value={selectedEnv}
                onChange={(e) => setSelectedEnv(e.target.value)}
              >
                {environments.map((env) => (
                  <MenuItem key={env.id} value={env.id}>
                    {env.name}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!selectedStudent || !selectedEnv}
                  onClick={handleCheckin}
                >
                  Check-in
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!selectedStudent}
                  onClick={handleCheckout}
                >
                  Check-out
                </Button>
              </Stack>
            </Stack>

            {message && (
              <Typography variant="body2" color="secondary.main">
                {message}
              </Typography>
            )}
          </Stack>
        </Card>

        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ocupação atual por ambiente
          </Typography>
          {occupancy.map((item) => (
            <Box
              key={item.environmentId}
              display="flex"
              justifyContent="space-between"
              sx={{ py: 1, borderBottom: '1px solid #1f2937' }}
            >
              <Typography>{item.name}</Typography>
              <Typography color="secondary.main">
                {item.currentOccupancy} presentes
              </Typography>
            </Box>
          ))}
        </Card>
      </Stack>
    </AppShell>
  );
}
