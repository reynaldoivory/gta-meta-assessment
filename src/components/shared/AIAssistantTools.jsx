// src/components/shared/AIAssistantTools.jsx
import PropTypes from 'prop-types';
import { BookOpen } from 'lucide-react';
import { buildGoogleDocExport, buildWhatIfPrompt } from '../../utils/buildLLMPrompt';
import { useToast } from '../../context/ToastContext';

/**
 * Copies text to clipboard with toast notification (no blocking alert).
 */
const copyToClipboard = async (text, notify, successMessage = 'Copied to clipboard!') => {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(text);
    notify(successMessage, 'success');
  } catch (_err) {
    notify('Failed to copy. Please try again.', 'error');
  }
};

const CopyButton = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

CopyButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * AI prompt copy tools + what-if textarea for LLM-assisted plan review.
 */
export const AIAssistantTools = ({
  formData, results, actionPlan, weeklyBonuses,
  llmPrompt, planPrompt, jsonPayload,
  whatIfText, setWhatIfText,
}) => {
  const { showToast } = useToast();
  const handleCopyLLM = () => copyToClipboard(llmPrompt, showToast, 'LLM prompt copied to clipboard!');
  const handleCopyPlan = () => copyToClipboard(planPrompt, showToast, 'Plan critique prompt copied!');
  const handleCopyJson = () => copyToClipboard(JSON.stringify(jsonPayload, null, 2), showToast, 'JSON payload copied!');
  const handleCopyGoogleDoc = () => {
    const doc = buildGoogleDocExport({ formData, assessmentResults: results, actionPlan });
    copyToClipboard(doc, showToast, 'Google Doc export copied to clipboard!');
  };
  const handleCopyWhatIf = () => {
    const prompt = buildWhatIfPrompt({
      formData,
      assessmentResults: results,
      whatIf: whatIfText || 'No specific change, just confirm best actions.',
      weeklyBonuses,
    });
    copyToClipboard(prompt, showToast, 'What-if prompt copied!');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-400" />
        AI Assistant Tools
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Paste these prompts into your AI assistant to cross-check against current weekly bonuses and GTA+ meta.
      </p>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <CopyButton onClick={handleCopyLLM} disabled={!llmPrompt} className="bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-600">
            📋 Copy LLM Prompt
          </CopyButton>
          <CopyButton onClick={handleCopyPlan} disabled={!planPrompt} className="bg-purple-900/40 hover:bg-purple-900/70 text-purple-100 border border-purple-500/40">
            🔍 Copy LLM Prompt (Critique Plan)
          </CopyButton>
          <CopyButton onClick={handleCopyJson} disabled={!jsonPayload} className="bg-green-900/40 hover:bg-green-900/70 text-green-100 border border-green-500/40">
            📦 Copy JSON Payload
          </CopyButton>
          <CopyButton onClick={handleCopyGoogleDoc} disabled={!results} className="bg-orange-900/40 hover:bg-orange-900/70 text-orange-100 border border-orange-500/40">
            📄 Copy Google Doc Export
          </CopyButton>
        </div>

        <div className="mt-4 space-y-2 pt-4 border-t border-slate-700/50">
          <label htmlFor="what-if" className="block text-xs font-semibold text-slate-400">
            Optional: Describe a &quot;what if&quot; change to sanity-check with an AI assistant
          </label>
          <textarea
            id="what-if"
            value={whatIfText}
            onChange={(e) => setWhatIfText(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-slate-100 resize-none h-16 focus:border-blue-500 focus:outline-none"
            placeholder='Example: "What if I buy Oppressor Mk II now instead of Nightclub?"'
          />
          <CopyButton onClick={handleCopyWhatIf} disabled={!results} className="bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-600">
            💭 Copy LLM Prompt (with What-If)
          </CopyButton>
        </div>
      </div>
    </div>
  );
};

AIAssistantTools.propTypes = {
  formData: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  actionPlan: PropTypes.array.isRequired,
  weeklyBonuses: PropTypes.array.isRequired,
  llmPrompt: PropTypes.string,
  planPrompt: PropTypes.string,
  jsonPayload: PropTypes.object,
  whatIfText: PropTypes.string,
  setWhatIfText: PropTypes.func.isRequired,
};
