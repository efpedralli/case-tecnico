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
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type Props = {
  title?: string;
  children: ReactNode;
  disableContainer?: boolean;
};

export function AppShell({ title, children, disableContainer }: Props) {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (isAdmin) navigate('/dashboard');
    else if (isStudent) navigate('/student-area');
    else navigate('/login');
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default" color="text.primary">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ px: 4 }}>
          <MeetingRoomIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 600, cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            OcupaPUC
          </Typography>

          {/* MENU PARA ADMIN */}
          {isAdmin && (
            <>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/students')}>
                Alunos
              </Button>
              <Button color="inherit" onClick={() => navigate('/checkin')}>
                Presenças
              </Button>
            </>
          )}

          {/* MENU PARA ESTUDANTE */}
          {isStudent && (
            <>
              <Button color="inherit" onClick={() => navigate('/student-area')}>
                Minha Área
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/student-history')}
              >
                Histórico
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/student-update')}
              >
                Atualizar Dados
              </Button>
            </>
          )}

          {(isAdmin || isStudent) && (
            <IconButton color="inherit" onClick={handleLogout}>
              <Typography variant="body2">Sair</Typography>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {
        !disableContainer ? (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {title && (
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {children}
          </Container>
        ) : (
          <Box sx={{ p: 2 }}>
            {title && (
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {children}
          </Box>
        )
      }
    </Box>
  );
}
