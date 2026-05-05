'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';
import GlowCard from '@/components/GlowCard';

interface Incident {
  type: string;
  severity: string;
  workspace: string;
  metric: number | string;
  threshold: number | string;
  message: string;
  timestamp?: string;
}

interface AutoFix {
  type: string;
  workspace: string;
  message: string;
}

interface ScanData {
  scan_time: string;
  workspaces_scanned: number;
  incidents: Incident[];
  auto_fixes: AutoFix[];
}

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', icon: '🚨', label: 'Critical' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', icon: '🟡', label: 'Warning' },
  info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', icon: 'ℹ️', label: 'Info' },
};

const TYPE_ICONS: Record<string, string> = {
  cost_spike: '💰', token_flood: '🔢', daily_spend: '💳', session_cost: '💵',
  employee_budget: '📊', tool_loop: '🔄', error_storm: '❌', idle_session: '⏳',
  zombie_session: '🧟', unusual_hours: '🌙', expensive_model: '💸',
  ram_high: '🧠', cpu_high: '⚙️', container_restarts: '🔄',
};

const METRIC_NAMES: Record<string, string> = {
  cost_spike: 'Hourly Cost Spike', token_flood: 'Token Flood', daily_spend: 'Daily Company Spend',
  session_cost: 'Session Cost', employee_budget: 'Employee Budget Breach', tool_loop: 'Infinite Tool Loop',
  error_storm: 'Error Storm', idle_session: 'Idle Session', zombie_session: 'Zombie Session',
  unusual_hours: 'Unusual Hours Activity', expensive_model: 'Expensive Model Switch',
  ram_high: 'RAM Usage High', cpu_high: 'CPU Sustained High', container_restarts: 'Container Restart Loop',
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Calcutta', hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short' });
  } catch { return iso; }
}

