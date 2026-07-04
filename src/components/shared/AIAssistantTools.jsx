// src/components/shared/AIAssistantTools.jsx
import { BookOpen } from 'lucide-react';
import PropTypes from 'prop-types';
import { buildGoogleDocExport, buildWhatIfPrompt } from '../../utils/buildLLMPrompt';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui';

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
    <div className="bg-bg-surface border border-border rounded-2xl p-6">
      <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-hud-blue" />
        AI Assistant Tools
      </h2>
      <p className="text-sm text-text-muted mb-4">
        Paste these prompts into your AI assistant to cross-check against current weekly bonuses and GTA+ meta.
      </p>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleCopyLLM} disabled={!llmPrompt}>
            📋 Copy LLM Prompt
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyPlan} disabled={!planPrompt}>
            🔍 Copy LLM Prompt (Critique Plan)
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyJson} disabled={!jsonPayload}>
            📦 Copy JSON Payload
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyGoogleDoc} disabled={!results}>
            📄 Copy Google Doc Export
          </Button>
        </div>

        <div className="mt-4 space-y-2 pt-4 border-t border-border">
          <label htmlFor="what-if" className="block text-xs font-semibold text-text-muted">
            Optional: Describe a &quot;what if&quot; change to sanity-check with an AI assistant
          </label>
          <textarea
            id="what-if"
            value={whatIfText}
            onChange={(e) => setWhatIfText(e.target.value)}
            className="w-full rounded-lg bg-bg-raised border border-border p-2 text-xs text-text-primary resize-none h-16 focus:border-hud-blue focus:outline-none"
            placeholder='Example: "What if I buy Oppressor Mk II now instead of Nightclub?"'
          />
          <Button variant="secondary" size="sm" onClick={handleCopyWhatIf} disabled={!results}>
            💭 Copy LLM Prompt (with What-If)
          </Button>
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
