'use client';

import { KanbanPhase, KanbanProject } from '@/types/kanban';
import { useState } from 'react';
import SubAgentPanel from './SubAgentPanel';

const COLUMN_CONFIG = {
  brainstorm: { icon: '💡', color: '#fbbf24', label: 'Brainstorm' },
  planning: { icon: '📋', color: '#60a5fa', label: 'Planning' },
  executing: { icon: '🚀', color: '#a78bfa', label: 'Executing' },
  done: { icon: '✅', color: '#6ee7b7', label: 'Done' },
} as const;

type ColumnKey = keyof typeof COLUMN_CONFIG;

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#7c3aed',
  HR: '#ec4899',
  Sales: '#f59e0b',
  Design: '#06b6d4',
  Marketing: '#10b981',
};

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

function StatusBadge({ status }: { status: KanbanProject['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'background:#7c3aed22;color:#a78bfa' },
    paused: { label: 'Paused', cls: 'background:#fbbf2422;color:#fbbf24' },
    completed: { label: 'Completed', cls: 'background:#6ee7b722;color:#6ee7b7' },
    errored: { label: 'Errored', cls: 'background:#f8717122;color:#f87171' },
  };
  const s = map[status] || map.active;
  return (
    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase', ...Object.fromEntries(s.cls.split(';').map(p => { const [k,v] = p.split(':'); return [k.trim(), v]; })) }}>
      {s.label}
    </span>
  );
}

function PhaseBar({ phases }: { phases: KanbanPhase[] }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
      {phases.map((p, i) => (
        <div
          key={i}
          style={{
            height: 4,
            borderRadius: 2,
            flex: 1,
            background: p.status === 'done' ? '#6ee7b7' : p.status === 'running' ? '#a78bfa' : '#1e1e3a',
            animation: p.status === 'running' ? 'segPulse 1s infinite' : undefined,
          }}
        />
      ))}
    </div>
  );
}

function ProjectCard({ project, isExpanded, onToggle }: { project: KanbanProject; isExpanded: boolean; onToggle: () => void }) {
  const avatarColor = DEPT_COLORS[project.department] || '#7c3aed';
  return (
    <div
      onClick={onToggle}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: `1px solid ${isExpanded ? '#7c3aed' : '#2d2d5a'}`,
        borderRadius: 12,
        padding: 14,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        animation: 'cardSpawn 0.4s ease-out',
      }}
      onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.borderColor = '#7c3aed88'; }}
      onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.borderColor = '#2d2d5a'; }}
    >
      {/* Employee line */}
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${avatarColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: avatarColor }}>
          {project.employee_name[0]}
        </div>
        {project.employee_name} — {project.department}
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4, color: '#e2e8f0' }}>
        {project.title}
      </div>

      {/* Phase bar */}
      <PhaseBar phases={project.phases} />

      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#64748b' }}>
        <StatusBadge status={project.status} />
        <span>{timeAgo(project.updated_at)}</span>
      </div>

      {/* Expanded sub-agent panel */}
      {isExpanded && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <SubAgentPanel project={project} />
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard({ projects, filter }: { projects: KanbanProject[]; filter: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'All Workspaces'
    ? projects
    : projects.filter(p => p.department === filter);

  const columns: ColumnKey[] = ['brainstorm', 'planning', 'executing', 'done'];

  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px 28px', minHeight: '70vh', overflowX: 'auto' }}>
      {columns.map(col => {
        const cfg = COLUMN_CONFIG[col];
        const colProjects = filtered.filter(p => p.column === col);
        return (
          <div key={col} style={{ flex: 1, minWidth: 280, background: '#0f0f23', borderRadius: 16, border: '1px solid #1e1e3a', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: 16, fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #1e1e3a', display: 'flex', alignItems: 'center', gap: 10, color: '#e2e8f0' }}>
              <span>{cfg.icon}</span> {cfg.label}
              <span style={{ background: '#7c3aed33', color: '#a78bfa', fontSize: 11, padding: '2px 8px', borderRadius: 8 }}>{colProjects.length}</span>
            </div>
            {/* Body */}
            <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {colProjects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isExpanded={expandedId === p.id}
                  onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                />
              ))}
              {colProjects.length === 0 && (
                <div style={{ color: '#475569', fontSize: 12, textAlign: 'center', padding: 24 }}>No projects</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes segPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes cardSpawn {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes iconGlow {
          0%, 100% { box-shadow: 0 0 4px #a78bfa44; }
          50% { box-shadow: 0 0 12px #a78bfa88; }
        }
        @keyframes progFill {
          0% { width: 30%; }
          50% { width: 70%; }
          100% { width: 30%; }
        }
        @media (max-width: 768px) {
          .kanban-board { flex-direction: column !important; }
          .kanban-board > div { min-width: auto !important; }
        }
      `}</style>
    </div>
  );
}
