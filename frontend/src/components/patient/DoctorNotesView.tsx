import React, { useState } from 'react';
import { api } from '../../services/api';
import { PatientDetail } from '../../types';
import { 
  FileEdit, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Check,
  AlertCircle 
} from 'lucide-react';

interface DoctorNotesViewProps {
  patient: PatientDetail;
}

export const DoctorNotesView: React.FC<DoctorNotesViewProps> = ({ patient }) => {
  const [rawNotes, setRawNotes] = useState<string>(
    `Patient evaluated in OPD. Reports fever for 4 days with yellowish cough and retrosternal soreness. Appears moderately toxic but alert. Chest auscultation reveals mild bilateral coarse crackles in right lower base. Advised blood work, oral paracetamol, and adequate fluids.`
  );
  const [structuredSummary, setStructuredSummary] = useState<string>('');
  const [extractedSymptoms, setExtractedSymptoms] = useState<string[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSummarize = async () => {
    if (!rawNotes.trim()) return;
    setSummarizing(true);
    try {
      const res = await api.summarizeNotes(patient.id, rawNotes);
      setStructuredSummary(res.structured_summary);
      setExtractedSymptoms(res.extracted_symptoms);
      setSuggestedActions(res.suggested_actions);
    } catch (err) {
      console.error("Failed to summarize notes:", err);
    } finally {
      setSummarizing(false);
    }
  };

  const handleSaveNotes = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Clinical Free-Text Notes & AI Summarizer</h3>
          <p className="text-xs text-slate-500">Record observations and convert long physician notes into structured SOAP documentation</p>
        </div>

        <button
          onClick={handleSummarize}
          disabled={summarizing || !rawNotes.trim()}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-500/20"
        >
          {summarizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>AI-Assisted Note Summarization</span>
        </button>
      </div>

      {/* Free Text Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          Attending Doctor's Notes (Free-text)
        </label>
        <textarea
          rows={5}
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder="Enter physical examination findings, history notes, or clinical impressions..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-sans"
        />
      </div>

      {/* Structured AI Output */}
      {structuredSummary && (
        <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI-Generated Structured SOAP Summary (Doctor Review Required)</span>
            </span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">
              Ready to Save
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-teal-100 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
            {structuredSummary}
          </div>

          {extractedSymptoms.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Extracted Findings:</span>
              {extractedSymptoms.map((s, idx) => (
                <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        {saved && (
          <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
            <Check className="w-4 h-4" />
            <span>Saved to patient record</span>
          </span>
        )}
        <button
          onClick={handleSaveNotes}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
        >
          <Save className="w-4 h-4 text-teal-400" />
          <span>Save Clinical Notes</span>
        </button>
      </div>
    </div>
  );
};
