import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../design-system/components/AppShell';
import { Card } from '../design-system/components/Card';
import { Box, Button, Stack, Typography } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import api from '../api/client';

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

      // Nosso QR vem como "envId=6"
      let envId: string | null = null;

      // 1) tenta formato envId=6
      const match = text.match(/envId\s*=\s*(\d+)/i);
      if (match) {
        envId = match[1];
      }

      if (!envId) {
        throw new Error('QR Code inválido. Não foi possível encontrar o envId.');
      }

      // aqui podemos usar o fluxo simples: sempre CHECKIN
      // (checkout continua pelo botão "Registrar Saída" da StudentAreaPage)
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
    <AppShell title="Ler QR Code da Sala">
      <Stack spacing={3}>
        <Button
          variant="contained"
          onClick={() => navigate('/student-area')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar para área do estudante
        </Button>

        <Card>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aponte a câmera para o QR Code da sala
          </Typography>

          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (!!result && !loading) {
                  const text = result.getText();
                  processQR(text);
                }
              }}
              containerStyle={{ width: '100%' }}
              videoStyle={{ width: '100%' }}
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
