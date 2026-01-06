import { create } from 'zustand';
import { Conversation, Message, User } from '../types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  onlineUsers: string[];
  typingUsers: Record<string, string[]>; // conversationId -> userIds
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (messageId: string, conversationId: string) => void;
  removeConversation: (conversationId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  onlineUsers: [],
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (message) => set((state) => ({
    conversations: state.conversations.map(c => {
      if (c.id === message.conversationId) {
        // Prevent duplicate messages
        if (c.messages.some(m => m.id === message.id)) return c;
        return {
          ...c,
          messages: [...c.messages, message],
          lastMessageAt: message.createdAt
        };
      }
      return c;
    })
  })),

  updateMessage: (message) => set((state) => ({
    conversations: state.conversations.map(c => {
      if (c.id === message.conversationId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === message.id ? message : m)
        };
      }
      return c;
    })
  })),

  removeMessage: (messageId, conversationId) => set((state) => ({
    conversations: state.conversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: c.messages.filter(m => m.id !== messageId)
        };
      }
      return c;
    })
  })),

  removeConversation: (conversationId) => set((state) => ({
    conversations: state.conversations.filter(c => c.id !== conversationId),
    activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
  })),

  setTyping: (conversationId, userId, isTyping) => set((state) => {
    const currentTyping = state.typingUsers[conversationId] || [];
    const newTyping = isTyping 
      ? [...new Set([...currentTyping, userId])]
      : currentTyping.filter(id => id !== userId);
    
    return {
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: newTyping
      }
    };
  }),

  setOnlineUsers: (userIds) => set({ onlineUsers: userIds })
}));