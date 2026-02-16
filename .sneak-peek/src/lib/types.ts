// --- Harness Config (.harness/{session}/config.json) ---
export interface HarnessConfig {
  slug: string
  project: string
  session_name: string
  specs: string
  agent: {
    harness: string
    model: string
    max_turns: number
    max_iterations: number
    max_retries: number
    rollback: boolean
  }
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
  pid: number | null
  max_features: number | null
  features_done: number | null
}

// --- Session (Feature Run) ---
export interface SessionSummary {
  id: string
  pid: number | null
  alive: boolean
  started_at: string | null
  finished_at: string | null
  output_bytes: number
  is_current: boolean
  metrics: SessionMetrics | null
  exit_code: number | null
  retries: number | null
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
  activeSession: string
}

// --- Harness Session Info ---
export interface HarnessSessionInfo {
  name: string
  isActive: boolean
  hasFeatures: boolean
  featuresCount: number
  featuresPassingCount: number
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

export interface HarnessStartResponse {
  pid: number
  workspace: string
  log: string
  message: string
}

export interface HarnessStopResponse {
  success: boolean
  workspace: string
  pid: number | null
  signalSent: boolean
}

// --- SSE Stream Events ---
export type StreamEvent =
  | { type: 'log'; text: string }
  | { type: 'done'; exitCode: number }
  | { type: 'error'; error: string }
