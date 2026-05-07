'use client';

import { useEffect, useState } from 'react';
import { KanbanData, KanbanProject } from '@/types/kanban';
import KanbanBoard from '@/components/KanbanBoard';

const FILTERS = ['All Workspaces', 'Engineering', 'HR', 'Sales', 'Design'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function KanbanPage() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [filter, setFilter] = useState('All Workspaces');

  useEffect(() => {
    const load = () => {
      fetch('/openclaw-dashboard/data/kanban.json')
        .then(r => r.json())
        .then(setData)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const projects = data?.projects || [];
  const activeCount = projects.filter(p => p.status === 'active').length;
  const runningNow = projects.filter(p => p.phases.some(ph => ph.status === 'running')).length;
  const todayCost = projects.reduce((sum, p) => sum + p.cost_usd, 0);
  const stuckCount = projects.filter(p => {
    const diff = Date.now() - new Date(p.updated_at).getTime();
    return diff > 86400000 && p.status === 'active';
  }).length;

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a1a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #7c3aed33' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(90deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LIVIO KANBAN MISSION CONTROL
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6ee7b7' }}>
          <div style={{ width: 8, height: 8, background: '#6ee7b7', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
          LIVE — {activeCount} projects active
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, padding: '16px 28px', background: '#0f0f23', borderBottom: '1px solid #1e1e3a', flexWrap: 'wrap' }}>
        {[
          { label: 'Active Projects', value: activeCount, color: '#a78bfa' },
          { label: 'Running Now', value: runningNow, color: '#6ee7b7' },
          { label: "Today's Cost", value: `$${todayCost.toFixed(2)}`, color: '#fbbf24' },
          { label: 'Stuck (>24h)', value: stuckCount, color: '#f87171' },
        ].map(s => (
          <div key={s.label} style={{ background: 'linear-gradient(135deg, #1a1a2e, #1e1e3a)', border: '1px solid #7c3aed22', borderRadius: 12, padding: '14px 20px', flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 28px', background: '#0a0a1a' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#7c3aed22' : '#1a1a2e',
              border: `1px solid ${filter === f ? '#7c3aed' : '#2d2d5a'}`,
              color: filter === f ? '#a78bfa' : '#94a3b8',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Board */}
      <KanbanBoard projects={projects} filter={filter} />

      {/* Last updated */}
      {data && (
        <div style={{ textAlign: 'center', padding: 16, fontSize: 11, color: '#475569' }}>
          Last updated {timeAgo(data.updated_at)} · Auto-refreshes every 10s
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @media (max-width: 768px) {
          .kanban-board { flex-direction: column !important; padding: 12px !important; }
        }
      `}</style>
    </main>
  );
}
