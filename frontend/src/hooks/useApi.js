import { useState } from "react";

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro na requisição");
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
}