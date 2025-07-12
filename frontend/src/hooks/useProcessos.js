import { useEffect, useState } from 'react';

export function useProcessos() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/processos') // ajuste a URL ao seu backend
      .then(res => res.json())
      .then(data => setProcessos(data))
      .finally(() => setLoading(false));
  }, []);

  return { processos, loading };
}