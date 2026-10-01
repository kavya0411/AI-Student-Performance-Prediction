import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Clock,
  Award,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { PerformanceGrade, PredictionResult, StudentInput } from '../types';
import { calculateAcademicScore } from '../data/syntheticDataset';
import { generateRecommendations, globalModel } from '../lib/mlEngine';

interface PredictFormProps {
  onSavePrediction: (result: PredictionResult) => void;
  onOpenReport: (result: PredictionResult) => void;
  userId: number;
}

const PRESETS: { label: string; values: StudentInput }[] = [
  {
    label: 'High Achiever (Excellent)',
    values: {
      student_name: 'Aarav Patel',
      attendance: 94,
      study_hours: 6.5,
      assignment_score: 92,
      internal_marks: 88,
      previous_score: 90,
    },
  },
  {
    label: 'Consistent Student (Good)',
    values: {
      student_name: 'Priya Sharma',
      attendance: 82,
      study_hours: 4.2,
      assignment_score: 75,
      internal_marks: 72,
      previous_score: 78,
    },
  },
  {
    label: 'Borderline Passing (Average)',
    values: {
      student_name: 'Rohan Verma',
      attendance: 64,
      study_hours: 2.5,
      assignment_score: 55,
      internal_marks: 52,
      previous_score: 54,
    },
  },
  {
    label: 'Academic Risk (Poor)',
    values: {
      student_name: 'Kunal Sen',
      attendance: 48,
      study_hours: 1.2,
      assignment_score: 38,
      internal_marks: 40,
      previous_score: 36,
    },
  },
];

