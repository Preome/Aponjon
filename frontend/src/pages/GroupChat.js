import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PaperAirplaneIcon, UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';

const GroupChat = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroupData();
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem('token');
      // You'll need to create this endpoint
      const response = await fetch(`http://localhost:5000/api/messages/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGroup(data);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/groups/${groupId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/groups/${groupId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        {/* Group Header */}
        <div className="bg-white rounded-t-xl shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/community')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl">
              👥
            </div>
            <div className="ml-3">
              <h2 className="font-semibold text-lg">{group?.name || 'Group Chat'}</h2>
              <p className="text-sm text-gray-500">{group?.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="flex items-center text-gray-500 hover:text-primary-600"
          >
            <UsersIcon className="h-5 w-5 mr-1" />
            <span>{members.length}</span>
          </button>
        </div>

        {/* Members Sidebar (conditionally shown) */}
        {showMembers && (
          <div className="bg-white border-t p-4">
            <h3 className="font-semibold mb-3">Group Members</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((member) => (
                <div key={member.user?._id || member._id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">{member.user?.name || 'Member'}</p>
                    <p className="text-xs text-gray-500">{member.role || 'member'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="bg-white shadow-md p-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-32">
              <p>No messages yet. Be the first to say hello!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender?._id === user?._id
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.sender?._id !== user?._id && (
                      <p className="text-xs font-semibold mb-1 text-purple-600">
                        {msg.sender?.name || 'User'}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender?._id === user?._id ? 'text-purple-200' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-b-xl shadow-md p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;