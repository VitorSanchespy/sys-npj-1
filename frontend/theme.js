// src/theme.js
import { createTheme } from '@mantine/core';

export default createTheme({
  colors: {
    primaryColor: 'ufmt-green',
    primaryShade: 6,
    'ufmt-green': [
      '#e6f7f0',
      '#cceee1',
      '#99dcc3',
      '#66cba5',
      '#33b987',
      '#00a869',
      '#008654',
      '#00653f',
      '#00432a',
      '#002215'
    ],
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
  },
  defaultRadius: 'md',
});