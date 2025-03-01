export enum RecordStatus {
  RecordStatusNone = 0,
  RecordStatusRunning = 1,
  RecordStatusPending = 2,
  RecordStatusError = 3,
};

export interface Record {
  id: number
  name: string
  season_id: string
  search_id: string
  cookie: string
  status: RecordStatus
};
