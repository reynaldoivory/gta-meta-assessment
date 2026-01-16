/**
 * GATEKEEPER SCHEMA DEFINITION
 * * We define three types of Gates:
 * 1. HARD_GATE: User MUST own this asset. (Non-negotiable)
 * 2. SOFT_GATE: User SHOULD have this stat. (negotiable, but creates risk penalty)
 * 3. GEAR_OVERRIDE: Specific gear that bypasses a Soft Gate (e.g., Scuba Suit bypasses Lung Capacity).
 */

export const TASK_REQUIREMENTS = {
    // HEISTS
    'cayo_perico': {
        hard_gates: ['kosatka'], 
        soft_gates: [
            { stat: 'flying', min: 40, penalty: 'high' },   // Setup missions require rapid helicopter travel
            { stat: 'strength', min: 60, penalty: 'medium' } // Stealth failures lead to combat
        ],
        gear_overrides: []
    },
    'casino_heist': {
        hard_gates: ['arcade'],
        soft_gates: [
            { stat: 'hacking', min: 70, penalty: 'critical' }, // Fingerprint hack is impossible with low skill
        ],
        gear_overrides: ['hacking_device_practice'] 
    },
    'dre_contract': {
        hard_gates: ['agency'],
        soft_gates: [
            { stat: 'shooting', min: 50, penalty: 'medium' } // heavy combat finale
        ],
        gear_overrides: ['heavy_armor']
    },
    
    // BUSINESSES
    'acid_lab_sell': {
        hard_gates: ['acid_lab', 'brickade_6x6'],
        soft_gates: [],
        gear_overrides: []
    },

    // GRINDING
    'sightseer_vip': {
        hard_gates: [],
        soft_gates: [
            { stat: 'flying', min: 20, penalty: 'low' } // Chopper highly recommended
        ],
        gear_overrides: ['oppressor_mk2'] // If they have an Oppressor, flying skill is irrelevant
    }
};

export const ASSET_LIBRARY = {
    'kosatka': { name: 'Kosatka Submarine', cost: 2200000, buyUrl: 'warstock' },
    'agency': { name: 'Agency', cost: 2010000, buyUrl: 'dynasty8_exec' },
    'arcade': { name: 'Arcade', cost: 1235000, buyUrl: 'mazebank_foreclosures' },
};
