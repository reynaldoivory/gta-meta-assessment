// src/views/PriorityActionPlan.jsx
import React, { useMemo, useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { buildCompactActionPlan, buildSessionPlan } from '../utils/actionPlanBuilder';
import { prioritizeActions } from '../utils/actionPriority';
import { buildLLMPrompt, buildPlanCritiquePrompt, buildLLMJsonPayload, buildGoogleDocExport, buildWhatIfPrompt } from '../utils/buildLLMPrompt';
import { getWeeklyBonuses } from '../config/weeklyEvents';
import { ArrowLeft, Target, Clock, BookOpen, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import ActionPlan from '../components/ActionPlan';

const PriorityActionPlan = () => {
  const { formData, results, setStep, whatIfText, setWhatIfText } = useAssessment();
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const sessionPlan = useMemo(() => {
    if (!results) return null;
    try {
      return buildSessionPlan({ formData, results, sessionMinutes });
    } catch (e) {
      console.error('Error building session plan:', e);
      return null;
    }
  }, [formData, results, sessionMinutes]);

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('results')}
            className="mb-4 text-slate-400 hover:text-white"
          >
            ← Back to Results
          </button>
          <p className="text-slate-400">No assessment results available.</p>
        </div>
      </div>
    );
  }

  // Prioritize bottlenecks using the priority sorter (ensures urgent events are first)
  let prioritizedBottlenecks = [];
  let actionPlan = [];
  let weeklyBonuses = [];
  
  try {
    prioritizedBottlenecks = prioritizeActions(
      results.bottlenecks || [],
      Number(formData.liquidCash) || 0,
      results.incomePerHour || 0
    );
    
    actionPlan = buildCompactActionPlan(prioritizedBottlenecks, results.heistReady, formData, results);
    weeklyBonuses = getWeeklyBonuses();
  } catch (error) {
    console.error('Error building action plan:', error);
    // Fallback to empty arrays to prevent crash
    prioritizedBottlenecks = [];
    actionPlan = [];
    weeklyBonuses = [];
  }

  const renderSessionCard = (label, action) => {
    if (!action) {
      return (
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/40">
          <div className="text-xs font-bold text-slate-400 mb-2">{label}</div>
          <div className="text-slate-400 text-sm">No recommendation found for this slot.</div>
        </div>
      );
    }

    const blocked = action.blockedBy && action.blockedBy.length > 0;
    const multiplier = action.launchesPassiveTimer ? '3× Passive Multiplier' : null;
    const velocity = typeof action.unlockVelocity === 'number' ? `Unlock Velocity: ${action.unlockVelocity}` : null;

    return (
      <div className={`p-4 rounded-xl border ${blocked ? 'border-red-500/40 bg-red-950/10' : 'border-slate-700 bg-slate-900/40'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-400">{label}</div>
          <div className="flex items-center gap-2">
            {action.estimatedMinutes != null && (
              <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.estimatedMinutes}m
              </span>
            )}
            {multiplier && (
              <span className="text-xs text-cyan-300 bg-cyan-900/20 border border-cyan-500/20 px-2 py-1 rounded">
                {multiplier}
              </span>
            )}
            {velocity && (
              <span className="text-xs text-purple-300 bg-purple-900/20 border border-purple-500/20 px-2 py-1 rounded">
                {velocity}
              </span>
            )}
          </div>
        </div>

        <div className="text-white font-bold">{action.title}</div>
        <div className="text-slate-300 text-sm mt-1">{action.why}</div>

        {blocked && (
          <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-900/10">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-red-400 font-bold mb-1">GATEKEEPER BLOCK</div>
                <div className="text-xs text-red-300">{action.blockedBy.join(', ')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleCopyToClipboard = async (text, successMessage = 'Copied to clipboard!') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert(successMessage);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(successMessage);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy. Please try again.');
    }
  };

  // Build LLM prompts safely
  let llmPrompt = '';
  let planPrompt = '';
  let jsonPayload = {};
  
  try {
    llmPrompt = buildLLMPrompt({ formData, assessmentResults: results, weeklyBonuses });
    planPrompt = buildPlanCritiquePrompt({
      formData,
      assessmentResults: results,
      actionPlan,
      weeklyBonuses,
    });
    jsonPayload = buildLLMJsonPayload({ formData, assessmentResults: results });
  } catch (error) {
    console.error('Error building LLM prompts:', error);
    // Fallback to empty values
  }

  const handleCopyLLMPrompt = () => handleCopyToClipboard(llmPrompt, 'LLM prompt copied to clipboard!');
  const handleCopyPlanCritique = () => handleCopyToClipboard(planPrompt, 'Plan critique prompt copied!');
  const handleCopyJson = () => {
    const jsonString = JSON.stringify(jsonPayload, null, 2);
    handleCopyToClipboard(jsonString, 'JSON payload copied!');
  };
  const handleCopyGoogleDoc = () => {
    const googleDoc = buildGoogleDocExport({ formData, assessmentResults: results, actionPlan });
    handleCopyToClipboard(googleDoc, 'Google Doc export copied to clipboard!');
  };
  const handleCopyWhatIf = () => {
    const whatIfPrompt = buildWhatIfPrompt({
      formData,
      assessmentResults: results,
      whatIf: whatIfText || 'No specific change, just confirm best actions.',
      weeklyBonuses,
    });
    handleCopyToClipboard(whatIfPrompt, 'What-if prompt copied!');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700">
          <button 
            onClick={() => setStep('results')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </button>
          <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Priority Action Plan
          </div>
        </div>

        {/* Session Optimizer - Dynamic Recommendations */}
        <div className="bg-slate-900/60 border border-green-900/30 rounded-2xl overflow-hidden">
          <ActionPlan />
        </div>

        {/* Time to Goal Card */}
        {results.nextGoal && (
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500 rounded-lg p-4">
            <h3 className="text-xl font-bold text-green-400 mb-2">
              🎯 Next Goal: {results.nextGoal.name}
            </h3>
            
            {results.nextGoal.canAffordNow ? (
              <p className="text-green-300 text-lg">✅ You can buy this NOW!</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Cost:</span>
                  <span className="font-mono">${results.nextGoal.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>You have:</span>
                  <span className="font-mono">${results.nextGoal.currentCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Need:</span>
                  <span className="font-mono">${results.nextGoal.needed.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-lg text-green-300">
                    ⏱️ <strong>{results.nextGoal.hoursRemaining}hrs</strong> of grinding
                  </p>
                  <p className="text-sm text-slate-400">
                    Best method: {results.nextGoal.fastestGrind}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Consultant */}
        {sessionPlan && (
          <div className="bg-slate-900/60 border border-emerald-900/30 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Session Consultant</h3>
                <p className="text-sm text-slate-400">
                  Compound Efficiency: start passive clocks first, then bridge with best executable money, then invest in unlocks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">I have</span>
                <select
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderSessionCard('1) The Tax (first 5 mins)', sessionPlan.tax)}
              {renderSessionCard('2) The Bridge (main block)', sessionPlan.bridge)}
              {renderSessionCard('3) The Investment (final mins)', sessionPlan.investment)}
            </div>

            <div className="mt-4 text-xs text-slate-400">
              Passive systems maxed: <span className={sessionPlan.meta?.passiveProgress?.allMaxed ? 'text-emerald-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                {sessionPlan.meta?.passiveProgress?.readyCount ?? 0}/{sessionPlan.meta?.passiveProgress?.total ?? 4}
              </span>
              {!sessionPlan.meta?.passiveProgress?.allMaxed && (
                <span className="ml-2 text-slate-500">
                  (linear grinds are de-prioritized until passives are upgraded)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {actionPlan && actionPlan.length > 0 ? (
          <div className="bg-slate-900/60 border border-blue-900/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-blue-400 w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Action Plan</h3>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                {actionPlan.length} steps
              </span>
            </div>
            <div className="space-y-3">
              {actionPlan.map((action, idx) => {
                const isUrgent = action.urgency === 'URGENT' || action.urgency === 'BUY NOW' || action.urgency === 'GRIND NOW';
                const isBlocker = action.urgency === 'BLOCKER';
                
                return (
                  <div 
                    key={idx}
                    className={`
                      p-5 rounded-xl border-2 transition-all
                      ${isUrgent ? 'bg-yellow-900/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20' : ''}
                      ${isBlocker ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-500/20' : ''}
                      ${!isUrgent && !isBlocker ? 'bg-slate-900/60 border-slate-700' : ''}
                    `}
                  >
                    {/* Urgency badges */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isUrgent && (
                          <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded flex items-center gap-1">
                            ⚡ URGENT
                          </span>
                        )}
                        
                        {isBlocker && (
                          <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold rounded flex items-center gap-1">
                            🚨 BLOCKER
                          </span>
                        )}
                        
                        {action.timeRemaining && (
                          <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {action.timeRemaining} left
                          </span>
                        )}
                      </div>
                      
                      {typeof action.priority === 'number' && (
                        <span className="text-xs font-bold text-slate-500">
                          #{action.priority + 1}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h4 className={`text-lg font-bold mb-2 ${
                      isUrgent ? 'text-yellow-300' : 
                      isBlocker ? 'text-red-300' : 
                      'text-white'
                    }`}>
                      {action.title}
                    </h4>
                    
                    {/* Why */}
                    <p className="text-slate-300 text-sm mb-3">
                      {action.why}
                    </p>
                    
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {action.cost !== undefined && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-400" />
                          <span className="text-slate-400">Cost:</span>
                          <span className="text-white font-semibold">
                            ${(action.cost / 1000000).toFixed(2)}M
                          </span>
                        </div>
                      )}
                      
                      {(action.timeToComplete || action.timeEstimate) && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span className="text-slate-400">Time:</span>
                          <span className="text-white font-semibold">
                            {action.timeToComplete || action.timeEstimate}
                          </span>
                        </div>
                      )}
                      
                      {action.earnings && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-slate-400">Earns:</span>
                          <span className="text-green-400 font-semibold">
                            {action.earnings}
                          </span>
                        </div>
                      )}
                      
                      {action.potentialEarnings && (
                        <div className="flex items-center gap-1 col-span-2">
                          <TrendingUp className="w-3 h-3 text-yellow-400" />
                          <span className="text-slate-400">Potential:</span>
                          <span className="text-yellow-400 font-bold">
                            {action.potentialEarnings}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Blocker warning */}
                    {action.blockedBy && action.blockedBy.length > 0 && (
                      <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-red-400 font-bold mb-1">BLOCKED BY:</div>
                            <div className="text-xs text-red-300">
                              {action.blockedBy.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Method/timing notes */}
                    {(action.method || action.timing || action.methodDetails || action.alternativeMethod || action.avoidMethod) && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        {action.method && (
                          <div className="text-xs text-slate-400">
                            <span className="font-semibold">Method:</span> {action.method}
                          </div>
                        )}
                        {action.methodDetails && (
                          <div className="text-xs text-slate-400 mt-1 ml-4 whitespace-pre-line">
                            {action.methodDetails}
                          </div>
                        )}
                        {action.alternativeMethod && (
                          <div className="text-xs text-slate-500 mt-1 italic">
                            {action.alternativeMethod}
                          </div>
                        )}
                        {action.avoidMethod && (
                          <div className="text-xs text-red-400 mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                            {action.avoidMethod}
                          </div>
                        )}
                        {action.timing && (
                          <div className="text-xs text-slate-400 mt-1">
                            <span className="font-semibold">Timing:</span> {action.timing}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Progress calculator for strength training */}
                    {action.impactsNeeded && action.currentStat && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="text-xs font-semibold text-slate-400 mb-2">Progress Calculator:</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="bg-slate-900/50 p-2 rounded">
                            <div className="text-slate-500">Current</div>
                            <div className="text-red-400 font-bold">{action.currentStat}</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded">
                            <div className="text-slate-500">Target</div>
                            <div className="text-green-400 font-bold">{action.targetStat}</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded">
                            <div className="text-slate-500">Punches Needed</div>
                            <div className="text-yellow-400 font-bold">{action.impactsNeeded}</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded">
                            <div className="text-slate-500">Est. Time</div>
                            <div className="text-blue-400 font-bold">{action.timeToComplete}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Prerequisites */}
                    {action.prerequisites && action.prerequisites.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-700">
                        <span className="text-xs text-slate-500">Requires:</span>
                        {action.prerequisites.map((prereq, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-slate-900/50 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 text-center">
            <p className="text-slate-400">No specific actions needed. You're doing great!</p>
          </div>
        )}

        {/* AI Assistant Tools */}
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
              <button
                onClick={handleCopyLLMPrompt}
                disabled={!llmPrompt}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-lg transition-all border border-slate-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📋 Copy LLM Prompt
              </button>
              <button
                onClick={handleCopyPlanCritique}
                disabled={!planPrompt}
                className="px-4 py-2 bg-purple-900/40 hover:bg-purple-900/70 text-purple-100 rounded-lg transition-all border border-purple-500/40 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 Copy LLM Prompt (Critique Plan)
              </button>
              <button
                onClick={handleCopyJson}
                disabled={!jsonPayload}
                className="px-4 py-2 bg-green-900/40 hover:bg-green-900/70 text-green-100 rounded-lg transition-all border border-green-500/40 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📦 Copy JSON Payload
              </button>
              <button
                onClick={handleCopyGoogleDoc}
                disabled={!results}
                className="px-4 py-2 bg-orange-900/40 hover:bg-orange-900/70 text-orange-100 rounded-lg border border-orange-500/40 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📄 Copy Google Doc Export
              </button>
            </div>

            <div className="mt-4 space-y-2 pt-4 border-t border-slate-700/50">
              <label htmlFor="what-if" className="block text-xs font-semibold text-slate-400">
                Optional: Describe a "what if" change to sanity-check with an AI assistant
              </label>
              <textarea
                id="what-if"
                value={whatIfText}
                onChange={(e) => setWhatIfText(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-slate-100 resize-none h-16 focus:border-blue-500 focus:outline-none"
                placeholder='Example: "What if I buy Oppressor Mk II now instead of Nightclub?"'
              />
              <button
                onClick={handleCopyWhatIf}
                disabled={!results}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💭 Copy LLM Prompt (with What-If)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityActionPlan;
