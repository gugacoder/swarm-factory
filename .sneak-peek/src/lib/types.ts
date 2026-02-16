// --- Harness Config (agent-harness.json) ---
export interface HarnessConfig {
  _version: number
  slug: string
  name: string
  specs: string
  workspace: string
  agent: {
    harness: string
    max_turns: number
    max_retries: number
  }
  artifacts: Record<string, string>
  session_template: {
    pattern: string
    files: string[]
    dirs: string[]
  }
  notifications: any[]
}

// --- Feature ---
export type FeatureStatus = 'passing' | 'failing' | 'pending' | 'blocked' | 'skipped' | 'in_progress'

export interface Feature {
  id: string
  title: string
  description: string | null
  status: FeatureStatus
  priority: number
  dependencies: string[]
  retries: number
  prp_ids?: string[]
  prp_path?: string
  completed_at?: string
  tests?: string[]
}

// --- Loop State ---
export type LoopState = 'idle' | 'running' | 'between' | 'stopping' | 'completed'

export interface LoopStateDetail {
  status: string
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

// --- Session ---
export interface SessionSummary {
  id: string
  pid: number | null
  alive: boolean
  started_at: string | null
  finished_at: string | null
  output_bytes: number
  is_current: boolean
  metrics: SessionMetrics | null
}

export interface SessionMetrics {
  cost_usd: number | null
  duration_ms: number | null
  turns: number | null
  model: string | null
}

// --- JSONL Events ---
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

export interface SessionOutput {
  events: JsonlEvent[]
  total_bytes: number
  total_events: number
  truncated: boolean
  metrics: SessionMetrics | null
  append?: boolean
}

// --- Specs ---
export interface SpecsFile {
  type: 'file'
  path: string
  content: string
}

export interface SpecsDirectory {
  type: 'directory'
  path: string
  items: SpecsItem[]
}

export interface SpecsItem {
  name: string
  type: 'file' | 'directory'
  path: string
}

export type SpecsResponse = SpecsFile | SpecsDirectory

// --- Workspace Discovery ---
export interface WorkspaceInfo {
  slug: string
  name: string
  workspace: string
  harness: string
  features: { total: number; passing: number }
}

// --- Harness Create Flow ---
export interface HarnessInferResponse {
  specsPath: string
  workspace: string
  repoRoot: string
  milestone: string
  suggestedSlug: string
  suggestedName: string
}

export interface HarnessCreateRequest {
  slug: string
  name: string
  workspace: string
  specs: string
  harness: string
}

export interface HarnessCreateResponse {
  success: boolean
  slug: string
  workspace: string
  artifacts_created?: string[]
}

export interface HarnessSetupResponse {
  success: boolean
  output?: string
  exitCode?: number
}

export interface HarnessStartResponse {
  pid: number
  workspace: string
  log: string
  message: string
}

export interface HarnessStopResponse {
  success: boolean
  workspace: string
}
