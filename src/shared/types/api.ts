import { Board, Card, List, User, Activity, Comment, Label, Attachment } from './entities';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BoardWithLists extends Board {
  lists: ListWithCards[];
  members: BoardMemberInfo[];
}

export interface ListWithCards extends List {
  cards: CardWithDetails[];
}

export interface CardWithDetails extends Card {
  labels: Label[];
  members: User[];
  badges: {
    due_date?: Date | null;
    comments: number;
    attachments: number;
  };
}

export interface BoardMemberInfo {
  user: User;
  role: 'viewer' | 'member' | 'admin';
  joined_at: Date;
}

export interface CreateBoardRequest {
  name: string;
  visibility?: 'private' | 'team' | 'public';
  team_id?: string;
  background?: Record<string, any>;
}

export interface CreateListRequest {
  name: string;
  position?: number;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  position?: number;
  due_date?: Date;
  member_ids?: string[];
  label_ids?: string[];
}

export interface MoveCardRequest {
  list_id: string;
  position: number;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  due_date?: Date | null;
  member_ids?: string[];
  label_ids?: string[];
}

export interface WebSocketMessage {
  type: 'board.update' | 'card.created' | 'card.updated' | 'card.moved' | 'card.deleted' | 'list.created' | 'list.updated' | 'list.moved' | 'member.joined' | 'member.left';
  board_id: string;
  data: any;
  user_id: string;
  timestamp: string;
}

export interface SearchRequest {
  query: string;
  types?: ('card' | 'board' | 'member')[];
  board_id?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  type: 'card' | 'board' | 'member';
  id: string;
  title: string;
  description?: string;
  highlight: {
    title?: string;
    description?: string;
  };
  board?: {
    id: string;
    name: string;
  };
}