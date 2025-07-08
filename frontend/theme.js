// src/theme.js
import { createTheme } from '@mantine/core';

export default createTheme({
  primaryColor: 'ufmt-blue',
  colors: {
    'ufmt-blue': [
      '#e6f0ff',
      '#c1d8f0',
      '#9bc0e1',
      '#75a8d2',
      '#4f90c3',
      '#2978b4', // Cor principal
      '#206093',
      '#184872',
      '#103051',
      '#081830' // Azul escuro institucional
    ]
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
  },
  defaultRadius: 'md',
});