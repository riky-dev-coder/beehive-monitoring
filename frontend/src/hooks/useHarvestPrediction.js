// hooks/useHarvestPrediction.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useHarvestPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    try {
      const response = await api.get('/sensors/harvest-readiness');
      setPrediction(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    // Podríamos actualizar cada cierto tiempo, pero por ahora solo una vez
  }, []);

  return { prediction, loading, error, refetch: fetchPrediction };
};