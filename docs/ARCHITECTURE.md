# Architecture Documentation

## Migration Summary

### Before Refactoring
- **1 monolithic file**: `GTAAssessment.jsx` (2,800+ lines)
- Prop drilling through multiple layers
- Hardcoded weekly events scattered throughout
- Difficult to test individual components
- Hard to collaborate on

### After Refactoring
- **20+ modular files** organized by purpose
- Context-driven state management (no prop drilling)
- Config-driven weekly events (single source of truth)
- Each view testable independently
- Clear separation of concerns

## Architecture Patterns

### 1. Context API Pattern
```jsx
// Centralized state in AssessmentContext
const { formData, results, step, runAssessment } = useAssessment();
```

**Benefits:**
- No prop drilling
- State accessible from any component
- Automatic persistence to localStorage
- Version management for migrations

### 2. View Router Pattern
```jsx
// Simple switch-based routing
switch (step) {
  case 'form': return <AssessmentForm />;
  case 'results': return <AssessmentResults />;
  // ...
}
```

**Benefits:**
- Easy to add new views
- Clear navigation flow
- Can be extended with React Router if needed

### 3. Config-Driven Pattern
```jsx
// Single source of truth
// src/config/weeklyEvents.js
export const WEEKLY_EVENTS = { /* ... */ };
```

**Benefits:**
- Update bonuses in one place
- Version control meta changes
- Easy to migrate to API later

### 4. Component Organization by Purpose
```
components/
├── calculators/    # Business logic UI
├── gamification/   # Engagement features
└── shared/         # Reusable primitives
```

**Benefits:**
- Clear where to add new features
- Easy to find related components
- Scalable folder structure

## Data Flow

```
User Input → AssessmentForm
    ↓
Context (formData updated)
    ↓
runAssessment() called
    ↓
computeAssessment() (pure function)
    ↓
Context (results updated, step = 'results')
    ↓
AssessmentResults renders
    ↓
submitAnonymousStats() + saveProgressSnapshot()
    ↓
localStorage updated
```

## State Management

### Context State
- `formData`: Current form inputs
- `results`: Calculated assessment results
- `step`: Current view ('form', 'results', 'guide', 'actionPlan')
- `hasDraft`: Whether draft exists in localStorage
- `errors`: Validation errors
- `whatIfText`: User's what-if scenario text
- `isCalculating`: Loading state during assessment

### Persistence
- **Auto-save**: Form data debounced (1 second) to localStorage
- **Version**: Context version (`v5`) for migration support
- **Community Stats**: Stored in `gta_community_stats_pool`
- **Progress History**: Stored in `gta_progress_history`

## Error Handling

### Error Boundary
- Catches React errors at the root level
- Shows friendly error message
- Includes error details in development mode
- Provides refresh button

### Form Validation
- Real-time validation with error messages
- Prevents invalid submissions
- Clear error indicators

### Loading States
- Visual feedback during calculations
- Prevents double-submissions
- Smooth user experience

## Testing Strategy

### Unit Tests
- Test utilities in isolation (`computeAssessment`, `buildLLMPrompt`)
- Mock context for view tests
- Test edge cases (empty data, invalid inputs)

### Integration Tests
- Test full form → results flow
- Test localStorage persistence
- Test view transitions

### Manual Testing Checklist
- [ ] Fresh user flow (clear localStorage)
- [ ] Returning user flow (restore from localStorage)
- [ ] Edge cases (0 assets, 0 rank, etc.)
- [ ] GTA+ toggle changes guide content
- [ ] Streak tracker increments correctly
- [ ] Progress charts render with multiple snapshots

## Performance Considerations

### Debouncing
- Form inputs debounced to prevent excessive localStorage writes
- 1 second delay balances responsiveness and performance

### Code Splitting (Future)
- Views can be lazy-loaded
- Reduces initial bundle size
- Load components on-demand

### Chart Rendering
- Chart.js handles large datasets efficiently
- Only renders when 2+ snapshots exist
- Responsive and performant

## Security & Privacy

### Client-Side Only
- No server-side storage
- All data stays in user's browser
- Privacy-first approach

### Local Storage
- Versioned keys (`gtaAssessmentDraft_v5`)
- Graceful handling of storage quota exceeded
- Migration support for version changes

## Deployment

### Build Process
```bash
npm run build  # Creates optimized production build
```

### Deployment Targets
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting
- **Any static host**: Just upload `dist/` folder

### Environment Variables
- `NODE_ENV`: Controls dev tools visibility
- No API keys needed (fully client-side)

## Maintenance

### Weekly Updates
1. Open `src/config/weeklyEvents.js`
2. Update `WEEKLY_EVENTS` object
3. Set new `validUntil` date
4. Commit and deploy

### Adding Features
1. Determine feature category (calculator, gamification, shared)
2. Create component in appropriate folder
3. Import and use in relevant view
4. Update context if new state needed

### Debugging
- DevTools panel (development only)
- Shows current state, results, and storage
- Helps debug without console.log spam

## Future Enhancements

### Short Term
- [ ] Add unit tests for utilities
- [ ] Add integration tests for views
- [ ] Add TypeScript for type safety

### Medium Term
- [ ] API integration for weekly events
- [ ] Lazy loading for views
- [ ] PWA support (offline functionality)

### Long Term
- [ ] Multi-language support (i18n)
- [ ] A/B testing framework
- [ ] Analytics integration
- [ ] User accounts (optional, server-side)

---

**Last Updated:** January 2026
**Architecture Version:** v5
**Status:** Production Ready ✅
