import { useEffect, useState } from 'react';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';
import {
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Button,
  TextField,
} from '@mui/material';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

type Occupancy = {
  environmentId: number;
  name: string;
  type: string;
  currentOccupancy: number;
  capacity?: number;
  block?: string | null;
};

export function DashboardPage() {
  const [data, setData] = useState<Occupancy[]>([]);
  const [sortField, setSortField] = useState<
    'name' | 'type' | 'currentOccupancy' | 'block'
  >('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [block, setBlock] = useState('');
  const [capacity, setCapacity] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  async function load() {
    const { data } = await api.get<Occupancy[]>('/entries/occupancy');
    setData(data);
  }

  useEffect(() => {
    load();
  }, []);

  const totalPresent = data.reduce((sum, d) => sum + d.currentOccupancy, 0);

  function toggleSort(field: 'name' | 'type' | 'currentOccupancy' | 'block') {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  const sorted = [...data].sort((a, b) => {
    const field = sortField;

    let v1: any = (a as any)[field];
    let v2: any = (b as any)[field];

    if (field === 'currentOccupancy') {
      return sortDirection === 'asc' ? v1 - v2 : v2 - v1;
    }

    v1 = v1?.toString().toLowerCase() ?? '';
    v2 = v2?.toString().toLowerCase() ?? '';

    if (v1 < v2) return sortDirection === 'asc' ? -1 : 1;
    if (v1 > v2) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !type.trim()) return;

    try {
      setCreating(true);
      await api.post('/environments', {
        name,
        type,
        block: block || null,
        capacity: capacity ? Number(capacity) : null,
      });

      setName('');
      setType('');
      setBlock('');
      setCapacity('');
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell title="Dashboard de ocupação">
      <Stack spacing={3}>
        {/* Cards de resumo */}
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
            Novo ambiente
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
                label="Tipo"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <TextField
                label="Bloco"
                size="small"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
              />
              <TextField
                label="Capacidade"
                size="small"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                sx={{ whiteSpace: 'nowrap' }}
                disabled={creating}
              >
                {creating ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </Stack>
          </Box>
        </Card>

        {/* Tabela de ocupação */}
        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ocupação por ambiente
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => toggleSort('name')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Sala{' '}
                  {sortField === 'name'
                    ? sortDirection === 'asc'
                      ? '▲'
                      : '▼'
                    : ''}
                </TableCell>

                <TableCell
                  onClick={() => toggleSort('type')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Tipo{' '}
                  {sortField === 'type'
                    ? sortDirection === 'asc'
                      ? '▲'
                      : '▼'
                    : ''}
                </TableCell>

                <TableCell
                  onClick={() => toggleSort('block')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Bloco{' '}
                  {sortField === 'block'
                    ? sortDirection === 'asc'
                      ? '▲'
                      : '▼'
                    : ''}
                </TableCell>

                <TableCell
                  onClick={() => toggleSort('currentOccupancy')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Ocupação{' '}
                  {sortField === 'currentOccupancy'
                    ? sortDirection === 'asc'
                      ? '▲'
                      : '▼'
                    : ''}
                </TableCell>

                <TableCell sx={{ fontWeight: 'bold' }}>Capacidade</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sorted.map((env) => (
                <TableRow
                  key={env.environmentId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`/environment/${env.environmentId}`)
                  }
                >
                  <TableCell>{env.name}</TableCell>
                  <TableCell>{env.type}</TableCell>
                  <TableCell>{env.block ?? '-'}</TableCell>
                  <TableCell>{env.currentOccupancy}</TableCell>
                  <TableCell>{env.capacity ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Stack>
    </AppShell>
  );
}
