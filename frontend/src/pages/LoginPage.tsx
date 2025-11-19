import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  MenuItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, studentLogin } = useAuthContext();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'admin' | 'student'>('admin');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'admin') {
      setIdentifier('');
      setPassword('');
    } else {
      setIdentifier('');
      setPassword('');
    }
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'admin') {
        await login(identifier, password);
        navigate('/dashboard');
      } else {
        await studentLogin(identifier, password);
        navigate('/student-area');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
    >
      <Paper sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Controle de Ocupação
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Escolha o tipo de acesso:
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          sx={{ mb: 3 }}
          label="Tipo de login"
          value={mode}
          onChange={(e) => setMode(e.target.value as 'admin' | 'student')}
        >
          <MenuItem value="admin">Administrador</MenuItem>
          <MenuItem value="student">Estudante</MenuItem>
        </TextField>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label={mode === 'admin' ? 'E-mail' : 'Matrícula'}
              type={mode === 'admin' ? 'email' : 'text'}
              size="small"
              fullWidth
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <TextField
              label="Senha"
              type="password"
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
