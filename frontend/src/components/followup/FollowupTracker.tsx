import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FollowupItem } from '../../types';
import { 
  CalendarClock, 
  CheckCircle2, 
  Phone, 
  User, 
  Clock, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

interface FollowupTrackerProps {
  onSelectPatient: (patientId: number) => void;
}

export const FollowupTracker: React.FC<FollowupTrackerProps> = ({ onSelectPatient }) => {
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    setLoading(true);
    try {
      const data = await api.getFollowups();
      setFollowups(data);
    } catch (err) {
      console.error("Failed to load followups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeFollowup(id);
      loadFollowups();
    } catch (err) {
      console.error("Failed to complete followup:", err);
    }
  };

  const filtered = followups.filter(f => filterStatus === 'all' || f.status === filterStatus);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Follow-up Tracker</h1>
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              {followups.filter(f => f.status === 'pending').length} Active Reviews
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor post-consultation response, chronic condition review schedules, and recall alerts
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {['all', 'pending', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isPending = item.status === 'pending';
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-soft space-y-3 transition-all ${
                isPending ? 'border-slate-200/80 hover:border-teal-300' : 'border-slate-200/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{item.patient_name}</h3>
                  <span className="text-[11px] font-mono text-slate-500">{item.patient_mrn}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Follow-up Objective
                </span>
                <p className="font-medium text-slate-800 leading-snug">{item.reason}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center space-x-1">
                  <CalendarClock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Due Date: <strong className="text-slate-800">{item.due_date}</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.patient_contact}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectPatient(item.patient_id)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>Open Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {isPending && (
                  <button
                    onClick={() => handleComplete(item.id)}
                    className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
                    title="Mark follow-up reviewed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Done</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
