const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : '/api';

export const fetchData = async () => {
  const response = await fetch(`${API_BASE_URL}/endpoint`);
  return await response.json();
};