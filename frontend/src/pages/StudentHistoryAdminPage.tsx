import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
    id: number;
    name: string;
  };
};

type Environment = {
  id: number;
  name: string;
  type: string;
};


export function StudentHistoryAdminPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const [envs, setEnvs] = useState<Environment[]>([]);
const [selectedEnvId, setSelectedEnvId] = useState<number | ''>('');
const [presenceLoading, setPresenceLoading] = useState(false);



  async function loadHistory() {
    if (!id) return;
    const { data } = await api.get<Entry[]>('/entries/history', {
      params: { studentId: id },
    });
    setEntries(data);
    

    try {
  const studentRes = await api.get(`/students/${id}`);
  setStudentName(studentRes.data.name);
  setStudentData(studentRes.data);

  const envRes = await api.get<Environment[]>('/environments');
  setEnvs(envRes.data);
} catch {
  setStudentName('');
}

  }

  useEffect(() => {
    loadHistory();
  }, [id]);

  async function handleUpdate() {
  if (!id) return;

  try {
    await api.put(`/students/${id}`, {
      name: studentName,
      registration: studentData.registration,
      email: studentData.email,
      course: studentData.course,
    });

    alert('Dados atualizados com sucesso!');
  } catch (err) {
    console.error(err);
    alert('Erro ao atualizar aluno.');
  }
}

async function handleSoftDelete() {
  if (!id) return;

  if (!confirm('Tem certeza que deseja arquivar este aluno?')) return;

  try {
    await api.delete(`/students/${id}`);
    alert('Aluno arquivado com sucesso!');
    navigate('/students');
  } catch (err) {
    console.error(err);
    alert('Erro ao arquivar aluno.');
  }
}

const currentOpenEntry = entries.find((e) => e.checkOutAt === null);
const currentEnvId = currentOpenEntry?.environment?.id;
const currentEnvName = currentOpenEntry?.environment?.name;

async function handleAdminCheckin() {
  if (!id || !selectedEnvId) {
    alert('Selecione uma sala para registrar a entrada.');
    return;
  }

  try {
    setPresenceLoading(true);
    await api.post('/entries/checkin', {
      studentId: Number(id),
      environmentId: selectedEnvId,
    });
    await loadHistory();
    alert('Entrada registrada com sucesso!');
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        'Erro ao registrar entrada. Verifique se o aluno já não está em outra sala.'
    );
  } finally {
    setPresenceLoading(false);
  }
}

async function handleAdminCheckout() {
  if (!id) return;

  try {
    setPresenceLoading(true);
    await api.post('/entries/checkout', {
      studentId: Number(id),
    });
    await loadHistory();
    alert('Saída registrada com sucesso!');
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        'Erro ao registrar saída. Verifique se o aluno possui presença em aberto.'
    );
  } finally {
    setPresenceLoading(false);
  }
}


    return (
  <AppShell title="Histórico e Dados do Aluno">
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      
      <Box flex={2}>
  

  <Card sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle1" sx={{ mb: 2 }}>
      Histórico de presenças de {studentName}

    </Typography>

    {entries.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        Este aluno ainda não possui presenças registradas.
      </Typography>
    ) : (
        <Box sx={{ 
            maxHeight: 400,
            overflowY: "scroll" 
            }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Ambiente</strong></TableCell>
            <TableCell><strong>Entrada</strong></TableCell>
            <TableCell><strong>Saída</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.environment.name}</TableCell>
              <TableCell>
                {new Date(e.checkInAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {e.checkOutAt
                  ? new Date(e.checkOutAt).toLocaleString()
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Box>
    )}
  </Card>

  <Button
    sx={{ mt: 4 }}
    variant="contained"
    onClick={() => navigate('/students')}
  >
    Voltar para lista de alunos
  </Button>
</Box>


      <Box flex={1}>
        <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Presença manual
            </Typography>

            {currentEnvId ? (
            <Typography variant="body2" sx={{ mb: 1 }}>
                Atualmente em: <strong>{currentEnvName}</strong>
            </Typography>
            ) : (
            <Typography variant="body2" sx={{ mb: 1 }}>
                Este aluno não está presente em nenhuma sala no momento.
            </Typography>
            )}

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="env-select-label">Sala</InputLabel>
            <Select
                labelId="env-select-label"
                label="Sala"
                value={selectedEnvId}
                onChange={(e) =>
                setSelectedEnvId(e.target.value ? Number(e.target.value) : '')
                }
            >
                {envs.map((env) => (
                <MenuItem key={env.id} value={env.id}>
                    {env.name}
                </MenuItem>
                ))}
            </Select>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 3 }}>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleAdminCheckin}
                disabled={presenceLoading || !selectedEnvId}
            >
                Registrar entrada
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                onClick={handleAdminCheckout}
                disabled={presenceLoading || !currentEnvId}
            >
                Registrar saída
            </Button>
            </Stack>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Dados do Aluno
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />

            <TextField
              label="Matrícula"
              value={studentData?.registration || ''}
              onChange={(e) =>
                setStudentData((prev) => ({
                  ...prev,
                  registration: e.target.value,
                }))
              }
            />

            <TextField
              label="Curso"
              value={studentData?.course || ''}
              onChange={(e) =>
                setStudentData((prev) => ({
                  ...prev,
                  course: e.target.value,
                }))
              }
            />

            <TextField
              label="E-mail"
              value={studentData?.email || ''}
              onChange={(e) =>
                setStudentData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />

            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdate}
            >
              Salvar alterações
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleSoftDelete}
            >
              Arquivar aluno
            </Button>
          </Stack>
        </Card>
      </Box>
    </Stack>
  </AppShell>
);

}
