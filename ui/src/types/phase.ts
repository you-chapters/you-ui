export interface PhaseRecord {
  phase_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  entry_count: number;
  dominant_topics: string[];
  mean_mood: number;
  top_people: string[];
  top_locations: string[];
  generated_at: string;
  is_open: boolean;
}