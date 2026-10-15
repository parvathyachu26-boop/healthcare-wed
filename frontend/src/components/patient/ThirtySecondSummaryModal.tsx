import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Zap, 
  X, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles 
} from 'lucide-react';

interface ThirtySecondSummaryModalProps {
  patientId: number;
  patientName: string;
  onClose: () => void;
}

export const ThirtySecondSummaryModal: React.FC<ThirtySecondSummaryModalProps> = ({
  patientId,
  patientName,
  onClose
}) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get30sSummary(patientId);
        setSummary(res.summary);
      } catch (err) {
        console.error("Failed to load 30s summary:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                30-Second Pre-Consultation Briefing
              </h3>
              <p className="text-xs text-slate-500">
                Ultra-rapid clinical synthesis for {patientName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
            Generating 30-second clinical executive summary...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs text-slate-800 leading-relaxed font-medium">
              {summary}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Designed to review in under 30 seconds before inviting patient into consultation room.</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">Doctor review required</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
