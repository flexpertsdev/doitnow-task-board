import { WebSocketServer, WebSocket } from 'ws';
import { supabase } from './supabase.js';
import type { WebSocketMessage } from '@task-board/shared';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  boardId?: string;
}

const boardConnections = new Map<string, Set<AuthenticatedWebSocket>>();

export function setupWebSocketServer(wss: WebSocketServer) {
  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'auth':
            await handleAuth(ws, data.token);
            break;
          case 'subscribe':
            await handleSubscribe(ws, data.boardId);
            break;
          case 'unsubscribe':
            handleUnsubscribe(ws);
            break;
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ error: 'Invalid message' }));
      }
    });

    ws.on('close', () => {
      handleUnsubscribe(ws);
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

async function handleAuth(ws: AuthenticatedWebSocket, token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      ws.send(JSON.stringify({ type: 'auth_error', error: 'Invalid token' }));
      ws.close();
      return;
    }

    ws.userId = user.id;
    ws.send(JSON.stringify({ type: 'auth_success', userId: user.id }));
  } catch (error) {
    ws.send(JSON.stringify({ type: 'auth_error', error: 'Authentication failed' }));
    ws.close();
  }
}

async function handleSubscribe(ws: AuthenticatedWebSocket, boardId: string) {
  if (!ws.userId) {
    ws.send(JSON.stringify({ error: 'Not authenticated' }));
    return;
  }

  // Check if user has access to the board
  const { data: board, error } = await supabase
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .single();

  if (error || !board) {
    ws.send(JSON.stringify({ error: 'Board not found or access denied' }));
    return;
  }

  // Unsubscribe from previous board if any
  handleUnsubscribe(ws);

  // Subscribe to new board
  ws.boardId = boardId;
  if (!boardConnections.has(boardId)) {
    boardConnections.set(boardId, new Set());
  }
  boardConnections.get(boardId)!.add(ws);

  ws.send(JSON.stringify({ type: 'subscribed', boardId }));
}

function handleUnsubscribe(ws: AuthenticatedWebSocket) {
  if (ws.boardId) {
    const connections = boardConnections.get(ws.boardId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        boardConnections.delete(ws.boardId);
      }
    }
    ws.boardId = undefined;
  }
}

export function broadcastToBoard(boardId: string, message: WebSocketMessage) {
  const connections = boardConnections.get(boardId);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}