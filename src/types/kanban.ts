export interface KanbanPhase {
  name: string;
  status: 'done' | 'running' | 'queued';
}

export interface KanbanProject {
  id: string;
  workspace: string;
  employee_name: string;
  department: string;
  title: string;
  column: 'brainstorm' | 'planning' | 'executing' | 'done';
  status: 'active' | 'paused' | 'completed' | 'errored';
  current_phase: number;
  total_phases: number;
  phases: KanbanPhase[];
  cost_usd: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
  files: string[];
}

export interface KanbanData {
  updated_at: string;
  total_projects: number;
  projects: KanbanProject[];
}
