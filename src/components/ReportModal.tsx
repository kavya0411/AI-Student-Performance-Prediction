import React from 'react';
import { Printer, Download, X, GraduationCap, CheckCircle2 } from 'lucide-react';
import { PredictionResult } from '../types';

interface ReportModalProps {
  result: PredictionResult;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ result, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-300 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls - hidden when printing */}
        <div className="no-print bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <GraduationCap className="w-4 h-4 text-slate-900" />
            <span>Academic Performance Assessment Document</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Academic Document - styled for A4 look */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="academic-report-area">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
              Student Performance Prediction Report
            </h1>
            <p className="text-xs font-medium text-slate-600 mt-1 uppercase tracking-wider">
              B.Tech Computer Science & Engineering (AI & ML) Academic Project
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supervised Machine Learning System · Random Forest Classification Architecture
            </p>
          </div>

          {/* Student Profile & Metadata Table */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Academic Evaluation Profile
            </h2>
            <div className="border border-slate-300 rounded-md overflow-hidden">
              <table className="min-w-full text-xs divide-y divide-slate-200">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700 w-1/3 border-r border-slate-200">
                      Student Name / Identifier
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      {result.student_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Evaluation Timestamp
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 tabular-nums">
                      {result.created_at}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Class Attendance
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-900 tabular-nums font-medium">
                      {result.attendance.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Study Hours / Day
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-900 tabular-nums font-medium">
                      {result.study_hours.toFixed(1)} hrs
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Assignment Score
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-900 tabular-nums font-medium">
                      {result.assignment_score.toFixed(1)} / 100
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Internal Assessment Marks
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-900 tabular-nums font-medium">
                      {result.internal_marks.toFixed(1)} / 100
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Previous Semester Exam Score
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-900 tabular-nums font-medium">
                      {result.previous_score.toFixed(1)} / 100
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-300">
                    <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-100">
                      Calculated Performance Index
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm tabular-nums bg-slate-100">
                      {result.performance_score.toFixed(2)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-200">
                      ML Predicted Classification
                    </td>
                    <td className="px-4 py-3 font-bold text-sm text-slate-900">
                      <span className="px-2.5 py-0.5 border border-slate-400 rounded">
                        {result.prediction}
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-200">
                      Ensemble Model Confidence
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-900 tabular-nums font-medium">
                      {(result.confidence * 100).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Actionable Academic Recommendations
            </h2>
            <div className="bg-slate-50 border border-slate-300 rounded-md p-4">
              <ul className="space-y-1.5 text-xs text-slate-800">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Academic Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 italic leading-relaxed">
            <strong>Disclaimer:</strong> This evaluation report was synthesized using an academic
            machine learning model (Random Forest Classifier) on synthetic training distributions.
            The computed prediction serves as an academic assessment support tool and is not an
            absolute guarantee of future examination outcomes.
          </div>

          {/* Signature lines */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-2">
              <div className="font-semibold">Academic Counselor / Faculty Mentor</div>
              <div className="text-[10px] text-slate-500">Department of Computer Science</div>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <div className="font-semibold">Project Guide / Evaluator</div>
              <div className="text-[10px] text-slate-500">AI & Machine Learning Laboratory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
