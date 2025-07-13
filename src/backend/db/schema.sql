-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE visibility_type AS ENUM ('private', 'team', 'public');
CREATE TYPE member_role AS ENUM ('viewer', 'member', 'admin');
CREATE TYPE activity_type AS ENUM ('card.created', 'card.moved', 'card.updated', 'comment.added');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Boards table
CREATE TABLE public.boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    background JSONB,
    visibility visibility_type DEFAULT 'private' NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id),
    team_id UUID REFERENCES public.teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Lists table
CREATE TABLE public.lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position REAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Cards table
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position REAL NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Activities table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type activity_type NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id),
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Labels table
CREATE TABLE public.labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Attachments table
CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Junction tables
CREATE TABLE public.board_members (
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (board_id, user_id)
);

CREATE TABLE public.card_members (
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    assigned_by UUID NOT NULL REFERENCES public.users(id),
    PRIMARY KEY (card_id, user_id)
);

CREATE TABLE public.card_labels (
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (card_id, label_id)
);

-- Indexes
CREATE INDEX idx_boards_slug ON public.boards(slug);
CREATE INDEX idx_boards_team_id ON public.boards(team_id);
CREATE INDEX idx_boards_created_by ON public.boards(created_by);
CREATE INDEX idx_lists_board_id ON public.lists(board_id);
CREATE INDEX idx_lists_position ON public.lists(board_id, position);
CREATE INDEX idx_cards_list_id ON public.cards(list_id);
CREATE INDEX idx_cards_position ON public.cards(list_id, position);
CREATE INDEX idx_cards_due_date ON public.cards(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_activities_board_id ON public.activities(board_id, created_at DESC);
CREATE INDEX idx_activities_card_id ON public.activities(card_id, created_at DESC) WHERE card_id IS NOT NULL;
CREATE INDEX idx_comments_card_id ON public.comments(card_id, created_at DESC);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for optimized queries
CREATE OR REPLACE VIEW cards_with_counts AS
SELECT 
    c.*,
    COUNT(DISTINCT cm.user_id) as member_count,
    COUNT(DISTINCT com.id) as comment_count,
    COUNT(DISTINCT a.id) as attachment_count,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', l.id,
            'name', l.name,
            'color', l.color
        )) FILTER (WHERE l.id IS NOT NULL), 
        '[]'::json
    ) as labels,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'avatar_url', u.avatar_url
        )) FILTER (WHERE u.id IS NOT NULL),
        '[]'::json
    ) as members
FROM public.cards c
LEFT JOIN public.card_members cm ON c.id = cm.card_id
LEFT JOIN public.users u ON cm.user_id = u.id
LEFT JOIN public.comments com ON c.id = com.card_id
LEFT JOIN public.attachments a ON c.id = a.card_id
LEFT JOIN public.card_labels cl ON c.id = cl.card_id
LEFT JOIN public.labels l ON cl.label_id = l.id
GROUP BY c.id;

-- Row Level Security (RLS) Policies
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_members ENABLE ROW LEVEL SECURITY;

-- Board access policy
CREATE POLICY "Users can view boards they are members of" ON public.boards
    FOR SELECT USING (
        visibility = 'public' OR
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update boards they admin" ON public.boards
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role = 'admin')
    );

-- List policies
CREATE POLICY "Users can view lists in accessible boards" ON public.lists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.boards b
            WHERE b.id = lists.board_id AND (
                b.visibility = 'public' OR
                b.created_by = auth.uid() OR
                EXISTS (SELECT 1 FROM public.board_members WHERE board_id = b.id AND user_id = auth.uid())
            )
        )
    );

-- Card policies
CREATE POLICY "Users can view cards in accessible boards" ON public.cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lists l
            JOIN public.boards b ON b.id = l.board_id
            WHERE l.id = cards.list_id AND (
                b.visibility = 'public' OR
                b.created_by = auth.uid() OR
                EXISTS (SELECT 1 FROM public.board_members WHERE board_id = b.id AND user_id = auth.uid())
            )
        )
    );