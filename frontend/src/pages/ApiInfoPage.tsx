import { Box, Typography, Paper, Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl();

interface EndpointInfo {
  name: string;
  method: string;
  path: string;
  description: string;
  example?: string;
}

const endpoints: EndpointInfo[] = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api/health',
    description: 'Проверка работоспособности сервера',
    example: `${API_URL}/health`,
  },
  {
    name: 'Database Health',
    method: 'GET',
    path: '/api/health/db',
    description: 'Проверка состояния базы данных',
    example: `${API_URL}/health/db`,
  },
  {
    name: 'Delete All Snowflakes',
    method: 'DELETE',
    path: '/api/snowflakes',
    description: 'Удалить все снежинки из базы данных (очистка БД)',
    example: `${API_URL}/snowflakes`,
  },
  {
    name: 'Get DAU Stats',
    method: 'GET',
    path: '/api/metrics/dau',
    description: 'Получить статистику Daily Active Users',
    example: `${API_URL}/metrics/dau`,
  },
  {
    name: 'Get DAU for Date',
    method: 'GET',
    path: '/api/metrics/dau/:date',
    description: 'Получить DAU за конкретную дату (YYYY-MM-DD)',
    example: `${API_URL}/metrics/dau/2024-12-23`,
  },
  {
    name: 'Check 1M DAU Milestone',
    method: 'GET',
    path: '/api/metrics/dau/milestone',
    description: 'Проверить достижение цели 1M DAU',
    example: `${API_URL}/metrics/dau/milestone`,
  },
];

export const ApiInfoPage: React.FC = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const testEndpoint = async (endpoint: EndpointInfo) => {
    setLoading(true);
    setResponse('Загрузка...');
    try {
      const url = endpoint.example || `${API_URL}${endpoint.path}`;
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const res = await fetch(url, options);
      const data = await res.json();
      
      if (endpoint.method === 'DELETE' && endpoint.path === '/api/snowflakes' && res.ok) {
        setResponse(JSON.stringify(data, null, 2) + '\n\n⚠️ ВНИМАНИЕ: Все снежинки удалены из базы данных!');
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setResponse(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        padding: 4,
        backgroundColor: '#0a1929',
        color: 'white',
        position: 'relative',
      }}
    >
      <IconButton
        color="inherit"
        aria-label="back to draw"
        onClick={() => navigate('/draw')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'white',
        }}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="h3" sx={{ marginBottom: 4, textAlign: 'center' }}>
        API Endpoints
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Доступные эндпоинты:
          </Typography>

          {endpoints.map((endpoint, index) => (
            <Paper
              key={index}
              sx={{
                padding: 2,
                marginBottom: 2,
                backgroundColor: '#1a2332',
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#81d4fa' }}>
                    {endpoint.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      color: '#b0bec5',
                      marginTop: 0.5,
                    }}
                  >
                    {endpoint.method} {endpoint.path}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: 1, color: '#cfd8dc' }}>
                    {endpoint.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => testEndpoint(endpoint)}
                  disabled={loading}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Тест
                </Button>
              </Box>
              {endpoint.example && (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: '#90caf9',
                    fontSize: '0.7rem',
                    display: 'block',
                    marginTop: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  {endpoint.example}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>

        <Box sx={{ flex: 1, minWidth: 400 }}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Ответ сервера:
          </Typography>
          <Paper
            sx={{
              padding: 2,
              backgroundColor: '#1a2332',
              color: 'white',
              minHeight: 400,
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {response || 'Нажмите "Тест" на любом эндпоинте для просмотра ответа'}
            </pre>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
