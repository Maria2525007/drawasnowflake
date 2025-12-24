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

      if (
        endpoint.method === 'DELETE' &&
        endpoint.path === '/api/snowflakes' &&
        res.ok
      ) {
        setResponse(
          JSON.stringify(data, null, 2) +
            '\n\nВсе снежинки удалены из базы данных'
        );
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setResponse(
        `Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        padding: { xs: 3, sm: 4, md: 5 },
        backgroundColor: '#0a1929',
        color: 'white',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <IconButton
        color="inherit"
        aria-label="back to draw"
        onClick={() => navigate('/draw')}
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 16 },
          left: { xs: 8, sm: 16 },
          color: 'white',
          zIndex: 1,
        }}
      >
        <ArrowBack />
      </IconButton>
      <Typography
        variant="h3"
        sx={{
          marginBottom: { xs: 2, sm: 3, md: 4 },
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          paddingTop: { xs: 4, sm: 0 },
        }}
      >
        API Endpoints
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, sm: 4 },
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              marginBottom: 2,
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            }}
          >
            Доступные эндпоинты:
          </Typography>

          {endpoints.map((endpoint, index) => (
            <Paper
              key={index}
              sx={{
                padding: { xs: 1.5, sm: 2 },
                marginBottom: 2,
                backgroundColor: '#1a2332',
                color: 'white',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'start' },
                  marginBottom: 1,
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#81d4fa',
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.25rem' },
                    }}
                  >
                    {endpoint.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      color: '#b0bec5',
                      marginTop: 0.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-word',
                    }}
                  >
                    {endpoint.method} {endpoint.path}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      marginTop: 1,
                      color: '#cfd8dc',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    {endpoint.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => testEndpoint(endpoint)}
                  disabled={loading}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    minWidth: { xs: '60px', sm: 'auto' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    marginTop: { xs: 1, sm: 0 },
                    alignSelf: { xs: 'flex-start', sm: 'auto' },
                  }}
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
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
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

        <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              marginBottom: 2,
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            }}
          >
            Ответ сервера:
          </Typography>
          <Paper
            sx={{
              padding: { xs: 1.5, sm: 2 },
              backgroundColor: '#1a2332',
              color: 'white',
              minHeight: { xs: 200, sm: 300, md: 400 },
              maxHeight: { xs: '60vh', sm: '70vh', md: '80vh' },
              overflow: 'auto',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {response ||
                'Нажмите "Тест" на любом эндпоинте для просмотра ответа'}
            </pre>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
