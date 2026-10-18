import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Clock, TrendingUp, AlertTriangle, ShieldCheck, Sun, Moon, Info } from 'lucide-react';
import { api } from '../../services/api';
import { CrowdAnalytics } from '../../types';
import { CrowdBadge } from '../../components/CrowdBadge';

export const CrowdTimingsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CrowdAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setAnalytics(res.analytics);
      } catch (err) {
        console.error('Failed to load crowd analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-subtle">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-transit bg-teal-50 text-transit-teal flex items-center justify-center">
            <Clock size={16} />
          </div>
          <h1 className="text-xl font-bold text-transit-navy tracking-tight">Mumbai Transit Crowd Timings</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-transit-teal border border-teal-200 font-mono">
            Historical &amp; Live Pattern
          </span>
        </div>
        <p className="text-xs text-transit-muted mt-0.5 ml-10">
          Plan your commute during quiet windows. Real-time comparison across Local Trains, Mumbai Metro, and BEST Buses.
        </p>
      </div>

      {/* Peak vs Quiet Windows Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morning Rush */}
        <div className="bg-white border border-rose-200 rounded-card p-4 shadow-subtle flex items-start gap-3">
          <div className="p-2.5 rounded-transit bg-rose-50 text-rose-700 shrink-0">
            <Sun size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Morning Peak Rush
            </span>
            <h3 className="text-lg font-bold text-transit-navy">08:15 AM – 11:00 AM</h3>
            <p className="text-xs text-slate-500 mt-1">
              Super Dense Crush Load (SDCL) on Southbound trains heading towards Churchgate, CSMT, BKC, and Lower Parel.
            </p>
          </div>
        </div>

        {/* Evening Rush */}
        <div className="bg-white border border-rose-200 rounded-card p-4 shadow-subtle flex items-start gap-3">
          <div className="p-2.5 rounded-transit bg-rose-50 text-rose-700 shrink-0">
            <Moon size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Evening Peak Rush
            </span>
            <h3 className="text-lg font-bold text-transit-navy">05:30 PM – 08:45 PM</h3>
            <p className="text-xs text-slate-500 mt-1">
              Maximum crush load on Northbound trains heading towards Borivali/Virar, Thane/Kalyan, and Panvel.
            </p>
          </div>
        </div>

        {/* Quiet Window */}
        <div className="bg-white border border-emerald-200 rounded-card p-4 shadow-subtle flex items-start gap-3">
          <div className="p-2.5 rounded-transit bg-emerald-50 text-emerald-700 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Optimal Quiet Window
            </span>
            <h3 className="text-lg font-bold text-transit-navy">12:00 PM – 03:45 PM</h3>
            <p className="text-xs text-slate-500 mt-1">
              Off-peak comfortable seating window across all suburban train routes and metro lines.
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Density Chart Card */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-transit-navy">
              Hourly Commuter Occupancy Trends (06:00 to 23:00)
            </h3>
            <p className="text-xs text-transit-muted">
              Comparison of Suburban Train load vs Mumbai Metro and BEST Bus capacity
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-teal-800">
              <span className="w-3 h-1 bg-[#0f766e] rounded-full" /> Local Train
            </span>
            <span className="flex items-center gap-1.5 text-sky-800">
              <span className="w-3 h-1 bg-[#0284c7] rounded-full" /> Metro
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-3 h-1 bg-[#ea580c] rounded-full" /> BEST Bus
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {analytics ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}% Load`, name === 'trainCrowd' ? 'Local Train' : name === 'metroCrowd' ? 'Mumbai Metro' : 'BEST Bus']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="trainCrowd"
                  name="Local Train"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="metroCrowd"
                  name="Mumbai Metro"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="busCrowd"
                  name="BEST Bus"
                  stroke="#ea580c"
                  strokeWidth={1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-transit-muted">
              Loading timing data...
            </div>
          )}
        </div>
      </div>

      {/* Station Rush Density Matrix */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
        <div>
          <h3 className="text-base font-bold text-transit-navy">
            Major Interchange Stations Rush Index
          </h3>
          <p className="text-xs text-transit-muted">
            Aggregated passenger footfalls, platform density, and real-time reports.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Transit Station</th>
                <th className="py-2.5 px-3">Primary Mode</th>
                <th className="py-2.5 px-3">Current Density</th>
                <th className="py-2.5 px-3">Capacity Load</th>
                <th className="py-2.5 px-3">Passenger Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.stationRankings.map((stn, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-transit-navy">
                    {stn.stationName}
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-600">
                    {stn.mode}
                  </td>
                  <td className="py-3 px-3">
                    <CrowdBadge level={stn.crowdLevel} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stn.currentLoad > 75 ? 'bg-rose-600' : stn.currentLoad > 45 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${stn.currentLoad}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium">{stn.currentLoad}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {stn.reportedCrowd} verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
