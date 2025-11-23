import { useEffect, useState } from "react";
import { getStudentFromToken } from "../utils/getStudentFromToken";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../design-system/components/AppShell";
import { 
    Stack, 
    Button,
    Box,
    Card,
    Typography,
    TextField
} from "@mui/material";

interface StudentData {
  name: string;
  registration: string;
  course: string;
  email: string;
}

export default function StudentUpdatePage() {
    const navigate = useNavigate();
    const session = getStudentFromToken();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    async function loadData() {
     try {
        const studentRes = await api.get(`/students/${session?.studentId}`);
        setStudentData(studentRes.data);
      } catch {
        setStudentData(null);
      }
    }
    useEffect(() => {
        loadData();
    }, []);

    async function handleUpdate() {
        if (!studentData) return;

        if (password || confirmPassword) {
        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        }

        try {
        setLoading(true);

        const payload: any = {
            name: studentData.name,
            registration: studentData.registration,
            course: studentData.course,
            email: studentData.email,
        };

        if (password) {
            payload.password = password;
        }

        await api.put(`/students/${session?.studentId}`, payload);

        alert('Dados atualizados com sucesso!');
        setPassword('');
        setConfirmPassword('');
        } catch (err) {
        console.error(err);
        alert('Erro ao atualizar seus dados.');
        } finally {
        setLoading(false);
        }
    }

    return (
    <AppShell title="Meus dados">
      <Stack spacing={3}>
        <Button
          variant="contained"
          onClick={() => navigate('/student-area')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar para área do estudante
        </Button>

        <Box>
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Atualizar informações pessoais
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nome"
                value={studentData?.name}
                onChange={(e) =>
                  setStudentData((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
                fullWidth
              />

              <TextField
                label="Matrícula"
                value={studentData?.registration}
                onChange={(e) =>
                  setStudentData((prev) =>
                    prev ? { ...prev, registration: e.target.value } : prev
                  )
                }
                fullWidth
              />

              <TextField
                label="Curso"
                value={studentData?.course}
                onChange={(e) =>
                  setStudentData((prev) =>
                    prev ? { ...prev, course: e.target.value } : prev
                  )
                }
                fullWidth
              />

              <TextField
                label="E-mail"
                type="email"
                value={studentData?.email}
                onChange={(e) =>
                  setStudentData((prev) =>
                    prev ? { ...prev, email: e.target.value } : prev
                  )
                }
                fullWidth
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Alterar senha (opcional)
              </Typography>

              <TextField
                label="Nova senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />

              <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </Stack>
          </Card>
        </Box>
      </Stack>
    </AppShell>
  );
}

