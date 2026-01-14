# 🗺️ Feature Roadmap

## 🚀 Quick Wins (1-2 hours each)

### 1. **Keyboard Shortcuts**
**Impact:** High | **Effort:** Low

Add keyboard shortcuts for power users:
- `Ctrl/Cmd + S` - Save form (show toast notification)
- `Ctrl/Cmd + R` - Run assessment
- `Ctrl/Cmd + E` - Export CSV
- `Ctrl/Cmd + /` - Show shortcuts help modal
- `Esc` - Close modals/return to form

**Implementation:**
```jsx
// src/utils/keyboardShortcuts.js
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save logic
      }
      // ... more shortcuts
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

---

### 2. **Form Auto-Save Indicator**
**Impact:** Medium | **Effort:** Low

Visual feedback when form auto-saves:
- Show "💾 Saved" badge when localStorage write succeeds
- Show "⚠️ Saving..." spinner during debounce
- Show "❌ Save failed" if localStorage quota exceeded

**Implementation:**
```jsx
// In AssessmentContext.jsx
const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
```

---

### 3. **Undo/Redo for Form Changes**
**Impact:** High | **Effort:** Medium

Allow users to undo accidental changes:
- Store form history in context (last 10 states)
- `Ctrl/Cmd + Z` to undo, `Ctrl/Cmd + Shift + Z` to redo
- Show undo/redo buttons in form header

**Implementation:**
```jsx
// In AssessmentContext.jsx
const [formHistory, setFormHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

---

### 4. **Compare with Last Week**
**Impact:** High | **Effort:** Low

Show delta comparison card in results:
- "📈 Score improved by +5 points"
- "💰 Income increased by $50k/hr"
- "🎯 Rank increased by 10 levels"
- Visual arrows (↑↓) showing direction

**Implementation:**
```jsx
// src/utils/progressTracker.js
export const compareToLastWeek = (currentResults) => {
  const history = getProgressHistory();
  const weekAgo = history.find(h => 
    new Date(h.timestamp) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  // Compare and return deltas
};
```

---

### 5. **Profile Import/Export as JSON**
**Impact:** Medium | **Effort:** Low

Allow users to save/load profiles:
- "Export Profile" button → Downloads `gta-profile-2026-01-15.json`
- "Import Profile" button → File picker → Restores formData
- Useful for testing different builds or sharing with friends

**Implementation:**
```jsx
// src/utils/profileExport.js
export const exportProfile = (formData) => {
  const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
  // Download logic
};

export const importProfile = async () => {
  // File picker → parse JSON → validate → setFormData
};
```

---

## 💎 High-Value Features (4-8 hours each)

### 6. **Batch Assessment Comparison**
**Impact:** High | **Effort:** Medium

Compare multiple profiles side-by-side:
- "Add Comparison Profile" button
- Side-by-side cards showing:
  - Profile A vs Profile B
  - Score difference
  - Income difference
  - Asset differences
- Useful for "What if I buy X?" scenarios

**Implementation:**
```jsx
// src/views/ComparisonView.jsx
const ComparisonView = () => {
  const [profiles, setProfiles] = useState([currentProfile, comparisonProfile]);
  // Render side-by-side comparison
};
```

---

### 7. **Custom Achievement Creator**
**Impact:** Medium | **Effort:** Medium

Let users create custom achievements:
- "Create Achievement" modal
- Define condition (e.g., "Income > $1M/hr")
- Set icon, title, description
- Store in localStorage
- Show in achievements list

**Implementation:**
```jsx
// src/components/gamification/CustomAchievementCreator.jsx
// Store custom achievements in localStorage
// Merge with default ACHIEVEMENTS object
```

---

### 8. **Personalized Action Plan Templates**
**Impact:** High | **Effort:** Medium

Save and reuse action plans:
- "Save as Template" button in action plan view
- Name template (e.g., "Kosatka Grind Path")
- "Load Template" dropdown
- Templates stored in localStorage

**Implementation:**
```jsx
// src/utils/actionPlanTemplates.js
export const saveActionPlanTemplate = (name, actionPlan) => {
  const templates = getTemplates();
  templates[name] = actionPlan;
  localStorage.setItem('gta_action_plan_templates', JSON.stringify(templates));
};
```

---

### 9. **Share Assessment URL**
**Impact:** High | **Effort:** Medium

Encode assessment state in URL hash:
- `https://gta-assessment.com/#assessment=eyJzY29yZSI6ODUsInRpZXIiOiJBIi...`
- "Share Results" button → Copy URL
- Visiting URL restores formData and shows results
- Useful for sharing with friends or saving for later

**Implementation:**
```jsx
// src/utils/urlEncoder.js
export const encodeAssessment = (formData, results) => {
  const data = { formData, results };
  return btoa(JSON.stringify(data)); // Base64 encode
};

export const decodeAssessment = (hash) => {
  const data = JSON.parse(atob(hash));
  return data;
};

// In AssessmentContext.jsx - load from URL on mount
useEffect(() => {
  const hash = window.location.hash.replace('#assessment=', '');
  if (hash) {
    const { formData, results } = decodeAssessment(hash);
    setFormData(formData);
    setResults(results);
  }
}, []);
```

---

### 10. **Voice Input for Form Filling**
**Impact:** Medium | **Effort:** High

Use Web Speech API for hands-free form filling:
- "🎤 Start Voice Input" button
- Speak values: "Rank 75, cash 5 million, has Kosatka"
- Parse speech → Fill form fields
- Useful for mobile users

**Implementation:**
```jsx
// src/utils/voiceInput.js
export const useVoiceInput = () => {
  const recognition = new window.webkitSpeechRecognition();
  // Parse commands like "set rank to 75"
  // Map to form fields
};
```

---

## 🌟 Advanced Features (8+ hours each)

### 11. **Direct AI API Integration**
**Impact:** High | **Effort:** High

Call Claude/GPT API directly instead of copy-paste:
- "Get AI Suggestions" button
- Show loading spinner
- Display AI response inline
- Requires API key (user provides or use proxy)
- Rate limiting and error handling

**Implementation:**
```jsx
// src/utils/aiIntegration.js
export const callAI = async (prompt, apiKey) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: 'claude-3-sonnet', messages: [{ role: 'user', content: prompt }] })
  });
  return response.json();
};
```

---

### 12. **Real-Time Weekly Events API**
**Impact:** Medium | **Effort:** High

Fetch weekly events from server instead of manual updates:
- Create simple API endpoint (Vercel serverless function)
- Scrape Rockstar Newswire or use RSS feed
- Auto-update `weeklyEvents.js` or fetch on app load
- Fallback to local config if API fails

**Implementation:**
```jsx
// src/utils/weeklyEventsAPI.js
export const fetchWeeklyEvents = async () => {
  try {
    const response = await fetch('https://api.gta-assessment.com/weekly-events');
    return response.json();
  } catch (error) {
    // Fallback to local config
    return WEEKLY_EVENTS;
  }
};
```

---

### 13. **Multi-User Community Stats (Backend)**
**Impact:** High | **Effort:** Very High

Move community stats to database:
- Set up Supabase/Firebase backend
- Anonymous user IDs (no auth required)
- Real-time community averages
- Global leaderboards
- Requires backend infrastructure

**Implementation:**
```jsx
// src/utils/communityStatsAPI.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const submitStats = async (formData, results) => {
  await supabase.from('assessments').insert({
    score: results.score,
    income_per_hour: results.incomePerHour,
    // ... more fields
  });
};
```

---

### 14. **Crew Leaderboards**
**Impact:** Medium | **Effort:** High

Compare with your crew:
- "Join Crew" modal → Enter crew code
- Crew leaderboard showing:
  - Top scores
  - Average income
  - Most improved
- Requires backend for crew management

---

### 15. **Achievement Showcase Page**
**Impact:** Low | **Effort:** Medium

Dedicated page showing all achievements:
- Grid of all 13+ achievements
- Locked vs unlocked states
- Progress bars for multi-step achievements
- "Share Achievement" buttons

**Implementation:**
```jsx
// src/views/AchievementsShowcase.jsx
// Grid layout with achievement cards
// Filter by tier (bronze, silver, gold, platinum)
```

---

## 🎨 UX Enhancements

### 16. **Dark/Light Mode Toggle**
**Impact:** Medium | **Effort:** Low

Add theme switcher:
- Toggle in header
- Persist preference in localStorage
- Smooth transition animation

**Implementation:**
```jsx
// src/utils/theme.js
export const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  // Apply theme class to document
};
```

---

### 17. **Mobile App (React Native)**
**Impact:** High | **Effort:** Very High

Native mobile app:
- React Native version
- Push notifications for weekly events
- Offline mode
- Native share sheet

---

### 18. **PWA Support**
**Impact:** Medium | **Effort:** Medium

Make it installable:
- Service worker for offline mode
- Web app manifest
- "Install App" prompt
- Cache weekly events for offline access

**Implementation:**
```jsx
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GTA Manager',
        short_name: 'GTAM',
        theme_color: '#0f172a'
      }
    })
  ]
};
```

---

### 19. **Multi-Language Support (i18n)**
**Impact:** Medium | **Effort:** Medium

Translate to multiple languages:
- Use `react-i18next`
- Language switcher in header
- Translate all UI text
- Store preference in localStorage

---

### 20. **Advanced Chart Filters**
**Impact:** Low | **Effort:** Low

Filter progress chart by:
- Date range picker
- Show/hide datasets (Score, Income, Rank)
- Zoom to specific time period
- Export chart as image

---

## 🔧 Developer Experience

### 21. **TypeScript Migration**
**Impact:** High | **Effort:** High

Add type safety:
- Migrate incrementally (utils first, then components)
- Better IDE autocomplete
- Catch errors at compile time

**Implementation:**
```bash
npm install -D typescript @types/react @types/react-dom
# Add tsconfig.json
# Rename .jsx to .tsx incrementally
```

---

### 22. **Storybook Integration**
**Impact:** Medium | **Effort:** Medium

Document components:
- Visual component library
- Interactive prop playground
- Useful for onboarding new developers

**Implementation:**
```bash
npx storybook init
# Create stories for shared components
```

---

### 23. **E2E Testing with Playwright**
**Impact:** High | **Effort:** Medium

End-to-end test critical flows:
- Form filling → Assessment → Results
- CSV export
- Streak tracking
- Error handling

**Implementation:**
```jsx
// tests/e2e/assessment-flow.spec.js
test('complete assessment flow', async ({ page }) => {
  await page.fill('[name="rank"]', '75');
  await page.click('button:has-text("Run Assessment")');
  await expect(page.locator('text=Tier')).toBeVisible();
});
```

---

## 📊 Analytics & Monitoring

### 24. **Usage Analytics (Privacy-Friendly)**
**Impact:** Medium | **Effort:** Low

Track usage without PII:
- Plausible Analytics or PostHog
- Track: assessments run, exports used, features accessed
- No personal data, just aggregate metrics

---

### 25. **Error Tracking (Sentry)**
**Impact:** High | **Effort:** Low

Catch production errors:
- Sentry integration
- Automatic error reporting
- Stack traces with context

**Implementation:**
```jsx
// src/utils/errorTracking.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_DSN',
  environment: import.meta.env.MODE
});
```

---

## 🎯 Recommended Priority Order

### **Phase 1: Quick Wins (This Week)**
1. Keyboard shortcuts
2. Form auto-save indicator
3. Compare with last week
4. Profile import/export

### **Phase 2: High-Value Features (This Month)**
5. Share assessment URL
6. Batch comparison
7. Custom achievements
8. Dark/light mode

### **Phase 3: Advanced Features (Next Quarter)**
9. AI API integration
10. Backend for community stats
11. PWA support
12. TypeScript migration

---

## 💡 Feature Ideas from Users

**If you collect user feedback, prioritize:**
- Most requested features
- Features that reduce friction
- Features that increase engagement
- Features that differentiate from competitors

---

**Last Updated:** January 2026  
**Status:** Living document - update as features are implemented
