import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, MessageSquare, Home, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">SocialConnect</Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`p-2 rounded-full hover:bg-gray-100 ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600'}`}
              title="Feed"
            >
              <Home size={24} />
            </Link>
            
            <Link 
              to="/chat" 
              className={`p-2 rounded-full hover:bg-gray-100 ${location.pathname === '/chat' ? 'text-blue-600' : 'text-gray-600'}`}
              title="Messages"
            >
              <MessageSquare size={24} />
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-2" />

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
              <button 
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}