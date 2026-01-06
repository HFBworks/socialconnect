import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Post } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts, using mock data for demo');
      setPosts([
        {
          id: '1',
          content: 'Just launched our new social app! #coding #react',
          authorId: '1',
          author: { id: '1', name: 'Admin', email: 'admin@app.com', createdAt: '' },
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      // await api.post('/posts', { content });
      // setContent('');
      // fetchPosts();
      
      // Mock update
      const newPost: Post = {
        id: Date.now().toString(),
        content,
        authorId: user!.id,
        author: user!,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPosts([newPost, ...posts]);
      setContent('');
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex space-x-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.name[0]}
          </div>
          <form onSubmit={handleCreatePost} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                  {post.author.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>
            
            <div className="mt-4 flex items-center space-x-4 pt-4 border-t border-gray-100">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                <Heart size={20} />
                <span className="text-sm">{post.likes.length}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle size={20} />
                <span className="text-sm">{post.comments.length}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}