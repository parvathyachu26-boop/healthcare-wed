import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Activity,
  FileCheck 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnalyticsDashboard();
        setData(res);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return <div className="text-center py-12 text-xs text-slate-500">Compiling clinical metrics...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Quality & CDSS Analytics</h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Objective performance indicators evaluating clinical throughput, triage efficiency, and AI decision agreement
        </p>
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Patients Handled</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{data.patients_today}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18% vs weekly avg</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Consult Time</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{data.avg_consultation_time_min} min</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">{data.time_saved_percent}% faster with AI intake</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Doctor Agreement</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{data.ai_acceptance_rate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{data.doctor_approved_ai_recommendations} of {data.ai_assisted_consultations} verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Doctor Modifications</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{data.doctor_modified_recommendations}</p>
          <p className="text-[11px] text-amber-600 mt-1">Physician fine-tuned Rx</p>
        </div>
      </div>

      {/* Clean Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Patient Flow Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Consultation Volume & AI Assistance by Hour</h2>
            <p className="text-xs text-slate-500">Distribution of patients treated across today's clinic schedule</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly_distribution}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="patients" name="Total Patients" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai_assisted" name="AI Assisted" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Triage Priority Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Patient Triage Urgency Distribution</h2>
            <p className="text-xs text-slate-500">Risk classification breakdown across OPD lobby today</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.triage_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.triage_breakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs">
            {data.triage_breakdown.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-700">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
