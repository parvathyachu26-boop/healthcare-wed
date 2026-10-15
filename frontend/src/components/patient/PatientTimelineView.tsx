import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';

interface PatientTimelineViewProps {
  patientId: number;
}

export const PatientTimelineView: React.FC<PatientTimelineViewProps> = ({ patientId }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const events = await api.getPatientTimeline(patientId);
        setTimeline(events);
      } catch (err) {
        console.error("Failed to load timeline:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  if (loading) {
    return <div className="text-center py-10 text-xs text-slate-500">Loading chronological timeline...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-base text-slate-900">Visual Medical Timeline</h3>
        <p className="text-xs text-slate-500">Chronological history of consultations, diagnostic investigations, and clinical events</p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => {
          const isCurrent = event.type === 'current_visit';
          const isReport = event.type === 'lab_report';

          return (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                isCurrent
                  ? 'bg-teal-600 text-white'
                  : isReport
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-white'
              }`}>
                {isCurrent ? <Activity className="w-3 h-3" /> : isReport ? <FileText className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
              </div>

              {/* Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-teal-50/40 border-teal-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:shadow-xs'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{event.title}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500">{event.date}</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {event.tag}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
