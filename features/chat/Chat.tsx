import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { socketService } from '../../services/socket';
import { api } from '../../services/api';
import { Send, Trash2, Edit2, Smile, MoreVertical } from 'lucide-react';
import { Conversation, Message } from '../../types';
import toast from 'react-hot-toast';

export default function Chat() {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    setConversations,
    typingUsers 
  } = useChatStore();
  
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversationId]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (e) {
      console.log('Using mock conversations');
      setConversations([
        {
          id: '1',
          participants: [{ id: '2', name: 'Alice', email: 'alice@test.com', createdAt: '' }],
          messages: [],
          lastMessageAt: new Date().toISOString()
        }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !messageInput.trim()) return;

    socketService.sendMessage(activeConversationId, messageInput);
    
    // Optimistic update (simplified, real store update happens via socket event)
    const activeConv = conversations.find(c => c.id === activeConversationId);
    if(activeConv) {
         // Mock optimistic update logic would go here
    }

    setMessageInput('');
  };

  const handleDeleteConversation = () => {
    if (!activeConversationId) return;
    if (window.confirm('Delete entire conversation for everyone? This cannot be undone.')) {
      socketService.deleteConversation(activeConversationId);
      toast.success('Conversation deleted');
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = activeConversation?.participants.find(p => p.id !== user?.id);

  return (
    <div className="bg-white rounded-xl shadow-sm h-[calc(100vh-140px)] flex overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-700">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const participant = conv.participants.find(p => p.id !== user?.id) || { name: 'Unknown' };
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  activeConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{participant.name}</div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {conv.messages[conv.messages.length - 1]?.content || 'Start chatting'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversationId ? (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <button 
                className="md:hidden text-gray-600"
                onClick={() => setActiveConversation(null)}
              >
                ←
              </button>
              <div>
                <h3 className="font-semibold text-gray-900">{otherParticipant?.name}</h3>
                {typingUsers[activeConversationId]?.length > 0 && (
                  <span className="text-xs text-blue-600 animate-pulse">typing...</span>
                )}
              </div>
            </div>
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical size={20} className="text-gray-500" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10 border border-gray-100">
                <button
                  onClick={handleDeleteConversation}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Conversation
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConversation?.messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
                  }`}>
                    <p>{msg.content}</p>
                    <div className={`text-[10px] mt-1 flex justify-end ${
                      isMe ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  socketService.startTyping(activeConversationId);
                }}
                onBlur={() => socketService.stopTyping(activeConversationId)}
                placeholder="Type a message..."
                className="flex-1 border-gray-200 rounded-full px-4 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col text-gray-400 bg-gray-50">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}

// Icon helper
const MessageSquare = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);