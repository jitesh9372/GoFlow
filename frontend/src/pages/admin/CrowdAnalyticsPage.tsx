import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, ArrowUpRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { api } from '../../services/api';
import { CrowdAnalytics } from '../../types';

export const CrowdAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CrowdAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setAnalytics(res.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-transit-navy tracking-tight flex items-center gap-2">
          <BarChart3 size={24} className="text-transit-teal" />
          <span>Mumbai Commuter Flow &amp; Crowd Analytics</span>
        </h1>
        <p className="text-xs text-transit-muted mt-1">
          Hourly platform footfall, Super Dense Crush Load (SDCL) heatmaps, and multimodal distribution.
        </p>
      </div>

      {/* Hourly Multi-Modal Load Chart */}
      <div className="bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-transit-navy">
              Multimodal Hourly Capacity Utilization (%)
            </h3>
            <p className="text-xs text-transit-muted">
              Live vs historical rush curves across Suburban Trains, Mumbai Metro, and BEST Bus corridors.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Peak SDCL Threshold: 80%
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          {analytics ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}% Load`]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar dataKey="trainCrowd" name="Suburban Train" fill="#0f766e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="metroCrowd" name="Mumbai Metro" fill="#0284c7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="busCrowd" name="BEST Bus" fill="#ea580c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-transit-muted">
              Loading hourly analytics...
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peak Window Statistics */}
        <div className="bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
          <h3 className="font-bold text-base text-transit-navy">
            Peak Window Statistics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-transit border border-rose-100 bg-rose-50/50 flex items-start gap-3">
              <Sun size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-rose-900">
                  Morning Inflow: 08:15 AM – 11:00 AM
                </strong>
                <p className="text-rose-700/90 mt-0.5 leading-relaxed">
                  Average train load reaches 94% on fast corridors between Borivali-Churchgate and Thane-CSMT.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-transit border border-rose-100 bg-rose-50/50 flex items-start gap-3">
              <Moon size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-rose-900">
                  Evening Outflow: 05:30 PM – 08:45 PM
                </strong>
                <p className="text-rose-700/90 mt-0.5 leading-relaxed">
                  Severe crowding observed on Northbound platforms at Dadar, Lower Parel, and Andheri interchange.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-transit border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-emerald-900">
                  Midday Off-Peak: 12:00 PM – 03:45 PM
                </strong>
                <p className="text-emerald-700/90 mt-0.5 leading-relaxed">
                  Recommended for non-urgent travel; seat occupancy drops below 40%.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Critical Interchanges */}
        <div className="bg-white border border-transit-border rounded-card p-5 shadow-card space-y-4">
          <h3 className="font-bold text-base text-transit-navy">
            Critical Commuter Hubs by Footfall
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { name: 'Dadar Junction (WR/CR)', footfall: '850,000 / day', load: '94% (SDCL)', status: 'Extreme' },
              { name: 'Andheri Hub (WR/Metro 1)', footfall: '920,000 / day', load: '92% (SDCL)', status: 'Extreme' },
              { name: 'Kurla Junction (CR/Harbour)', footfall: '810,000 / day', load: '88% (SDCL)', status: 'High' },
              { name: 'Ghatkopar (CR/Metro 1)', footfall: '790,000 / day', load: '90% (SDCL)', status: 'High' },
              { name: 'Thane Central Terminus', footfall: '910,000 / day', load: '72% (Moderate)', status: 'Moderate' }
            ].map((hub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-transit border border-slate-100 bg-slate-50/70"
              >
                <div>
                  <span className="font-bold text-slate-800">{hub.name}</span>
                  <span className="block text-[11px] text-slate-400 font-mono">{hub.footfall}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-rose-700 block font-mono">{hub.load}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{hub.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
