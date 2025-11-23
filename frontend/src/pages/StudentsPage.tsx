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
  TableContainer,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';
import { excelImport } from '../utils/excelImport';

import { useNavigate } from 'react-router-dom';

type Student = {
  id: number;
  name: string;
  registration?: string | null;
  email?: string | null;
  course?: string | null;
};

type StudentDTO = {
  name: string;
  registration?: string | null;
  email?: string | null;
  course?: string | null;
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'id' | 'name' | 'registration' | 'email' | 'course'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const navigate = useNavigate();

  async function loadStudents() {
    const { data } = await api.get<Student[]>('/students');
    setStudents(data);
  }

  useEffect(() => {
    loadStudents();
  }, []);

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

  const v1 = a[field];
  const v2 = b[field];

  if (typeof v1 === 'number' && typeof v2 === 'number') {
    return sortDirection === 'asc' ? v1 - v2 : v2 - v1;
  }

  const s1 = (v1 ?? '').toString().toLowerCase();
  const s2 = (v2 ?? '').toString().toLowerCase();

  if (s1 < s2) return sortDirection === 'asc' ? -1 : 1;
  if (s1 > s2) return sortDirection === 'asc' ? 1 : -1;
  return 0;
});

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/students', {
      name,
      registration: registration || null,
      email: email || null,
      course: course || null,
    });
    setName('');
    setRegistration('');
    setEmail('');
    setCourse('');
    await loadStudents();
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setImportError('');
    setImporting(true);

    const imported = await excelImport<StudentDTO>(file, {
      name: 'Nome',         
      registration: 'Matrícula', 
      email: 'E-mail',
      course: 'Curso',
    });

    await api.post('/students/bulk', {
      students: imported,
    });

    await loadStudents();
    e.target.value = '';

  } catch (err: any) {
    console.error(err);
    setImportError(
      err?.response?.data?.message ||
      'Erro ao importar planilha. Verifique o formato e os cabeçalhos.'
    );
  } finally {
    setImporting(false);
  }
}

function toggleSort(field: 'id' | 'name' | 'registration' | 'email' | 'course') {
  if (sortField === field) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
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
                label="Curso"
                size="small"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
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
          <Box mt={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                component="label"
                disabled={importing}
              >
                {importing ? 'Importando...' : 'Importar alunos via Excel'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                />
              </Button>
              {importError && (
                <Typography variant="body2" color="error">
                  {importError}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Esperado: colunas "Nome", "Matrícula" e "E-mail" na primeira aba da planilha.
            </Typography>
          </Box>
        </Card>

        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Lista de alunos
          </Typography>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Buscar por nome ou matrícula"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>


          <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => toggleSort('id')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ID {sortField === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableCell>

                <TableCell
                  onClick={() => toggleSort('name')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Nome {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableCell>
                <TableCell
                  onClick={() => toggleSort('course')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Curso {sortField === 'course' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
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

                <TableCell
                  onClick={() => toggleSort('email')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  E-mail {sortField === 'email' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedStudents.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/students/${s.id}/history`)}
                >
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.course || '-'}</TableCell>
                  <TableCell>{s.registration || '-'}</TableCell>
                  <TableCell>{s.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
        </Card>
      </Stack>
    </AppShell>
  );
}

