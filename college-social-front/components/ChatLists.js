import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ChatLists.css';

const ChatList = ({ setSelectedChatUser }) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to log in to access chats.');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error.response?.data || error.message);
        alert(error.response?.data.message || 'Failed to fetch chats');
      }
    };
    fetchChats();
  }, []);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to search users.');
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/chats/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error.response?.data || error.message);
      alert(error.response?.data.message || 'Failed to search users');
    }
  };

  return (
    <div className="chat-list">
      <h3>Chats</h3>
      <div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="search-item"
              onClick={() => setSelectedChatUser(user._id)}
            >
              <img
                src={user.profilePicture || 'https://via.placeholder.com/40'}
                alt={`${user.username}'s profile`}
                className="mini-avatar"
              />
              <strong>{user.username}</strong>
            </div>
          ))}
        </div>
      )}
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            key={chat.user._id}
            className="chat-item"
            onClick={() => setSelectedChatUser(chat.user._id)}
          >
            <img
              src={chat.user.profilePicture || 'https://via.placeholder.com/40'}
              alt={`${chat.user.username}'s profile`}
              className="mini-avatar"
            />
            <div>
              <strong>{chat.user.username}</strong>
              <p>{chat.latestMessage}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No chats available.</p>
      )}
    </div>
  );
};

export default ChatList;