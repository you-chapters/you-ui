export interface Entry {
  entry_id: string;
  user_id: string;
  entry: string;
  timestamp?: string;
  location?: string;
}

export interface CreateEntryPayload {
  user_id: string;
  entry: string;
  location?: string;
}