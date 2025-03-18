import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Chats.css';

const Chat = ({ userId, setSelectedChatUser }) => {
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [newMessage, setNewMessage] = useState(''); // State for the input field

  // Fetch chat messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to log in to access chat.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the chat with the selected user
        const chat = response.data.find((c) => c.user._id === userId);
        setMessages(chat?.messages || []);
      } catch (error) {
        console.error('Error fetching chat messages:', error.response?.data || error.message);
        alert(error.response?.data.message || 'Failed to fetch chat messages');
      }
    };

    fetchMessages();
  }, [userId]);

  // Send a new chat message
  const sendMessage = async () => {
    try {
      if (!newMessage.trim()) {
        alert('Message cannot be empty.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to send a message.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/chats/send',
        { recipientId: userId, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: { username: 'You' }, message: newMessage, createdAt: new Date() },
      ]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      alert(error.response?.data.message || 'Failed to send message.');
    }
  };

  return (
    <div className="chat-container">
      <h2>
        Chat with User{' '}
        <button onClick={() => setSelectedChatUser(null)} style={{ float: 'right', fontSize: '1rem' }}>
          Back
        </button>
      </h2>

      {/* Display Messages */}
      <div className="messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.sender.username}:</strong> {msg.message}
            </div>
          ))
        ) : (
          <p>No messages available.</p>
        )}
      </div>

      {/* Input Field and Send Button */}
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;