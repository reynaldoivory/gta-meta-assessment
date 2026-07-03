// src/components/gamification/EmpireProgressPanel.jsx
import PropTypes from 'prop-types';
import { Crown, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { useEmpireProgressData } from '../../utils/useEmpireProgressData';

const renderQuest = (quest) => (
  <div
    key={quest.id}
    className={`flex items-start justify-between gap-3 rounded-xl border p-3 transition-colors ${
      quest.completed
        ? 'border-hud-blue/30 bg-hud-blue/10'
        : 'border-border bg-bg-base/40'
    }`}
  >
    <div>
      <div className="flex items-center gap-1.5">
        <div className="text-sm font-semibold text-text-primary">{quest.title}</div>
        {quest.tag === 'special_op' && (
          <span className="rounded bg-hud-pink/20 px-1.5 py-0.5 text-2xs font-bold uppercase text-accent-pink-text">Event</span>
        )}
      </div>
      <div className="text-xs text-text-muted">{quest.description}</div>
    </div>
    <div className="text-xs font-bold text-hud-blue">
      +{quest.rewardXp} XP
    </div>
  </div>
);

const QuestColumn = ({ title, icon: Icon, emptyText, quests, borderClass = 'border-border', bgClass = 'bg-bg-base/50' }) => (
  <div className={`rounded-2xl border ${borderClass} ${bgClass} p-4`}>
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-hud-blue">
      <Icon className="h-4 w-4" /> {title}
    </div>
    <div className="mt-3 space-y-2">
      {quests.length ? quests.map(renderQuest) : (
        <div className="text-xs text-text-muted">{emptyText}</div>
      )}
    </div>
  </div>
);

QuestColumn.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  emptyText: PropTypes.string.isRequired,
  quests: PropTypes.arrayOf(PropTypes.object).isRequired,
  borderClass: PropTypes.string,
  bgClass: PropTypes.string,
};

const RecentAchievements = ({ recentAchievements }) => (
  <div className="rounded-2xl border border-border bg-bg-base/50 p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
      <Trophy className="h-4 w-4 text-hud-blue" /> Recent Achievements
    </div>
    <div className="mt-3 space-y-2">
      {recentAchievements.length ? (
        recentAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center justify-between rounded-xl border border-hud-blue/20 bg-hud-blue/10 px-3 py-2">
            <div>
              <div className="text-sm font-semibold text-text-primary">
                {achievement.icon} {achievement.title}
              </div>
              <div className="text-xs text-text-muted">{achievement.description}</div>
            </div>
            <span className="text-xs uppercase text-hud-blue">{achievement.tier}</span>
          </div>
        ))
      ) : (
        <div className="text-xs text-text-muted">No achievements yet. Your first unlock is closer than you think.</div>
      )}
    </div>
  </div>
);

RecentAchievements.propTypes = {
  recentAchievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      icon: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      tier: PropTypes.string,
    })
  ).isRequired,
};

