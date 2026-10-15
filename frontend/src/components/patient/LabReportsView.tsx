import React, { useState } from 'react';
import { PatientDetail, LabReport } from '../../types';
import { api } from '../../services/api';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowDown, 
  ArrowUp,
  FileSearch,
  Sparkles,
  Plus
} from 'lucide-react';

interface LabReportsViewProps {
  patient: PatientDetail;
  onRefresh: () => void;
}

export const LabReportsView: React.FC<LabReportsViewProps> = ({ patient, onRefresh }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('Diagnostic Blood Panel');
  const [reportType, setReportType] = useState<string>('Blood Test');
  const [simulatedText, setSimulatedText] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Quick Demo Pre-set Uploads
  const handleQuickUpload = async (preset: 'cbc' | 'metabolic' | 'urine') => {
    setUploading(true);
    let title = "CBC Report";
    let type = "Blood Test";
    let text = "";

    if (preset === 'cbc') {
      title = "Complete Blood Count (CBC)";
      type = "Blood Test";
      text = "Hemoglobin: 10.2 g/dL\nWBC: 13,200 /µL\nNeutrophils: 78 %\nPlatelets: 240,000 /µL\nCRP: 34.5 mg/L";
    } else if (preset === 'metabolic') {
      title = "Comprehensive Metabolic Panel";
      type = "Blood Test";
      text = "Fasting Blood Sugar: 164 mg/dL\nHbA1c: 8.6 %\nSerum Creatinine: 1.4 mg/dL\nSerum Sodium: 140 mEq/L\nSerum Potassium: 4.8 mEq/L";
    } else {
      title = "Urinalysis Dipstick & Microscopy";
      type = "Urinalysis";
      text = "Urine Leukocyte Esterase: Positive (++)\nUrine Nitrites: Positive (+)\nUrine RBC: 5 /HPF\nUrine Protein: 25 mg/dL";
    }

    try {
      await api.uploadReport(patient.id, title, type, text);
      onRefresh();
      setShowUploadModal(false);
    } catch (err) {
      console.error("Failed to upload report:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleCustomUpload = async () => {
    if (!reportTitle.trim()) return;
    setUploading(true);
    try {
      await api.uploadReport(patient.id, reportTitle, reportType, simulatedText);
      onRefresh();
      setShowUploadModal(false);
      setSimulatedText('');
    } catch (err) {
      console.error("Failed to upload custom report:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Header Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-extrabold text-slate-900">
              Laboratory & Diagnostic Documents
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {patient.lab_reports.length} Uploaded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI document-processing pipeline: OCR text extraction → Reference range flagging
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick presets for evaluation demo */}
          <button
            onClick={() => handleQuickUpload('cbc')}
            disabled={uploading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
            title="Simulate immediate upload of CBC report with abnormal values"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Sample CBC</span>
          </button>
          <button
            onClick={() => handleQuickUpload('metabolic')}
            disabled={uploading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>+ Sample Metabolic</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={uploading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      {patient.lab_reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-soft">
          <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Laboratory Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload a clinical PDF, blood work report, or scan document to trigger AI OCR and parameter extraction.
          </p>
          <button
            onClick={() => handleQuickUpload('cbc')}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
          >
            Load Sample CBC Document
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {patient.lab_reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4"
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Type: <strong className="text-slate-700">{report.report_type}</strong></span>
                      <span>•</span>
                      <span>File: {report.file_name}</span>
                      <span>•</span>
                      <span>Processed: {new Date(report.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center space-x-1 w-fit">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>OCR Processed</span>
                </span>
              </div>

              {/* Extraction Summary */}
              {report.summary_findings && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <strong className="text-slate-900 font-semibold">AI Extraction Summary:</strong> {report.summary_findings}
                </div>
              )}

              {/* Extracted Parameters Table with Out-of-Range Flags */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Measured Value</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3">Clinical Status</th>
                      <th className="py-2.5 px-3">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.results.map((res, rIdx) => {
                      const isHigh = res.flag === 'high' || res.flag === 'critical';
                      const isLow = res.flag === 'low';
                      const isCritical = res.flag === 'critical';

                      return (
                        <tr
                          key={rIdx}
                          className={isCritical ? 'bg-red-50/50' : isHigh || isLow ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {res.test_name}
                          </td>
                          <td className="py-2.5 px-3 font-bold font-mono text-slate-800">
                            {res.value} <span className="text-slate-400 font-normal">{res.unit}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {res.reference_range || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            {isHigh && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                <ArrowUp className="w-3 h-3 text-amber-700" />
                                <span>ABOVE RANGE</span>
                              </span>
                            )}
                            {isLow && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                <ArrowDown className="w-3 h-3 text-blue-700" />
                                <span>BELOW RANGE</span>
                              </span>
                            )}
                            {!isHigh && !isLow && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                                <span>Normal</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            {res.interpretation || (isHigh ? 'Above normal thresholds' : isLow ? 'Below normal thresholds' : 'Within physiological range')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Custom Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base">
              Upload Clinical Document
            </h3>
            <p className="text-xs text-slate-500">
              Paste or input report parameters for the OCR extraction pipeline
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="e.g. Chest Radiograph / Biochemistry"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Blood Test">Blood Test / CBC</option>
                  <option value="X-Ray">Chest / Skeletal X-Ray</option>
                  <option value="Scan">CT / MRI Scan</option>
                  <option value="Urinalysis">Urinalysis Panel</option>
                  <option value="Prescription">External Prescription Document</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Report Text / OCR Lines (Format: Test: Value Unit)
                </label>
                <textarea
                  rows={4}
                  value={simulatedText}
                  onChange={(e) => setSimulatedText(e.target.value)}
                  placeholder="Hemoglobin: 11.2 g/dL&#10;WBC: 12800 /µL&#10;Platelets: 210000 /µL"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomUpload}
                disabled={uploading}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20"
              >
                {uploading ? 'Processing OCR...' : 'Process Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