function workspaceDisplayName(ws: string) {
  return ws.replace('_workspace', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function WatchdogPage() {
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [livePulse, setLivePulse] = useState(true);

  useEffect(() => {
    const loadData = () => {
      fetch('/openclaw-dashboard/data/guardian.json')
        .then(r => r.json())
        .then(data => {
          setScanData(data);
          setLoading(false);
          setLivePulse(true);
          setTimeout(() => setLivePulse(false), 2000);
        })
        .catch(() => setLoading(false));
    };
    loadData();
    const interval = setInterval(loadData, 10000); // 10s live refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/30 to-slate-900 flex items-center justify-center relative">
        <ParticleBackground />
        <div className="text-white text-xl animate-pulse relative z-10">🛡️ Watchdog loading...</div>
      </main>
    );
  }

  const incidents = scanData?.incidents || [];
  const autoFixes = scanData?.auto_fixes || [];
  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.severity === filter);

  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const warningCount = incidents.filter(i => i.severity === 'warning').length;
  const infoCount = incidents.filter(i => i.severity === 'info').length;

  // Group incidents by type
  const incidentsByType: Record<string, Incident[]> = {};
  incidents.forEach(i => {
    const key = i.type;
    if (!incidentsByType[key]) incidentsByType[key] = [];
    incidentsByType[key].push(i);
  });

  // Get unique workspaces with issues
  const affectedWorkspaces = [...new Set(incidents.map(i => i.workspace))].filter(w => w !== 'SYSTEM');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900 p-4 md:p-8 relative">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">🛡️ Watchdog</h1>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${livePulse ? 'bg-green-500/30 text-green-400' : 'bg-green-500/20 text-green-400'}`}>
                <span className={`w-2 h-2 rounded-full bg-green-400 ${livePulse ? 'animate-ping' : 'animate-pulse'}`} />
                LIVE
              </div>
            </div>
            <p className="text-purple-200/60 mt-1">Real-time anomaly detection across {scanData?.workspaces_scanned || 0} workspaces</p>
            {scanData?.scan_time && (
              <p className="text-purple-300/40 text-xs mt-1">Last scan: {formatTime(scanData.scan_time)}</p>
            )}
          </div>
          <Link href="/" className="text-purple-300 hover:text-white text-sm">← Home</Link>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <GlowCard className="text-center !p-4" glowColor="rgba(239,68,68,0.3)">
            <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-purple-300/60 text-sm">🚨 Critical</div>
          </GlowCard>
          <GlowCard className="text-center !p-4" glowColor="rgba(245,158,11,0.3)">
            <div className="text-3xl font-bold text-amber-400">{warningCount}</div>
            <div className="text-purple-300/60 text-sm">🟡 Warnings</div>
          </GlowCard>
          <GlowCard className="text-center !p-4" glowColor="rgba(59,130,246,0.3)">
            <div className="text-3xl font-bold text-blue-400">{infoCount}</div>
            <div className="text-purple-300/60 text-sm">ℹ️ Info</div>
          </GlowCard>
          <GlowCard className="text-center !p-4" glowColor="rgba(34,197,94,0.3)">
            <div className="text-3xl font-bold text-green-400">{autoFixes.length}</div>
            <div className="text-purple-300/60 text-sm">🔧 Auto-fixes</div>
          </GlowCard>
          <GlowCard className="text-center !p-4" glowColor="rgba(168,85,247,0.3)">
            <div className="text-3xl font-bold text-purple-400">{affectedWorkspaces.length}</div>
            <div className="text-purple-300/60 text-sm">👤 Affected</div>
          </GlowCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'critical', 'warning', 'info'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? f === 'critical' ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                    : f === 'warning' ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                    : f === 'info' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                    : 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                  : 'bg-white/5 text-purple-300/60 hover:text-white border border-transparent'
              }`}
            >
              {f === 'all' ? 'All' : SEVERITY_CONFIG[f as keyof typeof SEVERITY_CONFIG]?.icon + ' ' + SEVERITY_CONFIG[f as keyof typeof SEVERITY_CONFIG]?.label}
              <span className="ml-1 text-xs opacity-60">
                ({f === 'all' ? incidents.length : incidents.filter(i => i.severity === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Incident Feed */}
        <div className="space-y-3 mb-8">
          {filtered.length === 0 ? (
            <GlowCard glowColor="rgba(34,197,94,0.3)" className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-2">All Clear</h2>
              <p className="text-purple-300/60">No {filter !== 'all' ? filter : ''} incidents detected</p>
            </GlowCard>
          ) : (
            filtered.map((incident, idx) => {
              const sev = SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
              const typeIcon = TYPE_ICONS[incident.type] || '⚠️';
              return (
                <div
                  key={`${incident.type}-${incident.workspace}-${idx}`}
                  className="relative rounded-xl border p-4 transition-all hover:scale-[1.01]"
                  style={{
                    background: sev.bg,
                    borderColor: sev.border,
                    borderLeftWidth: '4px',
                    borderLeftColor: sev.color,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-0.5">{typeIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: sev.color }}>{sev.label.toUpperCase()}</span>
                        <span className="text-white/40 text-xs">•</span>
                        <span className="text-white/80 text-sm font-medium">{METRIC_NAMES[incident.type] || incident.type}</span>
                      </div>
                      <p className="text-white text-sm mb-2">{incident.message}</p>
                      <div className="flex items-center gap-4 text-xs">
                        {incident.workspace !== 'SYSTEM' && (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-purple-300 font-mono">
                            {workspaceDisplayName(incident.workspace)}
                          </span>
                        )}
                        {incident.metric !== undefined && (
                          <span className="text-white/50">
                            Value: <span className="text-white font-mono">{typeof incident.metric === 'number' ? incident.metric.toLocaleString() : incident.metric}</span>
                            {incident.threshold !== undefined && (
                              <> / Limit: <span className="font-mono">{incident.threshold}</span></>
                            )}
                          </span>
                        )}
                        {incident.timestamp && (
                          <span className="text-white/30 ml-auto">{formatTime(incident.timestamp)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 14 Metrics Grid */}
        <GlowCard className="mb-8" glowColor="rgba(168,85,247,0.2)">
          <h2 className="text-xl font-bold text-white mb-4">📊 14 Monitored Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(METRIC_NAMES).map(([type, name]) => {
              const count = incidentsByType[type]?.length || 0;
              const sev = incidentsByType[type]?.[0]?.severity || 'ok';
              const isActive = count > 0;
              return (
                <div
                  key={type}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive
                      ? sev === 'critical' ? 'bg-red-500/10 border-red-500/30'
                        : sev === 'warning' ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICONS[type]}</span>
                    <div>
                      <div className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>{name}</div>
                      {isActive && (
                        <div className="text-xs mt-0.5" style={{ color: SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG]?.color }}>
                          {count} incident{count > 1 ? 's' : ''}
                        </div>
                      )}
                      {!isActive && <div className="text-xs text-green-400/40 mt-0.5">✓ OK</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        {/* Auto-fixes Log */}
        {autoFixes.length > 0 && (
          <GlowCard className="mb-8" glowColor="rgba(34,197,94,0.2)">
            <h2 className="text-xl font-bold text-white mb-4">🔧 Auto-fixes Applied</h2>
            <div className="space-y-2">
              {autoFixes.map((fix, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-green-500/5 rounded-lg">
                  <span className="text-green-400">✅</span>
                  <span className="text-white/80 text-sm">{fix.message}</span>
                  <span className="text-purple-300/40 text-xs ml-auto font-mono">{workspaceDisplayName(fix.workspace)}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        )}

        {/* Affected Workspaces */}
        {affectedWorkspaces.length > 0 && (
          <GlowCard className="mb-8" glowColor="rgba(168,85,247,0.2)">
            <h2 className="text-xl font-bold text-white mb-4">👤 Affected Workspaces</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {affectedWorkspaces.map(ws => {
                const wsIncidents = incidents.filter(i => i.workspace === ws);
                const hasCritical = wsIncidents.some(i => i.severity === 'critical');
                return (
                  <div
                    key={ws}
                    className={`p-3 rounded-lg border text-center ${
                      hasCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">{workspaceDisplayName(ws)}</div>
                    <div className="text-xs mt-1" style={{ color: hasCritical ? '#ef4444' : '#f59e0b' }}>
                      {wsIncidents.length} issue{wsIncidents.length > 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlowCard>
        )}

        <p className="text-purple-300/20 text-xs text-center mt-8">
          🛡️ Livio Usage Guardian · Zero-token operation · Scans every 5 minutes · 14 anomaly types
        </p>
      </div>
    </main>
  );
}
