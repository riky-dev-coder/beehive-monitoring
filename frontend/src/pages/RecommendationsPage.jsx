import RecommendationList from '../components/Recommendations/RecommendationList';
import BeekeeperChat from '../components/Recommendations/BeekeeperChat';

const RecommendationsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-200">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">
          Recomendaciones IA
        </h2>
        <p className="text-gray-400">
          Sugerencias generadas automáticamente a partir de alertas detectadas en la colmena
        </p>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Alertas <span className="text-red-400 font-medium">críticas</span> · ventana de 2 min
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Alertas <span className="text-yellow-400 font-medium">preventivas</span> · ventana de 15 min
        </div>
      </div>

      {/* Two-column layout: Recommendations list + Chat */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 items-start">

        {/* Left: Recommendations list */}
        <div className="bg-[#0f1720] border border-gray-800 rounded-2xl shadow-sm min-w-0">
          <RecommendationList />
        </div>

        {/* Right: Beekeeper AI Chat */}
        <div className="bg-[#0f1720] border border-gray-800 rounded-2xl shadow-sm
                        xl:sticky xl:top-6 flex flex-col"
             style={{ height: 'calc(100vh - 12rem)', maxHeight: '680px', minHeight: '480px' }}>
          <BeekeeperChat />
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;