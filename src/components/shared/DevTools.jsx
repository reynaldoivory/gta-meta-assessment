// src/components/shared/DevTools.jsx
// Development-only debug panel
import React, { useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { X, Code, Database } from 'lucide-react';

const DevTools = () => {
  const { formData, results, step, version } = useAssessment();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('state');

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg z-50"
        title="Dev Tools"
      >
        <Code className="w-5 h-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dev Tools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {['state', 'results', 'storage'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 text-xs font-mono">
            {activeTab === 'state' && (
              <div className="space-y-2">
                <div>
                  <div className="text-slate-500 mb-1">Current Step:</div>
                  <div className="text-green-400">{step}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Context Version:</div>
                  <div className="text-blue-400">{version}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Form Data:</div>
                  <pre className="text-slate-300 overflow-auto max-h-64 bg-slate-950 p-2 rounded">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                {results ? (
                  <pre className="text-slate-300 overflow-auto max-h-96 bg-slate-950 p-2 rounded">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-500">No results yet</div>
                )}
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-2">
                <div>
                  <div className="text-slate-500 mb-1">Draft:</div>
                  <div className="text-slate-300">
                    {localStorage.getItem('gtaAssessmentDraft_v5') ? '✓ Saved' : '✗ None'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Community Stats:</div>
                  <div className="text-slate-300">
                    {JSON.parse(localStorage.getItem('gta_community_stats_pool') || '[]').length} entries
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Progress History:</div>
                  <div className="text-slate-300">
                    {JSON.parse(localStorage.getItem('gta_progress_history') || '[]').length} snapshots
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="mt-4 w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs"
                >
                  Clear All Storage
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DevTools;
