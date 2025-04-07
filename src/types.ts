export interface BusinessmapConfig {
  url: string;
  apikey: string;
  sslVerify: boolean;
  boardsFilter?: string[];
  readOnly: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId?: string;
  laneId?: string;
  priority?: string;
  assigneeIds?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  cardId: string;
  text: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface SearchParams {
  query: string;
  boardIds?: string[];
  maxResults?: number;
}

export interface CardCreateParams {
  boardId: string;
  workflowId: string;
  laneId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: string;
  assigneeIds?: string[];
}

export interface CardUpdateParams {
  cardId: string;
  title?: string;
  description?: string;
  columnId?: string;
  laneId?: string;
  priority?: string;
  assigneeIds?: string[];
}

export interface Board {
  id: string;
  name: string;
  description?: string;
} 