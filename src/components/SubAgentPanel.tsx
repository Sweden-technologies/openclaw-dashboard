'use client';

import { KanbanProject } from '@/types/kanban';

export default function SubAgentPanel({ project }: { project: KanbanProject }) {
  const estimatedTokens = project.total_phases * 50000;
  const tokenPct = Math.min((project.tokens_used / estimatedTokens) * 100, 100);
  const estimatedCost = project.total_phases * 0.15;

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2d2d5a' }}>
      {/* Phase title */}
      <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        ⚡ Phase {project.current_phase}/{project.total_phases}: {project.phases[project.current_phase - 1]?.name || 'Unknown'}
      </div>

      {/* Sub-agent rows */}
      {project.phases.map((phase, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 11 }}>
          {/* Icon */}
          {phase.status === 'done' ? (
            <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#065f4622', color: '#6ee7b7', border: '1px solid #6ee7b733' }}>✓</div>
          ) : phase.status === 'running' ? (
            <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#7c3aed22', color: '#a78bfa', border: '1px solid #a78bfa33', animation: 'iconGlow 1.5s infinite' }}>R</div>
          ) : (
            <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: '#1e1e3a', color: '#64748b', border: '1px solid #1e1e3a' }}>Q</div>
          )}

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#cbd5e1' }}>{phase.name}</div>
            <div style={{ color: '#64748b', fontSize: 9, marginTop: 2 }}>
              {phase.status === 'done' ? `Completed` : phase.status === 'running' ? 'Running' : 'Queued'}
            </div>
          </div>

          {/* Mini progress */}
          <div style={{ width: 60, height: 3, background: '#1e1e3a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: 2,
              background: phase.status === 'done' ? '#6ee7b7' : phase.status === 'running' ? '#a78bfa' : '#1e1e3a',
              width: phase.status === 'done' ? '100%' : phase.status === 'running' ? '50%' : '0%',
              animation: phase.status === 'running' ? 'progFill 2s infinite' : undefined,
            }} />
          </div>
        </div>
      ))}

      {/* Token meter */}
      <div style={{ marginTop: 10 }}>
        <div style={{ height: 3, background: '#1e1e3a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #6ee7b7, #a78bfa)', borderRadius: 2, width: `${tokenPct}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginTop: 3 }}>
          <span>{(project.tokens_used / 1000).toFixed(0)}k tokens</span>
          <span>~{(estimatedTokens / 1000).toFixed(0)}k est</span>
        </div>
      </div>

      {/* Cost */}
      <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
        ${project.cost_usd.toFixed(2)} spent / ~${estimatedCost.toFixed(2)} est
      </div>
    </div>
  );
}
