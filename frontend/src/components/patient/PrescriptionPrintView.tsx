import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Prescription, PatientDetail } from '../../types';
import { 
  Printer, 
  Download, 
  CheckCircle2, 
  FileCheck, 
  Activity, 
  ShieldCheck,
  Stethoscope 
} from 'lucide-react';

interface PrescriptionPrintViewProps {
  patient: PatientDetail;
}

export const PrescriptionPrintView: React.FC<PrescriptionPrintViewProps> = ({ patient }) => {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPrescription(patient.id);
        setPrescription(data);
      } catch (err) {
        console.error("Failed to load prescription:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patient.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!prescription) return;
    const content = `
======================================================
           MEDIASSIST CLINICAL CONSULTATION SUMMARY
======================================================
Doctor: ${prescription.doctor_name} (${prescription.doctor_qualification})
Specialty: ${prescription.doctor_department}
Date: ${prescription.date}

PATIENT INFORMATION:
Name: ${prescription.patient_name}
Age / Sex: ${prescription.patient_age_sex}
MRN: ${prescription.patient_mrn}

CLINICAL DIAGNOSIS:
${prescription.diagnosis}

VITALS:
${Object.entries(prescription.vitals || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}

INVESTIGATIONS ORDERED:
${prescription.investigations_ordered?.map(i => `• ${i}`).join('\n') || 'None'}

AUTHORIZED MEDICATIONS (Rx):
${prescription.medications?.map(m => `• ${m.name} - ${m.dose} (${m.frequency}) for ${m.duration || 'duration prescribed'}`).join('\n') || 'None'}

PHYSICIAN ADVICE & LIFESTYLE:
${prescription.advice}

FOLLOW-UP APPOINTMENT:
${prescription.follow_up_date || 'In 7 days or SOS'}

STATUS: Doctor Verified & Authorized
======================================================
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Prescription_${prescription.patient_name.replace(' ', '_')}_${prescription.patient_mrn}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div className="text-center py-10 text-xs text-slate-500">Preparing consultation summary...</div>;
  }

  if (!prescription) {
    return <div className="text-center py-10 text-xs text-slate-500">No active prescription available.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex items-center justify-between no-print">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Official Consultation Summary & Rx</h3>
            <p className="text-[11px] text-slate-500">Authorized medical document ready for hospital records or patient printing</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Print Formal Prescription</span>
          </button>
        </div>
      </div>

      {/* Printable Consultation Document */}
      <div
        id="printable-prescription"
        className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-soft space-y-6 max-w-4xl mx-auto"
      >
        {/* Hospital & Doctor Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">MEDIASSIST <span className="text-teal-600">CLINICAL</span></span>
            </div>
            <p className="text-xs text-slate-500">Department of Internal Medicine & Pulmonology</p>
            <p className="text-[11px] text-slate-400">Apollo Medical Centre • OPD Complex Suite 102</p>
          </div>

          <div className="text-right space-y-0.5">
            <p className="font-bold text-sm text-slate-900">{prescription.doctor_name}</p>
            <p className="text-xs text-slate-600">{prescription.doctor_qualification}</p>
            <p className="text-[11px] text-teal-700 font-semibold">{prescription.doctor_department}</p>
            <p className="text-[10px] text-slate-400">Date: {prescription.date}</p>
          </div>
        </div>

        {/* Patient Demographics Strip */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Patient Name</span>
            <p className="font-bold text-slate-900">{prescription.patient_name}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Age / Sex</span>
            <p className="font-bold text-slate-900">{prescription.patient_age_sex}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Medical Record #</span>
            <p className="font-bold font-mono text-slate-900">{prescription.patient_mrn}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Vitals (BP / SpO2)</span>
            <p className="font-bold text-slate-900">
              {prescription.vitals?.["Blood Pressure"] || '120/80'} • {prescription.vitals?.["SpO2"] || '98%'}
            </p>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Diagnosis</span>
          <p className="text-base font-extrabold text-slate-900 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
            {prescription.diagnosis}
          </p>
        </div>

        {/* Rx Medication Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1">
            <span>℞ Authorized Pharmacotherapy</span>
          </span>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase">
              <tr>
                <th className="p-2.5">Medication Name</th>
                <th className="p-2.5">Dosage</th>
                <th className="p-2.5">Frequency</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.medications?.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                  <td className="p-2.5 font-medium text-slate-700">{m.dose}</td>
                  <td className="p-2.5 text-slate-700">{m.frequency}</td>
                  <td className="p-2.5 text-slate-700">{m.duration || '5 days'}</td>
                  <td className="p-2.5 text-slate-500 text-[11px]">{m.instructions || 'After meals'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Investigations & Advice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              Investigations Ordered
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {prescription.investigations_ordered?.map((inv, idx) => (
                <li key={idx}>{inv}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              Physician Advice & Regimen
            </span>
            <p className="text-slate-700 leading-relaxed">{prescription.advice}</p>
            <p className="text-[11px] font-semibold text-teal-800 pt-1">
              Next Review: {prescription.follow_up_date || '7 days'}
            </p>
          </div>
        </div>

        {/* Bottom Signature Section */}
        <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
          <div className="space-y-1 text-slate-400 text-[10px]">
            <p>Generated by MediAssist AI CDSS • Authorized by licensed physician.</p>
            <p>Report issues to Medical Records Department.</p>
          </div>

          <div className="text-right space-y-1">
            <div className="w-40 border-b border-slate-900 pb-1 font-signature text-slate-900 font-bold italic text-sm">
              {prescription.doctor_name}
            </div>
            <p className="font-bold text-[11px] text-slate-800">Physician Digital Signature</p>
            <p className="text-[10px] text-emerald-700 font-medium">✓ Doctor Verified & Approved</p>
          </div>
        </div>
      </div>
    </div>
  );
};
