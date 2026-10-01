import React from 'react';
import {
  Sparkles,
  Database,
  Cpu,
  History,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { PerformanceGrade, PredictionResult } from '../types';

interface DashboardProps {
  history: PredictionResult[];
  onNavigate: (tab: string) => void;
  onOpenReport: (result: PredictionResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  onNavigate,
  onOpenReport,
}) => {
  const total = history.length;
  const countByGrade: Record<PerformanceGrade, number> = {
    Excellent: 0,
    Good: 0,
    Average: 0,
    Poor: 0,
  };

  history.forEach((h) => {
    if (countByGrade[h.prediction] !== undefined) {
      countByGrade[h.prediction]++;
    }
  });

  const getPercent = (count: number) => {
    if (!total) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              B.Tech CSE (AI & ML) Final Year Academic Project
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Student Performance Prediction System
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              An applied machine learning intelligence suite utilizing Random Forest classification
              to forecast student academic performance tiers and offer targeted intervention strategies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>New Prediction</span>
            </button>
            <button
              onClick={() => onNavigate('model')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Cpu className="w-4 h-4 text-slate-600" />
              <span>Model Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Evaluations</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Logged in local database
          </div>
        </div>

        {/* Excellent */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-emerald-700">Excellent (≥80%)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {countByGrade.Excellent}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({getPercent(countByGrade.Excellent)})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-1 rounded-full"
              style={{
                width: total ? `${(countByGrade.Excellent / total) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Good */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-blue-700">Good (60-80%)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {countByGrade.Good}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({getPercent(countByGrade.Good)})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1 rounded-full"
              style={{
                width: total ? `${(countByGrade.Good / total) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Average */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-amber-700">Average (40-60%)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {countByGrade.Average}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({getPercent(countByGrade.Average)})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-1 rounded-full"
              style={{
                width: total ? `${(countByGrade.Average / total) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Poor */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-xs font-medium text-rose-700">Poor (&lt;40%)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {countByGrade.Poor}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({getPercent(countByGrade.Poor)})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-rose-600 h-1 rounded-full"
              style={{
                width: total ? `${(countByGrade.Poor / total) * 100}%` : '0%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Workflow pipeline & Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic System Architecture */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Academic Feature Weighting
          </h2>
          <p className="text-xs text-slate-600">
            The mathematical formulation assigns rigorous weights across 5 key educational dimensions:
          </p>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Previous Semester Exam Score', weight: '25%', desc: 'Long-term foundational baseline' },
              { name: 'Class Attendance Percentage', weight: '20%', desc: 'Consistency & curriculum engagement' },
              { name: 'Internal Assessment Marks', weight: '20%', desc: 'Mid-term periodic comprehension' },
              { name: 'Assignment & Project Score', weight: '20%', desc: 'Continuous coursework completion' },
              { name: 'Daily Study Hours (Norm 8h)', weight: '15%', desc: 'Self-directed learning commitment' },
            ].map((f) => (
              <div
                key={f.name}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">{f.name}</div>
                  <div className="text-[11px] text-slate-500">{f.desc}</div>
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 shrink-0">
                  {f.weight}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('dataset')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Explore 200 Student Dataset Records</span>
            </button>
          </div>
        </div>

        {/* Right Column (2 cols wide): Recent Predictions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Student Evaluations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest predictions generated by the Random Forest classifier
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-slate-700">
                No evaluations recorded yet
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Begin by launching the prediction engine to assess a student's indicators and generate personalized recommendations.
              </p>
              <button
                onClick={() => onNavigate('predict')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span>Run First Prediction</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead>
                  <tr className="text-slate-500 font-semibold">
                    <th className="py-2.5 pr-3">Student</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-3">Study (h)</th>
                    <th className="py-2.5 px-3">Index Score</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice(0, 7).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">
                        {item.student_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {item.attendance}%
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {item.study_hours}h
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-slate-900">
                        {item.performance_score.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded border ${
                            item.prediction === 'Excellent'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : item.prediction === 'Good'
                              ? 'text-blue-700 bg-blue-50 border-blue-200'
                              : item.prediction === 'Average'
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          onClick={() => onOpenReport(item)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