export const PredictForm: React.FC<PredictFormProps> = ({
  onSavePrediction,
  onOpenReport,
  userId,
}) => {
  const [formData, setFormData] = useState<StudentInput>({
    student_name: 'Ananya Gupta',
    attendance: 88,
    study_hours: 5.0,
    assignment_score: 85,
    internal_marks: 82,
    previous_score: 86,
  });

  const [lastResult, setLastResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof StudentInput,
    value: string | number
  ) => {
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === 'student_name'
          ? value
          : Math.max(0, Math.min(field === 'study_hours' ? 24 : 100, Number(value) || 0)),
    }));
  };

  const handleApplyPreset = (preset: StudentInput) => {
    setFormData(preset);
    setError(null);
  };

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name.trim()) {
      setError('Please provide a student name or identifier.');
      return;
    }

    const { attendance, study_hours, assignment_score, internal_marks, previous_score } =
      formData;

    const featureVector = [
      attendance,
      study_hours,
      assignment_score,
      internal_marks,
      previous_score,
    ];

    const { prediction, confidence, probabilities } = globalModel.predict(featureVector);
    const score = calculateAcademicScore(
      attendance,
      study_hours,
      assignment_score,
      internal_marks,
      previous_score
    );

    const recs = generateRecommendations(
      attendance,
      study_hours,
      assignment_score,
      internal_marks,
      previous_score,
      prediction
    );

    const newResult: PredictionResult = {
      id: `pred_${Date.now()}`,
      user_id: userId,
      student_name: formData.student_name.trim(),
      attendance,
      study_hours,
      assignment_score,
      internal_marks,
      previous_score,
      performance_score: score,
      prediction,
      confidence,
      probabilities,
      recommendations: recs,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setLastResult(newResult);
    onSavePrediction(newResult);
  };

  const getBadgeStyle = (grade: PerformanceGrade) => {
    switch (grade) {
      case 'Excellent':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Good':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Average':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Poor':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Predict Student Performance
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Evaluated by the Scikit-Learn Random Forest Classifier trained on 5 academic dimensions.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p.values)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handlePredict} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Personal & Habit metrics */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Name or ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    onChange={(e) => handleInputChange('student_name', e.target.value)}
                    placeholder="e.g. Rahul Sharma or STU201"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors"
                  />
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Attendance */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Attendance Percentage
                  </label>
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formData.attendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.attendance}
                  onChange={(e) => handleInputChange('attendance', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0%</span>
                  <span className={formData.attendance < 75 ? 'text-amber-600 font-medium' : ''}>
                    75% Minimum Required
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* Daily Study Hours */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Daily Self-Study Hours
                  </label>
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formData.study_hours} hrs/day
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={formData.study_hours}
                  onChange={(e) => handleInputChange('study_hours', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0 hrs</span>
                  <span>Target: 4-6 hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>
            </div>

            {/* Column 2: Assessment Metrics */}
            <div className="space-y-4">
              {/* Assignment Score */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Assignment Score (Weight: 20%)
                  </label>
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formData.assignment_score} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.assignment_score}
                  onChange={(e) => handleInputChange('assignment_score', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0</span>
                  <span>Pass: 40</span>
                  <span>100</span>
                </div>
              </div>

              {/* Internal Marks */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Internal Assessment Marks (Weight: 20%)
                  </label>
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formData.internal_marks} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.internal_marks}
                  onChange={(e) => handleInputChange('internal_marks', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0</span>
                  <span>Pass: 40</span>
                  <span>100</span>
                </div>
              </div>

              {/* Previous Exam Score */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Previous Semester Exam Score (Weight: 25%)
                  </label>
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formData.previous_score} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.previous_score}
                  onChange={(e) => handleInputChange('previous_score', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0</span>
                  <span>Pass: 40</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  student_name: '',
                  attendance: 75,
                  study_hours: 4.0,
                  assignment_score: 70,
                  internal_marks: 70,
                  previous_score: 70,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Inputs
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Generate ML Prediction
            </button>
          </div>
        </form>
      </div>

      {/* Result Section (when predicted) */}
      {lastResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500">
                Evaluation for <strong className="text-slate-800">{lastResult.student_name}</strong> · Evaluated at {lastResult.created_at}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Model Prediction Outcome
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenReport(lastResult)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4 text-slate-700" />
                View & Print Academic PDF Report
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-medium text-slate-500">
                Performance Score
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {lastResult.performance_score.toFixed(2)}%
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, lastResult.performance_score)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Weighted index across 5 academic indicators
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-medium text-slate-500">
                Predicted Performance
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-bold border rounded-md ${getBadgeStyle(
                    lastResult.prediction
                  )}`}
                >
                  {lastResult.prediction}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Random Forest classification tier
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-medium text-slate-500">
                Model Confidence
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {(lastResult.confidence * 100).toFixed(1)}%
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, lastResult.confidence * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Ensemble consensus across 100 decision trees
              </div>
            </div>
          </div>

          {/* Probability Distribution Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                Random Forest Probability Distribution
              </span>
              <span className="text-[11px] text-slate-500">
                Sum: 100% across 4 target classes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {(['Poor', 'Average', 'Good', 'Excellent'] as PerformanceGrade[]).map(
                (grade) => {
                  const prob = (lastResult.probabilities[grade] || 0) * 100;
                  const isWinner = lastResult.prediction === grade;
                  return (
                    <div
                      key={grade}
                      className={`p-2.5 rounded-md border text-center ${
                        isWinner
                          ? 'bg-white border-slate-400 shadow-xs'
                          : 'bg-slate-100/70 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-600">
                        {grade}
                      </div>
                      <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        {prob.toFixed(1)}%
                      </div>
                      <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${
                            isWinner ? 'bg-slate-900' : 'bg-slate-400'
                          }`}
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Feature Values Breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">
              Input Indicators vs. Academic Benchmark (0 - 100 Scale)
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Attendance',
                  val: lastResult.attendance,
                  unit: '%',
                  sub: 'Weight: 20%',
                },
                {
                  label: 'Study Hours (Normalized to 8h)',
                  val: Math.min((lastResult.study_hours / 8) * 100, 100),
                  unit: `${lastResult.study_hours}h`,
                  sub: 'Weight: 15%',
                },
                {
                  label: 'Assignment Score',
                  val: lastResult.assignment_score,
                  unit: '/100',
                  sub: 'Weight: 20%',
                },
                {
                  label: 'Internal Assessment Marks',
                  val: lastResult.internal_marks,
                  unit: '/100',
                  sub: 'Weight: 20%',
                },
                {
                  label: 'Previous Semester Exam Score',
                  val: lastResult.previous_score,
                  unit: '/100',
                  sub: 'Weight: 25%',
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {item.label}{' '}
                      <span className="text-slate-400 font-normal">({item.sub})</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {item.val.toFixed(1)}
                      {item.unit.startsWith('/') ? '' : ' '}
                      <span className="text-slate-500 font-normal text-[11px]">
                        {item.unit}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.val >= 75
                          ? 'bg-emerald-600'
                          : item.val >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, item.val)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
              Personalized Academic Recommendations
            </h3>
            <ul className="space-y-2">
              {lastResult.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
