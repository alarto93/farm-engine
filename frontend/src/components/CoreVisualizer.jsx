import React from 'react'; // <--- Falta esta línea

const CoreVisualizer = ({ label, load, type }) => {
  const color = type === 'p' ? 'bg-orange-500' : 'bg-emerald-500';
  
  return (
    <div className="bg-slate-950 p-3 rounded border border-slate-800">
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-mono text-slate-500">{label}</span>
        <span className={`text-[10px] font-mono ${load > 90 ? 'text-red-400' : 'text-slate-300'}`}>
            {load.toFixed(0)}%
        </span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${load}%` }}
        />
      </div>
    </div>
  );
};

export default CoreVisualizer;