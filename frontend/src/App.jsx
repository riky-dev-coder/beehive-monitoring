import { useState } from 'react';
import Tabs from './components/Layout/Tabs';
import LiveClock from './components/Layout/LiveClock';
import RealTimePage from './pages/RealTimePage';
import HistoricalPage from './pages/HistoricalPage';
import AlertsPage from './pages/AlertsPage';
import RecommendationsPage from './pages/RecommendationsPage';

// pestañas
const tabs = [
  { id: 'real-time', label: 'Tiempo Real' },
  { id: 'historical', label: 'Histórico' },
  { id: 'alerts', label: 'Alertas' },
  { id: 'recommendations', label: 'Recomendaciones IA' },
];

function App() {
  const [activeTab, setActiveTab] = useState('real-time');

  const renderPage = () => {
    switch (activeTab) {
      case 'real-time': return <RealTimePage />;
      case 'historical': return <HistoricalPage />;
      case 'alerts': return <AlertsPage />;
      case 'recommendations': return <RecommendationsPage />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#071014] text-gray-200 flex flex-col">
      <header className="bg-[#0b1316] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-400 text-black font-bold">Monitor de Colmenas</div>
                <span className="text-xs bg-[#06221a] text-emerald-300 px-2 py-1 rounded">v1.1</span>
              </div>
              <div className="hidden sm:flex flex-col text-xs text-gray-400">
                <span className="font-medium text-gray-200">Sistema Inteligente</span>
                <span>Panel de monitoreo — Estado general</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 5. Reemplazamos el texto estático por la variable dinámica */}
              <div className="text-sm font-mono text-emerald-500/80 hidden md:block">
                <LiveClock />
              </div>
              <button className="px-3 py-2 bg-[#0f1b1a] border border-gray-800 rounded-lg text-sm text-gray-300 hover:border-emerald-600 transition-colors">
                Conectar
              </button>
            </div>
          </div>

          <div className="py-3">
            <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>

      <footer className="bg-[#071014] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Beehive Monitor - Sistema inteligente de monitoreo apícola</p>
        </div>
      </footer>
    </div>
  );
}

export default App;