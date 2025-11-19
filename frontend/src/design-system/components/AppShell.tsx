import type { ReactNode } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Button,
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Props = {
  title?: string;
  children: ReactNode;
};

export function AppShell({ title, children }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default" color="text.primary">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ px: 4 }}>
          <MeetingRoomIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            OcupaPUC
          </Typography>

          <Button color="inherit" onClick={() => navigate('/students')}>
            Alunos
          </Button>
          <Button color="inherit" onClick={() => navigate('/checkin')}>
            Presenças
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>

          <IconButton color="inherit" onClick={handleLogout}>
            <Typography variant="body2">Sair</Typography>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {title && (
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
}
