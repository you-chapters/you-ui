export interface MoodPoint {
  date: string;
  mood: string;
}

export interface TopicCount {
  topic: string;
  count: number;
}

export interface PersonCount {
  name: string;
  count: number;
}

export interface LocationCount {
  location: string;
  count: number;
}

export interface PeriodSummary {
  period_days: number;
  entry_count: number;
  mood_timeline: MoodPoint[];
  top_topics: TopicCount[];
  top_people: PersonCount[];
  top_locations: LocationCount[];
}
