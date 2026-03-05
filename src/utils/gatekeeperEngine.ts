import { TASK_REQUIREMENTS } from '../config/gatekeeperSchema.js';

/**
 * @param {string} taskId - The ID of the activity (e.g., 'cayo_perico')
 * @param {object} userProfile - { stats: { flying: 20... }, assets: ['kosatka'] }
 * @returns {object} - { status: 'LOCKED' | 'WARNING' | 'GREEN', reason: string, score_penalty: number }
 */
export const checkGatekeeper = (taskId, userProfile) => {
    const rules = TASK_REQUIREMENTS[taskId];
    if (!rules) return { status: 'GREEN', reason: 'Optimal', score_penalty: 1.0 }; // No rules = safe

    // 1. CHECK HARD GATES (Assets)
    // If you don't own the sub, you simply cannot do the heist.
    const missingAssets = rules.hard_gates.filter(asset => !userProfile.assets.includes(asset));
    if (missingAssets.length > 0) {
        return {
            status: 'LOCKED',
            reason: `Missing Required Asset: ${missingAssets.join(', ')}`,
            score_penalty: 0 // Kill the score completely
        };
    }

    // 2. CHECK SOFT GATES (Stats & Skills)
    let penaltyMultiplier = 1.0;
    let warnings = [];

    rules.soft_gates.forEach(gate => {
        const userStat = userProfile.stats[gate.stat] || 0;
        
        // Check for Overrides (Implementation pending)
        
        if (userStat < gate.min) {
            // Calculate penalty severity
            if (gate.penalty === 'critical') penaltyMultiplier *= 0.1; // 90% reduction
            if (gate.penalty === 'high') penaltyMultiplier *= 0.4;     // 60% reduction
            if (gate.penalty === 'medium') penaltyMultiplier *= 0.7;   // 30% reduction
            if (gate.penalty === 'low') penaltyMultiplier *= 0.9;      // 10% reduction
            
            warnings.push(`Low ${gate.stat} (${userStat}/${gate.min})`);
        }
    });

    if (warnings.length > 0) {
        return {
            status: 'WARNING',
            reason: `Skill Issue: ${warnings.join(', ')}. Efficiency reduced.`,
            score_penalty: penaltyMultiplier
        };
    }

    return { status: 'GREEN', reason: 'Optimal', score_penalty: 1.0 };
};
