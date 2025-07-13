import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastToBoard } from '../lib/websocket.js';

const router = Router();

const createCardSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().optional(),
  position: z.number().optional(),
  due_date: z.string().datetime().optional(),
  member_ids: z.array(z.string().uuid()).optional(),
  label_ids: z.array(z.string().uuid()).optional()
});

const moveCardSchema = z.object({
  list_id: z.string().uuid(),
  position: z.number()
});

// Create card
router.post('/lists/:listId/cards', async (req: AuthRequest, res) => {
  try {
    const { listId } = req.params;
    const body = createCardSchema.parse(req.body);

    // Get list and board info
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('board_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if user has access to board
    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', list.board_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate position if not provided
    let position = body.position;
    if (position === undefined) {
      const { data: cards } = await supabase
        .from('cards')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1);

      position = cards && cards.length > 0 ? cards[0].position + 1 : 0;
    }

    // Create card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        list_id: listId,
        title: body.title,
        description: body.description,
        position,
        due_date: body.due_date,
        created_by: req.user!.id
      })
      .select()
      .single();

    if (cardError) throw cardError;

    // Add members if provided
    if (body.member_ids && body.member_ids.length > 0) {
      const { error: membersError } = await supabase
        .from('card_members')
        .insert(
          body.member_ids.map(userId => ({
            card_id: card.id,
            user_id: userId,
            assigned_by: req.user!.id
          }))
        );

      if (membersError) throw membersError;
    }

    // Add labels if provided
    if (body.label_ids && body.label_ids.length > 0) {
      const { error: labelsError } = await supabase
        .from('card_labels')
        .insert(
          body.label_ids.map(labelId => ({
            card_id: card.id,
            label_id: labelId
          }))
        );

      if (labelsError) throw labelsError;
    }

    // Log activity
    await supabase
      .from('activities')
      .insert({
        type: 'card.created',
        user_id: req.user!.id,
        board_id: list.board_id,
        card_id: card.id,
        data: { card_title: card.title }
      });

    // Broadcast to board
    broadcastToBoard(list.board_id, {
      type: 'card.created',
      board_id: list.board_id,
      data: card,
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ data: card });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Move card
router.put('/:id/move', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const body = moveCardSchema.parse(req.body);

    // Get current card info
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        *,
        list:lists!inner(board_id)
      `)
      .eq('id', id)
      .single();

    if (cardError || !card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user has access
    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', card.list.board_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update card position
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        list_id: body.list_id,
        position: body.position
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Log activity
    await supabase
      .from('activities')
      .insert({
        type: 'card.moved',
        user_id: req.user!.id,
        board_id: card.list.board_id,
        card_id: id,
        data: {
          from_list_id: card.list_id,
          to_list_id: body.list_id,
          position: body.position
        }
      });

    // Broadcast to board
    broadcastToBoard(card.list.board_id, {
      type: 'card.moved',
      board_id: card.list.board_id,
      data: {
        cardId: id,
        fromListId: card.list_id,
        toListId: body.list_id,
        position: body.position
      },
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Failed to move card' });
  }
});

// Update card
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get card and check access
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        *,
        list:lists!inner(board_id)
      `)
      .eq('id', id)
      .single();

    if (cardError || !card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const { data: member } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', card.list.board_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update card
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log activity
    await supabase
      .from('activities')
      .insert({
        type: 'card.updated',
        user_id: req.user!.id,
        board_id: card.list.board_id,
        card_id: id,
        data: { changes: req.body }
      });

    // Broadcast to board
    broadcastToBoard(card.list.board_id, {
      type: 'card.updated',
      board_id: card.list.board_id,
      data: updatedCard,
      user_id: req.user!.id,
      timestamp: new Date().toISOString()
    });

    res.json({ data: updatedCard });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

export default router;