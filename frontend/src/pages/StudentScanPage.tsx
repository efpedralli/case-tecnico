import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';
import { Box, Button, Stack, Typography } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import api from '../api/client';
import { CameraPreview } from '../utils/cameraPreview';

export function StudentScanPage() {
  const navigate = useNavigate();
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function processQR(text: string) {
    try {
      setError('');
      setLoading(true);
      setScannedText(text);

      let envId: string | null = null;

      const match = text.match(/envId\s*=\s*(\d+)/i);
      if (match) {
        envId = match[1];
      }

      if (!envId) {
        throw new Error('QR Code inválido. Não foi possível encontrar o envId.');
      }

      await api.post('/student/entries/checkin', {
        environmentId: Number(envId),
      });

      alert('Entrada registrada com sucesso!');
      navigate('/student-area');
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Erro ao registrar entrada. Verifique se você já não está em outra sala.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell disableContainer title="Ler QR Code da Sala">
      <Stack spacing={3}>
        <Button
          variant="contained"
          onClick={() => navigate('/student-area')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar para área do estudante
        </Button>

        <Card sx={{ p: 2, borderRadius: 3, minHeight: '70vh' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aponte a câmera para o QR Code da sala
          </Typography>

          <Box sx={{ 
            maxWidth: 450,
            mx: 'auto',
            overflow: 'hidden',
            height: '60vh',
            borderRadius: 2,
            backgroundColor: 'black',
          }}>
            <CameraPreview />

            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (error) {
                  return;
                }

                if (!!result && !loading) {
                  const text = result.getText();
                  processQR(text);
                }
              }}
              containerStyle={{ width: '100%', height: '100%' }}
              videoContainerStyle={{ width: '100%', height: '100%' }}
              videoStyle={{ width: '100%', height: '100%' }}
            />
          </Box>

          {scannedText && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              QR lido: {scannedText}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {loading && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Registrando entrada...
            </Typography>
          )}
        </Card>
      </Stack>
    </AppShell>
  );
}
