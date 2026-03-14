export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-[#0f1720] border border-gray-800 rounded-2xl p-4 shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
          <div className="text-xs text-gray-400">•</div>
        </div>
      )}
      {children}
    </div>
  );
}