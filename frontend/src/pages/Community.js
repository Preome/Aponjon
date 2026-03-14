import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  BellIcon,
  MagnifyingGlassIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Community = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Update online status to online
    updateStatus('online');
    
    // Set offline when leaving
    return () => {
      updateStatus('offline');
    };
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch friends
      const friendsRes = await fetch('http://localhost:5000/api/messages/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const friendsData = await friendsRes.json();
      setFriends(friendsData);

      // Fetch friend requests
      const requestsRes = await fetch('http://localhost:5000/api/messages/friend-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsRes.json();
      setFriendRequests(requestsData);

      // Fetch discover users
      const discoverRes = await fetch('http://localhost:5000/api/messages/discover', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const discoverData = await discoverRes.json();
      setUsers(discoverData);

      // Fetch groups
      const groupsRes = await fetch('http://localhost:5000/api/messages/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const groupsData = await groupsRes.json();
      setGroups(groupsData);

      // Fetch my groups
      const myGroupsRes = await fetch('http://localhost:5000/api/messages/my-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const myGroupsData = await myGroupsRes.json();
      setMyGroups(myGroupsData);

      // Fetch unread count
      const unreadRes = await fetch('http://localhost:5000/api/messages/unread', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const unreadData = await unreadRes.json();
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/messages/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/friend-request/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Friend request sent!');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleFriendRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/friend-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Friend request ${status}`);
        fetchData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Failed to handle friend request:', error);
      alert('Network error. Please try again.');
    }
  };

  // ✅ NEW: Join Group Function
  const joinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Successfully joined the group!');
        // Refresh groups
        fetchData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Network error. Please try again.');
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 Elder Community</h1>
          <div className="flex space-x-4">
            <Link
              to="/messages"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Messages
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/create-group"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Create Group
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'discover' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Discover Elders
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'friends' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'} flex items-center`}
          >
            My Friends
            <span className="ml-2 bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-1">{friends.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'requests' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'} flex items-center`}
          >
            Friend Requests
            {friendRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'groups' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'my-groups' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            My Groups
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Discover Tab */}
          {activeTab === 'discover' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Find New Friends</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search elders..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No new elders to discover</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((elder) => (
                    <div key={elder._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                            👤
                          </div>
                          <div className="ml-3">
                            <h3 className="font-semibold">{elder.name}</h3>
                            <p className="text-sm text-gray-500">{elder.age} years • {elder.location?.city || 'Unknown'}</p>
                            <div className="flex items-center mt-1">
                              <span className={`h-2 w-2 rounded-full ${elder.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                              <span className="text-xs text-gray-500">{elder.onlineStatus}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(elder._id)}
                          className="text-primary-600 hover:text-primary-700"
                          title="Add Friend"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {elder.bio && (
                        <p className="text-sm text-gray-600 mt-2">{elder.bio}</p>
                      )}
                      {elder.interests && elder.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {elder.interests.slice(0, 3).map((interest, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Friends ({friends.length})</h2>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No friends yet. Connect with other elders!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div key={friend._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                            👤
                          </div>
                          <div className="ml-3">
                            <h3 className="font-semibold">{friend.name}</h3>
                            <div className="flex items-center">
                              <span className={`h-2 w-2 rounded-full ${friend.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                              <span className="text-xs text-gray-500">{friend.onlineStatus}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/chat/${friend._id}`}
                          className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-700"
                        >
                          Chat
                        </Link>
                      </div>
                      {friend.lastSeen && (
                        <p className="text-xs text-gray-400 mt-2">
                          Last seen: {new Date(friend.lastSeen).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
              {friendRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending friend requests</p>
              ) : (
                <div className="space-y-3">
                  {friendRequests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold">{request.from.name}</h3>
                          <p className="text-sm text-gray-500">Wants to connect with you</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFriendRequest(request._id, 'accepted')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleFriendRequest(request._id, 'rejected')}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Discover Groups</h2>
              {groups.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No groups available. Be the first to create one!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div key={group._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            <span>{group.members?.length || 0} members</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{group.category}</span>
                          </div>
                        </div>
                        {myGroups.some(g => g._id === group._id) ? (
                          <Link
                            to={`/group/${group._id}`}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"
                          >
                            View Group
                          </Link>
                        ) : (
                          <button
                            onClick={() => joinGroup(group._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Groups Tab */}
          {activeTab === 'my-groups' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Groups</h2>
              {myGroups.length === 0 ? (
                <p className="text-gray-500 text-center py-8">You haven't joined any groups yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myGroups.map((group) => (
                    <div key={group._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            <span>{group.members?.length || 0} members</span>
                          </div>
                        </div>
                        <Link
                          to={`/group/${group._id}`}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;