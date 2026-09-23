import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card/Card';
import { SignalBreakdownRow } from '../../components/SignalBreakdownRow/SignalBreakdownRow';
import { TrendSparkline } from '../../components/TrendSparkline/TrendSparkline';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { RingProgress } from '../../components/RingProgress/RingProgress';
import { StatusPill } from '../../components/StatusPill/StatusPill';
import { Logo } from '../../components/Logo';
import { CashFlowChart } from '../../components/CashFlowChart/CashFlowChart';
import { SavingsGoalCard } from '../../components/SavingsGoalCard/SavingsGoalCard';
import { NotificationBell } from '../../components/NotificationBell/NotificationBell';
import { LoadingState } from '../../components/LoadingState/LoadingState';
import { getScore } from '../../api/score';
import { getProfile } from '../../api/profile';
import { getCashFlow, type CashFlowPoint } from '../../api/cashFlow';
import type { ScoreResult, Signal } from '../../lib/scoring';
import { statusColors } from '../../theme/tokens';
import { useRequests } from '../../context/RequestsContext';
import { formatCountdown } from '../../lib/formatCountdown';
import styles from './Home.module.css';

function trendPoints(previousScore: number, score: number, steps = 8): number[] {
  const diff = score - previousScore;
  // Deterministic gentle wiggle so the line isn't perfectly straight — purely cosmetic.
  const wiggle = [0, 0.15, -0.1, 0.25, 0.1, 0.3, 0.05, 0];
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return previousScore + diff * t + diff * (wiggle[i % wiggle.length] ?? 0) * 0.1;
  });
}

function firstName(fullName: string | null): string {
  return fullName?.trim().split(/\s+/)[0] ?? 'there';
}

function initials(fullName: string | null): string {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Home() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const { grants, refresh } = useRequests();
  const navigate = useNavigate();

  useEffect(() => {
    refresh().catch(() => {});
    getScore().then(setResult);
    getProfile().then((p) => setProfileName(p.name));
    getCashFlow().then(setCashFlow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) return <LoadingState message="Loading your score…" />;

  const isUp = result.delta >= 0;
  const points = trendPoints(result.previousScore, result.score);
  const soonestExpiry = grants.length > 0 ? Math.min(...grants.map((g) => g.expiresAt)) : null;

  return (
    <div className={styles.screen}>
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <Logo size={22} />
          <span className={styles.brandName}>pesascore</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NotificationBell />
          <div className={styles.avatar}>{initials(profileName)}</div>
        </div>
      </div>

      <p className={styles.greeting}>Good afternoon, {firstName(profileName)}</p>

      <div className={styles.scoreRow}>
        <div>
          <p className={styles.scoreLabel}>your score</p>
          <p className={`${styles.scoreValue} num`}>{result.score}</p>
        </div>
        <div
          className={styles.deltaPill}
          style={{
            background: isUp ? 'var(--green-light)' : 'var(--coral-light)',
            color: isUp ? 'var(--green)' : 'var(--coral)',
          }}
        >
          <span>{isUp ? '↑' : '↓'}</span>
          <span>
            {isUp ? '+' : ''}
            {result.delta} this month
          </span>
        </div>
      </div>

      <div className={styles.trend}>
        <TrendSparkline points={points} color={isUp ? 'var(--green)' : 'var(--coral)'} />
      </div>

      <div className={styles.miniStats} onClick={() => navigate('/requests')} role="button" tabIndex={0}>
        <div className={styles.miniCard}>
          <p className={styles.miniLabel}>Active requests</p>
          <p className={styles.miniValue}>
            {grants.length} {grants.length === 1 ? 'SACCO' : 'SACCOs'}
          </p>
        </div>
        <div className={styles.miniCard}>
          <p className={styles.miniLabel}>Data shared</p>
          <p className={styles.miniValue}>
            {soonestExpiry ? `Expires ${formatCountdown(soonestExpiry - Date.now())}` : 'None'}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <CashFlowChart series={cashFlow} />
      </div>

      <SavingsGoalCard />

      <p className={styles.sectionLabel}>what's shaping this</p>
      <div className={styles.signals}>
        {result.signals.map((signal) => (
          <button key={signal.label} className={styles.signalButton} onClick={() => setSelectedSignal(signal)}>
            <SignalBreakdownRow
              value={signal.value}
              label={signal.label}
              explanation={signal.explanation}
              status={signal.status}
            />
          </button>
        ))}
      </div>

      <Card padding={12} style={{ marginBottom: 12 }}>
        <p className={styles.tipText}>{result.tip}</p>
      </Card>

      <button className={styles.simulatorLink} onClick={() => navigate('/simulator')}>
        See what could improve your score →
      </button>

      <div style={{ marginTop: 'auto' }}>
        <BottomNav />
      </div>

      <BottomSheet open={!!selectedSignal} onClose={() => setSelectedSignal(null)}>
        {selectedSignal && (
          <div>
            <div className={styles.sheetHeader}>
              <RingProgress
                value={selectedSignal.value}
                size={44}
                strokeWidth={4}
                color={statusColors[selectedSignal.status].text}
              />
              <div className={styles.sheetHeaderText}>
                <p className={styles.sheetLabel}>{selectedSignal.label}</p>
                <StatusPill status={selectedSignal.status} />
              </div>
            </div>
            <p className={styles.sheetSectionTitle}>What this means</p>
            <p className={styles.sheetBody}>{selectedSignal.explanation}</p>
            <p className={styles.sheetSectionTitle}>Recommendation</p>
            <p className={styles.sheetBody}>{selectedSignal.recommendation}</p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
