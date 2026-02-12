import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const MetricsChart = ({ history }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl w-full h-[380px] flex flex-col">
      <h2 className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-bold flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        Load History (Last 30 samples)
      </h2>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={history} 
            margin={{ top: 10, right: 30, left: -10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorQ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#1e293b" 
              vertical={false} 
              opacity={0.5}
            />
            
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 100]}
              dx={-5}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ padding: '2px 0' }}
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              height={40} 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            
            <Line 
              type="monotone" 
              dataKey="avg_p_load" 
              stroke="#f97316" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 4, strokeWidth: 0 }}
              name="Avg P-Core"
              fill="url(#colorP)"
              isAnimationActive={true}
              animationDuration={500}
            />
            
            <Line 
              type="monotone" 
              dataKey="queue_load" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 4, strokeWidth: 0 }}
              name="Backpressure"
              fill="url(#colorQ)"
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart;