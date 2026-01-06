export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: User;
  likes: Like[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  postId: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessageAt: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  isEdited: boolean;
  status: 'SENT' | 'DELIVERED' | 'READ';
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE_SEND = 'message:send',
  MESSAGE_NEW = 'message:new',
  MESSAGE_EDIT = 'message:edit',
  MESSAGE_DELETE = 'message:delete',
  MESSAGE_REACT = 'message:react',
  CONVERSATION_DELETE = 'conversation:delete',
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline'
}