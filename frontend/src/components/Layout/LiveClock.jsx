// components/Layout/LiveClock.jsx
import { useState, useEffect } from 'react';

const LiveClock = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true,
    }).replace('.', '');
  };

  return (
    <div className="text-sm font-mono text-emerald-500/80 hidden md:block">
      {formatDateTime(dateTime)}
    </div>
  );
};

export default LiveClock;