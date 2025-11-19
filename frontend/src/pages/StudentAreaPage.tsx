import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { getStudentFromToken } from '../utils/getStudentFromToken';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../design-system/components/AppShell';

type Environment = {
  id: number;
  name: string;
  type: string;
  capacity: number | null;
};

type Occupancy = {
  environmentId: number;
  name: string;
  type: string;
  currentOccupancy: number;
};

export function StudentAreaPage() {
  const navigate = useNavigate();
  const session = getStudentFromToken();

  const [envs, setEnvs] = useState<Environment[]>([]);
  const [occupancy, setOccupancy] = useState<Occupancy[]>([]);
  const [myStatus, setMyStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!session) {
    navigate('/login');
  }

  async function loadData() {
    const [envRes, occRes, myRes] = await Promise.all([
      api.get('/environments'),
      api.get('/entries/occupancy'),
      api.get(`/student/entries/status`)
    ]);

    setEnvs(envRes.data);
    setOccupancy(occRes.data);
    setMyStatus(myRes.data); // { inEnvironmentId: number | null }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCheckin(envId: number) {
    setLoading(true);
    try {
      await api.post(`/student/entries/checkin`, {
        environmentId: envId
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      await api.post(`/student/entries/checkout`);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getOccupancy(envId: number) {
    const o = occupancy.find((x) => x.environmentId === envId);
    return o ? o.currentOccupancy : 0;
  }

  return (
    <AppShell title="Área do Estudante">
    <Box
      minHeight="100vh"
      bgcolor="background.default"
      color="text.primary"
      p={4}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Bem-vindo(a) — Área do Estudante
      </Typography>

      {myStatus?.inEnvironmentId ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Você está presente em:{" "}
            <strong>
              {envs.find(e => e.id === myStatus.inEnvironmentId)?.name}
            </strong>
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCheckout}
            disabled={loading}
          >
            Registrar Saída
          </Button>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">
            Você não está presente em nenhum ambiente atualmente.
          </Typography>
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Ambientes Disponíveis
      </Typography>

      <Stack spacing={2}>
        {envs.map((env) => {
          const occ = getOccupancy(env.id);

          const isInside = myStatus?.inEnvironmentId === env.id;

          return (
            <Card
              key={env.id}
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 2
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {env.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {occ} pessoas / {env.capacity ?? '—'} vagas
                </Typography>
              </Box>

              {isInside ? (
                <Chip label="Você está aqui" color="secondary" />
              ) : (
                <Button
                  variant="contained"
                  disabled={loading || myStatus?.inEnvironmentId}
                  onClick={() => handleCheckin(env.id)}
                >
                  Entrar
                </Button>
              )}
            </Card>
          );
        })}
      </Stack>

      <Button
        sx={{ mt: 4 }}
        variant="outlined"
        onClick={() => navigate('/student-history')}
      >
        Ver meu histórico
      </Button>
    </Box>
    </AppShell>
  );
}