const EmpireHeader = ({ levelInfo, milestoneLabel, lastAward }) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hud-blue/10 text-hud-blue">
        <Crown className="h-6 w-6" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-hud-blue">Empire Level</div>
        <div className="font-display text-3xl font-bold text-text-primary">
          Level {levelInfo.level}
          {milestoneLabel && (
            <span className="ml-2 text-base font-normal text-hud-blue">— {milestoneLabel}</span>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="rounded-full border border-border bg-bg-surface/60 px-4 py-2 text-xs text-text-secondary">
        {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
      </div>
      {lastAward?.xpGained ? (
        <div className="rounded-full bg-hud-blue/20 px-4 py-2 text-xs font-semibold text-hud-blue">
          +{lastAward.xpGained} XP earned
        </div>
      ) : null}
    </div>
  </div>
);

EmpireHeader.propTypes = {
  levelInfo: PropTypes.shape({
    level: PropTypes.number.isRequired,
    currentLevelXp: PropTypes.number.isRequired,
    nextLevelXp: PropTypes.number.isRequired,
  }).isRequired,
  milestoneLabel: PropTypes.string,
  lastAward: PropTypes.shape({
    xpGained: PropTypes.number,
  }),
};

const EmpireProgressBar = ({ levelInfo, nextMilestone, lastAward }) => (
  <div className="mt-4">
    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-raised">
      <div
        className="h-full bg-hud-blue"
        style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
      />
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-text-muted">
      <span>
        Next unlock in {Math.max(levelInfo.nextLevelXp - levelInfo.currentLevelXp, 0)} XP
        {Boolean(nextMilestone) && (
          <span className="ml-2 text-hud-blue/70">· Milestone at Lv{nextMilestone}</span>
        )}
      </span>
      {lastAward?.streakMultiplier ? (
        <span className="flex items-center gap-1 text-hud-blue">
          <Sparkles className="h-3 w-3" />
          Streak boost x{lastAward.streakMultiplier}
        </span>
      ) : null}
    </div>
  </div>
);

EmpireProgressBar.propTypes = {
  levelInfo: PropTypes.shape({
    progress: PropTypes.number.isRequired,
    nextLevelXp: PropTypes.number.isRequired,
    currentLevelXp: PropTypes.number.isRequired,
  }).isRequired,
  nextMilestone: PropTypes.number,
  lastAward: PropTypes.shape({
    streakMultiplier: PropTypes.number,
  }),
};

const EmpireProgressPanel = ({ gamification }) => {
  const {
    hasGamification,
    levelInfo,
    milestoneLabel,
    nextMilestone,
    recentAchievements,
    dailyQuests,
    weeklyQuests,
    specialOps,
    lastAward,
  } = useEmpireProgressData(gamification);

  if (!hasGamification) return null;

  return (
    <section className="rounded-3xl border border-hud-blue/20 bg-bg-surface p-6 shadow-glow-blue">
      <EmpireHeader levelInfo={levelInfo} milestoneLabel={milestoneLabel} lastAward={lastAward} />
      <EmpireProgressBar levelInfo={levelInfo} nextMilestone={nextMilestone} lastAward={lastAward} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <QuestColumn
          title="Daily Ops"
          icon={Target}
          emptyText="No daily ops right now. Complete an assessment to unlock ops."
          quests={dailyQuests}
        />

        <QuestColumn
          title="Weekly Campaign"
          icon={Target}
          emptyText="No weekly campaign active. Check back after your next assessment."
          quests={weeklyQuests}
        />

        <div className="space-y-4">
          {specialOps.length > 0 && (
            <QuestColumn
              title="Special Ops"
              icon={Zap}
              emptyText=""
              quests={specialOps}
              borderClass="border-hud-pink/30"
              bgClass="bg-hud-pink/10"
            />
          )}

          <RecentAchievements recentAchievements={recentAchievements} />
        </div>
      </div>
    </section>
  );
};

EmpireProgressPanel.propTypes = {
  gamification: PropTypes.shape({
    xp: PropTypes.number,
    unlockedAchievements: PropTypes.arrayOf(PropTypes.string),
    quests: PropTypes.shape({
      daily: PropTypes.shape({
        items: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            rewardXp: PropTypes.number.isRequired,
            completed: PropTypes.bool.isRequired,
          })
        ),
      }),
      weekly: PropTypes.shape({
        items: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            rewardXp: PropTypes.number.isRequired,
            completed: PropTypes.bool.isRequired,
          })
        ),
      }),
      specialOps: PropTypes.shape({
        items: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            rewardXp: PropTypes.number.isRequired,
            completed: PropTypes.bool.isRequired,
          })
        ),
      }),
    }),
    lastAward: PropTypes.shape({
      xpGained: PropTypes.number,
      streakMultiplier: PropTypes.number,
    }),
  }),
};

export default EmpireProgressPanel;
