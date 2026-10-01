import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle,
  HelpCircle,
  BarChart,
  Grid,
  FileCode,
} from 'lucide-react';
import { ModelMetrics, PerformanceGrade } from '../types';
import { DEFAULT_STUDENTS_DATASET } from '../data/syntheticDataset';
import { CLASS_NAMES, FEATURE_NAMES, RandomForestModel, globalModel } from '../lib/mlEngine';

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics>(() => {
    // Train once initially
    return globalModel.train(DEFAULT_STUDENTS_DATASET, 0.2);
  });

  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(6);
  const [testSplit, setTestSplit] = useState(20);
  const [isRetraining, setIsRetraining] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      globalModel.nEstimators = nEstimators;
      globalModel.maxDepth = maxDepth;
      const newMetrics = globalModel.train(
        DEFAULT_STUDENTS_DATASET,
        testSplit / 100
      );
      setMetrics(newMetrics);
      setIsRetraining(false);
    }, 300);
  };

  const featureLabels: Record<string, string> = {
    Previous_Score: 'Previous Exam Score',
    Attendance: 'Class Attendance (%)',
    Assignment_Score: 'Assignment Work Score',
    Internal_Marks: 'Internal Assessments',
    Study_Hours: 'Daily Study Hours',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scikit-Learn Model Architecture
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Random Forest Classifier Evaluation & Metrics
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Supervised multiclass classification across 4 performance tiers (<code className="font-mono text-slate-800">model/metrics.json</code>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-mono">
              Dataset: 200 records · 80/20 Stratified Split
            </span>
          </div>
        </div>

        {/* Evaluation Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-200">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-medium text-slate-500">Test Accuracy</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {(metrics.accuracy * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Overall correct predictions
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-medium text-slate-500">Weighted Precision</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {(metrics.precision * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              True positives / Predicted positives
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-medium text-slate-500">Weighted Recall</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {(metrics.recall * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              True positives / Actual positives
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-medium text-slate-500">Weighted F1-Score</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {(metrics.f1_score * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Harmonic mean of precision & recall
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                4×4 Confusion Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Actual Ground Truth vs. Model Predicted Class (Test Set: {metrics.testing_samples} samples)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <div className="min-w-[320px]">
              {/* Matrix Header */}
              <div className="text-center text-xs font-semibold text-slate-700 mb-1">
                Predicted Class →
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-xs text-center">
                {/* Blank top-left */}
                <div className="font-semibold text-slate-500 flex items-center justify-center p-2">
                  Actual ↓
                </div>
                {CLASS_NAMES.map((name) => (
                  <div
                    key={name}
                    className="p-2 font-semibold text-slate-700 bg-slate-100 rounded"
                  >
                    {name}
                  </div>
                ))}

                {CLASS_NAMES.map((actualName, rowIdx) => (
                  <React.Fragment key={actualName}>
                    <div className="p-2 font-semibold text-slate-700 bg-slate-100 rounded flex items-center justify-center">
                      {actualName}
                    </div>
                    {CLASS_NAMES.map((_predName, colIdx) => {
                      const count = metrics.confusion_matrix[rowIdx]?.[colIdx] || 0;
                      const isDiagonal = rowIdx === colIdx;
                      return (
                        <div
                          key={colIdx}
                          className={`p-3 rounded font-mono font-bold text-sm tabular-nums flex items-center justify-center transition-colors ${
                            isDiagonal
                              ? count > 0
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-50 text-slate-400'
                              : count > 0
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-slate-50 text-slate-400'
                          }`}
                        >
                          {count}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400 inline-block" />
                  Diagonal (Correct Classifications)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-200 border border-rose-400 inline-block" />
                  Off-Diagonal (Misclassifications)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Feature Importance (Random Forest Gini Impurity)
            </h2>
            <p className="text-xs text-slate-500">
              Relative contribution of each predictor to tree node split variance
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(metrics.feature_importance)
              .sort(([, a], [, b]) => b - a)
              .map(([feat, imp]) => {
                const pct = (imp * 100).toFixed(1);
                return (
                  <div key={feat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {featureLabels[feat] || feat}
                      </span>
                      <span className="font-mono text-slate-900 tabular-nums font-bold">
                        {pct}% ({imp.toFixed(4)})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <strong>Observation:</strong> <span className="font-mono">Previous_Score</span> and{' '}
            <span className="font-mono">Attendance</span> contribute over 48% of the total predictive power,
            aligning with standard educational research findings.
          </div>
        </div>
      </div>

      {/* Retraining Hyperparameter Sandbox */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Live Hyperparameter Tuning Sandbox
            </h2>
            <p className="text-xs text-slate-500">
              Re-fit the decision tree ensemble in real-time and observe metric shifts
            </p>
          </div>

          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Fitting Ensemble...' : 'Retrain Random Forest'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {/* n_estimators */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Number of Trees (n_estimators)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {nEstimators} trees
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="20"
              value={nEstimators}
              onChange={(e) => setNEstimators(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>20</span>
              <span>Default: 100</span>
              <span>200</span>
            </div>
          </div>

          {/* max_depth */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Max Tree Depth</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {maxDepth} levels
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>3 (Low Overfit)</span>
              <span>Default: 6</span>
              <span>12 (Deep)</span>
            </div>
          </div>

          {/* test_split */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Test Split Ratio</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {testSplit}% test ({200 - Math.floor(200 * (testSplit / 100))} train / {Math.floor(200 * (testSplit / 100))} test)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={testSplit}
              onChange={(e) => setTestSplit(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>10%</span>
              <span>Standard: 20%</span>
              <span>40%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
