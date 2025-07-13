import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { BoardWithLists, ListWithCards, CardWithDetails, WebSocketMessage } from '@shared/types/api';

interface BoardState {
  board: BoardWithLists | null;
  loading: boolean;
  error: string | null;
  wsConnection: WebSocket | null;
  
  // Actions
  setBoard: (board: BoardWithLists) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Card actions
  moveCard: (cardId: string, fromListId: string, toListId: string, position: number) => void;
  updateCard: (cardId: string, updates: Partial<CardWithDetails>) => void;
  addCard: (listId: string, card: CardWithDetails) => void;
  deleteCard: (cardId: string) => void;
  
  // List actions
  addList: (list: ListWithCards) => void;
  updateList: (listId: string, updates: Partial<ListWithCards>) => void;
  moveList: (listId: string, position: number) => void;
  
  // WebSocket
  connectWebSocket: (boardId: string, token: string) => void;
  disconnectWebSocket: () => void;
  handleWebSocketMessage: (message: WebSocketMessage) => void;
}

export const useBoardStore = create<BoardState>()(
  immer((set, get) => ({
    board: null,
    loading: false,
    error: null,
    wsConnection: null,

    setBoard: (board) => set({ board, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    moveCard: (cardId, fromListId, toListId, position) => {
      set((state) => {
        if (!state.board) return;

        const fromList = state.board.lists.find((l) => l.id === fromListId);
        const toList = state.board.lists.find((l) => l.id === toListId);

        if (!fromList || !toList) return;

        const cardIndex = fromList.cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return;

        const [card] = fromList.cards.splice(cardIndex, 1);
        card.list_id = toListId;
        card.position = position;

        // Insert at correct position
        const insertIndex = toList.cards.findIndex((c) => c.position > position);
        if (insertIndex === -1) {
          toList.cards.push(card);
        } else {
          toList.cards.splice(insertIndex, 0, card);
        }

        // Update positions
        toList.cards.forEach((c, index) => {
          c.position = index;
        });
      });
    },

    updateCard: (cardId, updates) => {
      set((state) => {
        if (!state.board) return;

        for (const list of state.board.lists) {
          const card = list.cards.find((c) => c.id === cardId);
          if (card) {
            Object.assign(card, updates);
            break;
          }
        }
      });
    },

    addCard: (listId, card) => {
      set((state) => {
        if (!state.board) return;

        const list = state.board.lists.find((l) => l.id === listId);
        if (list) {
          list.cards.push(card);
        }
      });
    },

    deleteCard: (cardId) => {
      set((state) => {
        if (!state.board) return;

        for (const list of state.board.lists) {
          const index = list.cards.findIndex((c) => c.id === cardId);
          if (index !== -1) {
            list.cards.splice(index, 1);
            break;
          }
        }
      });
    },

    addList: (list) => {
      set((state) => {
        if (!state.board) return;
        state.board.lists.push(list);
      });
    },

    updateList: (listId, updates) => {
      set((state) => {
        if (!state.board) return;

        const list = state.board.lists.find((l) => l.id === listId);
        if (list) {
          Object.assign(list, updates);
        }
      });
    },

    moveList: (listId, position) => {
      set((state) => {
        if (!state.board) return;

        const listIndex = state.board.lists.findIndex((l) => l.id === listId);
        if (listIndex === -1) return;

        const [list] = state.board.lists.splice(listIndex, 1);
        list.position = position;

        const insertIndex = state.board.lists.findIndex((l) => l.position > position);
        if (insertIndex === -1) {
          state.board.lists.push(list);
        } else {
          state.board.lists.splice(insertIndex, 0, list);
        }

        // Update positions
        state.board.lists.forEach((l, index) => {
          l.position = index;
        });
      });
    },

    connectWebSocket: (boardId, token) => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000');

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', token }));
        ws.send(JSON.stringify({ type: 'subscribe', boardId }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data) as WebSocketMessage;
        get().handleWebSocketMessage(message);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      set({ wsConnection: ws });
    },

    disconnectWebSocket: () => {
      const ws = get().wsConnection;
      if (ws) {
        ws.close();
        set({ wsConnection: null });
      }
    },

    handleWebSocketMessage: (message) => {
      switch (message.type) {
        case 'card.moved':
          const { cardId, fromListId, toListId, position } = message.data;
          get().moveCard(cardId, fromListId, toListId, position);
          break;

        case 'card.created':
          get().addCard(message.data.list_id, message.data);
          break;

        case 'card.updated':
          get().updateCard(message.data.id, message.data);
          break;

        case 'card.deleted':
          get().deleteCard(message.data.id);
          break;

        case 'list.created':
          get().addList(message.data);
          break;

        case 'list.updated':
          get().updateList(message.data.id, message.data);
          break;

        case 'list.moved':
          get().moveList(message.data.listId, message.data.position);
          break;
      }
    },
  }))
);