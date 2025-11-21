import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';
import { 
  Box, 
  Typography, 
  Stack, 
  Button, 
  TextField, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Checkbox 
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import  ApexOptions  from 'apexcharts';
import { buildEnvironmentOccupancySeries } from '../utils/buildEnvironmentOccupancySeries';
import { theme } from '../design-system/theme';

type Environment = {
  id: number;
  name: string;
  type: string;
  block?: string | null;
  capacity?: number | null;
};

type Entry = {
  id: number;
  studentId: number;
  checkInAt: string;
  checkOutAt: string | null;
  student?: {
    name: string;
    registration?: string | null;
  };
};

type Student = {
  id: number;
  name: string;
  registration?: string | null;
};


export function EnvironmentManagementPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [env, setEnv] = useState<Environment | null>(null);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrSrc, setQrSrc] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [sortField, setSortField] = useState<'name' | 'registration'>('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
const [presenceLoading, setPresenceLoading] = useState(false);



    async function loadData() {
  if (!id) return;

  setLoading(true);
  try {
    const envRes = await api.get<Environment>(`/environments/${id}`);
    setEnv(envRes.data);

    const histRes = await api.get<Entry[]>(`/entries/history`, {
      params: { environmentId: id },
    });
    setEntries(histRes.data);

    const studentsRes = await api.get<Student[]>('/students');
    setStudents(studentsRes.data);

    const qrRes = await api.get<ArrayBuffer>(`/environments/${id}/qrcode`, {
      responseType: 'arraybuffer',
    });
    const base64 = btoa(
      Array.from(new Uint8Array(qrRes.data as any))
        .map((b) => String.fromCharCode(b))
        .join('')
    );
    setQrSrc(`data:image/png;base64,${base64}`);
  } finally {
    setLoading(false);
  }
}


    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const seriesData = buildEnvironmentOccupancySeries(entries);

    const currentOccupancy = entries.filter((e) => !e.checkOutAt).length;

const presentStudentIds = new Set(
  entries.filter((e) => !e.checkOutAt).map((e) => e.studentId)
);

const filteredStudents = students.filter((s) => {
  if (!searchTerm.trim()) return true;
  const term = searchTerm.toLowerCase();
  return (
    s.name.toLowerCase().includes(term) ||
    (s.registration ?? '').toLowerCase().includes(term)
  );
});

const sortedStudents = [...filteredStudents].sort((a, b) => {
  const field = sortField;
  const v1 = (a[field] ?? '').toString().toLowerCase();
  const v2 = (b[field] ?? '').toString().toLowerCase();

  if (v1 < v2) return sortDirection === 'asc' ? -1 : 1;
  if (v1 > v2) return sortDirection === 'asc' ? 1 : -1;
  return 0;
});

function toggleSort(field: 'name' | 'registration') {
  if (sortField === field) {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
}


    const now = new Date();
    const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    7, 0, 0, 0
    ).getTime();


  const chartSeries = [
    {
      name: 'Ocupação',
      data: seriesData,
    },
  ];

  async function handleTogglePresence(studentId: number, isPresent: boolean) {
  if (!id) return;

  try {
    setPresenceLoading(true);

    if (isPresent) {
      // checkout
      await api.post('/entries/checkout', { studentId });
    } else {
      // checkin nesta sala
      await api.post('/entries/checkin', {
        studentId,
        environmentId: Number(id),
      });
    }

    await loadData();
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        'Erro ao atualizar presença deste aluno.'
    );
  } finally {
    setPresenceLoading(false);
  }
}



  return (
    <AppShell title="Gestão da Sala">
      <Stack spacing={3}>
        <Button
          variant="contained"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => navigate('/dashboard')}
        >
          Voltar para o dashboard
        </Button>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card 
          sx={{ width: '70%'}}
          >
          {env ? (
            <>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {env.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tipo: {env.type} | Bloco: {env.block ?? '-'} | Capacidade:{' '}
                {env.capacity ?? '-'} | Ocupação: {currentOccupancy}
              </Typography>
            </Box>
            <Box mt={2} sx={{
              height: 300,
              overflowY: 'scroll',
            }}>

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Lista de alunos para presença
                </Typography>

              <TextField
                label="Pesquisar por nome ou matrícula"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      onClick={() => toggleSort('name')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Nome{' '}
                      {sortField === 'name'
                        ? sortDirection === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </TableCell>
                    <TableCell
                      onClick={() => toggleSort('registration')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Matrícula{' '}
                      {sortField === 'registration'
                        ? sortDirection === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Presente</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedStudents.map((s) => {
                    const isPresent = presentStudentIds.has(s.id);
                    return (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.registration || '-'}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={isPresent}
                            disabled={presenceLoading}
                            onChange={() =>
                              handleTogglePresence(s.id, isPresent)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            </>
          ) : (
            <Typography>Carregando dados da sala...</Typography>
          )}
        </Card>

        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            QR Code da sala
          </Typography>

          {env ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              {qrSrc ? (
                <Box
                  component="img"
                  sx={{ width: 240, height: 240, mb: 2 }}
                  src={qrSrc}
                  alt={`QR Code - ${env.name}`}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Carregando QR Code...
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" align="center">
                Peça para o estudante abrir o app, acessar a área de leitura de QR Code <br />
                e apontar a câmera para este código para registrar entrada ou saída.
              </Typography>
            </Box>
          ) : (
            <Typography>Carregando QR Code...</Typography>
          )}
        </Card>
      </Stack>
        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ocupação ao longo do tempo
          </Typography>

          {loading ? (
            <Typography>Carregando...</Typography>
          ) : seriesData.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Não há presenças registradas para esta sala.
            </Typography>
          ) : (
            <ReactApexChart
              options={{
                chart: {
                  id: 'environment-occupancy',
                  zoom: { enabled: true },
                  toolbar: { show: true },
                  foreColor: '#FFFFFF',
                },
                xaxis: {
                  type: 'datetime',
                  min: startOfDay,
                  title: {
                    text: 'Tempo',
                    style: {
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                    }
                  },
                  labels: {
                    style: {
                      colors: '#CCCCCC',
                    },
                  },
                },
                yaxis: {
                  min: 0,
                  forceNiceScale: true,
                  title: {
                    text: 'Quantidade de alunos',
                    style: {
                      color: theme.palette.grey[500],
                      fontSize: '14px',
                      fontWeight: 600,
                    }
                  },
                  labels: {
                    style: {
                      colors: theme.palette.grey[500],
                    },
                    formatter: (val: number) => Math.round(val).toString(),
                  },
                },
                stroke: {
                  curve: 'straight',
                  width: 3,
                  colors: [theme.palette.secondary.main], 
                },
                grid: {
                  borderColor: theme.palette.grey[800],
                  xaxis: {
                    lines: { show: true },
                  },
                  yaxis: {
                    lines: { show: true },
                  },
                },
                tooltip: {
                  theme: 'dark',
                  x: { format: 'dd/MM/yyyy HH:mm' },
                },
                dataLabels: { enabled: false },                
              }}
            
              series={chartSeries}
              type="line"
              height={350}
            />
          )}
        </Card>
      </Stack>
    </AppShell>
  );
}
