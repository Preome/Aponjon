import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all friends to show recent conversations
      const friendsRes = await fetch('http://localhost:5000/api/messages/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const friendsData = await friendsRes.json();
      
      // For each friend, get the last message
      const convos = await Promise.all(
        friendsData.map(async (friend) => {
          const messagesRes = await fetch(`http://localhost:5000/api/messages/conversation/${friend._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const messages = await messagesRes.json();
          const lastMessage = messages[messages.length - 1];
          
          return {
            friend,
            lastMessage,
            unreadCount: messages.filter(m => 
              m.sender?._id === friend._id && 
              !m.readBy?.some(r => r.user === user?._id)
            ).length
          };
        })
      );
      
      // Sort by most recent message
      convos.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setConversations(convos);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💬 Messages</h1>
          <Link
            to="/community"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ← Back to Community
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-t-xl shadow-md p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-b-xl shadow-md overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500 mb-6">Connect with other elders in the community</p>
              <Link
                to="/community"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
              >
                Browse Community →
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => (
                <Link
                  key={conv.friend._id}
                  to={`/chat/${conv.friend._id}`}
                  className="block hover:bg-gray-50 transition p-4"
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        conv.friend.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{conv.friend.name}</h3>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {conv.lastMessage ? (
                            <>
                              {conv.lastMessage.sender?._id === user?._id ? 'You: ' : ''}
                              {conv.lastMessage.content}
                            </>
                          ) : (
                            <span className="text-gray-400">No messages yet</span>
                          )}
                        </p>
                        
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;