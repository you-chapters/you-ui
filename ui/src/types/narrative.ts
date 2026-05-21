export interface NarrativeSummary {
  period_type: 'week' | 'month';
  period_key: string;
  entry_count: number;
  text: string;
  generated_at: string;
  is_cached: boolean;
}
