import React, { useState, useMemo } from 'react';
import {
  Trash2,
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  History,
} from 'lucide-react';
import { PerformanceGrade, PredictionResult } from '../types';

interface HistoryViewProps {
  history: PredictionResult[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onOpenReport: (result: PredictionResult) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDelete,
  onClearAll,
  onOpenReport,
}) => {
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesGrade = filterGrade === 'All' || item.prediction === filterGrade;
      const matchesSearch = item.student_name.toLowerCase().includes(search.toLowerCase());
      return matchesGrade && matchesSearch;
    });
  }, [history, filterGrade, search]);

  const handleExportHistoryCsv = () => {
    if (history.length === 0) return;
    const headers = [
      'ID',
      'Student_Name',
      'Attendance',
      'Study_Hours',
      'Assignment_Score',
      'Internal_Marks',
      'Previous_Score',
      'Performance_Score',
      'Prediction',
      'Confidence',
      'Created_At'
    ];
    const rows = history.map((h) => [
      h.id,
      `"${h.student_name}"`,
      h.attendance,
      h.study_hours,
      h.assignment_score,
      h.internal_marks,
      h.previous_score,
      h.performance_score,
      h.prediction,
      h.confidence,
      `"${h.created_at}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Local SQLite Database Storage
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Evaluation History Log ({history.length} records)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Historical student predictions stored with calculated scores and model confidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportHistoryCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {['All', 'Excellent', 'Good', 'Average', 'Poor'].map((grade) => (
              <button
                key={grade}
                onClick={() => setFilterGrade(grade)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterGrade === grade
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            {history.length === 0
              ? 'No evaluations recorded yet. Run a prediction to start building history.'
              : 'No evaluations match your search or filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-slate-600 font-semibold">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3 text-right">Attendance</th>
                  <th className="py-3 px-3 text-right">Study (h)</th>
                  <th className="py-3 px-3 text-right">Assignment</th>
                  <th className="py-3 px-3 text-right">Internal</th>
                  <th className="py-3 px-3 text-right">Previous</th>
                  <th className="py-3 px-3 text-right">Calculated Index</th>
                  <th className="py-3 px-3">Prediction</th>
                  <th className="py-3 px-3 text-right">Confidence</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.student_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                      {item.attendance}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                      {item.study_hours}h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                      {item.assignment_score}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                      {item.internal_marks}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                      {item.previous_score}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right tabular-nums">
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
                    <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] tabular-nums whitespace-nowrap">
                      {item.created_at}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenReport(item)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Generate printable academic report"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
