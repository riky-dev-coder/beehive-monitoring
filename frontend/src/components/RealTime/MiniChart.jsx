import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MiniChart = ({ data, type }) => {
  // Filtrar y preparar datos: necesitamos timestamp y valor
  const chartData = data
    .filter(item => type === 'temp' ? item.sensor_type.includes('temp') : item.sensor_type.includes('humedad'))
    .map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      value: item.value,
      sensor: item.sensor_type
    }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MiniChart;