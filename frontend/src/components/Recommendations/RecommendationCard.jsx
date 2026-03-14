import { useState } from 'react';
import api from '../../services/api';

const TRIGGER_STYLES = {
  critical: {
    badge:  'bg-red-500/10 border-red-500/50 text-red-400',
    accent: 'border-l-red-500',
    dot:    'bg-red-500',
    label:  'Crítica',
  },
  warning: {
    badge:  'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    accent: 'border-l-yellow-500',
    dot:    'bg-yellow-400',
    label:  'Preventiva',
  },
};

const STATUS_STYLES = {
  pendiente: 'text-gray-400 bg-gray-800 border-gray-700',
  aceptada:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
  rechazada: 'text-red-400 bg-red-500/10 border-red-500/40',
};

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  aceptada:  'Aceptada',
  rechazada: 'Rechazada',
};

const formatWindow = (inicio, fin) => {
  const start = new Date(inicio);
  const end   = new Date(fin);
  const date  = start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const from  = start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const to    = end.toLocaleTimeString('es-ES',   { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${from} – ${to}`;
};

const RecommendationCard = ({ recommendation: initial, onUpdated }) => {
  const [rec, setRec]               = useState(initial);
  const [comment, setComment]       = useState(initial.comentario_apicultor || '');
  const [editingComment, setEditing] = useState(false);
  const [savingComment, setSaving]  = useState(false);
  const [actionLoading, setAction]  = useState(null); // 'aceptada' | 'rechazada'

  const style = TRIGGER_STYLES[rec.tipo_trigger] || TRIGGER_STYLES.warning;

  // ── Aceptar / Rechazar ────────────────────────────────────────────────────
  const handleStatus = async (estado) => {
    setAction(estado);
    try {
      const { data } = await api.patch(`/recommendations/${rec.id}/status`, { estado });
      const updated = { ...rec, ...data, estado };
      setRec(updated);
      onUpdated?.(updated);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    } finally {
      setAction(null);
    }
  };

  // ── Guardar comentario ────────────────────────────────────────────────────
  const handleSaveComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/recommendations/${rec.id}/comment`, { comentario: comment.trim() });
      setRec((prev) => ({ ...prev, comentario_apicultor: comment.trim() }));
      setEditing(false);
      onUpdated?.({ ...rec, comentario_apicultor: comment.trim() });
    } catch (err) {
      console.error('Error al guardar comentario:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`
        relative bg-[#0d1821] border border-gray-800 border-l-4 rounded-xl
        overflow-hidden transition-all duration-200 hover:border-gray-700
        ${style.accent}
      `}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[rec.estado]}`}>
              {STATUS_LABELS[rec.estado]}
            </span>
            {rec.total_alertas > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs text-gray-500 bg-gray-800/60 border border-gray-700/50">
                {rec.total_alertas} {rec.total_alertas === 1 ? 'alerta' : 'alertas'}
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="text-base font-semibold text-gray-100 leading-snug">
            {rec.titulo}
          </h3>

          {/* Ventana de tiempo */}
          <p className="text-xs text-gray-500 mt-1">
            {formatWindow(rec.ventana_inicio, rec.ventana_fin)}
          </p>
        </div>
      </div>

      {/* Recomendación IA */}
      <div className="px-5 pb-4">
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {rec.recomendacion}
        </p>
      </div>

      {/* Acciones aceptar / rechazar */}
      {rec.estado === 'pendiente' && (
        <div className="px-5 pb-4 flex gap-2">
          <button
            onClick={() => handleStatus('aceptada')}
            disabled={!!actionLoading}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-500/10 border border-emerald-500/40 text-emerald-400
                       hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'aceptada' ? 'Guardando…' : '✓ Acertada'}
          </button>
          <button
            onClick={() => handleStatus('rechazada')}
            disabled={!!actionLoading}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500/10 border border-red-500/40 text-red-400
                       hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'rechazada' ? 'Guardando…' : '✕ Errónea'}
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 border-t border-gray-800" />

      {/* Sección de comentario */}
      <div className="px-5 py-4">
        {!editingComment ? (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {rec.comentario_apicultor ? (
                <>
                  <p className="text-xs text-gray-500 mb-1">Nota del apicultor</p>
                  <p className="text-sm text-gray-300 italic">"{rec.comentario_apicultor}"</p>
                </>
              ) : (
                <p className="text-xs text-gray-600 italic">Sin comentarios aún</p>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 px-3 py-1.5 text-xs rounded-lg border border-gray-700 text-gray-400
                         hover:bg-gray-800 hover:text-gray-200 transition-colors"
            >
              {rec.comentario_apicultor ? '✎ Editar' : '+ Añadir nota'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400">
              Nota del apicultor <span className="text-gray-600">(se guardará como referencia futura)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Escribe tus observaciones sobre esta recomendación…"
              className="w-full bg-[#0a1218] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200
                         placeholder-gray-600 focus:outline-none focus:border-blue-500/60 resize-none transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setComment(rec.comentario_apicultor || ''); }}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveComment}
                disabled={savingComment || !comment.trim()}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600/80 border border-blue-500/50 text-white
                           hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {savingComment ? 'Guardando…' : 'Guardar nota'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;