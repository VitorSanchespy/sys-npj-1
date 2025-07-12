import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'ufmt-blue',
  colors: {
    'ufmt-blue': [
      '#e6f0ff',
      '#cce0ff',
      '#99c2ff',
      '#66a3ff',
      '#3385ff',
      '#0066CC', // cor principal
      '#0052a3',
      '#003d7a',
      '#002952',
      '#001429',
    ],
    'ufmt-green': [
      // ...tons de verde se necessário
    ],
  },
  fontFamily: 'Segoe UI, Roboto, sans-serif',
  components: {
    Button: {
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Card: {
      styles: {
        root: {
          border: '1px solid #e0e6ed',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
  },
});
export default theme;