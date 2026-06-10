import type { Entry } from './entry';

export interface QaRequest {
  question: string;
}

export interface QaResponse {
  answer: string;
  sources: Entry[];
}
