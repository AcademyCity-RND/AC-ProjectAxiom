export type PlatformType = 'x' | 'youtube' | 'instagram';

export type PredictedClass = 'BOT' | 'BUZZER' | 'HUMAN';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ForensicDossier {
  threat_level: ThreatLevel;
  primary_agenda: string;
  target_institution: string;
  evidence_points: string[];
  tactical_recommendation: string;
  attribution_summary: string;
}

export interface CircadianHeatmapData {
  total_posts: number;
  matrix_7x24: number[][];
  matrix_24x7: number[][];
  normalized_matrix: number[][];
  days: string[];
  hours: number[];
  peak_day: string;
  peak_hour: number;
  working_hours_ratio: number;
  night_hours_ratio: number;
  chi2_statistic: number;
  chi2_p_value: number;
  pattern_type: 'STRUCTURED_OFFICE_HOURS' | 'CONTINUOUS_24_7_AUTOMATION' | 'ORGANIC_VARIABLE' | 'INSUFFICIENT_DATA';
  explanation: string;
}

export interface PostingEntropyData {
  total_intervals: number;
  entropy: number;
  normalized_entropy: number;
  mean_interval_sec: number;
  median_interval_sec: number;
  std_interval_sec: number;
  bins_distribution: Record<string, number>;
  classification: 'HIGHLY_RIGID_SCHEDULED' | 'SEMI_AUTOMATED_OR_FOCUSED' | 'NATURAL_HUMAN_VARIABILITY' | 'INSUFFICIENT_DATA';
  explanation: string;
}

export interface NarrativeDriftWindow {
  window_index: number;
  start_time: string;
  end_time: string;
  post_count: number;
  top_keywords: string[];
  drift_from_previous: number;
  drift_from_start: number;
}

export interface NarrativeDriftData {
  drift_detected: boolean;
  max_drift: number;
  mean_drift: number;
  window_count: number;
  windows: NarrativeDriftWindow[];
  summary: string;
}

export interface AnalyticsData {
  circadian_heatmap: CircadianHeatmapData;
  posting_entropy: PostingEntropyData;
  narrative_drift: NarrativeDriftData;
}

export interface TopAttacker {
  username: string;
  comment_count: number;
  cluster_connections: number;
  posted_in_burst_window: boolean;
  risk_score: number;
  estimated_category: 'BOT' | 'BUZZER' | 'SUSPICIOUS' | 'ORGANIC';
}

export interface LedgerItem {
  index: number;
  username: string;
  platform: string;
  post_id: string;
  published_at: string;
  content: string;
  likes: number;
  replies: number;
  in_cib_cluster: boolean;
  cluster_similarity: number;
  in_burst_window: boolean;
  estimated_class: 'BOT' | 'BUZZER' | 'ORGANIC';
  risk_score: number;
}

export interface ActorSummary {
  username: string;
  display_name?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  profile_metadata?: Record<string, any>;
}

export interface DetectionResultData {
  predicted_class: PredictedClass;
  confidence: number;
  class_probabilities: {
    BUZZER: number;
    BOT: number;
    HUMAN: number;
  };
  extracted_features: Record<string, number>;
  threat_attribution?: {
    top_features?: Array<{ feature: string; importance: number; explanation: string }>;
    forensic_dossier?: ForensicDossier;
    temporal_anomaly?: Record<string, any>;
    top_attackers?: TopAttacker[];
  };
}

export interface InvestigationCase {
  case_id: string;
  target: string;
  platform: PlatformType;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  created_at?: string;
  completed_at?: string;
  actor?: ActorSummary;
  detection?: DetectionResultData;
  result_summary?: {
    target?: string;
    platform?: string;
    predicted_class?: PredictedClass;
    confidence?: number;
    total_comments?: number;
    unique_commenters?: number;
    temporal_anomaly?: Record<string, any>;
    cib_clusters_count?: number;
    top_10_attackers?: TopAttacker[];
    forensic_dossier?: ForensicDossier;
    analytics?: AnalyticsData;
    error?: string;
  };
}

export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    type: 'target' | 'cluster_member' | 'interaction';
    category: PredictedClass | 'TARGET' | 'UNKNOWN';
    confidence?: number;
    size?: number;
  };
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    weight: number;
    label: string;
    link_type: string;
    evidence?: string;
  };
}

export interface CytoscapeGraphData {
  case_id: string;
  target: string;
  total_nodes: number;
  total_edges: number;
  elements: {
    nodes: CytoscapeNode[];
    edges: CytoscapeEdge[];
  };
}
