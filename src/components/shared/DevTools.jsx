// src/components/shared/DevTools.jsx
// Development-only debug panel
import { useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { X, Code, Database } from 'lucide-react';
import { STORAGE_KEYS, LEGACY_READ_KEYS, getRaw, getJSON, clearAll } from '../../utils/storage/appStorage';

const DevTools = () => {
  const { formData, results } = useAssessment();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('state');

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-hud-blue hover:brightness-110 text-text-on-accent p-3 rounded-full shadow-glow-blue z-50"
        aria-label={isOpen ? 'Close dev tools' : 'Open dev tools'}
        title="Dev Tools"
      >
        <Code className="w-5 h-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-bg-surface border border-border rounded-lg shadow-float-lg z-50 max-h-[600px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dev Tools
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close dev tools"
              className="text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {['state', 'results', 'storage'].map(tab => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-bg-raised text-hud-blue border-b-2 border-hud-blue'
                    : 'text-text-muted hover:text-text-secondary'
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
                  <div className="text-text-muted mb-1">Form Data:</div>
                  <pre className="text-text-secondary overflow-auto max-h-64 bg-bg-base p-2 rounded">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                {results ? (
                  <pre className="text-text-secondary overflow-auto max-h-96 bg-bg-base p-2 rounded">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                ) : (
                  <div className="text-text-muted">No results yet</div>
                )}
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-2">
                <div>
                  <div className="text-text-muted mb-1">Draft:</div>
                  <div className="text-text-secondary">
                    {getRaw(LEGACY_READ_KEYS.DRAFT_V5_BROKEN) ? '✓ Saved' : '✗ None'}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted mb-1">Community Stats:</div>
                  <div className="text-text-secondary">
                    {getJSON(STORAGE_KEYS.COMMUNITY_STATS_POOL, []).length} entries
                  </div>
                </div>
                <div>
                  <div className="text-text-muted mb-1">Progress History:</div>
                  <div className="text-text-secondary">
                    {getJSON(LEGACY_READ_KEYS.PROGRESS_HISTORY_BROKEN, []).length} snapshots
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    globalThis.location.reload();
                  }}
                  className="mt-4 w-full px-3 py-2 bg-hud-pink hover:brightness-110 text-text-on-accent rounded text-xs"
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
