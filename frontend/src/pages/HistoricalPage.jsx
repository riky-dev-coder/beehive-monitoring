import { useState } from 'react'; 
import HistoricalChart from '../components/Charts/HistoricalChart';
import Card from '../components/Layout/Card';

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-100 mb-4">
    {children}
  </h2>
);

// ✅ Componente reutilizable para el selector
const TimeRangeSelector = ({ value, onChange }) => {
  const options = [
    { label: '1H', value: '1h' },
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
    { label: 'Todo', value: 'all' },
  ];

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === opt.value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const HistoricalPage = () => {
  // ✅ Estado para el rango de tiempo (se comparte entre todos los gráficos)
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="space-y-10">
      
      {/* ✅ Selector global de tiempo */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Histórico de Datos</h1>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* ================= EXTERIOR ================= */}
      <div>
        <SectionTitle>Exterior</SectionTitle>
        <Card>
          <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
            <HistoricalChart
              sensors={['temp_exterior', 'humedad_exterior']}
              title="Temperatura y Humedad Exterior"
              showOptimal={false}
              timeRange={timeRange} // ✅ Pasar prop
            />
          </div>
        </Card>
      </div>

      {/* ================= CAMARA DE CRIA ================= */}
      <div>
        <SectionTitle>Cámara de Cría</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
              <HistoricalChart
                sensors={['temp_cria','temp_exterior']}
                title="Temperatura Cámara de Cría"
                optimalRange={{ min: 34, max: 36, unit: '°C' }}
                timeRange={timeRange} // ✅ Pasar prop
              />
            </div>
          </Card>
          <Card>
            <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
              <HistoricalChart
                sensors={['humedad_cria', 'humedad_exterior']}
                title="Humedad Cámara de Cría"
                optimalRange={{ min: 55, max: 75, unit: '%' }}
                timeRange={timeRange} // ✅ Pasar prop
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ================= CAMARA MIELERA ================= */}
      <div>
        <SectionTitle>Cámara Mielera</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
              <HistoricalChart
                sensors={['temp_mielera']}
                title="Temperatura Cámara Mielera"
                optimalRange={{ min: 34, max: 36, unit: '°C' }}
                timeRange={timeRange} // ✅ Pasar prop
              />
            </div>
          </Card>
          <Card>
            <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
              <HistoricalChart
                sensors={['humedad_mielera']}
                title="Humedad Cámara Mielera"
                optimalRange={{ min: 55, max: 75, unit: '%' }}
                timeRange={timeRange} // ✅ Pasar prop
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ================= PESOS ================= */}
      <div>
        <SectionTitle>Pesos</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
              <HistoricalChart
                sensors={['peso_total']}
                title="Peso Total de la Colmena"
                showOptimal={false}
                timeRange={timeRange} // ✅ Pasar prop
              />
            </div>
          </Card>
          <Card>
            <div className="bg-[#071015] border border-gray-800 rounded-xl p-4">
              <HistoricalChart
                sensors={['peso_mielera']}
                title="Peso Cámara Mielera"
                showOptimal={false}
                timeRange={timeRange} // ✅ Pasar prop
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HistoricalPage;