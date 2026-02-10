export type LoopState = 'idle' | 'running' | 'between' | 'stopping' | 'completed'

export interface LoopStateDetail {
  iteration: number
  max_iterations: number
  total: number
  done: number
  remaining: number
  feature_id: string
  started_at: string
  updated_at: string
  exit_reason: string
}

export interface RunConfig {
  name: string
  project: string
  milestone: string
  milestone_path?: string | null
  scaffold: string | null
  harness: 'claude-code' | 'opencode' | 'codex'
  location: string
  params: {
    max_iterations: number | null
    max_turns: number | null
    model: string | null
  }
  created_at: string
}

export interface RunSummary {
  id: string
  project: string
  milestone: string
  location: string
  is_external: boolean
  tool: 'claude-code' | 'opencode' | 'codex' | 'unknown'
  features: {
    total: number
    passing: number
    failing: number
  }
  loop_state: LoopState
  iteration: number | null
}

export interface RunFeature {
  id: string
  name: string
  status: string
  priority?: number
  completed_at?: string
  dependencies: string[]
  description: string | null
  tests: string[]
  prp_path?: string
}

export interface RunDetail extends RunSummary {
  features_list: RunFeature[]
  progress: string
  progress_total_lines: number
  loop_state_detail: LoopStateDetail | null
  params: RunConfig['params']
  milestone_path: string | null
  planning_path: string | null
}

// --- Session Metrics ---

export interface SessionMetrics {
  cost_usd: number | null
  duration_ms: number | null
  turns: number | null
  model: string | null
}

// --- JSONL Event Types ---

export type JsonlContent =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, any> }

export type JsonlToolResult = {
  type: 'tool_result'
  tool_use_id: string
  content: string | Array<{ type: string; text: string }>
  is_error?: boolean
}

export type JsonlEvent =
  | { type: 'system'; subtype?: string; model?: string; tools?: string[]; [k: string]: any }
  | { type: 'assistant'; message: { content: JsonlContent[]; usage?: Record<string, number>; [k: string]: any } }
  | { type: 'user'; message: { content: JsonlToolResult[] }; tool_use_result?: { stdout?: string; stderr?: string } }
  | { type: 'result'; cost_usd?: number; duration_ms?: number; turns?: number; result?: string }
  | { type: 'legacy'; lines: string[] }
  // Codex CLI events
  | { type: 'thread.started'; thread_id?: string }
  | { type: 'turn.started' }
  | { type: 'turn.completed'; usage?: { input_tokens?: number; output_tokens?: number; cached_input_tokens?: number } }
  | { type: 'item.started'; item: { id: string; type: string; command?: string; [k: string]: any } }
  | { type: 'item.completed'; item: { id: string; type: string; text?: string; command?: string; aggregated_output?: string; exit_code?: number | null; status?: string; message?: string; [k: string]: any } }
  // OpenCode events
  | { type: 'step_start'; timestamp?: number; sessionID?: string; part: { type: 'step-start'; [k: string]: any } }
  | { type: 'text'; timestamp?: number; part: { type: 'text'; text: string; [k: string]: any } }
  | { type: 'tool_use'; timestamp?: number; part: { type: 'tool'; tool: string; state: { status?: string; input?: Record<string, any>; output?: string; metadata?: Record<string, any>; [k: string]: any }; [k: string]: any } }
  | { type: 'step_finish'; timestamp?: number; part: { type: 'step-finish'; reason?: string; cost?: number; tokens?: { input?: number; output?: number; reasoning?: number; cache?: { read?: number; write?: number } }; [k: string]: any } }

// --- Session Types ---

export interface SessionSummary {
  id: string
  pid: number | null
  alive: boolean
  stime: string | null
  command: string | null
  has_checklist: boolean
  checklist_summary: { total: number; checked: number } | null
  output_bytes: number
  is_current: boolean
  started_at: string | null
  finished_at: string | null
  metrics: SessionMetrics | null
}

export interface SessionOutput {
  events: JsonlEvent[]
  total_bytes: number
  total_events: number
  truncated: boolean
  metrics: SessionMetrics | null
  append?: boolean
}

export interface SessionChecklist {
  content: string | null
  summary: { total: number; checked: number } | null
}
