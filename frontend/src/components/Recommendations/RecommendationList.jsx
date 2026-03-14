import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import RecommendationCard from './RecommendationCard';

const FILTERS = [
  { label: 'Todas',     value: null },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Aceptadas', value: 'aceptada' },
  { label: 'Rechazadas', value: 'rechazada' },
];

const RecommendationList = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter]                   = useState(null);
  const [loading, setLoading]                 = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      const params = filter ? { estado: filter } : {};
      const { data } = await api.get('/recommendations', { params });
      setRecommendations(data);
    } catch (err) {
      console.error('Error al obtener recomendaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 30000);
    return () => clearInterval(interval);
  }, [fetchRecommendations]);

  const handleUpdated = (updated) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
  };

  const pendingCount = recommendations.filter((r) => r.estado === 'pendiente').length;

  return (
    <div>
      {/* Barra de filtros */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {f.label}
            {f.value === 'pendiente' && pendingCount > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}

        {/* Refresh manual */}
        <button
          onClick={fetchRecommendations}
          className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          title="Actualizar"
        >
          <svg xmlns="https://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
            Cargando recomendaciones…
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
              🐝
            </div>
            <p className="text-gray-500 text-sm">
              {filter
                ? `No hay recomendaciones ${filter === 'pendiente' ? 'pendientes' : filter === 'aceptada' ? 'aceptadas' : 'rechazadas'}`
                : 'Aún no se han generado recomendaciones'}
            </p>
            {!filter && (
              <p className="text-gray-600 text-xs max-w-xs">
                Se generarán automáticamente cuando se detecten alertas críticas durante 2 min
                o preventivas durante 15 min.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onUpdated={handleUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationList;