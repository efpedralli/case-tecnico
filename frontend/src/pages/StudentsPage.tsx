import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';

type Student = {
  id: number;
  name: string;
  registration?: string | null;
  email?: string | null;
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');
  const [email, setEmail] = useState('');

  async function loadStudents() {
    const { data } = await api.get<Student[]>('/students');
    setStudents(data);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/students', {
      name,
      registration: registration || null,
      email: email || null,
    });
    setName('');
    setRegistration('');
    setEmail('');
    await loadStudents();
  }

  return (
    <AppShell title="Alunos">
      <Stack spacing={3}>
        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Novo aluno
          </Typography>
          <Box component="form" onSubmit={handleCreate}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nome"
                size="small"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Matrícula"
                size="small"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
              />
              <TextField
                label="E-mail"
                type="email"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Adicionar
              </Button>
            </Stack>
          </Box>
        </Card>

        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Lista de alunos
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Matrícula</TableCell>
                <TableCell>E-mail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.registration || '-'}</TableCell>
                  <TableCell>{s.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Stack>
    </AppShell>
  );
}

