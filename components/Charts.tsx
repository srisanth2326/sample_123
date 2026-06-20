"use client";

import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface BreakdownProps {
  data: {
    transport: number;
    home: number;
    food: number;
    goods: number;
  };
}

interface TrendProps {
  activities: Array<{
    timestamp: string;
    co2Saved: number;
  }>;
}

export function EmissionsBreakdownChart({ data }: BreakdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[250px] w-full flex items-center justify-center text-[var(--text-secondary)] font-mono">Loading Chart...</div>;
  }

  const chartData = [
    { name: 'Transport', value: data.transport, color: '#2563EB' },
    { name: 'Home Energy', value: data.home, color: '#8B5CF6' },
    { name: 'Diet/Food', value: data.food, color: '#1D9E75' },
    { name: 'Consumption', value: data.goods, color: '#EC4899' },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    return <div className="h-[250px] w-full flex items-center justify-center text-[var(--text-secondary)] font-mono">No emissions data recorded.</div>;
  }

  return (
    <div className="w-full h-[250px] flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#131924" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1A2232', border: '1px solid #262F41', borderRadius: '8px' }}
              labelStyle={{ color: '#F8FAFC', fontFamily: 'monospace' }}
              itemStyle={{ color: '#CBD5E1', fontFamily: 'monospace' }}
              formatter={(value: any) => [`${value} kg CO₂e`, 'Emissions']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full sm:w-1/2 flex flex-col gap-2 font-mono text-sm">
        {chartData.map((entry, index) => {
          const total = chartData.reduce((sum, item) => sum + item.value, 0);
          const pct = Math.round((entry.value / total) * 100) || 0;
          return (
            <div key={index} className="flex justify-between items-center bg-[var(--bg-surface-sec)] px-3 py-2 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-semibold text-[var(--text-secondary)]">{entry.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[var(--text-primary)]">{entry.value} kg</span>
                <span className="text-xs text-[var(--text-secondary)] ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CarbonSavingsTrendChart({ activities }: TrendProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[250px] w-full flex items-center justify-center text-[var(--text-secondary)] font-mono">Loading Chart...</div>;
  }

  const getSavingsData = () => {
    const dataMap: { [date: string]: number } = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap[dateStr] = 0;
    }

    activities.forEach(activity => {
      const dateStr = new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dataMap[dateStr] !== undefined) {
        dataMap[dateStr] += activity.co2Saved;
      }
    });

    return Object.keys(dataMap).map(date => ({
      date,
      Savings: Number(dataMap[date].toFixed(2)),
    }));
  };

  const chartData = getSavingsData();

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            stroke="#CBD5E1" 
            fontSize={11} 
            fontFamily="monospace"
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#CBD5E1" 
            fontSize={11} 
            fontFamily="monospace"
            tickLine={false} 
            axisLine={false} 
            label={{ value: 'kg CO₂e Saved', angle: -90, position: 'insideLeft', style: { fill: '#CBD5E1', fontSize: 11, fontFamily: 'monospace' } }}
          />
          <Tooltip
            contentStyle={{ background: '#1A2232', border: '1px solid #262F41', borderRadius: '8px' }}
            labelStyle={{ color: '#F8FAFC', fontFamily: 'monospace' }}
            itemStyle={{ color: '#1D9E75', fontFamily: 'monospace' }}
          />
          <Area 
            type="monotone" 
            dataKey="Savings" 
            stroke="#1D9E75" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSavings)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
