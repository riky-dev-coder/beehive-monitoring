import AlertList from '../components/Alerts/AlertList';

const AlertsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-200">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">
          Centro de Alertas
        </h2>
        <p className="text-gray-400">
          Monitoreo en tiempo real de eventos críticos en la colmena
        </p>
      </div>

      {/* Card principal */}
      <div className="bg-[#0f1720] border border-gray-800 rounded-2xl shadow-sm">
        <AlertList />
      </div>

    </div>
  );
};

export default AlertsPage;