// pages/RealTimePage.jsx
import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useHarvestPrediction } from '../hooks/useHarvestPrediction';
import SensorCards from '../components/RealTime/SensorCards';

const RealTimePage = () => {
  const { data: sensorData, loading: sensorsLoading } = useSensorData();
  const { prediction, loading: predLoading } = useHarvestPrediction();

  // Organizar sensores por tipo
  const sensors = {};
  sensorData.forEach(item => {
    sensors[item.sensor_type] = item;
  });

  if (sensorsLoading) {
    return <div className="text-center py-8">Cargando sensores...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta principal tipo "Water Tank 01" */}
      <div className="bg-[#0f1720] border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Colmena Principal</h2>
            <p className="text-sm text-gray-400">Cámara de cría + cámara mielera</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-right">
              <span className="text-4xl font-bold text-emerald-400">
                {sensors.peso_total?.value?.toFixed(1) || '--'}
              </span>
              <span className="text-sm text-gray-400 ml-1">kg total</span>
            </div>
            <div className="border-l border-gray-700 pl-4">
              <div className="text-sm text-gray-300">Temp. exterior: {sensors.temp_exterior?.value?.toFixed(1)}°C</div>
              <div className="text-sm text-gray-300">Humedad: {sensors.humedad_exterior?.value?.toFixed(0)}%</div>
            </div>
          </div>
        </div>
        {/* Ubicación simulada */}
        <div className="flex items-center mt-2 text-gray-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">Aplao - Arequipa, Apiario Central</span>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Tarjetas de sensores */}
      <SensorCards sensors={sensors} />

      {/* Sección de predicción de cosecha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarjeta de predicción de cosecha */}
        <div className="bg-[#0f1720] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Predicción de cosecha</h3>
          {predLoading ? (
            <div className="text-gray-400">Calculando...</div>
          ) : prediction ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Peso actual de la cámara mielera:</span>
                <span className="text-xl font-bold text-emerald-400">{prediction.current_weight?.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Umbral de cosecha:</span>
                <span className="text-gray-200">{prediction.min_harvest_weight} kg</span>
              </div>
              {prediction.ready ? (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-center">
                  <span className="text-green-400 font-medium">¡Lista para cosechar!</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Días estimados:</span>
                    <span className="text-gray-200">
                      {prediction.estimated_days_to_harvest !== null ? (
                        <>{prediction.estimated_days_to_harvest} días</>
                      ) : (
                        <span className="text-gray-500">No disponible</span>
                      )}
                    </span>
                  </div>
                  {prediction.estimated_harvest_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha estimada:</span>
                      <span className="text-gray-200">{new Date(prediction.estimated_harvest_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No hay datos suficientes para predecir</div>
          )}
        </div>

        {/* Otra tarjeta para información adicional (opcional) */}
        <div className="bg-[#0f1720] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Resumen de la colmena</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Peso de la cámara de cría:</span>
              <span className="text-gray-200">
                {sensors.peso_total && sensors.peso_mielera
                  ? (sensors.peso_total.value - sensors.peso_mielera.value).toFixed(1)
                  : '--'} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Temperatura de la cámara de cría:</span>
              <span className="text-gray-200">{sensors.temp_cria?.value?.toFixed(1) || '--'} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Humedad de la cámara de cría:</span>
              <span className="text-gray-200">{sensors.humedad_cria?.value?.toFixed(0) || '--'} %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Temperatura de la cámara mielera:</span>
              <span className="text-gray-200">{sensors.temp_mielera?.value?.toFixed(1) || '--'} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Humedad de la cámara mielera:</span>
              <span className="text-gray-200">{sensors.humedad_mielera?.value?.toFixed(0) || '--'} %</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimePage;