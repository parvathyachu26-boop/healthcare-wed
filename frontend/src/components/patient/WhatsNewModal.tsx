import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { WhatChanged } from '../../types';
import { 
  History, 
  X, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface WhatsNewModalProps {
  patientId: number;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ patientId, onClose }) => {
  const [data, setData] = useState<WhatChanged | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getWhatsNew(patientId);
        setData(res);
      } catch (err) {
        console.error("Failed to load What's New:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                What's New Since Last Visit?
              </h3>
              <p className="text-xs text-slate-500">
                Automated clinical delta analysis comparing current visit with previous consultation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            Comparing historical patient datasets...
          </div>
        ) : !data ? (
          <div className="text-center py-6 text-xs text-slate-500">No delta data available.</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Visit Dates Banner */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
              <span>Previous Visit: <strong className="text-slate-800">{data.previous_visit_date || 'N/A'}</strong></span>
              <span>Current Visit: <strong className="text-teal-700">{data.current_visit_date}</strong></span>
            </div>

            {/* New Symptoms */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                1. New or Acute Symptoms
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {data.new_symptoms.map((s, idx) => (
                  <li key={idx} className="font-medium text-slate-900">{s}</li>
                ))}
              </ul>
            </div>

            {/* New Lab Results */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                2. New Laboratory Findings (Outside Reference Range)
              </span>
              {data.new_lab_results.length === 0 ? (
                <p className="text-slate-500 italic">No new abnormal lab parameters detected.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.new_lab_results.map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900">{l.test}</span>
                        <p className="text-slate-500 text-[11px]">{l.interpretation}</p>
                      </div>
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {l.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improved vs Worsened Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Improved Findings</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-900">
                  {data.improved_findings.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                  {data.improved_findings.length === 0 && <li className="text-slate-400 italic">None noted</li>}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 space-y-1.5">
                <span className="font-bold text-red-800 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                  <span>Worsened / Escalated Findings</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-red-900">
                  {data.worsened_findings.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                  {data.worsened_findings.length === 0 && <li className="text-slate-400 italic">None noted</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
