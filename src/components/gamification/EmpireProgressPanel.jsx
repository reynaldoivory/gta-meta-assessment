// src/components/gamification/EmpireProgressPanel.jsx
import PropTypes from 'prop-types';
import { Crown, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { useEmpireProgressData } from '../../utils/useEmpireProgressData';

const renderQuest = (quest) => (
  <div
    key={quest.id}
    className={`flex items-start justify-between gap-3 rounded-xl border p-3 transition-colors ${
      quest.completed
        ? 'border-emerald-500/30 bg-emerald-900/10'
        : 'border-slate-700/60 bg-slate-900/40'
    }`}
  >
    <div>
      <div className="flex items-center gap-1.5">
        <div className="text-sm font-semibold text-slate-100">{quest.title}</div>
        {quest.tag === 'special_op' && (
          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-300">Event</span>
        )}
      </div>
      <div className="text-xs text-slate-400">{quest.description}</div>
    </div>
    <div className={`text-xs font-bold ${quest.completed ? 'text-emerald-300' : 'text-cyan-300'}`}>
      +{quest.rewardXp} XP
    </div>
  </div>
);

const QuestColumn = ({ title, icon: Icon, iconColorClass, emptyText, quests, borderClass = 'border-slate-800/80', bgClass = 'bg-slate-950/50', titleClass = 'text-slate-400' }) => (
  <div className={`rounded-2xl border ${borderClass} ${bgClass} p-4`}>
    <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${titleClass}`}>
      <Icon className={`h-4 w-4 ${iconColorClass}`} /> {title}
    </div>
    <div className="mt-3 space-y-2">
      {quests.length ? quests.map(renderQuest) : (
        <div className="text-xs text-slate-500">{emptyText}</div>
      )}
    </div>
  </div>
);

QuestColumn.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  iconColorClass: PropTypes.string.isRequired,
  emptyText: PropTypes.string.isRequired,
  quests: PropTypes.arrayOf(PropTypes.object).isRequired,
  borderClass: PropTypes.string,
  bgClass: PropTypes.string,
  titleClass: PropTypes.string,
};

const RecentAchievements = ({ recentAchievements }) => (
  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
      <Trophy className="h-4 w-4 text-amber-300" /> Recent Achievements
    </div>
    <div className="mt-3 space-y-2">
      {recentAchievements.length ? (
        recentAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-900/10 px-3 py-2">
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {achievement.icon} {achievement.title}
              </div>
              <div className="text-xs text-slate-400">{achievement.description}</div>
            </div>
            <span className="text-[11px] uppercase text-amber-300">{achievement.tier}</span>
          </div>
        ))
      ) : (
        <div className="text-xs text-slate-500">No achievements yet. Your first unlock is closer than you think.</div>
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        <Crown className="h-6 w-6" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Empire Level</div>
        <div className="font-display text-3xl font-bold text-slate-100">
          Level {levelInfo.level}
          {milestoneLabel && (
            <span className="ml-2 text-base font-normal text-amber-300">— {milestoneLabel}</span>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs text-slate-300">
        {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
      </div>
      {lastAward?.xpGained ? (
        <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-200">
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
        style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
      />
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400">
      <span>
        Next unlock in {Math.max(levelInfo.nextLevelXp - levelInfo.currentLevelXp, 0)} XP
        {Boolean(nextMilestone) && (
          <span className="ml-2 text-amber-400/70">· Milestone at Lv{nextMilestone}</span>
        )}
      </span>
      {lastAward?.streakMultiplier ? (
        <span className="flex items-center gap-1 text-emerald-300">
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
    <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900/90 to-cyan-950/40 p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
      <EmpireHeader levelInfo={levelInfo} milestoneLabel={milestoneLabel} lastAward={lastAward} />
      <EmpireProgressBar levelInfo={levelInfo} nextMilestone={nextMilestone} lastAward={lastAward} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <QuestColumn
          title="Daily Ops"
          icon={Target}
          iconColorClass="text-cyan-300"
          emptyText="No daily ops right now. Complete an assessment to unlock ops."
          quests={dailyQuests}
        />

        <QuestColumn
          title="Weekly Campaign"
          icon={Target}
          iconColorClass="text-violet-300"
          emptyText="No weekly campaign active. Check back after your next assessment."
          quests={weeklyQuests}
        />

        <div className="space-y-4">
          {specialOps.length > 0 && (
            <QuestColumn
              title="Special Ops"
              icon={Zap}
              iconColorClass=""
              emptyText=""
              quests={specialOps}
              borderClass="border-violet-500/30"
              bgClass="bg-violet-950/20"
              titleClass="text-violet-300"
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
