import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastToBoard } from '../lib/websocket.js';

const router = Router();

const createListSchema = z.object({
  name: z.string().min(1).max(255),
  position: z.number().optional()
});

// Create list
router.post('/boards/:boardId/lists', async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;
    const body = createListSchema.parse(req.body);

    // Check if user has access to board
    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', req.user!.id)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate position if not provided
    let position = body.position;
    if (position === undefined) {
      const { data: lists } = await supabase
        .from('lists')
        .select('position')
        .eq('board_id', boardId)
        .order('position', { ascending: false })
        .limit(1);

      position = lists && lists.length > 0 ? lists[0].position + 1 : 0;
    }

    // Create list
    const { data: list, error } = await supabase
      .from('lists')
      .insert({
        board_id: boardId,
        name: body.name,
        position
      })
      .select()
      .single();

    if (error) throw error;

    // Broadcast to board
    broadcastToBoard(boardId, {
      type: 'list.created',
      board_id: boardId,
      data: list,
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ data: list });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get list and check access
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('board_id')
      .eq('id', id)
      .single();

    if (listError || !list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', list.board_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update list
    const { data: updatedList, error: updateError } = await supabase
      .from('lists')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Broadcast to board
    broadcastToBoard(list.board_id, {
      type: 'list.updated',
      board_id: list.board_id,
      data: updatedList,
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.json({ data: updatedList });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Move list
router.put('/:id/move', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;

    if (typeof position !== 'number') {
      return res.status(400).json({ error: 'Position is required' });
    }

    // Get list and check access
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('board_id')
      .eq('id', id)
      .single();

    if (listError || !list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', list.board_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update position
    const { error: updateError } = await supabase
      .from('lists')
      .update({ position })
      .eq('id', id);

    if (updateError) throw updateError;

    // Broadcast to board
    broadcastToBoard(list.board_id, {
      type: 'list.moved',
      board_id: list.board_id,
      data: { listId: id, position },
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Move list error:', error);
    res.status(500).json({ error: 'Failed to move list' });
  }
});

export default router;