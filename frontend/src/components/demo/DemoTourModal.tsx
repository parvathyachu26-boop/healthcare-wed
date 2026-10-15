import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Stethoscope, 
  UserCheck, 
  FileText, 
  Edit3, 
  Printer 
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepNumber: number) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose, onJumpToStep }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    { title: "1. Today's patient queue", role: "Dashboard", description: "Start with the small, prioritized patient list. Demo records are fictional and labeled DEMO.", target: "dashboard", stepNum: 1 },
    { title: "2. Open a patient", role: "Patient information", description: "Review the current visit, symptoms, medical history, medications, allergies, and available reports.", target: "patient-profile", stepNum: 2 },
    { title: "3. Review the AI summary", role: "Clinical AI", description: "The AI prepares a summary and possible next steps. Treat these as suggestions that require clinical review.", target: "ai-assistant", stepNum: 3 },
    { title: "4. Doctor review", role: "Doctor decision", description: "Approve the plan, modify it before approval, or reject it. The doctor remains responsible for the final decision.", target: "ai-assistant", stepNum: 4 },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      onJumpToStep(steps[currentStep + 1].stepNum);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onJumpToStep(steps[currentStep - 1].stepNum);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Interactive Project Evaluation Tour
              </h3>
              <p className="text-xs text-slate-500">
                End-to-End Guided Demonstration of MediAssist AI
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80">
            {step.role}
          </span>
        </div>

        {/* Step Content */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200/80 space-y-2.5">
          <h4 className="text-base font-extrabold text-slate-900">
            {step.title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Philosophy Reminder */}
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
          <span className="font-bold text-teal-400">Core Principle:</span>
          <span className="text-slate-300 font-medium">"AI Prepares. Doctors Decide."</span>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-100 rounded-xl"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onJumpToStep(step.stepNum);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl"
            >
              Go to Screen
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md shadow-teal-600/20"
            >
              <span>{currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
