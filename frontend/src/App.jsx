import React, { useEffect, useState, useRef } from 'react';
import { Zap, Clock, Server, Database, Activity, ShieldCheck } from 'lucide-react';
import CoreVisualizer from './components/CoreVisualizer';
import MetricsChart from './components/MetricsChart';

const App = () => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  // 1. Inicialización: Telemetría, Historial y WebSockets
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const resp = await fetch('http://localhost:8000/history');
        const historyData = await resp.json();
        const formatted = historyData.map(log => ({
          time: new Date(log.timestamp).toLocaleTimeString(),
          avg_p_load: log.p_cores.reduce((a, b) => a + b, 0) / log.p_cores.length,
          queue_load: log.queue_load
        }));
        setHistory(formatted);
      } catch (err) {
        console.error("Historical Data Unavailable");
      }
    };

    const connect = () => {
      ws.current = new WebSocket(`ws://${window.location.hostname}:8000/ws/stats`);
      
      ws.current.onopen = () => setConnected(true);
      
      ws.current.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        setData(newData);
        
        setHistory(prev => {
          const avg = newData.p_cores.reduce((a, b) => a + b, 0) / newData.p_cores.length
          const newPoint = {
            time: new Date().toLocaleTimeString(),
            avg_p_load: avg,
            queue_load: newData.queue_load
          };
          return [...prev, newPoint].slice(-30);
        });
      };

      ws.current.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
    };

    fetchHistory();
    connect();
    return () => ws.current?.close();
  }, []);

  // 2. Polling de Logs de Tareas (cada 2 segundos)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const resp = await fetch('http://localhost:8000/history-tasks');
        const taskData = await resp.json();
        setTasks(taskData);
      } catch (err) {
        // Silencioso hasta que existan tareas
      }
    };
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-blue-500 animate-spin" size={40} />
        <span className="text-blue-500 font-mono text-xs tracking-[0.3em] animate-pulse">
          SYNCHRONIZING_SYSTEM_STATE...
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-mono">
      {/* GLOBAL HEADER */}
      <header className="max-w-[1600px] mx-auto flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-red-600 animate-ping'}`} />
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              F.A.R.M. <span className="text-blue-500">Engine Control</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 tracking-[0.2em]">PERSISTENCE_STATUS: MONGODB_CONNECTED</p>
        </div>
        
        <div className="flex gap-6">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-right">
            <p className="text-[9px] text-slate-500 uppercase font-bold">RAM_UTILIZATION</p>
            <p className="text-xl font-bold text-blue-400">{data.ram.toFixed(1)}%</p>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT GRID */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MONITORING & HISTORY (8/12) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* P-CORE CLUSTER */}
          <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl w-full">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Zap size={14} className="text-orange-500" /> Performance Cluster
              </h2>
              <span className="text-[9px] text-orange-500/50">AFFINITY: P-CORES_ONLY</span>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.p_cores.map((load, i) => (
                <CoreVisualizer key={`p-${i}`} label={`CORE_${i}`} load={load} type="p" />
              ))}
            </div>
          </section>

          {/* HISTORICAL CHART (Perfectly Centered) */}
          <section className="w-full">
            <MetricsChart history={history} />
          </section>

          {/* TASK PERSISTENCE TABLE */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden w-full">
            <header className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Clock size={14} className="text-blue-500" /> Task Execution Logs
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-500 uppercase">Live_Sync</span>
              </div>
            </header>
            <div className="max-h-[280px] overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-slate-900 shadow-sm text-slate-500 uppercase tracking-tighter font-bold">
                  <tr>
                    <th className="p-4 border-b border-slate-800">Timestamp</th>
                    <th className="p-4 border-b border-slate-800">Task_ID</th>
                    <th className="p-4 border-b border-slate-800 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tasks.length > 0 ? tasks.map((t, i) => (
                    <tr key={i} className="hover:bg-blue-500/5 transition-colors">
                      <td className="p-4 text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</td>
                      <td className="p-4 text-blue-400 font-bold">{t.task_id}</td>
                      <td className="p-4 text-right text-emerald-400 font-bold">{t.duration_seconds.toFixed(3)}s</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-slate-600 italic text-xs">
                        Awaiting process-data signals...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: STATUS & BACKPRESSURE (4/12) */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* BACKPRESSURE WIDGET */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Server size={80} />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Activity size={16} /> Queue Backpressure
            </h2>
            <div className="text-7xl font-black text-white mb-6 tracking-tighter">
              {data.queue_load.toFixed(0)}<span className="text-2xl text-slate-500">%</span>
            </div>
            <div className="h-4 bg-slate-950 rounded-full border border-slate-800 p-1 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.4)] ${
                  data.queue_load > 80 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-blue-600'
                }`}
                style={{ width: `${data.queue_load}%` }} 
              />
            </div>
            <p className="mt-4 text-[9px] text-slate-500 uppercase italic">Orchestrator Semaphore: {data.queue_load > 0 ? 'ACTIVE' : 'IDLE'}</p>
          </div>

          {/* PERSISTENCE STATUS */}
          <div className="bg-indigo-600/5 border border-indigo-500/20 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-500/10 pb-3">
              <Database size={18} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Persistence Node</h2>
            </div>
            <div className="space-y-3 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">CLUSTER_ID</span>
                <span className="text-slate-300">FARM_DB_01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ENGINE_SYNC</span>
                <span className="text-emerald-500 font-bold">REAL-TIME</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/10">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  <span className="text-[9px] text-indigo-300">SYSTEM_INTEGRITY_VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

        </aside>
      </main>
    </div>
  );
};

export default App;