import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastToBoard } from '../lib/websocket.js';

const router = Router();

const createBoardSchema = z.object({
  name: z.string().min(1).max(255),
  visibility: z.enum(['private', 'team', 'public']).optional(),
  team_id: z.string().uuid().optional(),
  background: z.record(z.any()).optional()
});

// Get user's boards
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { data: boards, error } = await supabase
      .from('boards')
      .select(`
        *,
        board_members!inner(user_id)
      `)
      .eq('board_members.user_id', req.user!.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ data: boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get board with lists and cards
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // First check if user has access
    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', id)
      .eq('user_id', req.user!.id)
      .single();

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (boardError || !board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check access
    if (board.visibility !== 'public' && !member && board.created_by !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get lists with cards
    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select(`
        *,
        cards (
          *,
          card_members (
            user:users (*)
          ),
          card_labels (
            label:labels (*)
          )
        )
      `)
      .eq('board_id', id)
      .is('archived_at', null)
      .order('position');

    if (listsError) throw listsError;

    // Format the response
    const formattedLists = lists?.map(list => ({
      ...list,
      cards: list.cards.map((card: any) => ({
        ...card,
        members: card.card_members.map((cm: any) => cm.user),
        labels: card.card_labels.map((cl: any) => cl.label),
        badges: {
          due_date: card.due_date,
          comments: 0, // Would need a separate query
          attachments: 0 // Would need a separate query
        }
      }))
    }));

    res.json({
      data: {
        ...board,
        lists: formattedLists || []
      }
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create board
router.post('/', async (req: AuthRequest, res) => {
  try {
    const body = createBoardSchema.parse(req.body);
    const slug = body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        ...body,
        slug,
        created_by: req.user!.id
      })
      .select()
      .single();

    if (boardError) throw boardError;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('board_members')
      .insert({
        board_id: board.id,
        user_id: req.user!.id,
        role: 'admin'
      });

    if (memberError) throw memberError;

    // Create default lists
    const defaultLists = [
      { name: 'To Do', position: 0 },
      { name: 'In Progress', position: 1 },
      { name: 'Done', position: 2 }
    ];

    const { error: listsError } = await supabase
      .from('lists')
      .insert(
        defaultLists.map(list => ({
          ...list,
          board_id: board.id
        }))
      );

    if (listsError) throw listsError;

    res.status(201).json({ data: board });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ error: 'Only board admins can update board' });
    }

    const { data: board, error } = await supabase
      .from('boards')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Broadcast update
    broadcastToBoard(id, {
      type: 'board.update',
      board_id: id,
      data: board,
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.json({ data: board });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

export default router;