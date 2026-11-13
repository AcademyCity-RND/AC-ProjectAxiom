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
  rank?: number;
  username: string;
  author_id?: string;
  comment_count: number;
  cluster_connections?: number;
  posted_in_burst_window?: boolean;
  risk_score: number;
  estimated_category: 'BOT' | 'BUZZER' | 'SUSPICIOUS' | 'ORGANIC' | 'HUMAN';
  account_created_at?: string;
  account_age_days_at_comment?: number;
  signals?: string[];
}

export interface HostCreator {
  username_or_channel: string;
  channel_or_user_id?: string;
  subscribers_or_followers?: number;
  is_verified?: boolean;
  profile_url?: string;
}

export interface HostEngagement {
  views_count?: number;
  likes_count?: number;
  dislikes_count?: number;
  total_comments_on_platform?: number;
}

export type ContentType = 'user' | 'tweet' | 'video' | 'shorts' | 'post' | 'reel';

export interface HostMetadata {
  platform: PlatformType;
  content_id: string;
  content_url: string;
  content_type: ContentType;
  title_or_caption: string;
  published_at?: string;
  creator: HostCreator;
  engagement: HostEngagement;
}

export interface HarvestSummary {
  target_quota: number;
  total_comments_extracted: number;
  unique_commenters_count: number;
  spammer_ratio: number;
  extraction_status: string;
}

export interface AITrainingFeatures {
  f_total_comments?: number;
  f_unique_commenters_ratio?: number;
  f_temporal_burst_ratio?: number;
  f_anomaly_score?: number;
  f_cluster_links_count?: number;
  f_top_attackers_count?: number;
  f_mean_comments_per_user?: number;
  f_max_comments_by_single_user?: number;
  f_mean_account_age_days_top_attackers?: number;
  f_new_accounts_ratio_top_attackers?: number;
  f_host_engagement_ratio?: number;
  f_dislike_ratio?: number;
  label_predicted_class?: string;
  label_confidence?: number;
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
  avatar_url?: string | null;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  account_created_at?: string | null;
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
  max_interactions?: number;
  depth_level?: number;
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
    host_metadata?: HostMetadata;
    harvest_summary?: HarvestSummary;
    ai_training_features?: AITrainingFeatures;
    content_type?: string;
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

export interface CaseSummary {
  case_id: string;
  target: string;
  platform: PlatformType;
  status: string;
  verdict?: string;
  confidence?: number | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
}

export interface SystemStats {
  total_cases: number;
  completed_cases: number;
  total_actors: number;
  bot_count: number;
  buzzer_count: number;
  human_count: number;
  avg_confidence: number;
  model_accuracy: number;
  system_status: string;
}

export interface WatchlistItem {
  id: number;
  username: string;
  platform: string;
  tag: string;
  notes?: string | null;
  added_by?: string | null;
  added_at: string;
  last_checked_at?: string | null;
}

export interface WatchlistCreatePayload {
  username: string;
  platform?: string;
  tag?: string;
  notes?: string;
}

export interface UserAccount {
  id: number;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreatePayload {
  username: string;
  password: string;
}

export interface AuditLogItem {
  id: number;
  operator_username: string;
  operator_role?: string;
  action: string;
  target?: string | null;
  ip_address?: string | null;
  details?: Record<string, any> | null;
  status: string;
  timestamp: string;
}

export interface AuditSummary {
  total_activities: number;
  total_scraping_operations: number;
  total_document_downloads: number;
}

export interface UserListResponse {
  total: number;
  users: UserAccount[];
}

export interface AuditLogListResponse {
  total: number;
  logs: AuditLogItem[];
}
