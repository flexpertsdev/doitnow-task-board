export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Board {
  id: string;
  name: string;
  slug: string;
  background?: Record<string, any> | null;
  visibility: 'private' | 'team' | 'public';
  created_by: string;
  team_id?: string | null;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date | null;
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date | null;
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description?: string | null;
  position: number;
  due_date?: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date | null;
}

export interface Activity {
  id: string;
  type: 'card.created' | 'card.moved' | 'card.updated' | 'comment.added';
  user_id: string;
  board_id: string;
  card_id?: string | null;
  data: Record<string, any>;
  created_at: Date;
}

export interface BoardMember {
  board_id: string;
  user_id: string;
  role: 'viewer' | 'member' | 'admin';
  joined_at: Date;
}

export interface CardMember {
  card_id: string;
  user_id: string;
  assigned_at: Date;
  assigned_by: string;
}

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Label {
  id: string;
  board_id: string;
  name: string;
  color: string;
  created_at: Date;
}

export interface CardLabel {
  card_id: string;
  label_id: string;
  added_at: Date;
}

export interface Attachment {
  id: string;
  card_id: string;
  user_id: string;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: Date;
}