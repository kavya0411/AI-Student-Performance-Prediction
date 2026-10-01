import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FolderArchive,
  Terminal,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PYTHON_FILES, downloadPythonProjectZip } from '../data/pythonProjectFiles';

export const PythonProjectViewer: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentFile =
    PYTHON_FILES.find((f) => f.name === selectedFileName) || PYTHON_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadPythonProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const lineCount = currentFile.code.split('\n').length;
  const byteSize = new Blob([currentFile.code]).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Python + Streamlit + Scikit-Learn Source Repository
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Original Project Code & ZIP Package
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Inspect all Python codebase files or export the complete ready-to-run repository with data and model folders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isDownloading ? 'Building ZIP Archive...' : 'Download Project .zip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* File Tabs */}
        <div className="flex items-center justify-between bg-slate-100/80 px-4 py-2 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-1">
            {PYTHON_FILES.map((file) => {
              const isSelected = file.name === selectedFileName;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileName(file.name)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pl-4 shrink-0">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              {lineCount} lines · {(byteSize / 1024).toFixed(1)} KB
            </span>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Description kicker */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>{currentFile.description}</span>
          <span className="font-mono text-[11px] text-slate-400">
            path: {currentFile.path}
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 text-slate-100 overflow-x-auto max-h-[600px] text-xs font-mono leading-relaxed">
          <pre className="select-text">
            <code>
              {currentFile.code.split('\n').map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell pr-4 text-slate-600 select-none text-right w-10">
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Execution Instructions Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-700" />
          Running the Python Streamlit Project Locally
        </h3>
        <p className="text-xs text-slate-600">
          Unzip the downloaded archive and run the following terminal commands:
        </p>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs space-y-1.5">
          <div className="text-slate-400"># 1. Install dependencies</div>
          <div>pip install -r requirements.txt</div>
          <div className="text-slate-400 pt-2"># 2. Generate the 200 synthetic student records</div>
          <div>python generate_dataset.py</div>
          <div className="text-slate-400 pt-2"># 3. Train the Random Forest classifier</div>
          <div>python train_model.py</div>
          <div className="text-slate-400 pt-2"># 4. Start the interactive Streamlit dashboard</div>
          <div className="text-emerald-400 font-bold">streamlit run app.py</div>
        </div>
      </div>
    </div>
  );
};
