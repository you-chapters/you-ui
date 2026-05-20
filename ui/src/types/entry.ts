export interface EntryTags {
  people: string[];
  locations: string[];
  topics: string[];
  mood: string | null;
  time_markers: string[];
}

export interface Entry {
  entry_id: string;
  user_id: string;
  entry: string;
  timestamp?: string;
  location?: string;
  tags?: EntryTags | null;
}

export interface CreateEntryPayload {
  entry: string;
  location?: string;
}
