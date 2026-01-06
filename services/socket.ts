import { io, Socket } from 'socket.io-client';
import { SocketEvent, Message } from '../types';
import { useChatStore } from '../store/useChatStore';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    // Use relative path to work with Proxy (Dev) and Nginx (Prod)
    this.socket = io('/', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      path: '/socket.io'
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    const { addMessage, updateMessage, removeMessage, removeConversation, setTyping, setOnlineUsers } = useChatStore.getState();

    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('Connected to socket server');
    });

    this.socket.on(SocketEvent.MESSAGE_NEW, (message: Message) => {
      addMessage(message);
    });

    this.socket.on(SocketEvent.MESSAGE_EDIT, (message: Message) => {
      updateMessage(message);
    });

    this.socket.on(SocketEvent.MESSAGE_DELETE, ({ messageId, conversationId }) => {
      removeMessage(messageId, conversationId);
    });

    this.socket.on(SocketEvent.CONVERSATION_DELETE, ({ conversationId }) => {
      removeConversation(conversationId);
    });

    this.socket.on(SocketEvent.TYPING_START, ({ conversationId, userId }) => {
      setTyping(conversationId, userId, true);
    });

    this.socket.on(SocketEvent.TYPING_STOP, ({ conversationId, userId }) => {
      setTyping(conversationId, userId, false);
    });

    this.socket.on(SocketEvent.USER_ONLINE, (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
  }

  sendMessage(conversationId: string, content: string) {
    this.socket?.emit(SocketEvent.MESSAGE_SEND, { conversationId, content });
  }

  editMessage(messageId: string, content: string) {
    this.socket?.emit(SocketEvent.MESSAGE_EDIT, { messageId, content });
  }

  deleteMessage(messageId: string, conversationId: string) {
    this.socket?.emit(SocketEvent.MESSAGE_DELETE, { messageId, conversationId });
  }

  deleteConversation(conversationId: string) {
    this.socket?.emit(SocketEvent.CONVERSATION_DELETE, { conversationId });
  }

  startTyping(conversationId: string) {
    this.socket?.emit(SocketEvent.TYPING_START, { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit(SocketEvent.TYPING_STOP, { conversationId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();