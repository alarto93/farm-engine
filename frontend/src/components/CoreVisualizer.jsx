import React from 'react'; // <--- Falta esta línea

const CoreVisualizer = ({ label, load, type }) => {
  const color = type === 'p' ? 'bg-orange-500' : 'bg-emerald-500';
  
  return (
    <div className="
      p-3 rounded
      bg-white border border-slate-300
      dark:bg-slate-950 dark:border-slate-800
    ">
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-mono text-black dark:text-white">{label}</span>
        <span className={`text-[10px] font-mono ${load > 90 ? 'text-red-400' : ' text-black dark:text-white'}`}>
            {load.toFixed(0)}%
        </span>
      </div>
      <div className="h-1 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${load}%` }}
        />1
      </div>
    </div>
  );
};

export default CoreVisualizer;