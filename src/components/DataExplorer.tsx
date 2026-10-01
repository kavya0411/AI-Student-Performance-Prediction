import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { DatasetStudent, PerformanceGrade } from '../types';
import {
  DEFAULT_STUDENTS_DATASET,
  datasetToCsv,
  generateSyntheticDataset,
} from '../data/syntheticDataset';

interface DataExplorerProps {
  onQuickPredict: (student: DatasetStudent) => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ onQuickPredict }) => {
  const [dataset, setDataset] = useState<DatasetStudent[]>(DEFAULT_STUDENTS_DATASET);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof DatasetStudent>('Student_ID');
  const [sortAsc, setSortAsc] = useState(true);
  const [seed, setSeed] = useState(42);

  // Compute dataset averages
  const stats = useMemo(() => {
    if (dataset.length === 0) return null;
    const avgAtt = dataset.reduce((acc, s) => acc + s.Attendance, 0) / dataset.length;
    const avgStudy = dataset.reduce((acc, s) => acc + s.Study_Hours, 0) / dataset.length;
    const avgAssign = dataset.reduce((acc, s) => acc + s.Assignment_Score, 0) / dataset.length;
    const avgInternal = dataset.reduce((acc, s) => acc + s.Internal_Marks, 0) / dataset.length;
    const avgPrev = dataset.reduce((acc, s) => acc + s.Previous_Score, 0) / dataset.length;
    const avgScore = dataset.reduce((acc, s) => acc + s.Calculated_Score, 0) / dataset.length;

    const counts: Record<PerformanceGrade, number> = {
      Excellent: 0,
      Good: 0,
      Average: 0,
      Poor: 0,
    };
    dataset.forEach((s) => counts[s.Performance]++);

    return {
      avgAtt: avgAtt.toFixed(1),
      avgStudy: avgStudy.toFixed(1),
      avgAssign: avgAssign.toFixed(1),
      avgInternal: avgInternal.toFixed(1),
      avgPrev: avgPrev.toFixed(1),
      avgScore: avgScore.toFixed(1),
      counts,
    };
  }, [dataset]);

  // Filter and sort
  const filteredData = useMemo(() => {
    return dataset
      .filter((s) => {
        const matchesGrade = filterGrade === 'All' || s.Performance === filterGrade;
        const matchesSearch =
          s.Student_ID.toLowerCase().includes(search.toLowerCase()) ||
          s.Student_Name.toLowerCase().includes(search.toLowerCase());
        return matchesGrade && matchesSearch;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      });
  }, [dataset, search, filterGrade, sortField, sortAsc]);

  const handleSort = (field: keyof DatasetStudent) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDownloadCsv = () => {
    const csv = datasetToCsv(dataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setDataset(generateSyntheticDataset(nextSeed, 200));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Training & Benchmark Dataset
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Synthetic Academic Records ({dataset.length} Samples)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Generated via Python script logic (<code className="font-mono text-slate-800">generate_dataset.py</code>, Seed: {seed}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              title="Reseed and regenerate synthetic distribution"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate (Seed: {seed})</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download students.csv</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-200 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500 font-medium">Avg Attendance</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {stats.avgAtt}%
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500 font-medium">Avg Study Hours</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {stats.avgStudy} hrs/day
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500 font-medium">Avg Assignment</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {stats.avgAssign}/100
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500 font-medium">Avg Internal Marks</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {stats.avgInternal}/100
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500 font-medium">Avg Previous Exam</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {stats.avgPrev}/100
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500 font-medium">Avg Index Score</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {stats.avgScore}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        {/* Search & Filter toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Student ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Interactive filter tabs */}
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
                {stats && grade !== 'All' && (
                  <span className="ml-1 text-[10px] text-slate-500">
                    ({stats.counts[grade as PerformanceGrade]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-slate-600 font-semibold">
                <th
                  onClick={() => handleSort('Student_ID')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Student ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Student_Name')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Attendance')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Study_Hours')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Study (h)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Assignment_Score')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Assignment</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Internal_Marks')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Internal</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Previous_Score')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Previous</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Calculated_Score')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Performance Tier</th>
                <th className="py-3 px-3 text-right">Quick Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.slice(0, 50).map((s) => (
                <tr key={s.Student_ID} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                    {s.Student_ID}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {s.Student_Name}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                    {s.Attendance}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                    {s.Study_Hours}h
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                    {s.Assignment_Score}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                    {s.Internal_Marks}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 text-right tabular-nums">
                    {s.Previous_Score}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right tabular-nums">
                    {s.Calculated_Score.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded border ${
                        s.Performance === 'Excellent'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : s.Performance === 'Good'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : s.Performance === 'Average'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}
                    >
                      {s.Performance}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onQuickPredict(s)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      title="Load into prediction engine"
                    >
                      Predict
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {Math.min(50, filteredData.length)} of {filteredData.length} records (showing first 50 for optimal render performance)
          </span>
          <span>Full 200 records available in CSV export</span>
        </div>
      </div>
    </div>
  );
};
