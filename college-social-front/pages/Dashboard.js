import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Profile from '../components/Profile';
import Search from '../components/Search';
import Notifications from '../components/Notifications';
import ChatList from '../components/ChatLists';
import Chat from '../components/Chats';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [view, setView] = useState('home');
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/posts?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Fetch Posts Error:', error);
      alert('Failed to load posts. Please try again.');
    }
  };

  useEffect(() => {
    if (view === 'home') fetchPosts();
  }, [filter, view]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="dashboard">
      <div className="filter-toggle">
        {view === 'home' && (
          <>
            <button className={filter === 'recent' ? 'active' : ''} onClick={() => setFilter('recent')}>
              Recent Posts
            </button>
            <button className={filter === 'top' ? 'active' : ''} onClick={() => setFilter('top')}>
              Top Posts
            </button>
          </>
        )}
      </div>

      <div className="content">
        {view === 'home' && (posts.length > 0 ? posts.map(post => (
          <PostCard key={post._id} post={post} fetchPosts={fetchPosts} />
        )) : <p>No posts available.</p>)}
        {view === 'create-post' && <CreatePost setView={setView} fetchPosts={fetchPosts} />}
        {view === 'profile' && <Profile />}
        {view === 'search' && <Search />}
        {view === 'notifications' && <Notifications />}
        {view === 'chat' && (
          selectedChatUser ? (
            <Chat userId={selectedChatUser} setSelectedChatUser={setSelectedChatUser} />
          ) : (
            <ChatList setSelectedChatUser={setSelectedChatUser} />
          )
        )}
      </div>

      <nav className="navbar">
        <button onClick={() => setView('home')}>Home</button>
        <button onClick={() => setView('profile')}>Profile</button>
        <button onClick={() => setView('create-post')}>+</button>
        <button onClick={() => setView('search')}>Search</button>
        <button onClick={() => setView('notifications')}>Notifications</button>
        <button onClick={() => setView('chat')}>Chat</button>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
};

export default Dashboard;