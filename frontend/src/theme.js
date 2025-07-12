import { createTheme } from '@mantine/core';

// Cores UFMT + gold judiciário
export const theme = createTheme({
  fontFamily: 'Roboto, Segoe UI, Arial, sans-serif',
  headings: { fontFamily: 'Georgia, serif', fontWeight: 700 },
  primaryColor: 'ufmt-azul',
  colors: {
    'ufmt-azul': [
      '#e7f1f8', '#c2d5e5', '#a0bcd8', '#5a86b7', '#366499', '#14497c', '#003366', '#00274d', '#001a33', '#000819'
    ],
    'ufmt-dourado': [
      '#fffbe6', '#fff5bf', '#ffea7a', '#ffd700', '#e6be00', '#bfa400', '#998900', '#736f00', '#4d4400', '#332c00'
    ],
    'ufmt-verde': [
      '#e6f8f2', '#c2e7d8', '#a0d8c3', '#5ab98c', '#36a371', '#148c5d', '#007347', '#00593a', '#003f2a', '#002618'
    ],
    // secundárias
    'gray': [
      '#f7fafc', '#edf2f7', '#e2e8f0', '#cbd5e0', '#a0aec0', '#718096', '#4a5568', '#2d3748', '#1a202c', '#171923'
    ]
  },
  primaryShade: 6,
  defaultRadius: 10,
});
export default theme;