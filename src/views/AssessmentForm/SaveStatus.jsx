// src/views/AssessmentForm/SaveStatus.jsx
// Save status display component

import PropTypes from 'prop-types';

/**
 * Renders save status indicator
 * @param {boolean} localStorageAvailable - Whether localStorage is available
 * @param {boolean} isSaving - Whether currently saving
 * @param {Date|null} lastSaved - Last save timestamp
 * @returns {JSX.Element} Save status display
 */
export const SaveStatus = ({ localStorageAvailable, isSaving, lastSaved }) => {
  if (!localStorageAvailable) {
    return (
      <div className="text-xs text-amber-400 bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-500/40">
        ⚠️ Auto-save disabled (browser storage unavailable)
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-600 animate-pulse">
        💾 Saving...
      </div>
    );
  }

  if (lastSaved) {
    const timeAgo = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    let timeText = '';
    if (timeAgo < 5) timeText = 'just now';
    else if (timeAgo < 60) timeText = `${timeAgo}s ago`;
    else if (timeAgo < 3600) timeText = `${Math.floor(timeAgo / 60)}m ago`;
    else timeText = `${Math.floor(timeAgo / 3600)}h ago`;

    return (
      <div className="text-xs text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Saved {timeText}
      </div>
    );
  }

  return (
    <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
      No save yet
    </div>
  );
};

SaveStatus.propTypes = {
  localStorageAvailable: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  lastSaved: PropTypes.instanceOf(Date),
};

SaveStatus.defaultProps = {
  lastSaved: null,
};

/**
 * Helper function to render save status (for backwards compatibility)
 * @deprecated Use SaveStatus component instead
 */
export const renderSaveStatus = (localStorageAvailable, isSaving, lastSaved) => {
  return <SaveStatus
    localStorageAvailable={localStorageAvailable}
    isSaving={isSaving}
    lastSaved={lastSaved}
  />;
};
