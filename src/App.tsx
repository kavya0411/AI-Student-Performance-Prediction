import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PredictForm } from './components/PredictForm';
import { DataExplorer } from './components/DataExplorer';
import { ModelPerformance } from './components/ModelPerformance';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { PythonProjectViewer } from './components/PythonProjectViewer';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { DatasetStudent, PredictionResult, UserProfile } from './types';

const INITIAL_HISTORY: PredictionResult[] = [
  {
    id: 'pred_101',
    user_id: 1,
    student_name: 'Tanvi Deshmukh',
    attendance: 95,
    study_hours: 6.0,
    assignment_score: 90,
    internal_marks: 88,
    previous_score: 92,
    performance_score: 90.75,
    prediction: 'Excellent',
    confidence: 0.942,
    probabilities: { Poor: 0.01, Average: 0.02, Good: 0.03, Excellent: 0.94 },
    recommendations: [
      'Your academic indicators are exceptionally strong. Maintain your structured daily routine and mentor peers.',
    ],
    created_at: '2026-09-28 14:22:10',
  },
  {
    id: 'pred_102',
    user_id: 1,
    student_name: 'Aditya Nair',
    attendance: 84,
    study_hours: 4.5,
    assignment_score: 76,
    internal_marks: 74,
    previous_score: 80,
    performance_score: 78.43,
    prediction: 'Good',
    confidence: 0.885,
    probabilities: { Poor: 0.02, Average: 0.09, Good: 0.89, Excellent: 0.00 },
    recommendations: [
      'Focus on internal mid-term exam preparation and revise foundational concepts.',
    ],
    created_at: '2026-09-28 16:05:40',
  },
  {
    id: 'pred_103',
    user_id: 1,
    student_name: 'Manish Rawat',
    attendance: 62,
    study_hours: 2.2,
    assignment_score: 54,
    internal_marks: 50,
    previous_score: 56,
    performance_score: 54.43,
    prediction: 'Average',
    confidence: 0.864,
    probabilities: { Poor: 0.05, Average: 0.86, Good: 0.09, Excellent: 0.00 },
    recommendations: [
      'Improve attendance and maintain regular class participation (target: ≥75%).',
      'Gradually increase daily study time and follow a consistent timetable schedule.',
    ],
    created_at: '2026-09-29 09:15:22',
  },
  {
    id: 'pred_104',
    user_id: 1,
    student_name: 'Vikram Choudhary',
    attendance: 46,
    study_hours: 1.0,
    assignment_score: 38,
    internal_marks: 35,
    previous_score: 39,
    performance_score: 38.08,
    prediction: 'Poor',
    confidence: 0.912,
    probabilities: { Poor: 0.91, Average: 0.09, Good: 0.00, Excellent: 0.00 },
    recommendations: [
      'Improve attendance and maintain regular class participation (target: ≥75%).',
      'Gradually increase daily study time and follow a consistent timetable schedule.',
      'Review assignment feedback thoroughly and complete additional guided practice problems.',
      'Focus on internal mid-term exam preparation and revise foundational concepts.',
      'Diagnose errors from previous exams and solve mock test papers under timed conditions.',
    ],
    created_at: '2026-09-29 10:45:00',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sp_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      id: 1,
      name: 'Dr. K. Sharma',
      email: 'sharma@university.edu',
    };
  });

  const [history, setHistory] = useState<PredictionResult[]>(() => {
    const saved = localStorage.getItem('sp_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_HISTORY;
  });

  const [selectedReportResult, setSelectedReportResult] =
    useState<PredictionResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sp_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('sp_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleSavePrediction = (newResult: PredictionResult) => {
    setHistory((prev) => [newResult, ...prev]);
  };

  const handleDeletePrediction = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all prediction history?')) {
      setHistory([]);
    }
  };

  const handleQuickPredict = (student: DatasetStudent) => {
    setActiveTab('predict');
  };

  const handleLogout = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* 3-zone Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            history={history}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenReport={(res) => setSelectedReportResult(res)}
          />
        )}

        {activeTab === 'predict' && (
          <PredictForm
            onSavePrediction={handleSavePrediction}
            onOpenReport={(res) => setSelectedReportResult(res)}
            userId={currentUser.id}
          />
        )}

        {activeTab === 'dataset' && (
          <DataExplorer onQuickPredict={handleQuickPredict} />
        )}

        {activeTab === 'model' && <ModelPerformance />}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onDelete={handleDeletePrediction}
            onClearAll={handleClearAllHistory}
            onOpenReport={(res) => setSelectedReportResult(res)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView history={history} />}

        {activeTab === 'python' && <PythonProjectViewer />}
      </main>

      {/* Printable / Viewable Report Modal */}
      {selectedReportResult && (
        <ReportModal
          result={selectedReportResult}
          onClose={() => setSelectedReportResult(null)}
        />
      )}

      {/* Auth / Profile Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onLogin={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto no-print text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Student Performance Prediction System · B.Tech CSE (AI & ML) Academic Project
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Python 3.12</span>
            <span>·</span>
            <span>Scikit-Learn Random Forest</span>
            <span>·</span>
            <span>Streamlit / React SPA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
