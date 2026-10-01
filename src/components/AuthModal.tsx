import React, { useState } from 'react';
import { User, Lock, Mail, X, Check, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onClose: () => void;
}

const PRESET_ACCOUNTS: UserProfile[] = [
  { id: 1, name: 'Dr. K. Sharma', email: 'sharma@university.edu' },
  { id: 2, name: 'Prof. Anita Roy', email: 'anita.roy@college.ac.in' },
  { id: 3, name: 'Student Academic Counselor', email: 'counseling@univ.edu' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLogin,
  onClose,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !name.trim()) {
      setFeedback('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setFeedback('Please provide both email and password.');
      return;
    }

    const newUser: UserProfile = {
      id: Date.now(),
      name: isRegister ? name.trim() : email.split('@')[0],
      email: email.trim().toLowerCase(),
    };

    onLogin(newUser);
    onClose();
  };

  const handleSelectPreset = (user: UserProfile) => {
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
            <span className="font-bold text-slate-900 text-sm">
              Academic Authentication (SQLite DB)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick profile switch */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Demo Faculty / Counselor Account
            </label>
            <div className="space-y-2">
              {PRESET_ACCOUNTS.map((account) => {
                const isSelected = currentUser.id === account.id;
                return (
                  <button
                    key={account.id}
                    onClick={() => handleSelectPreset(account)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {account.email}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">or sign in</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {feedback && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                {feedback}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className="w-full px-3 py-2 pl-8 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@university.edu"
                  className="w-full px-3 py-2 pl-8 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pl-8 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setFeedback(null);
              }}
              className="font-semibold text-slate-900 hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register New Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
